'use server';

import { redirect } from 'next/navigation';
import { UserModel } from '@/models/user.model';
import { signOut } from '@/lib/auth';

export async function finalizeRegistration(token: string) {
    const user = await UserModel.verifyEmailToken(token);

    if (!user) {
        return redirect('/auth/register?error=invalid_token');
    }

    await signOut({ redirect: false });

    return redirect('/auth/login?message=verification_successful');
}