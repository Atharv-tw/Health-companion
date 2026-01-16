import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Log the trigger if we had an AuditLog model
  // For now, just fetch contacts
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ 
    triggered: true, 
    contacts, 
    message: "Emergency mode activated. Contacts retrieved." 
  });
}
