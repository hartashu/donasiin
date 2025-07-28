// 'use client';

// import Link from 'next/link';
// import { formatDistanceToNowStrict } from 'date-fns';
// import type { Conversation } from '@/lib/services/chat.service';

// interface ConversationListProps {
//     initialConversations: Conversation[];
// }

// export function ConversationList({ initialConversations }: ConversationListProps) {

//     const formatTimestamp = (timestamp: Date) => {
//         return formatDistanceToNowStrict(timestamp, { addSuffix: true });
//     };

//     return (
//         <div className="overflow-y-auto">
//             {initialConversations.length === 0 ? (
//                 <div className="p-4 text-center text-gray-500">
//                     No conversations yet.
//                 </div>
//             ) : (
//                 <ul>
//                     {initialConversations.map((convo) => (
//                         <li key={convo.conversationId}>
//                             <Link
//                                 href={`/chat/${convo.conversationId}`}
//                                 className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50"
//                             >
//                                 <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 flex-shrink-0">
//                                     {convo.otherUser.avatarUrl ? (
//                                         <img src={convo.otherUser.avatarUrl} alt={convo.otherUser.fullName} className="w-full h-full rounded-full object-cover" />
//                                     ) : (
//                                         <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
//                                             {convo.otherUser.fullName.charAt(0).toUpperCase()}
//                                         </div>
//                                     )}
//                                 </div>
//                                 <div className="flex-1 overflow-hidden">
//                                     <div className="flex justify-between items-center">
//                                         <h3 className="font-semibold truncate">{convo.otherUser.fullName}</h3>
//                                         <p className="text-xs text-gray-500 whitespace-nowrap">
//                                             {formatTimestamp(convo.lastMessageAt)}
//                                         </p>
//                                     </div>
//                                     <p className="text-sm text-gray-600 truncate">{convo.lastMessageText}</p>
//                                 </div>
//                             </Link>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// }

'use client';

import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import type { IConversationInboxItem } from '@/types/types';
import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';
import Image from 'next/image';

interface ConversationListProps {
    currentUser: any;
    initialConversations: IConversationInboxItem[];
}

export function ConversationList({ currentUser, initialConversations }: ConversationListProps) {
    const [conversations, setConversations] = useState(initialConversations);

    useEffect(() => {
        if (!currentUser?.id) return;

        const handleNewMessage = (newMessage: any) => {
            setConversations((currentConversations) => {
                const updatedConversations = currentConversations.filter(
                    (convo) => convo.conversationId !== newMessage.conversationId
                );

                const newConvoItem: IConversationInboxItem = {
                    conversationId: newMessage.conversationId,
                    lastMessageText: newMessage.text,
                    lastMessageAt: newMessage.createdAt,
                    otherUser: newMessage.senderId === currentUser.id
                        ? newMessage.receiver
                        : newMessage.sender,
                };

                window.location.reload();

                return [newConvoItem, ...updatedConversations];
            });
        };

        conversations.forEach(convo => {
            const channel = pusherClient.subscribe(convo.conversationId);
            channel.bind('messages:new', handleNewMessage);
        });

        return () => {
            conversations.forEach(convo => {
                pusherClient.unsubscribe(convo.conversationId);
            });
        };
    }, [conversations, currentUser?.id]);

    return (
        <div className="overflow-y-auto">
            {conversations.map((convo) => (
                <Link key={convo.conversationId} href={`/chat/${convo.conversationId}`} className="flex items-center p-4 border-b hover:bg-gray-50">
                    <div className="relative w-12 h-12 rounded-full mr-4 flex-shrink-0">
                        {convo.otherUser.avatarUrl ? (
                            <Image src={convo.otherUser.avatarUrl} alt={convo.otherUser.fullName} fill className="rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                {convo.otherUser.fullName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold truncate">{convo.otherUser.fullName}</h3>
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                                {formatDistanceToNowStrict(new Date(convo.lastMessageAt), { addSuffix: true })}
                            </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{convo.lastMessageText}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}