'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordSchema, type ForgotPasswordInput } from '@/utils/validations/auth';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export function ForgotPasswordForm() {
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const form = useForm<ForgotPasswordInput>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = (data: ForgotPasswordInput) => {
        setMessage(null);
        setError(null);
        startTransition(async () => {
            try {
                const response = await fetch('/api/account/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "Failed to send link.");
                setMessage(result.message);
            } catch (err: unknown) {
                setError((err instanceof Error) ? err.message : 'An unknown error occurred.');
            }
        });
    };

    return (
        <div className="max-w-md w-full animate-subtle-float">
            <div className="bg-white/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20">
                <div className="text-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Forgot Your Password?</h1>
                    <p className="text-gray-700 text-sm sm:text-md mt-2">No problem. Enter your email to receive a reset link.</p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {error && <div className="bg-red-500/10 text-red-900 p-3 rounded-md text-sm border border-red-500/20">{error}</div>}
                    {message && <div className="bg-green-500/10 text-green-900 p-3 rounded-md text-sm border border-green-500/20">{message}</div>}

                    {!message && (
                        <>
                            <div className="space-y-2">
                                <label htmlFor="email" className="font-medium text-sm text-gray-600">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input id="email" type="email" {...form.register('email')} disabled={isPending} placeholder="you@example.com" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
                                </div>
                                {form.formState.errors.email && <p className="text-red-600 text-xs px-1 pt-1">{form.formState.errors.email.message}</p>}
                            </div>

                            <button type="submit" disabled={isPending} className="w-full bg-[#2a9d8f] text-white font-semibold py-2.5 rounded-md hover:bg-[#268a7e] transition duration-300 disabled:bg-[#2a9d8f]/50 disabled:cursor-not-allowed">
                                {isPending ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </>
                    )}
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    <Link href="/auth/login" className="font-semibold text-[#2a9d8f] hover:underline">
                        Back to login
                    </Link>
                </p>
            </div>
        </div>
    );
}
