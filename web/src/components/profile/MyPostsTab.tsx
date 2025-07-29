'use client';

import { IPostWithRequests, RequestStatus } from "@/types/types";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

interface MyPostsTabProps {
    posts: IPostWithRequests[];
    currentUserId: string;
    isPending: boolean;
    handleStatusUpdate: (id: string, status: RequestStatus) => void;
}

export function MyPostsTab({ posts, currentUserId, isPending, handleStatusUpdate }: MyPostsTabProps) {
    const router = useRouter();
    const createConversationId = (id1: string, id2: string) => [id1, id2].sort().join('_');

    if (posts.length === 0) {
        return <p className="text-center text-gray-500 py-8">You haven&apos;t posted any items yet.</p>
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {posts.map(post => (
                <div key={post._id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <Link href={`/posts/${post.slug}`} className="flex items-center gap-4 mb-3 group">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                            <Image src={post.thumbnailUrl} alt={post.title} fill className="object-cover" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg group-hover:text-brand transition">{post.title}</h3>
                            <span className={`text-xs font-semibold ${post.isAvailable ? 'text-green-600' : 'text-red-500'}`}>{post.isAvailable ? "Available" : "Claimed"}</span>
                        </div>
                    </Link>

                    {post.requests.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto scrollbar-thin py-2">
                            {post.requests.map(req => (
                                <div key={req._id} className="flex-shrink-0 w-full sm:w-80 p-3 border bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <Image src={req.requester.avatarUrl || '/default-avatar.png'} width={32} height={32} alt="requester" className="rounded-full" />
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-semibold truncate">{req.requester.fullName}</p>
                                                <p className="text-xs text-gray-500">{req.status}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => {
                                            const conversationId = createConversationId(currentUserId, req.requester._id);
                                            router.push(`/chat/${conversationId}`);
                                        }} className="p-2 text-gray-500 hover:bg-gray-200 hover:text-brand rounded-full">
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t">
                                        {req.status === 'PENDING' && (
                                            <>
                                                <button disabled={isPending} onClick={() => handleStatusUpdate(req._id, RequestStatus.ACCEPTED)} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Accept</button>
                                                <button disabled={isPending} onClick={() => handleStatusUpdate(req._id, RequestStatus.REJECTED)} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                                            </>
                                        )}
                                        {req.status === 'ACCEPTED' && (
                                            <button disabled={isPending} onClick={() => handleStatusUpdate(req._id, RequestStatus.SHIPPED)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">📦 Mark as Shipped</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </motion.div>
    );
}