'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, House } from 'lucide-react';

export default function ChatHeader() {
    const router = useRouter();

    return (
        <header className="p-4 border-b border-gray-200 flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 rounded hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Chats</h1>
            <button onClick={() => router.push('/')} className="p-2 rounded hover:bg-gray-100 ml-auto">
                <House className="w-5 h-5" />
            </button>
        </header>

    );
}