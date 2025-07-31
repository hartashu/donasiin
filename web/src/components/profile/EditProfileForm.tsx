'use client';

import { useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@/utils/validations/user";
import { updateUserProfileAction } from "@/actions/action";
import { IUser } from "@/types/types";
import { Camera, LoaderCircle, User, MapPin, AtSign } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

type EditProfileInput = {
    fullName: string;
    username: string;
    address: string;
};

interface EditProfileFormProps {
    user: IUser;
    onProfileUpdate: () => void;
    onCancel: () => void;
}

export function EditProfileForm({ user, onProfileUpdate, onCancel }: EditProfileFormProps) {
    const [isPending, startTransition] = useTransition();
    const [preview, setPreview] = useState<string | null>(user.avatarUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<EditProfileInput>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            fullName: user.fullName,
            username: user.username,
            address: user.address,
        }
    });

    const onSubmit = (data: EditProfileInput) => {
        const formData = new FormData();
        formData.append('fullName', data.fullName);
        formData.append('username', data.username);
        formData.append('address', data.address);

        const file = fileInputRef.current?.files?.[0];
        if (file) {
            formData.append('avatarFile', file);
        } else {
            formData.append('avatarUrl', user.avatarUrl || '');
        }

        startTransition(async () => {
            toast.loading("Saving changes...");
            const result = await updateUserProfileAction(formData);
            toast.dismiss();

            if (result.success) {
                toast.success(result.message || "Profile Updated!");
                onProfileUpdate();
            } else {
                toast.error(result.error || "An unknown error occurred.");
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi ukuran file (misal: maks 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File is too large! Maximum size is 2MB.");
                return;
            }
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="p-6 sm:p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* REFACTORED: Avatar Upload Area */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-colors"
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png, image/jpg" className="hidden" />
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                            <Image src={preview || "/default-avatar.png"} fill sizes="96px" alt="Avatar Preview" className="object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Max file size: 2MB. Allowed formats: JPG, PNG.</p>
                </div>

                {/* REFACTORED: Input Fields Styling */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input id="fullName" {...register("fullName")} disabled={isPending} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition" />
                        </div>
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <div className="relative mt-1">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input id="username" {...register("username")} disabled={isPending} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition" />
                        </div>
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <div className="relative mt-1">
                            <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <textarea id="address" {...register("address")} disabled={isPending} rows={3} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition" />
                        </div>
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>
                </div>

                {/* REFACTORED: Action Buttons Styling */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={onCancel} disabled={isPending} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-70">
                        Cancel
                    </button>
                    <button type="submit" disabled={isPending} className="px-6 py-2 bg-[#1c695f] text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-[#15564d] transition disabled:opacity-50">
                        {isPending && <LoaderCircle className="animate-spin w-4 h-4" />}
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}