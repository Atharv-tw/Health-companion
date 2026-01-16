import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import UploadDropzone from '@/components/reports/UploadDropzone';
import ReportsList from '@/components/reports/ReportsList';

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
      redirect('/login');
  }

  // We need to fetch the user ID based on email if it's not in session token properly
  // But our auth.ts callbacks usually put id in session. 
  // Let's assume session.user.id exists as per types/next-auth.d.ts
  
  const reports = await prisma.report.findMany({
    where: { 
        userId: session.user.id 
    },
    orderBy: { 
        createdAt: 'desc' 
    },
  });

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Medical Reports</h1>
        <p className="text-gray-500">
            Securely upload and organize your medical documents, prescriptions, and test results.
            Our AI Agent can access these to provide better health insights.
        </p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Upload New</h2>
            <UploadDropzone />
        </div>
        
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Documents</h2>
            <ReportsList reports={reports} />
        </div>
      </div>
    </div>
  );
}