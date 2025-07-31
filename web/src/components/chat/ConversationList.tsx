"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { format } from "date-fns";

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
  initialConversations: PlainConversation[];
}

export function ConversationList({
  initialConversations,
}: ConversationListProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [isClient, setIsClient] = useState(false);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    pusherClient.subscribe(currentUserId);

    const handleNewMessage = (data: {
      conversationId: string;
      text: string;
      createdAt: string;
      senderId: string;
    }) => {
      setConversations((prev) => {
        const existing = prev.find(
          (c) => c.conversationId === data.conversationId
        );
        if (existing) {
          const updated = {
            ...existing,
            lastMessageText: data.text,
            lastMessageAt: data.createdAt,
          };
          return [
            updated,
            ...prev.filter((c) => c.conversationId !== data.conversationId),
          ];
        }
        return prev;
      });
    };

    pusherClient.bind("messages:new", handleNewMessage);

    return () => {
      pusherClient.unsubscribe(currentUserId);
      pusherClient.unbind("messages:new", handleNewMessage);
    };
  }, [currentUserId]);

  return (
    <div className="overflow-y-auto">
      {conversations.map((convo, idx) => (
        <div key={convo.conversationId}>
          <Link
            href={`/chat/${convo.conversationId}`}
            className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors duration-150 gap-4 border-b border-gray-200 min-w-0"
          >
            <div className="relative w-12 h-12 flex-shrink-0">
              {convo.otherUser.avatarUrl ? (
                <Image
                  src={convo.otherUser.avatarUrl}
                  alt={convo.otherUser.fullName}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {convo.otherUser.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold truncate max-w-[70%] capitalize">
                  {convo.otherUser.fullName}
                </h3>
                <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {format(new Date(convo.lastMessageAt), "hh:mm a")}
                </p>
              </div>
              <p className="text-sm text-gray-700 break-all line-clamp-2 pr-15">
                {convo.lastMessageText}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
