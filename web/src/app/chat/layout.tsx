import { auth } from '@/lib/auth';
import { ChatModel } from '@/models/chat.model';
import { ConversationList } from '@/components/chat/ConversationList';
import { redirect } from 'next/navigation';

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/auth/login');
    }

    const conversations = await ChatModel.getConversations(session.user.id);

    return (
        <div className="flex h-screen">
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-white">
                <header className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold">Chats</h1>
                </header>
                <ConversationList initialConversations={conversations} />
            </div>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}