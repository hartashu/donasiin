'use server';

import { redirect } from 'next/navigation';
import { UserModel } from '@/models/user.model';

export async function finalizeRegistration(token: string, from?: string | null) {
    const pendingUser = await UserModel.getPendingRegistrationByToken(token);
    if (!pendingUser) {
        return redirect('/auth/register?error=invalid_token');
    }

    const existingUser = await UserModel.getUserByEmail(pendingUser.email);
    if (existingUser) {
        await UserModel.deletePendingRegistration(pendingUser.email);
        return redirect('/auth/login?message=account_already_exists');
    }

    await UserModel.createUser({
        email: pendingUser.email,
        password: pendingUser.password,
        fullName: pendingUser.fullName ?? '',
        username: pendingUser.username ?? '',
        dailyLimit: 5,
        address: '',
        avatarUrl: '',
        location: undefined,
    });

    await UserModel.deletePendingRegistration(pendingUser.email);

    if (from !== 'native') {
        redirect('/auth/login?message=registration_successful');
    }
}