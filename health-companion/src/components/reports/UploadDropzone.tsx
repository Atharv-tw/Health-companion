"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, AlertCircle, Loader2 } from "lucide-react";
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
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Max size is 10MB.");
      return;
    }

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
      // Upload to OnDemand Media API for text extraction
      const formData = new FormData();
      formData.append("file", file);

      setProgress(30);

      const response = await fetch("/api/reports/upload-direct", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload report");
      }

      await response.json();

      setProgress(100);
      setFile(null);
      onUploadComplete();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-700/30",
          error ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20" : ""
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
            className="flex flex-col items-center justify-center cursor-pointer space-y-4"
          >
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-gray-100">Document Upload</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-tighter">PDF, PNG, JPG up to 10MB</p>
            </div>
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/5 rounded-xl">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate max-w-[150px] uppercase">
                  {file.name}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold tracking-widest">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={() => setFile(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center space-x-2 mt-6 text-[10px] font-bold uppercase tracking-widest text-red-500">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}

        {isUploading && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              Uploading Documents...
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {file && !isUploading && (
          <Button onClick={handleUpload} className="mt-6 w-full h-12 rounded-2xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold uppercase tracking-widest text-[10px] shadow-xl">
            Secure Upload
          </Button>
        )}
      </div>
    </div>
  );
}
