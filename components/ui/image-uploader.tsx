'use client';

import { useState, useRef, useCallback } from 'react';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

type ImageUploaderProps = {
  value?: string;
  onUpload?: (url: string) => void;
  onRemove?: () => void;
  className?: string;
};

export function ImageUploader({ value, onUpload, onRemove, className }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setError(null);

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('Cloudinary not configured');
      return;
    }

    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();

      if (data.secure_url) {
        onUpload?.(data.secure_url);
      } else {
        setError(data.error?.message || 'Upload failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    }
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  // Has image
  if (value) {
    return (
      <div className={className}>
        <div className="relative group/img">
          <img src={value} alt="Uploaded" className="w-full h-40 object-cover rounded-lg" />
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-colors rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover/img:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg bg-red-500/30 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/50 transition-colors"
            >
              Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <span className="text-white text-xs">Uploading...</span>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />
      </div>
    );
  }

  // No image — drag & drop zone
  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
          ${dragging
            ? 'border-foreground/40 bg-foreground/5 text-foreground/60'
            : 'border-foreground/10 text-foreground/30 hover:border-foreground/20 hover:text-foreground/40'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {uploading ? (
          <span className="text-xs">Uploading to Cloudinary...</span>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs">Drop image or click to upload</span>
          </>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
