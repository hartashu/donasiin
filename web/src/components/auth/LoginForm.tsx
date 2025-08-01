// 'use client';

// import { useState, useTransition } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { LoginSchema, type LoginInput } from '@/utils/validations/auth';
// import { login } from '@/lib/actions/auth.actions';
// import { signIn } from 'next-auth/react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { Mail, Lock } from 'lucide-react';
// import toast from 'react-hot-toast'; // FIX: Import toast

// export function LoginForm() {
//     const searchParams = useSearchParams();
//     const callbackUrl = searchParams.get('callbackUrl') || '/';
//     const message = searchParams.get('message');
//     const [error, setError] = useState<string | null>(null);
//     const [isPending, startTransition] = useTransition();

//     const { register, handleSubmit } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

//     const onSubmit = (data: LoginInput) => {
//         setError(null);
//         startTransition(async () => {
//             const result = await login(data);
//             if (result?.error) {
//                 setError(result.error);
//             } else {
//                 // FIX: Tambahkan toast sukses dan reload halaman
//                 toast.success('Logged in successfully! Redirecting...');
//                 // Menggunakan window.location.href untuk navigasi + reload penuh
//                 window.location.href = callbackUrl;
//             }
//         });
//     };

//     const handleGoogleSignIn = () => { signIn('google', { callbackUrl }); };

//     return (
//         <div className="max-w-md w-full animate-subtle-float">
//             <div className="bg-white/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20">
//                 <div className="text-center mb-6">
//                     {/* FIX: Mengganti teks logo dengan komponen Image */}
//                     <div className="flex justify-center mb-4">
//                         <Image
//                             src="/LogoDonasiinnobg.png"
//                             alt="Donasiin Logo"
//                             width={180}
//                             height={50}
//                             priority
//                         />
//                     </div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h1>
//                     <p className="text-gray-700 text-sm sm:text-md mt-2">Sign in to continue to your account.</p>
//                 </div>

//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                     {error && <div className="bg-red-500/10 text-red-900 p-3 rounded-md text-sm border border-red-500/20">{error}</div>}
//                     {message && <div className="bg-green-500/10 text-green-900 p-3 rounded-md text-sm border border-green-500/20">{message}</div>}

//                     <div className="space-y-2">
//                         <label htmlFor="email" className="font-medium text-sm text-gray-600">Email</label>
//                         <div className="relative">
//                             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
//                             <input id="email" type="email" {...register('email')} disabled={isPending} placeholder="you@example.com" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
//                         </div>
//                     </div>

//                     <div className="space-y-2">
//                         <div className="flex items-center justify-between">
//                             <label htmlFor="password" className="font-medium text-sm text-gray-600">Password</label>
//                             <Link href="/auth/forgot-password" className="text-sm font-semibold text-[#2a9d8f] hover:underline">Forgot Password?</Link>
//                         </div>
//                         <div className="relative">
//                             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
//                             <input id="password" type="password" {...register('password')} disabled={isPending} placeholder="••••••••" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
//                         </div>
//                     </div>

//                     <button type="submit" disabled={isPending} className="w-full bg-[#2a9d8f] text-white font-semibold py-2.5 rounded-md hover:bg-[#268a7e] transition duration-300 disabled:bg-[#2a9d8f]/50 disabled:cursor-not-allowed">
//                         {isPending ? 'Signing In...' : 'Sign In'}
//                     </button>
//                 </form>

//                 <div className="my-6 flex items-center space-x-2">
//                     <div className="flex-1 border-t border-gray-400/50"></div>
//                     <span className="text-xs text-gray-600 uppercase">Or continue with</span>
//                     <div className="flex-1 border-t border-gray-400/50"></div>
//                 </div>

//                 <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 bg-white/30 text-gray-800 border border-gray-400/50 font-semibold py-2.5 rounded-md hover:bg-white/50 transition">
//                     <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width={20} height={20} />
//                     Sign in with Google
//                 </button>

//                 <p className="text-center text-sm text-gray-600 mt-6 sm:mt-8">Don&apos;t have an account?{' '}
//                     <Link href="/auth/register" className="font-semibold text-[#2a9d8f] hover:underline">Sign up</Link>
//                 </p>
//             </div>
//         </div>
//     );
// }



'use client';

import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginInput } from '@/utils/validations/auth';
import { login } from '@/lib/actions/auth.actions';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const message = searchParams.get('message'); // Untuk pesan sukses dari halaman lain
    const [isPending, startTransition] = useTransition();

    const { register, handleSubmit } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

    const onSubmit = (data: LoginInput) => {
        startTransition(async () => {
            try {
                const result = await login(data);

                if (result?.error) {
                    // FIX: Gunakan toast untuk menampilkan error
                    toast.error(result.error);
                } else {
                    // Blok ini akan berjalan jika login berhasil
                    toast.success('Logged in successfully! Redirecting...');
                    window.location.href = callbackUrl;
                }
            } catch (err) {
                toast.error("An unexpected error occurred. Please try again.");
            }
        });
    };

    const handleGoogleSignIn = () => { signIn('google', { callbackUrl }); };

    return (
        <div className="max-w-md w-full animate-subtle-float">
            <div className="bg-white/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/LogoDonasiinnobg.png"
                            alt="Donasiin Logo"
                            width={180}
                            height={50}
                            priority
                        />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-700 text-sm sm:text-md mt-2">Sign in to continue to your account.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* FIX: State 'error' dan div-nya sudah tidak diperlukan, digantikan oleh toast */}
                    {message && <div className="bg-green-500/10 text-green-900 p-3 rounded-md text-sm border border-green-500/20">{message}</div>}

                    <div className="space-y-2">
                        <label htmlFor="email" className="font-medium text-sm text-gray-600">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                            <input id="email" type="email" {...register('email')} disabled={isPending} placeholder="you@example.com" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="font-medium text-sm text-gray-600">Password</label>
                            <Link href="/auth/forgot-password" className="text-sm font-semibold text-[#2a9d8f] hover:underline">Forgot Password?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                            <input id="password" type="password" {...register('password')} disabled={isPending} placeholder="••••••••" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
                        </div>
                    </div>

                    <button type="submit" disabled={isPending} className="w-full bg-[#2a9d8f] text-white font-semibold py-2.5 rounded-md hover:bg-[#268a7e] transition duration-300 disabled:bg-[#2a9d8f]/50 disabled:cursor-not-allowed">
                        {isPending ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="my-6 flex items-center space-x-2">
                    <div className="flex-1 border-t border-gray-400/50"></div>
                    <span className="text-xs text-gray-600 uppercase">Or continue with</span>
                    <div className="flex-1 border-t border-gray-400/50"></div>
                </div>

                <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 bg-white/30 text-gray-800 border border-gray-400/50 font-semibold py-2.5 rounded-md hover:bg-white/50 transition">
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width={20} height={20} />
                    Sign in with Google
                </button>

                <p className="text-center text-sm text-gray-600 mt-6 sm:mt-8">Don&apos;t have an account?{' '}
                    <Link href="/auth/register" className="font-semibold text-[#2a9d8f] hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
}