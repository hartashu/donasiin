"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@/lib/schemas/auth.schema";
import { login } from "@/lib/actions/auth.actions";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const message = searchParams.get("message");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    setError(null);
    startTransition(async () => {
      const result = await login(data);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-gray-500 text-md">
          Sign in to continue to your account.
        </p>
      </div>

      <div className="bg-white p-4 pl-6 pr-6 rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm border border-green-200">
              {message}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="font-medium text-sm">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                {...register("email")}
                disabled={isPending}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="font-medium text-sm">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="password"
                type="password"
                {...register("password")}
                disabled={isPending}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-green-800/80 text-white font-semibold py-2.5 rounded-md hover:bg-green-800/90 disabled:bg-green-700/50"
          >
            {isPending ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 font-semibold py-2.5 rounded-md hover:bg-gray-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path
              fill="#4285F4"
              d="M24 9.5c3.21 0 5.51 1.38 6.73 2.54l-2.43 2.43C27.1 13.44 25.79 12.5 24 12.5c-4.41 0-8 3.59-8 8s3.59 8 8 8c2.51 0 4.1-1.07 5.09-2.01.81-.81 1.3-2.02 1.5-3.49H24v-3.02h9.02c.13.7.2 1.4.2 2.22 0 2.64-.72 5-2.61 6.62-1.89 1.62-4.32 2.58-6.61 2.58C16.69 32.5 11 27.24 11 20.5S16.69 8.5 24 8.5c3.83 0 6.57 1.35 8.44 3.16l-2.54 2.54C28.53 11.23 26.51 9.5 24 9.5z"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-green-800/80 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
