import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createReminderSchema = z.object({
  type: z.enum(['MEDICINE', 'WATER', 'SLEEP', 'CUSTOM']),
  title: z.string().min(1),
  schedule: z.object({
    times: z.array(z.string()),
    frequency: z.enum(['daily', 'custom']),
    days: z.array(z.number()).optional(),
  }),
  enabled: z.boolean().optional(),
});

export async function GET(_req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reminders = await prisma.reminder.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reminders);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await req.json();
    const body = createReminderSchema.parse(json);

    const reminder = await prisma.reminder.create({
      data: {
        type: body.type,
        title: body.title,
        schedule: body.schedule,
        enabled: body.enabled ?? true,
        userId: session.user.id,
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
