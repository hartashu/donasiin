'use server';

import { z } from 'zod';
import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';
import { LoginSchema, RegisterSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@/lib/schemas/auth.schema';
import { createUser, getUserByEmail, getUserByUsername, createVerificationToken, verifyEmailAndActivateUser, createPasswordResetToken, getPasswordResetToken, deletePasswordResetToken, updateUserPassword } from '@/lib/services/user.service';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/utils/email';
import { redirect } from 'next/navigation';

export async function login(values: z.infer<typeof LoginSchema>) {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid fields!' };
    }

    const { email, password } = validatedFields.data;

    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: '/',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.name) {
                case 'CredentialsSignin':
                    return { error: 'Invalid email or password!' };
                default:
                    return { error: 'An unexpected authentication error occurred.' };
            }
        }
        throw error;
    }
}

export async function registerUser(values: z.infer<typeof RegisterSchema>) {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid fields!' };
    }

    const { email, password, username, fullName } = validatedFields.data;

    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
        return { error: 'Email already in use.' };
    }

    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
        return { error: 'Username already taken.' };
    }

    await createUser({ email, password, fullName, username });
    const verificationToken = await createVerificationToken(email);

    try {
        await sendVerificationEmail(email, verificationToken);
        return { success: 'Confirmation email sent!' };
    } catch (error) {
        console.error("Email sending error:", error);
        return { error: 'Failed to send confirmation email.' };
    }
}

export async function verifyEmail(email: string | null, code: string) {
    if (!email || !code) {
        return { error: 'Missing information. Please try again.' };
    }

    const isVerified = await verifyEmailAndActivateUser(email, code);

    if (!isVerified) {
        return { error: 'Invalid or expired verification code.' };
    }

    redirect('/auth/login?message=Email+verified!+You+can+now+log+in.');
}

export async function generatePasswordResetLink(values: z.infer<typeof ForgotPasswordSchema>) {
    const validatedFields = ForgotPasswordSchema.safeParse(values);
    if (!validatedFields.success) return { error: 'Invalid email.' };

    const { email } = validatedFields.data;
    const resetToken = await createPasswordResetToken(email);

    if (!resetToken) {
        return { success: 'If an account with this email exists, a reset link has been sent.' };
    }

    await sendPasswordResetEmail(email, resetToken);
    return { success: 'If an account with this email exists, a reset link has been sent.' };
}

export async function resetPassword(values: z.infer<typeof ResetPasswordSchema>, token: string | null) {
    if (!token) return { error: 'Missing reset token!' };

    const validatedFields = ResetPasswordSchema.safeParse(values);
    if (!validatedFields.success) return { error: 'Invalid passwords.' };

    const { password } = validatedFields.data;
    const existingToken = await getPasswordResetToken(token);

    if (!existingToken) return { error: 'Invalid or expired token.' };

    await updateUserPassword(existingToken.email, password);
    await deletePasswordResetToken(token);

    return { success: 'Password updated successfully!' };
}