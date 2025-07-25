import { auth } from '@/lib/auth';
import { getConversations } from '@/lib/services/chat.service';
import { ConversationList } from '@/components/chat/ConversationList';
import { redirect } from 'next/navigation';

export default async function ChatPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/auth/login');
    }

    const conversations = await getConversations(session.user.id);

    return (
        <div className="flex h-screen">
            <div className="w-full md:w-1/3 border-r border-gray-200">
                <header className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold">Chats</h1>
                </header>
                <ConversationList initialConversations={conversations} />
            </div>
            <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 text-center">
                <h2 className="text-xl font-semibold text-gray-500">Select a chat to start messaging</h2>
                <p className="text-gray-400">Your conversations will appear here.</p>
            </div>
        </div>
    );
}