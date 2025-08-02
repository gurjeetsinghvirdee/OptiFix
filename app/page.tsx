'use client';

import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import ImageUpload from '@/components/ImageUpload';
import ImagePreview from '@/components/ImagePreview';
import { account, storage, functions } from '@/lib/appwrite';
import { uploadImage, getFilePreview } from '@/lib/image';

interface FunctionExecution {
  $id: string;
  status: 'waiting' | 'processing' | 'completed' | 'failed';
  stdout?: string;
  response?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<null | { email: string; $id: string }>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [optimizedImageUrl, setOptimizedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID ?? '';
  const COMPRESS_FUNCTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID ?? '';

  const [originalFileId, setOriginalFileId] = useState<string | null>(null);
  const [optimizedFileId, setOptimizedFileId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const sessionUser = await account.get();
        setUser(sessionUser);
      } catch {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  function handleLogin() {
    account.get().then(setUser).catch(() => setUser(null));
  }

  async function handleLogout() {
    try {
      await account.deleteSession('current');
    } catch {
      // Ignore possible errors on logout
    }
    clearImages();
    setUser(null);
  }

  function clearImages() {
    setOriginalFileId(null);
    setOptimizedFileId(null);
    setOriginalImageUrl(null);
    setOptimizedImageUrl(null);
  }

  async function handleFileUpload(file: File) {
    setErrorMsg(null);
    setLoading(true);
    clearImages();

    try {
      if (!BUCKET_ID || !COMPRESS_FUNCTION_ID) {
        throw new Error(
          'Bucket ID or compression function ID is not configured. Please set NEXT_PUBLIC_APPWRITE_BUCKET_ID and NEXT_PUBLIC_APPWRITE_FUNCTION_ID.'
        );
      }

      const uploaded = await uploadImage(file);
      setOriginalFileId(uploaded.$id);
      const originalUrl = getFilePreview(BUCKET_ID, uploaded.$id);
      setOriginalImageUrl(originalUrl);

      const execution = await functions.createExecution(
        COMPRESS_FUNCTION_ID,
        JSON.stringify({ bucketId: BUCKET_ID, fileId: uploaded.$id })
      );

      const maxRetries = 20;
      let retryCount = 0;
      let executionResult: FunctionExecution;

      while (true) {
        executionResult = await functions.getExecution(
          COMPRESS_FUNCTION_ID,
          execution.$id
        ) as FunctionExecution;

        const rawResponse = executionResult.stdout || executionResult.response;

        if (executionResult.status === 'completed') {
          if (!rawResponse) {
            throw new Error('No output from compression function.');
          }
          break;
        } else if (executionResult.status === 'failed') {
          throw new Error('Image compression failed on server.');
        }

        retryCount++;
        if (retryCount > maxRetries) {
          throw new Error('Image compression timed out.');
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      const responseJson = JSON.parse(executionResult.stdout || executionResult.response || '{}');
      const optimizedId: string = responseJson.optimizedFileId;
      setOptimizedFileId(optimizedId);

      const optimizedUrl = getFilePreview(BUCKET_ID, optimizedId);
      setOptimizedImageUrl(optimizedUrl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unexpected error occurred');
      }
      clearImages();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setErrorMsg(null);
    setLoading(true);

    try {
      if (originalFileId) {
        await storage.deleteFile(BUCKET_ID, originalFileId);
      }
      if (optimizedFileId) {
        await storage.deleteFile(BUCKET_ID, optimizedFileId);
      }
      clearImages();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('Failed to delete images');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!user ? (
        <AuthForm onLoginSuccess={handleLogin} />
      ) : (
        <section>
          <div className="flex justify-between items-center mb-6">
            <p>Welcome, {user.email}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          <p className="mb-4">Upload an image to compress and optimize.</p>

          <ImageUpload onUpload={handleFileUpload} />

          {loading && <p className="mt-4 text-blue-600">Processing... Please wait.</p>}

          {errorMsg && <p className="mt-4 text-red-600">{errorMsg}</p>}

          {originalImageUrl && (
            <ImagePreview original={originalImageUrl} optimized={optimizedImageUrl} />
          )}

          {(originalFileId || optimizedFileId) && !loading && (
            <button
              onClick={handleDelete}
              className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete My Images
            </button>
          )}
        </section>
      )}
    </div>
  );
}