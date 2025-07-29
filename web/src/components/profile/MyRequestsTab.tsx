'use client';

import { IRequestWithPostDetails, RequestStatus } from "@/types/types";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

interface MyRequestsTabProps {
    requests: IRequestWithPostDetails[];
    isPending: boolean;
    currentUserId: string;
    handleStatusUpdate: (id: string, status: RequestStatus) => void;
}

export function MyRequestsTab({ requests, isPending, currentUserId, handleStatusUpdate }: MyRequestsTabProps) {
    const router = useRouter();
    const createConversationId = (id1: string, id2: string) => [id1, id2].sort().join('_');

    if (requests.length === 0) {
        return <p className="text-center text-gray-500 py-8">You haven&apos;t requested any items yet.</p>
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {requests.map(req => (
                <div key={req._id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-start">
                        <Link href={`/posts/${req.postDetails.slug}`} className="flex items-center gap-4 group">
                            <div className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0">
                                <Image src={req.postDetails.thumbnailUrl} alt={req.postDetails.title} fill className="object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold group-hover:text-brand">{req.postDetails.title}</h3>
                                <p className="text-sm">Status: <span className="font-semibold">{req.status}</span></p>
                            </div>
                        </Link>
                        {req.status === 'SHIPPED' && (
                            <button disabled={isPending} onClick={() => handleStatusUpdate(req._id, RequestStatus.COMPLETED)} className="bg-brand text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                                ✔️ Mark as Completed
                            </button>
                        )}
                    </div>
                    {/* --- PERBAIKAN DI SINI --- */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                            <Image src={req.postDetails.author?.avatarUrl || '/default-avatar.png'} width={24} height={24} alt="owner" className="rounded-full" />
                            <span className="text-xs text-gray-600">Donated by <span className="font-semibold">{req.postDetails.author?.fullName || 'Unknown User'}</span></span>
                        </div>
                        {req.postDetails.author && ( // Hanya tampilkan tombol chat jika author ada
                            <button onClick={() => {
                                const conversationId = createConversationId(currentUserId, req.postDetails.author._id);
                                router.push(`/chat/${conversationId}`);
                            }} className="p-2 text-gray-500 hover:bg-gray-200 hover:text-brand rounded-full">
                                <MessageSquare className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {/* ----------------------- */}
                </div>
            ))}
        </motion.div>
    );
}