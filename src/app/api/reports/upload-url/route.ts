import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string /*, clientPayload?: string */) => {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
          throw new Error('Unauthorized');
        }

        // Return the allowed access and user metadata
        return {
          allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            email: session.user.email,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This is called via webhook after upload if configured, 
        // but for this plan we are manually saving metadata from the client side 
        // to a separate endpoint (POST /api/reports) to keep it simple and synchronous for the user UI.
        // So we can leave this empty or log it.
        console.log('Blob uploaded:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times if you return 400
    );
  }
}
