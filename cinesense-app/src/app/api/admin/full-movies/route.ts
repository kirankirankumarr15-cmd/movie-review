import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const list = await dbService.getAllLegalFullMovies();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
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
