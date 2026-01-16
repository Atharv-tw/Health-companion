'use client';

import { useState } from 'react';
import { Report } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface ReportsListProps {
  reports: Report[];
}

export default function ReportsList({ reports }: ReportsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete report');
    } finally {
      setDeletingId(null);
    }
  };

  const openReport = (url: string) => {
      window.open(url, '_blank');
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No reports uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report.id} className="group relative hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate pr-6" title={report.fileName}>
              {report.fileName}
            </CardTitle>
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0 text-gray-500">
                <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(report.createdAt), 'PPP')}</span>
              </div>
              <p>{(report.size / 1024 / 1024).toFixed(2)} MB • {report.mimeType.split('/')[1].toUpperCase()}</p>
            </div>
            
            <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => openReport(report.storageKey)}>
                    <ExternalLink className="h-4 w-4" />
                    View
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    disabled={deletingId === report.id}
                    onClick={() => handleDelete(report.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
