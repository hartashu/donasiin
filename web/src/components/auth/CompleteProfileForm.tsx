'use client';

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompleteProfileSchema, type CompleteProfileInput } from "@/utils/validations/auth";
import { completeGoogleRegistration } from "@/lib/actions/user.actions";
import { UserRound, MapPin } from "lucide-react";
import type { IIncompleteProfile } from "@/types/types";
import Image from "next/image";
import toast from "react-hot-toast";

interface CompleteProfileFormProps {
    profile: Omit<IIncompleteProfile, '_id'> & { _id: string };
}

export function CompleteProfileForm({ profile }: CompleteProfileFormProps) {
    const [isPending, startTransition] = useTransition();

    const { register, handleSubmit, formState: { errors } } = useForm<CompleteProfileInput>({
        resolver: zodResolver(CompleteProfileSchema),
    });

    const onSubmit = (data: CompleteProfileInput) => {
        const formData = new FormData();
        formData.append('token', profile.token);
        formData.append('username', data.username);
        formData.append('address', data.address);

        startTransition(async () => {
            const result = await completeGoogleRegistration(formData);
            if (result?.error) {
                toast.error(result.error);
            }
        });
    };

    return (
        <div className="max-w-md w-full animate-subtle-float">
            <div className="bg-white/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/LogoDonasiinnobg.png"
                            alt="Donasiin Logo"
                            width={180}
                            height={50}
                            priority
                        />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">One Last Step</h1>
                    <p className="text-gray-700 text-sm sm:text-md mt-2">Welcome, {profile.fullName}! Please complete your profile.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <label className="font-medium text-sm text-gray-600">Email</label>
                        <input value={profile.email} disabled className="w-full p-2.5 bg-gray-200/50 border border-gray-300/50 rounded-md text-gray-500 cursor-not-allowed" />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="username" className="font-medium text-sm text-gray-600">Username</label>
                        <div className="relative">
                            <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                            <input id="username" {...register("username")} disabled={isPending} placeholder="e.g., johndoe" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition" />
                        </div>
                        {errors.username && <p className="text-red-600 text-xs px-1 pt-1">{errors.username.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="address" className="font-medium text-sm text-gray-600">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <textarea id="address" {...register("address")} disabled={isPending} rows={2} placeholder="123 Charity Lane, Donation City" className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition resize-none" />
                        </div>
                        {errors.address && <p className="text-red-600 text-xs px-1 pt-1">{errors.address.message}</p>}
                    </div>
                    <button type="submit" disabled={isPending} className="w-full bg-[#2a9d8f] text-white font-semibold py-2.5 rounded-md hover:bg-[#268a7e] transition duration-300 disabled:bg-[#2a9d8f]/50 disabled:cursor-not-allowed">
                        {isPending ? 'Saving...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
}