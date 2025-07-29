import { auth } from '@/lib/auth';
import { ChatModel } from '@/models/chat.model';
import { ConversationList } from '@/components/chat/ConversationList';
import { redirect } from 'next/navigation';
import ChatHeader from '@/components/chat/ChatHeader';

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const conversations = await ChatModel.getConversations(session.user.id);

  const plainConversations = conversations.map(convo => ({
    ...convo,
    lastMessageAt: convo.lastMessageAt.toISOString(),
    otherUser: {
      ...convo.otherUser,
      _id: convo.otherUser._id.toString(),
    }
  }));

  return (
    <div className="flex h-screen bg-white">
      <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
        <ChatHeader />
        {/* FIX: Removed the 'currentUser' prop as it's no longer needed */}
        <ConversationList initialConversations={plainConversations} />
      </div>
      <main className="hidden md:flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
