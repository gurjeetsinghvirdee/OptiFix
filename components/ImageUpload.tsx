'use client';

import React, { useCallback, useState } from 'react';

export default function ImageUpload({
    onUpload,
} : {
    onUpload: (file: File) => void;
}) {
    const [dragging, setDragging] = useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type === 'image/jpeg' || file.type === 'image/png') {
                    onUpload(file);
                }
                e.dataTransfer.clearData();
            }
        },
        [onUpload]
    );

    return (
        <div 
            className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${dragging ? 'border-blue-600 bg-blue-50' : 'border-gray-400'}`}
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
                const input = document.getElementById('file-input');
                input?.click();
            }}
        >
            <input 
                type='file' 
                id='fileInput'
                accept='image/jpeg,image/png'
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        onUpload(e.target.files[0])
                    }
                }}
                className='hidden'
            />
            <p>Drag & drop an image here, or click to select (JPEG, PNG only)</p>
        </div>
    );
}