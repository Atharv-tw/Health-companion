import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { del } from '@vercel/blob';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!report) {
      return new NextResponse('Report not found', { status: 404 });
    }

    if (report.storageKey) {
        try {
            await del(report.storageKey);
        } catch (e) {
            console.error("Failed to delete blob", e);
        }
    }

    await prisma.report.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('REPORT_DELETE_ERROR', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!report) {
      return new NextResponse('Report not found', { status: 404 });
    }

    return NextResponse.redirect(report.storageKey);

  } catch (error) {
    console.error('REPORT_GET_ERROR', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
