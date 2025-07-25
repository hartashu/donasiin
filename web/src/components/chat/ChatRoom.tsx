'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

// Tipe data ini bisa Anda pindahkan ke file types.ts jika mau
type Message = {
    _id: string;
    senderId: string;
    text: string;
    createdAt: string;
};
type User = {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
};
type OtherUser = {
    id: string;
    fullName?: string | null;
    avatarUrl?: string | null;
};

interface ChatRoomProps {
    initialMessages: Message[];
    currentUser: User;
    otherUser: OtherUser;
    conversationId: string;
}

export function ChatRoom({ initialMessages, currentUser, otherUser, conversationId }: ChatRoomProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [text, setText] = useState('');
    const [isPending, startTransition] = useTransition();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll ke pesan terakhir saat komponen dimuat
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;

        const optimisticMessage: Message = {
            _id: Math.random().toString(),
            senderId: currentUser.id,
            text: text,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setText('');

        startTransition(async () => {
            try {
                await fetch('/api/chat/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ receiverId: otherUser.id, text }),
                });
            } catch (error) {
                console.error('Failed to send message');
                // Logika untuk menampilkan error atau mengembalikan pesan optimistik
                setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
            }
        });
    };

    return (
        <>
            {/* Header Chat */}
            <header className="flex items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
                <Link href="/chat" className="p-2 rounded-full hover:bg-gray-100 md:hidden mr-2">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="w-10 h-10 rounded-full bg-gray-300 mr-3">
                    {otherUser.avatarUrl ? (
                        <Image src={otherUser.avatarUrl} alt={otherUser.fullName || ''} width={40} height={40} className="rounded-full object-cover" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-base">
                            {otherUser.fullName?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <h2 className="font-semibold">{otherUser.fullName}</h2>
            </header>

            {/* Badan Chat */}
            <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="flex flex-col gap-4">
                    {messages.map(msg => (
                        <div
                            key={msg._id}
                            className={`flex items-end gap-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.senderId === currentUser.id
                                    ? 'bg-green-700 text-white rounded-br-none'
                                    : 'bg-white text-black border border-gray-200 rounded-bl-none'
                                }`}>
                                <p>{msg.text}</p>
                                <p className={`text-xs mt-1 ${msg.senderId === currentUser.id ? 'text-green-200' : 'text-gray-400'
                                    }`}>
                                    {format(new Date(msg.createdAt), 'p')}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </main>

            {/* Footer / Input Chat */}
            <footer className="p-3 border-t border-gray-200 bg-white sticky bottom-0">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isPending}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-lg p-2 resize-none focus:ring-2 focus:ring-green-500"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e as any);
                            }
                        }}
                    />
                    <button type="submit" disabled={isPending || !text.trim()} className="bg-green-800/80 text-white p-2 rounded-lg hover:bg-green-800/90 disabled:bg-gray-400">
                        <Send className="w-6 h-6" />
                    </button>
                </form>
            </footer>
        </>
    );
}