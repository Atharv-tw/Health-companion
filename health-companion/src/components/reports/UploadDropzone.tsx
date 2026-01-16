"use client";

import { useState, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onUploadComplete: () => void;
}

export function UploadDropzone({ onUploadComplete }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      validateAndSetFile(selectedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Max size is 10MB.");
      return;
    }

    // Validate type
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Only PDF, JPG, and PNG are allowed.");
      return;
    }

    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Upload to Vercel Blob
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/reports/upload-url",
        onUploadProgress: (progressEvent) => {
          setProgress((progressEvent.percentage / 100) * 90);
        },
      });

      // 2. Save metadata to our DB
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          storageKey: blob.url,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save report metadata");
      }

      setProgress(100);
      setFile(null);
      onUploadComplete();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-200",
          error ? "border-red-300 bg-red-50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={isUploading}
        />

        {!file ? (
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer space-y-2"
          >
            <div className="p-3 bg-gray-100 rounded-full">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <div className="text-sm font-medium text-gray-900">
              <span className="text-primary hover:underline">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
          </label>
        ) : (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded border border-gray-200">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={() => setFile(null)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {isUploading && (
          <div className="mt-4 space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 text-right">{Math.round(progress)}%</p>
          </div>
        )}

        {file && !isUploading && (
          <Button onClick={handleUpload} className="mt-4 w-full">
            Upload Report
          </Button>
        )}
      </div>
    </div>
  );
}
