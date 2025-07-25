import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConversations } from '@/lib/services/chat.service';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const conversations = await getConversations(session.user.id);
        return NextResponse.json(conversations);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}