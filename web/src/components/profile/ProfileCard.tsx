// @/components/profile/ProfileCard.tsx

'use client';

import { IUser, IPostWithRequests, IRequestWithPostDetails, RequestStatus } from '@/types/types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { Edit, LogOut, FileText, ArrowDownToLine, ArrowUpFromLine, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileData {
    profile: IUser;
    posts: IPostWithRequests[];
    requests: IRequestWithPostDetails[];
    stats: {
        totalPosts: number;
        totalIncomingRequests: number;
        totalOutgoingRequests: number;
    };
}

export function ProfileCard({
    profile,
    stats,
    onEdit,
}: {
    profile: IUser;
    stats: ProfileData['stats'];
    onEdit: () => void;
}) {
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border space-y-4">
            <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-3">
                    <Image src={profile.avatarUrl || '/default-avatar.png'} fill alt="avatar" className="rounded-full object-cover border-2 border-gray-200" />
                </div>
                <h2 className="font-bold text-xl">{profile.fullName}</h2>
                <p className="text-sm text-gray-500">@{profile.username}</p>
                <p className="text-xs text-gray-400 mt-1">Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}</p>
                <button onClick={onEdit} className="mt-3 text-sm flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md font-semibold text-gray-700">
                    <Edit size={14} /> Edit Profile
                </button>
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex items-start gap-3 text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="flex-grow">{profile.address || 'Address not set'}</p>
                </div>
            </div>

            <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold text-gray-700 mb-2">My Stats</h3>
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600"><FileText size={16} /> My Posts</span>
                    <span className="font-bold">{stats.totalPosts}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600"><ArrowDownToLine size={16} /> Incoming Requests</span>
                    <span className="font-bold">{stats.totalIncomingRequests}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600"><ArrowUpFromLine size={16} /> My Requests</span>
                    <span className="font-bold">{stats.totalOutgoingRequests}</span>
                </div>
            </div>

            <div className="border-t pt-4">
                <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center justify-center gap-3 px-3 py-2 text-left rounded-md transition text-red-600 hover:bg-red-50 font-semibold">
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </div>
        </div>
    );
}