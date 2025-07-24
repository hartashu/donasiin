'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { VerifyCodeSchema, type VerifyCodeInput } from '@/lib/schemas/auth.schema'
import { verifyEmail } from '@/lib/actions/auth.actions'

export function VerifyEmailForm() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email')

    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<VerifyCodeInput>({
        resolver: zodResolver(VerifyCodeSchema),
    })

    const onSubmit = (data: VerifyCodeInput) => {
        setError(null)

        startTransition(async () => {
            const result = await verifyEmail(email, data.code)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <div className="max-w-md w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Verify Your Email</h1>
                <p className="text-gray-500">A 6-digit code has been sent to <span className="font-semibold">{email || 'your email'}</span>.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">{error}</div>}

                    <div className="space-y-2">
                        <label htmlFor="code" className="font-medium text-sm">Verification Code</label>
                        <input
                            id="code"
                            {...register('code')}
                            disabled={isPending}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-center tracking-[0.5em] text-lg focus:ring-2 focus:ring-blue-500"
                            maxLength={6}
                        />
                        {errors.code && <p className="text-red-500 text-sm mt-2">{errors.code.message}</p>}
                    </div>

                    <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isPending ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>
            </div>
        </div>
    )
}