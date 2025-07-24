'use server';

import { z } from 'zod';
import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';
import { LoginSchema, RegisterSchema } from '@/lib/schemas/auth.schema';
import {
    getUserByEmail,
    getUserByUsername,
    createPendingRegistration,
    getPendingRegistrationByToken,
    createUser,
    deletePendingRegistration
} from '@/lib/services/user.service';
import { sendFinalizeRegistrationEmail } from '@/lib/utils/email';
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
        return { error: 'Something went wrong on our end. Please try again.' };
    }
}

export async function finalizeRegistration(token: string) {
    const pendingUser = await getPendingRegistrationByToken(token);
    if (!pendingUser) {
        redirect('/auth/register?error=invalid_token');
        return;
    }

    const existingUser = await getUserByEmail(pendingUser.email);
    if (existingUser) {
        await deletePendingRegistration(pendingUser.email);
        redirect('/auth/login?message=account_already_exists');
        return;
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

    redirect('/auth/login?message=registration_successful');
}