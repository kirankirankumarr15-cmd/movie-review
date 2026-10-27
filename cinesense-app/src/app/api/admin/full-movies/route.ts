import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

function isAuthorized(request: Request): boolean {
  if (process.env.NODE_ENV === 'test') return true;
  const email = request.headers.get('x-user-email');
  return email?.trim().toLowerCase() === 'kirankirankumarr15@gmail.com';
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const list = await dbService.getAllLegalFullMovies();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    const { id, status, reason } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required id or status' }, { status: 400 });
    }

    if (!['verified_approved', 'pending_admin', 'rejected_pirated_or_unverified'].includes(status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    await dbService.updateLegalFullMovieStatus(id, status, reason);
    return NextResponse.json({ success: true, id, status, reason });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
