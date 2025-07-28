// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ConversationList } from "@/components/chat/ConversationList";

// export default function ChatLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchConversations = async () => {
//       try {
//         const res = await fetch("/api/chat/conversations");
//         const data = await res.json();
//         console.log("Conversations:", data);

//         if (res.status === 401) {
//           router.push("/auth/login");
//           return;
//         }

//         setConversations(data);
//       } catch (err) {
//         console.error("Failed to fetch conversations:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConversations();
//   }, []);

//   if (loading) {
//     return <div className="p-6 text-center">Loading conversations...</div>;
//   }

//   return (
//     <div className="flex h-screen">
//       <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-white">
//         <header className="p-4 border-b border-gray-200">
//           <h1 className="text-xl font-bold">Chats</h1>
//         </header>
//         <ConversationList initialConversations={conversations} />
//       </div>
//       <main className="flex-1">{children}</main>
//     </div>
//   );
// }

// import { auth } from '@/lib/auth';
// import { ChatModel } from '@/models/chat.model';
// import { ConversationList } from '@/components/chat/ConversationList';
// import { redirect } from 'next/navigation';

// export default async function ChatLayout({ children }: { children: React.ReactNode }) {
//   const session = await auth();
//   if (!session?.user?.id) {
//     redirect('/auth/login');
//   }
//   const conversations = await ChatModel.getConversations(session.user.id);

//   return (
//     <div className="flex h-screen bg-white">
//       <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
//         <header className="p-4 border-b border-gray-200">
//           <h1 className="text-xl font-bold">Chats</h1>
//         </header>
//         <ConversationList initialConversations={conversations} currentUser={session.user} />
//       </div>
//       <main className="hidden md:flex flex-1 flex-col">
//         {children}
//       </main>
//     </div>
//   );
// }

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
        <ConversationList initialConversations={plainConversations} currentUser={session.user} />
      </div>
      <main className="hidden md:flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
