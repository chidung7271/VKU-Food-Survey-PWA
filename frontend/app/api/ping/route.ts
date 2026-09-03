import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Endpoint kiểm tra kết nối mạng (luôn không cache)
export async function GET() {
  return NextResponse.json(
    { status: 'ok', time: Date.now() },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}

