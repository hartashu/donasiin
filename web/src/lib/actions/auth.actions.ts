'use server';

import { z } from 'zod';
import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';
import { LoginSchema, RegisterSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@/lib/schemas/auth.schema';
import {
    getUserByEmail,
    getUserByUsername,
    createPendingRegistration,
    getPendingRegistrationByToken,
    createUser,
    deletePendingRegistration,
    createPasswordResetToken,
    getPasswordResetToken,
    deletePasswordResetToken,
    updateUserPassword
} from '@/lib/services/user.service';
import { sendFinalizeRegistrationEmail, sendPasswordResetEmail } from '@/lib/utils/email';
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
    if (!validatedFields.success) return { error: 'Invalid fields!' };

    const { email, username, password, fullName } = validatedFields.data;

    const existingUser = await getUserByEmail(email) || await getUserByUsername(username);
    if (existingUser) return { error: 'Email or username is already taken.' };

    try {
        const verificationToken = await createPendingRegistration({ email, password, fullName, username });
        await sendFinalizeRegistrationEmail(email, verificationToken);
        return { success: 'Verification email sent! Please check your inbox to complete registration.' };
    } catch (error) {
        console.error('Registration Error:', error);
        return { error: 'Something went wrong on our end. Please try again.' };
    }
}

export async function finalizeRegistration(token: string, from?: string | null) {
    const pendingUser = await getPendingRegistrationByToken(token);
    if (!pendingUser) {
        redirect('/auth/register?error=invalid_token');
    }

    const existingUser = await getUserByEmail(pendingUser.email);
    if (existingUser) {
        await deletePendingRegistration(pendingUser.email);
        redirect('/auth/login?message=account_already_exists');
    }

    await createUser({
        email: pendingUser.email,
        password: pendingUser.password,
        fullName: pendingUser.fullName,
        username: pendingUser.username,
        dailyLimit: 5,
        address: '',
        avatarUrl: '',
    });

    await deletePendingRegistration(pendingUser.email);

    if (from !== 'native') {
        redirect('/auth/login?message=registration_successful');
    }
}

export async function generatePasswordResetLink(values: z.infer<typeof ForgotPasswordSchema>, source?: string) {
    const validatedFields = ForgotPasswordSchema.safeParse(values);
    if (!validatedFields.success) return { error: 'Invalid email.' };

    const { email } = validatedFields.data;
    const resetToken = await createPasswordResetToken(email);

    if (!resetToken) {
        return { success: 'If an account with this email exists, a reset link has been sent.' };
    }

    await sendPasswordResetEmail(email, resetToken, source);
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