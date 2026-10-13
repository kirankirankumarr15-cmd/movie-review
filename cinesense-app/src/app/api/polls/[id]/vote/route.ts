import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { optionId, userId = 'user-demo' } = body;

    if (!optionId) {
      return NextResponse.json({ error: 'optionId is required' }, { status: 400 });
    }

    const updatedPoll = await dbService.votePoll(id, userId, optionId);
    if (!updatedPoll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, poll: updatedPoll });
  } catch (error: any) {
    return NextResponse.json({ error: 'Vote failed', message: error.message }, { status: 500 });
  }
}
