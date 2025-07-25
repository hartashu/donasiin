'use client';

import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import type { Conversation } from '@/lib/services/chat.service';

interface ConversationListProps {
    initialConversations: Conversation[];
}

export function ConversationList({ initialConversations }: ConversationListProps) {

    const formatTimestamp = (timestamp: Date) => {
        return formatDistanceToNowStrict(timestamp, { addSuffix: true });
    };

    return (
        <div className="overflow-y-auto">
            {initialConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                    No conversations yet.
                </div>
            ) : (
                <ul>
                    {initialConversations.map((convo) => (
                        <li key={convo.conversationId}>
                            <Link
                                href={`/chat/${convo.conversationId}`}
                                className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 flex-shrink-0">
                                    {convo.otherUser.avatarUrl ? (
                                        <img src={convo.otherUser.avatarUrl} alt={convo.otherUser.fullName} className="w-full h-full rounded-full object-cover" />
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
                                            {formatTimestamp(convo.lastMessageAt)}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{convo.lastMessageText}</p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}