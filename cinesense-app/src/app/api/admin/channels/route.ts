import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { OfficialChannel } from '@/lib/db/types';

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
    const channels = await dbService.getOfficialChannels();
    return NextResponse.json(channels);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    const { channel_id, channel_name, language, notes } = body;

    if (!channel_id || !channel_name) {
      return NextResponse.json({ error: 'channel_id and channel_name are required' }, { status: 400 });
    }

    const newChannel: OfficialChannel = {
      id: `ch-${Date.now()}`,
      channel_id,
      channel_name,
      language: language || 'hi',
      verified_date: new Date().toISOString(),
      is_whitelisted: true,
      notes: notes || 'Admin added rights holder'
    };

    await dbService.addOfficialChannel(newChannel);
    return NextResponse.json({ success: true, channel: newChannel });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channel_id');

    if (!channelId) {
      return NextResponse.json({ error: 'channel_id query parameter is required' }, { status: 400 });
    }

    await dbService.removeOfficialChannel(channelId);
    return NextResponse.json({ success: true, removed: channelId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
