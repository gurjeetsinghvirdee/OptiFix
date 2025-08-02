'use client';

import React from 'react';

export default function ImagePreview({
    original,
    optimized,
} : {
    original: string;
    optimized: string | null;
}) {
    return (
        <div className='mt-6 flex flex-col md:flex-row gap-6'>
            <div className='flex-1'>
                <p className='mb-2 font-semibold'>Original Image</p>
                {optimized ? (
                    <>
                        <img 
                            src={optimized} 
                            alt='Optimized version'  
                            className='max-w-full rounded shadow'
                        />
                        <a 
                            href={optimized}
                            download='optimized-image'
                            className='inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'    
                        >
                            Download Optimized Image
                        </a>
                    </>
                ) : (
                    <p className='italic text-gray-500'>Optimized image will appear here after processing.</p>
                )}
            </div>
        </div>
    );
}