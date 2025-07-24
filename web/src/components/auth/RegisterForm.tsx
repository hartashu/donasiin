'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterSchema, type RegisterInput } from '@/lib/schemas/auth.schema'
import { registerUser } from '@/lib/actions/auth.actions'
import Link from 'next/link'

export function RegisterForm() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
    })

    const onSubmit = (data: RegisterInput) => {
        setError(null)
        setSuccess(null)

        startTransition(async () => {
            const result = await registerUser(data)
            setError(result.error || null)

            if (result.success) {
                router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
            }
        })
    }

    return (
        <div className="max-w-md w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Create an Account</h1>
                <p className="text-gray-500">Join the community and start sharing.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">{error}</div>}

                    <div className="space-y-2">
                        <label htmlFor="fullName" className="font-medium text-sm">Full Name</label>
                        <input id="fullName" {...register('fullName')} disabled={isPending} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="username" className="font-medium text-sm">Username</label>
                        <input id="username" {...register('username')} disabled={isPending} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="font-medium text-sm">Email</label>
                        <input id="email" type="email" {...register('email')} disabled={isPending} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="font-medium text-sm">Password</label>
                        <input id="password" type="password" {...register('password')} disabled={isPending} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isPending ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            </div>
            <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    )
}