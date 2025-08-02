'use client';

import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import ImageUpload from '@/components/ImageUpload';
import ImagePreview from '@/components/ImagePreview';
import { account } from '@/lib/appwrite';

export default function HomePage() {
  const [user, setUser] = useState(null as null | { email: string; $id: string });
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [optimizedImageUrl, setOptimizedImageUrl] = useState<string | null>(null);

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
    // Refresh user data after login/signup
    account.get().then(setUser).catch(() => setUser(null));
  }

  function handleLogout() {
    account.deleteSession('current').then(() => {
      setUser(null);
      setOriginalImageUrl(null);
      setOptimizedImageUrl(null);
    });
  }

  return (
    <div>
      {!user ? (
        <AuthForm onLoginSuccess={handleLogin} />
      ) : (
        <section>
          <div className='flex justify-between items-center mb-6'>
            <p>Welcome, {user.email}</p>
            <button
              onClick={handleLogout}
              className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'
            >
              Logout
            </button>
          </div>

          {/* Image upload && compression */}

          <p className='mb-4'>Upload an image to compress and optimize.</p>

          <ImageUpload 
            onUpload={(file: File) => {
              const url = URL.createObjectURL(file);
              setOriginalImageUrl(url);
              setOptimizedImageUrl(null);
            }}
          />

          {originalImageUrl && (
            <ImagePreview 
              original={originalImageUrl}
              optimized={optimizedImageUrl}
            />
          )}
        </section>
      )}
    </div>
  );
}