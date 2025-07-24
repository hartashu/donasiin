'use server'

import { z } from 'zod'
import { RegisterSchema, VerifyCodeSchema } from '@/lib/schemas/auth.schema'
import { createUser, getUserByEmail, getUserByUsername, createVerificationToken, verifyEmailAndActivateUser } from '@/lib/services/user.service'
import { sendVerificationEmail } from '@/lib/utils/email'
import { redirect } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { LoginSchema } from '@/lib/schemas/auth.schema'
import { AuthError } from 'next-auth'

export async function login(values: z.infer<typeof LoginSchema>) {
    const validatedFields = LoginSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: 'Invalid fields!' }
    }

    const { email, password } = validatedFields.data

    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: '/',
        })

        return { success: 'Login successful!' }

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.name) {
                case 'CredentialsSignin':
                    return { error: 'Invalid email or password!' }
                default:
                    return { error: 'An unexpected authentication error occurred.' }
            }
        }

        throw error
    }
}

export async function registerUser(values: z.infer<typeof RegisterSchema>) {
    const validatedFields = RegisterSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: 'Invalid fields!' }
    }

    const { email, password, username, fullName } = validatedFields.data

    const existingUserByEmail = await getUserByEmail(email)
    if (existingUserByEmail) {
        return { error: 'Email already in use.' }
    }

    const existingUserByUsername = await getUserByUsername(username)
    if (existingUserByUsername) {
        return { error: 'Username already taken.' }
    }

    await createUser({ email, password, fullName, username })
    const verificationToken = await createVerificationToken(email)

    try {
        await sendVerificationEmail(email, verificationToken)
        return { success: 'Confirmation email sent!' }
    } catch (error) {
        return { error: 'Failed to send confirmation email.' }
    }
}

export async function verifyEmail(email: string | null, code: string) {
    if (!email || !code) {
        return { error: 'Missing information. Please try again.' }
    }

    const isVerified = await verifyEmailAndActivateUser(email, code)

    if (!isVerified) {
        return { error: 'Invalid or expired verification code.' }
    }

    redirect('/auth/login?message=Email+verified!+You+can+now+log+in.')
}