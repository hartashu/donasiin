'use client';

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterInput } from "@/utils/validations/auth";
import Link from "next/link";
import { Lock, Mail, Pencil, UserRound } from "lucide-react";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    setError(null);
    setSuccess(null);

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

        setSuccess(result.message);
        reset();
      } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
      }
    });
  };

  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">Create an Account</h1>
        <p className="text-gray-500 text-md">
          Join the community and start sharing.
        </p>
      </div>

      <div className="bg-white p-4 pl-6 pr-6 rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm border border-green-200">{success}</div>}

          <div className="space-y-2">
            <label htmlFor="fullName" className="font-medium text-sm">Full Name</label>
            <div className="relative">
              <Pencil className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input id="fullName" {...register("fullName")} disabled={isPending} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md" />
            </div>
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="font-medium text-sm">Username</label>
            <div className="relative">
              <UserRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input id="username" {...register("username")} disabled={isPending} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md" />
            </div>
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="font-medium text-sm">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input id="email" type="email" {...register("email")} disabled={isPending} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md" />
            </div>
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="font-medium text-sm">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input id="password" type="password" {...register("password")} disabled={isPending} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md" />
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isPending} className="w-full bg-green-800/80 text-white font-semibold py-2.5 rounded-md hover:bg-green-800/90 disabled:bg-green-700/50">
            {isPending ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-green-800/80 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}