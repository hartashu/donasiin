"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { IPostWithRequests, IRequestWithPostDetails, IUser, RequestStatus } from "@/types/types";
import { getMyProfileData, updateRequestStatusAction } from "@/actions/action";
import { motion } from "framer-motion";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import UploadReceiptModal from "@/components/profile/UploadReceiptModal";
import { ProfileTabSkeleton } from "@/components/ui/ProfileTabSkeleton";
import { MyPostsTab } from "@/components/profile/MyPostsTab";
import { MyRequestsTab } from "@/components/profile/MyRequestsTab";
import { Skeleton } from "@/components/ui/Skeleton";
import { Edit } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type ProfileData = {
    profile: IUser;
    posts: IPostWithRequests[];
    requests: IRequestWithPostDetails[];
}

export function ProfileView() {
    const [data, setData] = useState<ProfileData | null>(null);
    const [tab, setTab] = useState<"posts" | "requests">("posts");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const refreshData = useCallback(async () => {
        try {
            const newData = await getMyProfileData();
            setData(newData);
        } catch (error) {
            toast.error("Failed to load profile data.");
            router.push('/auth/login');
        }
    }, [router]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleStatusUpdate = (id: string, status: RequestStatus) => {
        startTransition(async () => {
            try {
                if (status === RequestStatus.ACCEPTED && !confirm("Accepting this will make the item unavailable. Continue?")) return;

                if (status === RequestStatus.SHIPPED) {
                    setSelectedRequestId(id);
                    setIsReceiptModalOpen(true);
                    return;
                }

                const result = await updateRequestStatusAction(id, { status });
                if (result.success) {
                    toast.success(result.message || "Status updated!");
                    await refreshData();
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to update status.");
            }
        });
    };

    const handleReceiptUploaded = (trackingNumber: string) => {
        if (!selectedRequestId) return;
        setIsReceiptModalOpen(false);
        startTransition(async () => {
            try {
                const result = await updateRequestStatusAction(selectedRequestId, {
                    status: RequestStatus.SHIPPED,
                    trackingCode: trackingNumber
                });
                if (result.success) {
                    toast.success(result.message || "Status updated!");
                    await refreshData();
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to update status.");
            } finally {
                setSelectedRequestId(null);
            }
        });
    };

    return (
        <>
            <div className="container mx-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <aside className="md:col-span-1 bg-white shadow-md rounded-xl p-4 self-start sticky top-24">
                        <div className="text-center relative">
                            {data && (
                                <button onClick={() => setIsEditModalOpen(true)} className="absolute top-1 right-1 p-2 text-gray-400 hover:text-brand rounded-full">
                                    <Edit className="w-4 h-4" />
                                </button>
                            )}
                            <div className="relative w-24 h-24 mx-auto">
                                {data ? (
                                    <Image src={data.profile.avatarUrl || "/default-avatar.png"} fill alt={data.profile.fullName || "avatar"} className="rounded-full object-cover" />
                                ) : (
                                    <Skeleton className="w-full h-full rounded-full" />
                                )}
                            </div>
                            <div className="mt-4">
                                {data ? (
                                    <>
                                        <h2 className="text-xl font-bold">{data.profile.fullName}</h2>
                                        <p className="text-gray-500">@{data.profile.username}</p>
                                    </>
                                ) : (
                                    <div className="space-y-2 mt-2">
                                        <Skeleton className="h-6 w-3/4 mx-auto" />
                                        <Skeleton className="h-4 w-1/2 mx-auto" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    <div className="md:col-span-3 space-y-6">
                        <div className="flex gap-4 border-b">
                            <button onClick={() => setTab('posts')} className={`px-4 py-2 font-semibold ${tab === 'posts' ? 'border-b-2 border-brand text-brand' : 'text-gray-500'}`}>
                                My Posts {data && `(${data.posts.length})`}
                            </button>
                            <button onClick={() => setTab('requests')} className={`px-4 py-2 font-semibold ${tab === 'requests' ? 'border-b-2 border-brand text-brand' : 'text-gray-500'}`}>
                                My Requests {data && `(${data.requests.length})`}
                            </button>
                        </div>

                        {!data ? (
                            <ProfileTabSkeleton />
                        ) : tab === 'posts' ? (
                            <MyPostsTab posts={data.posts} currentUserId={data.profile._id.toString()} isPending={isPending} handleStatusUpdate={handleStatusUpdate} />
                        ) : (
                            <MyRequestsTab requests={data.requests} currentUserId={data.profile._id.toString()} isPending={isPending} handleStatusUpdate={handleStatusUpdate} />
                        )}
                    </div>
                </div>
            </div>
            {isEditModalOpen && data && <EditProfileModal user={data.profile} onClose={() => { setIsEditModalOpen(false); refreshData(); }} />}
            {isReceiptModalOpen && <UploadReceiptModal onClose={() => setIsReceiptModalOpen(false)} onSuccess={handleReceiptUploaded} />}
        </>
    );
}