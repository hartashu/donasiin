// @/components/profile/ActivityTimeline.tsx
'use client';

import { Activity } from "@/types/types";
import { formatDistanceToNow } from 'date-fns';
import { Gift, MailPlus } from "lucide-react";
import { useState } from "react";

const activityConfig = {
    POST_CREATED: { icon: Gift, color: "text-emerald-500", text: (title: string) => <>You donated <strong>{title}</strong></> },
    REQUEST_RECEIVED: { icon: MailPlus, color: "text-sky-500", text: (title: string, user?: string) => <>Request for <strong>{title}</strong> from {user}</> }
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
    const [visibleCount, setVisibleCount] = useState(5);

    if (activities.length === 0) return null;

    const visibleActivities = activities.slice(0, visibleCount);

    return (
        <div>
            <h3 className="font-semibold text-gray-800 mb-3">Recent Activity</h3>
            <div className="relative border-l-2 border-gray-100 pl-6 space-y-5">
                {visibleActivities.map((activity, index) => {
                    const config = activityConfig[activity.type];
                    return (
                        <div key={index} className="relative">
                            <div className="absolute -left-[34px] top-1 w-5 h-5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                                <config.icon className={`${config.color} w-3 h-3`} />
                            </div>
                            <p className="text-sm text-gray-700">{config.text(activity.title, activity.user)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(new Date(activity.date), { addSuffix: true })}</p>
                        </div>
                    );
                })}
            </div>
            <div className="pl-6 mt-4 flex gap-4">
                {visibleCount < activities.length && (
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