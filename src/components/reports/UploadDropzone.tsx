'use client';

import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { Button } from '@/components/ui/button';
import { Upload, File, Loader2, X, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default function UploadDropzone() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Not fully supported by vercel blob client yet without xhr, but we can simulate or show loading
  const router = useRouter();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setIsUploading(true);

    try {
      // 1. Upload to Vercel Blob
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/reports/upload-url',
      });

      // 2. Save metadata to our DB
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          storageKey: blob.url,
          reportType: 'general', // Default for now, can add selector later
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save report metadata');
      }

      router.refresh();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="p-8 border-2 border-dashed border-gray-200 hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center gap-4"
          onClick={() => fileInputRef.current?.click()}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="application/pdf,image/jpeg,image/png"
      />
      
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Uploading...</p>
        </div>
      ) : (
        <>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
                <h3 className="font-semibold text-lg text-gray-900">Upload Report</h3>
                <p className="text-sm text-gray-500">PDF, JPG or PNG (max 10MB)</p>
            </div>
            <Button variant="outline" className="mt-2">Select File</Button>
        </>
      )}
    </Card>
  );
}
