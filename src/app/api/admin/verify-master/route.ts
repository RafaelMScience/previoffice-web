import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, verifyMasterKey } from '@/lib/security/admin-guard';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // 1. Rate Limit Check
  const rateLimit = checkRateLimit(ip, 'admin-verify-master', 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many failed attempts. Temporary IP security lockout.',
        remaining: 0,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { masterKey } = body;

    if (!masterKey || !verifyMasterKey(masterKey)) {
      return NextResponse.json(
        {
          error: 'Invalid master administrator key.',
          remaining: rateLimit.remaining,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Master authentication granted.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Malformed request payload.' },
      { status: 400 }
    );
  }
}
