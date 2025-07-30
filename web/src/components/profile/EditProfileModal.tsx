// @/components/profile/EditProfileModal.tsx

'use client';

import { IUser } from "@/types/types";
import { EditProfileForm } from "./EditProfileForm";
import { X } from "lucide-react";

interface EditProfileModalProps {
    user: IUser;
    isOpen: boolean;
    onClose: () => void;
    onProfileUpdate: () => void;
}

export function EditProfileModal({ user, isOpen, onClose, onProfileUpdate }: EditProfileModalProps) {
    if (!isOpen) return null;

    const handleUpdateAndClose = () => {
        onProfileUpdate();
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
                <EditProfileForm user={user} onProfileUpdate={handleUpdateAndClose} onCancel={onClose} />
            </div>
        </div>
    );
}