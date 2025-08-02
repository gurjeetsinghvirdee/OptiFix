'use client';

import React, { useState } from 'react';
import { account } from '@/lib/appwrite';

type Mode = 'login' | 'signup';

export default function AuthForm({
    onLoginSuccess,
}: {
    onLoginSuccess: () => void;
}) {
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        try {
            if (mode === 'signup') {
                await account.create('unique()', email, password);
            }
            await account.createEmailPasswordSession(email, password);
            onLoginSuccess();
        } catch (error: unknown) {
          if (error instanceof Error) {
            setErrorMsg(error.message);
          } else {
            setErrorMsg('An unexpected error occurred');
          }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='max-w-md mx-auto mt-20 p-6 bg-white rounded shadow'>
            <h2 className='text-2xl mb-4 text-center text-black'>
                {mode === 'login' ? 'Log In' : 'Sign Up'}
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
                <input 
                    type="email"
                    required
                    placeholder='Email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className='w-full px-4 py-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500' 
                />
                <input 
                    type="password"
                    required
                    placeholder='Password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className='w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 text-black focus:ring-blue-500'
                    minLength={8} 
                />

                {errorMsg && <p className='text-red-500'>{errorMsg}</p>}

                <button
                    type='submit'
                    disabled={loading}
                    className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-7000 transition'
                >
                    {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}
                </button>
            </form>

            <p className='mt-4 text-center'>
                {mode === 'login' ? (
                    <>
                        <span className='text-black'>Don&apos;t have an account?{' '}</span>
                        <button 
                            className='text-blue-600 underline' 
                            onClick={() => setMode('signup')}
                        >
                            Sign Up
                        </button>
                    </>
                ) : (
                    <>
                        <span className='text-black'>Already have an account?{' '}</span>
                        <button
                            className='text-blue-600 underline'
                            onClick={() => setMode('login')}
                        >
                            Log In
                        </button>
                    </>
                )}
            </p>
        </div>
    );
}