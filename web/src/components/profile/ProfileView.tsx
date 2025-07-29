'use client';

import { useState, useCallback, useTransition } from 'react';
// FIX: Removed unused 'useRouter' import
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Activity, Settings, LogOut } from 'lucide-react';

import { getMyProfileData, updateRequestStatusAction } from '@/actions/action';
import { IUser, IPostWithRequests, IRequestWithPostDetails, RequestStatus } from '@/types/types';

import { MyPostsTab } from '@/components/profile/MyPostsTab';
import { MyRequestsTab } from '@/components/profile/MyRequestsTab';
import UploadReceiptModal from '@/components/profile/UploadReceiptModal';
import { EditProfileForm } from './EditProfileModal';
import { Skeleton } from '@/components/ui/Skeleton';

// --- Type definition for the data prop ---
interface ProfileData {
    profile: IUser;
    posts: IPostWithRequests[];
    requests: IRequestWithPostDetails[];
}

interface ProfileViewProps {
    initialData: ProfileData;
}


function ProfileSkeleton() {
    return (
        <div className="container mx-auto p-4 sm:p-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <Skeleton className="h-60 w-full rounded-lg" />
                </aside>
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex gap-4 border-b">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        </div>
    );
}

function ProfileCard({ profile, activeTab, setActiveTab }: {
    profile: IUser;
    activeTab: string;
    setActiveTab: (tab: 'activity' | 'settings') => void;
}) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                    <Image src={profile.avatarUrl || '/default-avatar.png'} fill alt="avatar" className="rounded-full object-cover" />
                </div>
                <div>
                    <h2 className="font-bold text-lg">{profile.fullName}</h2>
                    <p className="text-sm text-gray-500">@{profile.username}</p>
                </div>
            </div>
            <nav className="space-y-1 border-t pt-4">
                <button onClick={() => setActiveTab('activity')} className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition ${activeTab === 'activity' ? 'bg-brand-light text-brand-dark font-semibold' : 'hover:bg-gray-100'}`}>
                    <Activity className="w-5 h-5" /> Aktivitas Saya
                </button>
                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition ${activeTab === 'settings' ? 'bg-brand-light text-brand-dark font-semibold' : 'hover:bg-gray-100'}`}>
                    <Settings className="w-5 h-5" /> Pengaturan Akun
                </button>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition text-red-600 hover:bg-red-50">
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </nav>
        </div>
    );
}

function MyActivityTabs({
    posts,
    requests,
    profile,
    onOpenReceiptModal,
    onDataChange,
}: {
    posts: IPostWithRequests[];
    requests: IRequestWithPostDetails[];
    profile: IUser;
    onOpenReceiptModal: (requestId: string) => void;
    onDataChange: () => void;
}) {
    const [subTab, setSubTab] = useState<'posts' | 'requests'>('posts');
    const [isPending, startTransition] = useTransition();

    const handleStatusUpdate = (id: string, status: RequestStatus) => {
        startTransition(async () => {
            try {
                // Using window.confirm is not recommended in production, consider a custom modal.
                if (status === RequestStatus.ACCEPTED && !window.confirm('Accepting will make the item unavailable. Continue?')) return;
                if (status === RequestStatus.SHIPPED) {
                    onOpenReceiptModal(id);
                    return;
                }
                const result = await updateRequestStatusAction(id, { status });
                if (result.success) {
                    toast.success(result.message || 'Status updated!');
                    onDataChange();
                } else {
                    // FIX: Changed 'result.error' to 'result.message' to match the likely return type and resolve the TS error.
                    toast.error(result.message || 'Failed to update status.');
                }
            } catch {
                toast.error('An unexpected error occurred.');
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border mt-6 lg:mt-0">
            <div className="flex gap-4 border-b mb-6">
                <button
                    onClick={() => setSubTab('posts')}
                    className={`pb-2 font-semibold ${subTab === 'posts' ? 'border-b-2 border-brand text-brand' : 'text-gray-500'}`}
                >
                    My Posts ({posts.length})
                </button>
                <button
                    onClick={() => setSubTab('requests')}
                    className={`pb-2 font-semibold ${subTab === 'requests' ? 'border-b-2 border-brand text-brand' : 'text-gray-500'}`}
                >
                    My Requests ({requests.length})
                </button>
            </div>

            {subTab === 'posts' ? (
                <MyPostsTab
                    posts={posts}
                    currentUserId={profile._id?.toString() || ''}
                    isPending={isPending}
                    handleStatusUpdate={handleStatusUpdate}
                />
            ) : (
                <MyRequestsTab
                    requests={requests}
                    currentUserId={profile._id?.toString() || ''}
                    isPending={isPending}
                    handleStatusUpdate={handleStatusUpdate}
                />
            )}
        </div>
    );
}


export function ProfileView({ initialData }: ProfileViewProps) {
    const [data, setData] = useState<ProfileData | null>(initialData);
    const [activeTab, setActiveTab] = useState<'activity' | 'settings'>('activity');
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    // FIX: Removed unused 'router' variable.

    const refreshData = useCallback(async () => {
        try {
            const newData = await getMyProfileData();
            setData(newData);
        } catch {
            toast.error('Failed to reload profile data.');
        }
        // FIX: Removed 'router' from dependency array as it's not used.
    }, []);

    const handleReceiptUploaded = async (trackingNumber: string) => {
        if (!selectedRequestId) return;
        try {
            const result = await updateRequestStatusAction(selectedRequestId, {
                status: RequestStatus.SHIPPED,
                trackingCode: trackingNumber,
            });
            if (result.success) toast.success(result.message || 'Status updated!');
            else toast.error('Failed to update status.');
        } catch {
            toast.error('Failed to update status.');
        } finally {
            setIsReceiptModalOpen(false);
            setSelectedRequestId(null);
            await refreshData();
        }
    };

    if (!data) return <ProfileSkeleton />;
    const { profile, posts, requests } = data;

    return (
        <>
            <div className="container mx-auto p-4 sm:p-6">
                {/* Mobile View */}
                <div className="lg:hidden mb-6">
                    <ProfileCard profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} />
                    {activeTab === 'activity' && (
                        <MyActivityTabs
                            posts={posts}
                            requests={requests}
                            profile={profile}
                            onOpenReceiptModal={(requestId: string) => {
                                setSelectedRequestId(requestId);
                                setIsReceiptModalOpen(true);
                            }}
                            onDataChange={refreshData}
                        />
                    )}
                    {activeTab === 'settings' && (
                        <EditProfileForm user={profile} onProfileUpdate={refreshData} />
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden lg:grid grid-cols-4 gap-8">
                    <aside className="col-span-1 self-start sticky top-24">
                        <ProfileCard profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} />
                    </aside>

                    <div className="col-span-3">
                        {activeTab === 'activity' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <MyActivityTabs
                                    posts={posts}
                                    requests={requests}
                                    profile={profile}
                                    onOpenReceiptModal={(requestId: string) => {
                                        setSelectedRequestId(requestId);
                                        setIsReceiptModalOpen(true);
                                    }}
                                    onDataChange={refreshData}
                                />
                            </motion.div>
                        )}
                        {activeTab === 'settings' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <EditProfileForm user={profile} onProfileUpdate={refreshData} />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {isReceiptModalOpen && (
                <UploadReceiptModal
                    onClose={() => setIsReceiptModalOpen(false)}
                    onSuccess={handleReceiptUploaded}
                />
            )}
        </>
    );
}
