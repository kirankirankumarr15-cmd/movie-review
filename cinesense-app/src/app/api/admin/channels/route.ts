import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { OfficialChannel } from '@/lib/db/types';

export async function GET() {
  try {
    const channels = await dbService.getOfficialChannels();
    return NextResponse.json(channels);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
