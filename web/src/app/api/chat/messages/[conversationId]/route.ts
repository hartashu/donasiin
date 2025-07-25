import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMessagesByConversationId } from '@/lib/services/chat.service';

export async function GET(
    request: Request,
    { params }: { params: { conversationId: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!params.conversationId.includes(session.user.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const messages = await getMessagesByConversationId(params.conversationId);
        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}