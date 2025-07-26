import { NextResponse } from 'next/server';
import { getSession } from '@/utils/getSession';
import { ChatModel } from '@/models/chat.model';
import handleError from '@/errorHandler/errorHandler';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { receiverId, text } = body;

        if (!receiverId || !text) {
            return NextResponse.json({ error: 'Missing receiverId or text' }, { status: 400 });
        }

        const newMessage = await ChatModel.createMessage(session.user.id, receiverId, text);
        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}