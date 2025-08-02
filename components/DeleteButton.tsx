'use client';

import React from 'react';

export default function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm('Are you sure you want to delete your images? This action cannot be undone.')) {
          onDelete();
        }
      }}
      className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
      aria-label="Delete my images"
    >
      Delete My Images
    </button>
  );
}