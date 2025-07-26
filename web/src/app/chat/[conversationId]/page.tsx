import { auth } from "@/lib/auth";
import { ChatModel } from "@/models/chat.model";
import { UserModel } from "@/models/user.model";
import { redirect } from "next/navigation";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { ObjectId } from "mongodb";

interface ChatRoomPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { conversationId } = await params;
  if (!conversationId.includes(session.user.id)) {
    redirect("/chat");
  }

  const initialMessages = await ChatModel.getMessagesByConversationId(
    conversationId
  );

  const participantIds = conversationId.split("_");
  const otherUserId = participantIds.find((id) => id !== session.user.id);

  let otherUser = null;
  if (otherUserId && ObjectId.isValid(otherUserId)) {
    otherUser = await UserModel.getUserById(otherUserId); // Asumsi ada fungsi ini
  }

  if (!otherUser) {
    redirect("/chat");
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatRoom
        initialMessages={JSON.parse(JSON.stringify(initialMessages))}
        currentUser={session.user}
        otherUser={{
          id: otherUser._id.toString(),
          fullName: otherUser.fullName,
          avatarUrl: otherUser.avatarUrl,
        }}
        conversationId={conversationId}
      />
    </div>
  );
}
