import { NextResponse } from 'next/server';
import { getSession } from '@/utils/getSession';
import { ChatModel } from '@/models/chat.model';
import handleError from '@/errorHandler/errorHandler';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const conversations = await ChatModel.getConversations(session.user.id);
        return NextResponse.json(conversations);
    } catch (error) {
        return handleError(error);
    }
}