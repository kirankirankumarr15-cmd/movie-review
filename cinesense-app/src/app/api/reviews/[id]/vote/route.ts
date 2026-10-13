import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { voteType, userId = 'anonymous_user' } = body;

    if (!['up', 'down'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid voteType. Use "up" or "down".' }, { status: 400 });
    }

    const updatedScores = await dbService.voteReviewHelpfulness(id, userId, voteType);
    return NextResponse.json({ success: true, ...updatedScores });
  } catch (error: any) {
    return NextResponse.json({ error: 'Vote failed', message: error.message }, { status: 500 });
  }
}
