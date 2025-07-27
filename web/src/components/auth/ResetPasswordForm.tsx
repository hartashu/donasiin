'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema, type ResetPasswordInput } from '@/utils/validations/auth';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface ResetPasswordFormProps {
    token: string | null;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const searchParams = useSearchParams();
    const source = searchParams.get('from');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    const onSubmit = (data: ResetPasswordInput) => {
        setError(null);
        setSuccess(null);
        startTransition(async () => {
            try {
                const response = await fetch('/api/account/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, token }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                setSuccess(result.message);
            } catch (err: unknown) {
                setError((err instanceof Error) ? err.message : 'An unknown error occurred.');
            }
        });
    };

    return (
        <div className="max-w-md w-full animate-subtle-float">
            <div className="bg-white/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20">
                <div className="text-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Set a New Password</h1>
                    {!success && <p className="text-gray-700 text-sm sm:text-md mt-2">Please enter and confirm your new password.</p>}
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {error && <div className="bg-red-500/10 text-red-900 p-3 rounded-md text-sm border border-red-500/20">{error}</div>}
                    {success && <div className="bg-green-500/10 text-green-900 p-3 rounded-md text-sm border border-green-500/20">{success}</div>}

                    {!success && (
                        <>
                            <div className="space-y-2">
                                <label htmlFor="password" className="font-medium text-sm text-gray-600">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input id="password" type="password" {...form.register('password')} disabled={isPending} placeholder="••••••••" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
                                </div>
                                {form.formState.errors.password && <p className="text-red-600 text-xs px-1 pt-1">{form.formState.errors.password.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="font-medium text-sm text-gray-600">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <input id="confirmPassword" type="password" {...form.register('confirmPassword')} disabled={isPending} placeholder="••••••••" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
                                </div>
                                {form.formState.errors.confirmPassword && <p className="text-red-600 text-xs px-1 pt-1">{form.formState.errors.confirmPassword.message}</p>}
                            </div>
                            <button type="submit" disabled={isPending} className="w-full bg-[#2a9d8f] text-white font-semibold py-2.5 rounded-md hover:bg-[#268a7e] transition duration-300 disabled:bg-[#2a9d8f]/50 disabled:cursor-not-allowed">
                                {isPending ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </>
                    )}
                </form>

                {success && source === 'native' && (
                    <p className="text-center text-sm text-gray-800 mt-6 font-medium">Password updated! You can now return to the app.</p>
                )}
                {success && source !== 'native' && (
                    <p className="text-center text-sm text-gray-600 mt-6">
                        <Link href="/auth/login" className="font-semibold text-[#2a9d8f] hover:underline">
                            Password updated! Click here to login
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
