import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import SOSButton from '@/components/sos/SOSButton';
import EmergencyContacts from '@/components/sos/EmergencyContacts';

export default async function SOSPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
      redirect('/login');
  }

  // Fetch contacts for both components
  const contacts = await prisma.emergencyContact.findMany({
    where: { 
        userId: session.user.id 
    },
  });

  return (
    <div className="max-w-xl mx-auto space-y-12 p-8 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-red-600">EMERGENCY SOS</h1>
        <p className="text-lg text-gray-600">
            Press the button below to instantly access your emergency contacts and alert services.
        </p>
      </div>

      <div className="py-8">
        <SOSButton initialContacts={contacts} />
      </div>

      <div className="text-left space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Manage Contacts</h2>
        <EmergencyContacts contacts={contacts} />
        <p className="text-xs text-gray-500 text-center pt-4">
            * In a life-threatening emergency, always call local emergency services immediately if the app is unresponsive.
        </p>
      </div>
    </div>
  );
}