'use client';

import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { useEffect, useState } from 'react';
import Image from 'next/image';
// NOTE: Session type is no longer needed as the prop using it has been removed.
// import type { Session } from 'next-auth';

type PlainConversation = {
    conversationId: string;
    lastMessageText: string;
    lastMessageAt: string;
    otherUser: {
        _id: string;
        fullName: string;
        username: string;
        avatarUrl?: string;
    };
};

interface ConversationListProps {
    // FIX: Removed unused 'currentUser' prop.
    initialConversations: PlainConversation[];
}

export function ConversationList({ initialConversations }: ConversationListProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="overflow-y-auto">
            {initialConversations.map((convo) => (
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
                                {isClient ? formatDistanceToNowStrict(new Date(convo.lastMessageAt), { addSuffix: true }) : '...'}
                            </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{convo.lastMessageText}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
