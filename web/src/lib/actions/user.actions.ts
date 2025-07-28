'use server';

import { signIn } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { CompleteProfileSchema } from '@/utils/validations/auth';
import { getCoordinates } from "@/utils/geocoding/geocodingService";

export async function completeGoogleRegistration(formData: FormData) {
    const rawData = {
        token: formData.get('token'),
        username: formData.get('username'),
        address: formData.get('address'),
    };

    const validatedFields = CompleteProfileSchema.safeParse({
        username: rawData.username,
        address: rawData.address,
    });
    if (!validatedFields.success) {
        return { error: 'Invalid input.' };
    }

    const { username, address } = validatedFields.data;
    const token = rawData.token as string;

    if (!token) {
        return { error: 'Missing session token.' };
    }

    const pendingProfile = await UserModel.getIncompleteProfileByToken(token);
    if (!pendingProfile) {
        return { error: 'Your session has expired. Please try signing up again.' };
    }

    const existingUsername = await UserModel.getUserByUsername(username);
    if (existingUsername) {
        return { error: 'This username is already taken.' };
    }

    const coordinates = await getCoordinates(address);
    if (!coordinates) {
        return { error: 'Could not verify the provided address.' };
    }
    const location = { type: "Point" as const, coordinates: coordinates };

    await UserModel.createUser({
        email: pendingProfile.email,
        fullName: pendingProfile.fullName ?? 'New User',
        username: username,
        avatarUrl: pendingProfile.avatarUrl ?? '',
        address: address,
        location: location,
        dailyLimit: 5,
        password: null,
    });

    await UserModel.deleteIncompleteProfile(pendingProfile.email);

    await signIn('google');
}