"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { pusherClient } from "@/lib/pusher";
import type { Session } from "next-auth";

type Message = {
    _id: string;
    senderId: string;
    text: string;
    createdAt: string;
};

type OtherUser = {
    id: string;
    fullName?: string | null;
    avatarUrl?: string | null;
};

interface ChatRoomProps {
    initialMessages: Message[];
    currentUser: Session["user"];
    otherUser: OtherUser;
    conversationId: string;
}

export function ChatRoom({
    initialMessages,
    currentUser,
    otherUser,
    conversationId,
}: ChatRoomProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [text, setText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        pusherClient.subscribe(conversationId);

        const handleNewMessage = (newMessage: Message) => {
            if (newMessage.senderId !== currentUser.id) {
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        pusherClient.bind("messages:new", handleNewMessage);

        return () => {
            pusherClient.unsubscribe(conversationId);
            pusherClient.unbind("messages:new", handleNewMessage);
        };
    }, [conversationId, currentUser.id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;

        const optimisticMessage: Message = {
            _id: Math.random().toString(),
            senderId: currentUser.id,
            text: text,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);
        setText("");

        await fetch("/api/chat/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId: otherUser.id, text }),
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-white overflow-x-hidden">
            <header className="flex items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-10 shadow-sm">
                <Link
                    href="/chat"
                    className="p-2 rounded-full hover:bg-gray-100 md:hidden mr-2"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="w-10 h-9 rounded-full bg-gray-300 mr-3 relative overflow-hidden">
                    {otherUser.avatarUrl ? (
                        <Image
                            src={otherUser.avatarUrl}
                            alt={otherUser.fullName || ""}
                            fill
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-base">
                            {otherUser.fullName?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <h2 className="font-semibold">{otherUser.fullName}</h2>
            </header>

            <main
                className="flex-1 overflow-y-scroll overflow-x-hidden p-4 bg-gray-50"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                <div
                    className="flex flex-col gap-4"
                    style={{
                        scrollbarWidth: "none",
                    }}
                >
                    <style jsx>{`
            main::-webkit-scrollbar {
              display: none;
            }
          `}</style>

                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`flex items-end gap-2 ${msg.senderId === currentUser.id
                                ? "justify-end"
                                : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[75%] break-words p-3 rounded-2xl ${msg.senderId === currentUser.id
                                    ? "bg-green-700 text-white rounded-br-none"
                                    : "bg-white text-black border border-gray-200 rounded-bl-none"
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                <p
                                    className={`text-xs mt-1 text-right ${msg.senderId === currentUser.id
                                        ? "text-green-200"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {format(new Date(msg.createdAt), "p")}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </main>

            <footer className="p-3 border-t border-gray-200 bg-white">
                <form
                    onSubmit={handleSubmit}
                    className="flex items-end gap-2 w-full px-4 py-2 bg-white "
                >
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-600 text-sm leading-relaxed break-words overflow-hidden"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                (e.target as HTMLFormElement).form?.requestSubmit();
                            }
                        }}
                    />

                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className="shrink-0 bg-green-700 hover:bg-green-800 text-white p-2 rounded-lg disabled:bg-gray-400 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
