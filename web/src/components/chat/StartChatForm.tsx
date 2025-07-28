'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

interface StartChatFormProps {
    receiverId: string;
}

export function StartChatForm({ receiverId }: StartChatFormProps) {
    const router = useRouter();
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;

        setError(null);
        startTransition(async () => {
            try {
                const response = await fetch('/api/chat/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ receiverId, text }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to send message.');
                }

                router.push(`/chat/${result.conversationId}`);

            } catch (err: unknown) {
                const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
                setError(errorMessage);
            }
        });
    };

    return (
        <div className="mt-8">
            <h3 className="font-semibold text-lg mb-2">Contact the Owner</h3>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isPending}
                    placeholder="Hi, I'm interested in this item..."
                    className="flex-1 border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-green-500"
                    rows={3}
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-green-800/80 text-white p-3 rounded-lg hover:bg-green-800/90 disabled:bg-gray-400 self-stretch"
                >
                    <Send className="w-6 h-6" />
                </button>
            </form>
        </div>
    );
}