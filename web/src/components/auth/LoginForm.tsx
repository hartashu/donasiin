'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginInput } from '@/utils/validations/auth';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import Image from 'next/image';

export function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const message = searchParams.get('message');
    const [error, setError] = useState<string | null>(searchParams.get('error') === 'CredentialsSignin' ? 'Invalid email or password.' : searchParams.get('error'));
    const [isPending, startTransition] = useTransition();

    const { register, handleSubmit } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

    const onSubmit = (data: LoginInput) => {
        setError(null);
        startTransition(() => {
            signIn('credentials', {
                ...data,
                redirect: false,
                callbackUrl
            })
                .then((result) => {
                    if (result?.error) {
                        if (result.error === 'CredentialsSignin') {
                            setError('Invalid email or password.');
                        } else {
                            setError(result.error);
                        }
                    } else {
                        window.location.href = callbackUrl;
                    }
                });
        });
    };

    const handleGoogleSignIn = () => { signIn('google', { callbackUrl }); };

    return (
        <div className="max-w-md w-full">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-gray-500 text-md">Sign in to continue to your account.</p>
            </div>
            <div className="bg-white p-4 pl-6 pr-6 rounded-lg shadow-md border border-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">{error}</div>}
                    {message && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm border border-green-200">{message}</div>}
                    <div className="space-y-2">
                        <label htmlFor="email" className="font-medium text-sm">Email</label>
                        <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input id="email" type="email" {...register('email')} disabled={isPending} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md" /></div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="font-medium text-sm">Password</label>
                            <Link href="/auth/forgot-password" className="text-sm font-semibold text-green-800/80 hover:underline">Forgot Password?</Link>
                        </div>
                        <div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input id="password" type="password" {...register('password')} disabled={isPending} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md" /></div>
                    </div>
                    <button type="submit" disabled={isPending} className="w-full bg-green-800/80 text-white font-semibold py-2.5 rounded-md hover:bg-green-800/90 disabled:bg-green-700/50">{isPending ? 'Signing In...' : 'Sign In'}</button>
                </form>
                <div className="relative my-3"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">Or continue with</span></div></div>
                <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 font-semibold py-2.5 rounded-md hover:bg-gray-50">
                    <Image src="/google-logo.svg" alt="Google" width={20} height={20} /> Sign in with Google
                </button>
            </div>
            <p className="text-center text-sm text-gray-600 mt-6">Don&apos;t have an account?{' '}<Link href="/auth/register" className="font-semibold text-green-800/80 hover:underline">Sign up</Link></p>
        </div>
    );
}