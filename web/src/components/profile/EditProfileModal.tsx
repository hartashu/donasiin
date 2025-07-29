'use client';

import { useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@/utils/validations/user";
import { updateUserProfileAction } from "@/actions/action";
import { IUser } from "@/types/types";
import { X, Camera, LoaderCircle } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

type EditProfileInput = {
    fullName: string;
    username: string;
    address: string;
};

interface EditProfileModalProps {
    user: IUser;
    onClose: () => void;
}

export function EditProfileModal({ user, onClose }: EditProfileModalProps) {
    const [isPending, startTransition] = useTransition();
    const [preview, setPreview] = useState<string | null>(user.avatarUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState: { errors }, setError } = useForm<EditProfileInput>({
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
            const result = await updateUserProfileAction(formData);
            if (result.success) {
                toast.success(result.message || "Profile Updated!");
                onClose();
            } else {
                setError("root", { message: result.error });
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-gray-100">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {errors.root && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{errors.root.message}</div>}

                    <div className="flex justify-center">
                        <div className="relative">
                            <Image src={preview || "/default-avatar.png"} width={100} height={100} alt="avatar" className="rounded-full object-cover" />
                            <input type="file" ref={fileInputRef} onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setPreview(URL.createObjectURL(file));
                            }} accept="image/*" className="hidden" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow border hover:bg-gray-100">
                                <Camera className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="fullName">Full Name</label>
                        <input id="fullName" {...register("fullName")} disabled={isPending} className="w-full p-2 mt-1 border rounded-md" />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="username">Username</label>
                        <input id="username" {...register("username")} disabled={isPending} className="w-full p-2 mt-1 border rounded-md" />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="address">Address</label>
                        <textarea id="address" {...register("address")} disabled={isPending} rows={3} className="w-full p-2 mt-1 border rounded-md resize-none" />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>

                    {/* <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 bg-gray-200 rounded-md font-semibold">Cancel</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-brand text-white rounded-md font-semibold flex items-center gap-2">
                            {isPending && <LoaderCircle className="animate-spin w-4 h-4" />}
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div> */}
                    <div className="border bg-red-100">
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" className="bg-blue-300 px-2">Cancel</button>
                            <button type="submit" className="bg-green-300 px-2">Submit</button>
                        </div>
                    </div>

                </form>
            </motion.div>
        </div>
    );
}