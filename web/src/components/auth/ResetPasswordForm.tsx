'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema, type ResetPasswordInput } from '@/lib/schemas/auth.schema';
import { resetPassword } from '@/lib/actions/auth.actions';
import Link from 'next/link';

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
            const result = await resetPassword(data, token);
            setError(result.error || null);
            setSuccess(result.success || null);
        });
    };

    return (
        <div className="max-w-md w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Set a New Password</h1>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
                    {success && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">{success}</div>}

                    {!success && (
                        <>
                            <div className="space-y-2">
                                <label htmlFor="password">New Password</label>
                                <input id="password" type="password" {...form.register('password')} disabled={isPending} className="w-full px-4 py-2 border rounded-md" />
                                {form.formState.errors.password && <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input id="confirmPassword" type="password" {...form.register('confirmPassword')} disabled={isPending} className="w-full px-4 py-2 border rounded-md" />
                                {form.formState.errors.confirmPassword && <p className="text-red-500 text-sm">{form.formState.errors.confirmPassword.message}</p>}
                            </div>
                            <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                                {isPending ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </>
                    )}
                </form>
            </div>

            {success && source === 'native' && (
                <p className="text-center text-sm text-gray-600 mt-6">
                    Password updated successfully! You can now return to the app.
                </p>
            )}

            {success && source !== 'native' && (
                <p className="text-center text-sm text-gray-600 mt-6">
                    <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
                        Click here to login
                    </Link>
                </p>
            )}
        </div>
    );
}