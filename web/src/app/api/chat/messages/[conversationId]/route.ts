import { NextResponse } from "next/server";
import { getSession } from "@/utils/getSession";
import { ChatModel } from "@/models/chat.model";
import handleError from "@/errorHandler/errorHandler";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const session = await getSession();

        const { conversationId } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!conversationId.includes(session.user.id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const messages = await ChatModel.getMessagesByConversationId(
            conversationId
        );
        return NextResponse.json(messages);
    } catch (error) {
        return handleError(error);
    }
}
