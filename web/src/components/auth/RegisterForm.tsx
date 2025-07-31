'use client';

import { useEffect, useTransition } from "react"; // FIX: Import useEffect
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterInput } from "@/utils/validations/auth";
import { signIn } from 'next-auth/react';
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, UserRound, MapPin } from "lucide-react";
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from "next/navigation";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  useEffect(() => {
    const toastError = searchParams.get('toast_error');
    if (toastError) {
      if (toastError === 'missing_token') {
        toast.error('Verification token is missing. Please try again.');
      } else if (toastError === 'invalid_or_expired_token') {
        toast.error('Your verification token is invalid or has expired.');
      }
      router.replace('/auth/register', { scroll: false });
    }
  }, [searchParams, router]);

  const onSubmit = (data: RegisterInput) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/account/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Registration failed.');
        }

        toast.success(result.message || "Registration successful! Please check your email.");
        reset();

      } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
        toast.error(errorMessage);
      }
    });
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-700 text-sm sm:text-md mt-2">Join us and start making a difference.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="fullName" className="font-medium text-sm text-gray-600">Full Name</label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input id="fullName" {...register("fullName")} disabled={isPending} placeholder="John Doe" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
              </div>
              {errors.fullName && <p className="text-red-600 text-xs px-1 pt-1">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="username" className="font-medium text-sm text-gray-600">Username</label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input id="username" {...register("username")} disabled={isPending} placeholder="johndoe" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
              </div>
              {errors.username && <p className="text-red-600 text-xs px-1 pt-1">{errors.username.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="font-medium text-sm text-gray-600">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input id="email" type="email" {...register("email")} disabled={isPending} placeholder="you@example.com" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
            </div>
            {errors.email && <p className="text-red-600 text-xs px-1 pt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="font-medium text-sm text-gray-600">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input id="password" type="password" {...register("password")} disabled={isPending} placeholder="••••••••" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
            </div>
            {errors.password && <p className="text-red-600 text-xs px-1 pt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="address" className="font-medium text-sm text-gray-600">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <textarea id="address" {...register("address")} disabled={isPending} placeholder="123 Charity Lane" rows={2} className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition resize-none" />
            </div>
            {errors.address && <p className="text-red-600 text-xs px-1 pt-1">{errors.address.message}</p>}
          </div>

          <button type="submit" disabled={isPending} className="!mt-5 w-full bg-[#2a9d8f] text-white font-semibold py-2.5 rounded-md hover:bg-[#268a7e] transition duration-300 disabled:bg-[#2a9d8f]/50 disabled:cursor-not-allowed">
            {isPending ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="my-6 flex items-center space-x-2">
          <div className="flex-1 border-t border-gray-400/50"></div>
          <span className="text-xs text-gray-600 uppercase">Or sign up with</span>
          <div className="flex-1 border-t border-gray-400/50"></div>
        </div>

        <button onClick={handleGoogleSignIn} disabled={isPending} className="w-full flex items-center justify-center gap-3 bg-white/30 text-gray-800 border border-gray-400/50 font-semibold py-2.5 rounded-md hover:bg-white/50 transition disabled:opacity-70 disabled:cursor-not-allowed">
          <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width={20} height={20} />
          Sign up with Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-6 sm:mt-8">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-[#2a9d8f] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}