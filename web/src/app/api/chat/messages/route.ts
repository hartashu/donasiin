import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createMessage } from '@/lib/services/chat.service';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { receiverId, text } = body;

        if (!receiverId || !text) {
            return NextResponse.json({ error: 'Missing receiverId or text' }, { status: 400 });
        }

        const newMessage = await createMessage(session.user.id, receiverId, text);
        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}