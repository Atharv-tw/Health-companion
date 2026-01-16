import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  relationship: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const count = await prisma.emergencyContact.count({
      where: { userId: session.user.id },
    });

    if (count >= 3) {
      return NextResponse.json({ error: 'Maximum 3 contacts allowed' }, { status: 400 });
    }

    const json = await req.json();
    const body = contactSchema.parse(json);

    const contact = await prisma.emergencyContact.create({
      data: {
        ...body,
        userId: session.user.id,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
