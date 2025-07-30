'use client';

import { Activity, RequestStatus } from "@/types/types";
import { formatDistanceToNow } from 'date-fns';
import { Gift, MailPlus, Send, CheckCircle, XCircle, Package, UserCheck } from "lucide-react";
import { useState } from "react";

// Konfigurasi untuk setiap jenis aktivitas, biar rapi
const activityConfig = {
    I_CREATED_A_POST: { icon: Gift, color: "text-emerald-500", text: (title: string) => <>You donated <strong>{title}</strong>.</> },
    SOMEONE_REQUESTED_MY_ITEM: { icon: MailPlus, color: "text-sky-500", text: (title: string, user?: string) => <>{user} requested your item: <strong>{title}</strong>.</> },
    I_MADE_A_REQUEST: { icon: Send, color: "text-blue-500", text: (title: string, user?: string) => <>You requested <strong>{title}</strong> from {user}.</> },

    // Updates untuk request yang SAYA BUAT
    MY_REQUEST_WAS_UPDATED: {
        [RequestStatus.ACCEPTED]: { icon: UserCheck, color: "text-green-500", text: (title: string) => <>Your request for <strong>{title}</strong> was accepted!</> },
        [RequestStatus.REJECTED]: { icon: XCircle, color: "text-red-500", text: (title: string) => <>Your request for <strong>{title}</strong> was rejected.</> },
        [RequestStatus.SHIPPED]: { icon: Package, color: "text-purple-500", text: (title: string) => <>Your item <strong>{title}</strong> is on its way!</> },
        [RequestStatus.COMPLETED]: { icon: CheckCircle, color: "text-yellow-500", text: (title: string) => <>You completed the exchange for <strong>{title}</strong>.</> },
    },

    // Updates untuk request yang SAYA TERIMA
    I_UPDATED_A_REQUEST: {
        [RequestStatus.ACCEPTED]: { icon: UserCheck, color: "text-green-500", text: (title: string, user?: string) => <>You accepted the request for <strong>{title}</strong> from {user}.</> },
        [RequestStatus.REJECTED]: { icon: XCircle, color: "text-red-500", text: (title: string, user?: string) => <>You rejected the request for <strong>{title}</strong> from {user}.</> },
        [RequestStatus.SHIPPED]: { icon: Package, color: "text-purple-500", text: (title: string, user?: string) => <>You shipped <strong>{title}</strong> to {user}.</> },
        [RequestStatus.COMPLETED]: { icon: CheckCircle, color: "text-yellow-500", text: (title: string, user?: string) => <>The exchange for <strong>{title}</strong> with {user} is complete.</> },
    }
};

export function ActivityTimeline({ activities }: { activities: (Activity | null)[] }) {
    const [visibleCount, setVisibleCount] = useState(5);

    const formatDateSafely = (dateString: string | Date): string => {
        if (!dateString) return 'a while ago';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'a while ago';
        return formatDistanceToNow(date, { addSuffix: true });
    };

    const validActivities = activities?.filter(Boolean) || [];

    if (validActivities.length === 0) {
        return (
            <div>
                <h3 className="font-semibold text-gray-800 mb-3">Recent Activity</h3>
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">No activity to show yet.</p>
                    <p className="text-gray-400 text-xs mt-1">Start donating or requesting items!</p>
                </div>
            </div>
        )
    };

    const visibleActivities = validActivities.slice(0, visibleCount);

    return (
        <div>
            <h3 className="font-semibold text-gray-800 mb-3">Recent Activity</h3>
            <div className="relative border-l-2 border-gray-100 pl-6 space-y-5">
                {visibleActivities.map((activity, index) => {
                    let config;
                    // Logika untuk mencari config yang tepat
                    if (activity.type === 'MY_REQUEST_WAS_UPDATED' || activity.type === 'I_UPDATED_A_REQUEST') {
                        if (activity.status) {
                            config = activityConfig[activity.type][activity.status];
                        }
                    } else {
                        // Cast tipe agar TypeScript tidak bingung
                        config = activityConfig[activity.type as keyof typeof activityConfig];
                    }

                    // Jika tidak ada config yang cocok, jangan render apa-apa
                    if (!config || typeof config.text !== 'function') return null;

                    const { icon: Icon, color, text } = config;

                    return (
                        <div key={`${activity.type}-${activity.date}-${index}`} className="relative">
                            <div className="absolute -left-[34px] top-1 w-5 h-5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                                <Icon className={`${color} w-3 h-3`} />
                            </div>
                            <p className="text-sm text-gray-700">{text(activity.title, activity.otherUserName)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDateSafely(activity.date)}</p>
                        </div>
                    );
                })}
            </div>
            <div className="pl-6 mt-4 flex gap-4">
                {visibleCount < validActivities.length && (
                    <button onClick={() => setVisibleCount(prev => prev + 5)} className="text-sm font-semibold text-gray-500 hover:text-gray-900">
                        Show More...
                    </button>
                )}
                {visibleCount > 5 && (
                    <button onClick={() => setVisibleCount(5)} className="text-sm font-semibold text-gray-500 hover:text-gray-900">
                        Show Less
                    </button>
                )}
            </div>
        </div>
    );
}
