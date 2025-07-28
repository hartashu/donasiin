'use client';

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompleteProfileSchema, type CompleteProfileInput } from "@/utils/validations/auth";
import { completeGoogleRegistration } from "@/lib/actions/user.actions";
import { UserRound, MapPin } from "lucide-react";
import type { IIncompleteProfile } from "@/types/types";

interface CompleteProfileFormProps {
    profile: IIncompleteProfile;
}

export function CompleteProfileForm({ profile }: CompleteProfileFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const { register, handleSubmit, formState: { errors } } = useForm<CompleteProfileInput>({
        resolver: zodResolver(CompleteProfileSchema),
    });

    const onSubmit = (data: CompleteProfileInput) => {
        setError(null);
        const formData = new FormData();
        formData.append('token', profile.token);
        formData.append('username', data.username);
        formData.append('address', data.address);

        startTransition(async () => {
            const result = await completeGoogleRegistration(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    return (
        <div className="max-w-md w-full">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold">Complete Your Profile</h1>
                <p className="text-gray-500 text-md">Welcome, {profile.fullName}! Just one last step.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
                    <div className="space-y-1">
                        <label className="font-medium text-sm">Email</label>
                        <input value={profile.email} disabled className="w-full p-2 bg-gray-100 border rounded-md" />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="username">Username</label>
                        <div className="relative"><UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="username" {...register("username")} disabled={isPending} className="w-full pl-10 p-2 border rounded-md" /></div>
                        {errors.username && <p className="text-red-600 text-sm">{errors.username.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="address">Address</label>
                        <div className="relative"><MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><textarea id="address" {...register("address")} disabled={isPending} rows={2} className="w-full pl-10 p-2 border rounded-md resize-none" /></div>
                        {errors.address && <p className="text-red-600 text-sm">{errors.address.message}</p>}
                    </div>
                    <button type="submit" disabled={isPending} className="w-full bg-green-700 text-white font-semibold py-2 rounded-md hover:bg-green-800 disabled:bg-green-400">
                        {isPending ? 'Saving...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
}