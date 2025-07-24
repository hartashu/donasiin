'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas/auth.schema';
import { generatePasswordResetLink } from '@/lib/actions/auth.actions';
import Link from 'next/link';

export function ForgotPasswordForm() {
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const form = useForm<ForgotPasswordInput>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = (data: ForgotPasswordInput) => {
        setMessage(null);
        startTransition(async () => {
            const result = await generatePasswordResetLink(data);
            setMessage(result.success || result.error || null);
        });
    };

    return (
        <div className="max-w-md w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Forgot Your Password?</h1>
                <p className="text-gray-500">Enter your email to receive a reset link.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {message && <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm">{message}</div>}
                    <div className="space-y-2">
                        <label htmlFor="email" className="font-medium text-sm">Email</label>
                        <input id="email" type="email" {...form.register('email')} disabled={isPending} className="w-full px-4 py-2 border rounded-md" />
                        {form.formState.errors.email && <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>}
                    </div>
                    <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isPending ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
            <p className="text-center text-sm text-gray-600 mt-6">
                <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
                    Back to login
                </Link>
            </p>
        </div>
    );
}