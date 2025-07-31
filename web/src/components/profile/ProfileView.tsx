
'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getMyProfileData } from '@/actions/action';
import { IUser, IPostWithRequests, IRequestWithPostDetails, Achievement, Activity } from '@/types/types';

import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ProfilePageSkeleton } from './ProfilePageSkeleton';
import { ProfileHeader } from './ProfileHeader';
import { MyActivity } from './MyActivity';

interface ProfileData {
    profile: IUser;
    posts: IPostWithRequests[];
    requests: IRequestWithPostDetails[];
    stats: {
        totalPosts: number;
        totalIncomingRequests: number;
        totalOutgoingRequests: number;
        totalCarbonSavings: number;
        completedDonations: number;
        dailyRequestsMade: number;
    };
    achievements: (Achievement & { icon: string })[];
    activityFeed: Activity[];
}

interface ProfileViewProps {
    initialData: ProfileData;
}

export function ProfileView({ initialData }: ProfileViewProps) {
    const [data, setData] = useState<ProfileData | null>(initialData);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const refreshData = useCallback(async () => {
        try {
            toast.loading('Refreshing data...');
            const newData = await getMyProfileData();
            setData(newData);
            toast.dismiss();
            toast.success('Data updated!');
        } catch {
            toast.dismiss();
            toast.error('Failed to reload profile data.');
        }
    }, []);

    if (!data) return <ProfilePageSkeleton />;

    const { profile, posts, requests, stats, achievements, activityFeed } = data;

    return (
        <>
            <div className="relative min-h-screen">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-100 via-white to-gray-50" />
                <div className="container mx-auto p-4 sm:p-6">
                    <div className="space-y-8 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0 items-start">
                        <aside className="lg:col-span-4 xl:col-span-3">
                            <div className="lg:sticky lg:top-6">
                                <ProfileHeader
                                    profile={profile}
                                    stats={stats}
                                    achievements={achievements}
                                    activityFeed={activityFeed}
                                    onEdit={() => setIsEditModalOpen(true)}
                                />
                            </div>
                        </aside>

                        <main className="lg:col-span-8 xl:col-span-9">
                            <MyActivity
                                profile={profile}
                                posts={posts}
                                requests={requests}
                                refreshData={refreshData}
                            />
                        </main>
                    </div>
                </div>
            </div>


            <EditProfileModal
                user={profile}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onProfileUpdate={refreshData}
            />
        </>
    );
}