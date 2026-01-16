"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { FileText, Trash2, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportAnalysis } from "@/components/reports/ReportAnalysis";

interface Report {
  id: string;
  fileName: string;
  size: number;
  createdAt: string;
  storageKey: string;
  reportType?: string | null;
}

interface ReportsListProps {
  refreshTrigger: number;
}

export function ReportsList({ refreshTrigger }: ReportsListProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [analyzingReport, setAnalyzingReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
  }, [refreshTrigger]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-medium text-gray-900">
            No reports yet
          </CardTitle>
          <CardDescription>
            Uploaded medical reports will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="overflow-hidden group">
            <div className="p-4 flex items-start space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate" title={report.fileName}>
                  {report.fileName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(report.size / 1024 / 1024).toFixed(2)} MB •{" "}
                  {format(new Date(report.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-t border-gray-100 gap-2">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2"
                  asChild
                >
                  <a href={report.storageKey} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    View
                  </a>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8 px-2"
                  onClick={() => setAnalyzingReport(report)}
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Analyze
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                onClick={() => handleDelete(report.id)}
                disabled={deletingId === report.id}
              >
                {deletingId === report.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {analyzingReport && (
        <ReportAnalysis 
          report={analyzingReport} 
          onClose={() => setAnalyzingReport(null)} 
        />
      )}
    </>
  );
}