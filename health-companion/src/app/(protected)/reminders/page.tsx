import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import ReminderList from '@/components/reminders/ReminderList';

export default async function RemindersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
      redirect('/login');
  }

  // Assuming session.user.id exists
  const reminders = await prisma.reminder.findMany({
    where: { 
        userId: session.user.id 
    },
    orderBy: { 
        createdAt: 'desc' 
    },
  });

  return (
    <div className="space-y-8 p-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Health Reminders</h1>
        <p className="text-gray-500">Never miss your medications or daily health habits.</p>
      </div>

      <ReminderList initialReminders={reminders} />
    </div>
  );
}