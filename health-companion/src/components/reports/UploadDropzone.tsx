"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
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

    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "text/markdown", "text/plain"];
    if (!validTypes.includes(file.type)) {
      setError("Only medical documents (PDF, JPG, PNG, MD) are accepted.");
      return;
    }

    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // 1. Prepare Multipart Form Data
      const formData = new FormData();
      formData.append("file", file);

      // 2. Submit directly to our API (which now forwards to OnDemand DB)
      const response = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || "Synchronization with Knowledge Base failed.");
      }

      setFile(null);
      onUploadComplete();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Sync failed. Check your network or file format.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-100 bg-gray-50/30",
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
          accept=".pdf,.jpg,.jpeg,.png,.md,.txt"
          disabled={isUploading}
        />

        {!file ? (
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer space-y-4"
          >
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-gray-900">Clinical Acquisition</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Drag or click to ingest medical docs</p>
            </div>
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/5 rounded-xl">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900 truncate max-w-[150px] uppercase">
                  {file.name}
                </p>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={() => setFile(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
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
              Ingesting to Vector DB...
            </div>
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                animate={{ x: ["-100%", "100%"] }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="h-full w-full bg-primary" 
              />
            </div>
          </div>
        )}

        {file && !isUploading && (
          <Button onClick={handleUpload} className="mt-6 w-full h-12 rounded-2xl bg-gray-900 text-white font-bold uppercase tracking-widest text-[10px] shadow-xl">
            Authorize Ingestion
          </Button>
        )}
      </div>
    </div>
  );
}