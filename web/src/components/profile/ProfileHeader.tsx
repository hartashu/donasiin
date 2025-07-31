// @/components/profile/ProfileHeader.tsx
"use client";

import { IUser, Achievement, Activity } from "@/types/types";
import Image from "next/image";
import {
    Edit,
    LogOut,
    MapPin,
    CalendarDays,
    Clock,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { format } from "date-fns";
import { CarbonSummary } from "./CarbonSummary";
import { Achievements } from "./Achievements";
import { ActivityTimeline } from "./ActivityTimeline";

// Tipe data yang diharapkan oleh komponen ActivityTimeline, disimpulkan dari error.
type TimelineActivityType =
    | "I_CREATED_A_POST"
    | "SOMEONE_REQUESTED_MY_ITEM"
    | "I_UPDATED_A_REQUEST"
    | "I_MADE_A_REQUEST"
    | "MY_REQUEST_WAS_UPDATED";

// Tipe baru ini menggabungkan properti dari Activity asli dengan `type` yang baru.
interface TimelineActivity extends Omit<Activity, "type"> {
    type: TimelineActivityType;
}

interface ProfileHeaderProps {
    profile: IUser;
    stats: {
        totalPosts: number;
        totalIncomingRequests: number;
        totalOutgoingRequests: number;
        totalCarbonSavings: number;
        dailyRequestsMade: number;
    };
    achievements: (Achievement & { icon: string })[];
    activityFeed: Activity[];
    onEdit: () => void;
}

const StatItem = ({
    value,
    label,
}: {
    value: number | string;
    label: string;
}) => (
    <div className="text-center">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
    </div>
);

export function ProfileHeader({
    profile,
    stats,
    achievements,
    activityFeed,
    onEdit,
}: ProfileHeaderProps) {
    // FIX: Transformasi `activityFeed` ke tipe yang diharapkan oleh `ActivityTimeline`.
    // Ini adalah cara yang type-safe untuk mengatasi error tanpa menggunakan `any`.
    const timelineActivities = activityFeed
        .map((act): TimelineActivity | null => {
            let newType: TimelineActivityType;

            switch (act.type) {
                case "POST_CREATED":
                    newType = "I_CREATED_A_POST";
                    break;
                case "REQUEST_RECEIVED":
                    newType = "SOMEONE_REQUESTED_MY_ITEM";
                    break;
                default:
                    // Abaikan tipe aktivitas yang tidak dikenal untuk mencegah error
                    return null;
            }

            return {
                ...act,
                type: newType,
            };
        })
        // Menyaring nilai null yang mungkin dihasilkan dari tipe yang tidak dikenal
        .filter((act): act is TimelineActivity => act !== null);

    return (
        <div className="bg-white p-5 rounded-2xl shadow-lg w-full space-y-5">
            <div className="flex items-start gap-4">
                <Image
                    src={profile.avatarUrl || "/default-avatar.png"}
                    width={80}
                    height={80}
                    alt="Avatar"
                    className="rounded-full border-4 border-white flex-shrink-0 shadow-md"
                />
                <div className="flex-grow pt-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {profile.fullName}
                    </h1>
                    <p className="text-sm text-gray-500">@{profile.username}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={onEdit}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="p-2 bg-rose-50 hover:bg-rose-100 rounded-full text-rose-500 transition-colors"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                    <MapPin size={14} className="flex-shrink-0 text-gray-400" />
                    <span>{profile.address || "Address not set"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <CalendarDays size={14} className="flex-shrink-0 text-gray-400" />
                    <span>
                        Joined on {format(new Date(profile.createdAt), "MMMM d, yyyy")}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="col-span-2 grid grid-cols-3 gap-4">
                    <StatItem label="Posts" value={stats.totalPosts} />
                    <StatItem label="Requests In" value={stats.totalIncomingRequests} />
                    <StatItem label="Requests Out" value={stats.totalOutgoingRequests} />
                </div>
                <div className="col-span-2 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-center">
                    <Clock size={16} className="text-gray-400" />
                    <p className="text-sm text-gray-600">
                        Daily Requests:{" "}
                        <span className="font-bold text-gray-800">
                            {" "}
                            {profile.dailyLimit} / 5
                        </span>
                    </p>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-6">
                <CarbonSummary totalCarbonSavings={stats.totalCarbonSavings} />
                <Achievements allAchievements={achievements} />
                <ActivityTimeline activities={timelineActivities} />
            </div>
        </div>
    );
}