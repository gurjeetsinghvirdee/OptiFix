import './globals.css';
import React from 'react';

export const metadata = {
    title: 'OptiFix',
    description: 'Privacy-first image optimization'
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang='en'>
            <body className='bg-gray-50 min-h-screen font-sans text-gray-900'>
                <main className='max-w-3xl mx-auto p-4'>{children}</main>
            </body>
        </html>
    );
}