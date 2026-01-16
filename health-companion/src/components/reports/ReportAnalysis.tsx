"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface Report {
  id: string;
  fileName: string;
  reportType?: string | null;
}

interface ReportAnalysisProps {
  report: Report;
  onClose: () => void;
}

export function ReportAnalysis({ report, onClose }: ReportAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeReport = async () => {
      try {
        setLoading(true);
        // Use dedicated analyze endpoint that uses extracted text from the report
        const response = await fetch(`/api/reports/${report.id}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to analyze report");
        }

        const data = await response.json();
        setAnalysis(data.analysis);
      } catch (err) {
        console.error(err);
        setError("Unable to analyze report at this time. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    analyzeReport();
  }, [report]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-purple-900">AI Analysis</CardTitle>
              <p className="text-xs text-gray-500">{report.fileName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-25"></div>
                <div className="relative bg-white p-3 rounded-full shadow-sm border">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              </div>
              <p className="text-sm text-gray-500 animate-pulse">
                Reading report and interpreting medical data...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-900 font-medium">Analysis Failed</p>
              <p className="text-sm text-gray-500 max-w-xs">{error}</p>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          ) : (
            <div className="prose prose-purple prose-sm max-w-none">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Disclaimer:</strong> This is an AI-generated summary. It is not a medical diagnosis. Always review the original document and consult a healthcare professional.
                    </p>
                  </div>
                </div>
              </div>
              <ReactMarkdown>{analysis || "No analysis available."}</ReactMarkdown>
            </div>
          )}
        </CardContent>
        
        {!loading && !error && (
            <div className="p-4 border-t bg-gray-50 flex justify-end">
                <Button onClick={onClose}>Done</Button>
            </div>
        )}
      </Card>
    </div>
  );
}
