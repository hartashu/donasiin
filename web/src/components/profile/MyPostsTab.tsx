// @/components/profile/MyPostsTab.tsx
'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { IPostWithRequests, IRequestWithPostDetails, RequestStatus } from "@/types/types";
import DeletePostButton from "./DeletePostButton";
import { ChevronDown, MessageSquare, Leaf, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateRequestStatusAction } from '@/actions/action';
import toast from 'react-hot-toast';
import { getCategoryColor } from '@/utils/colorUtils';

interface TabProps {
    currentUserId: string;
    refreshData: () => void;
}

const RequestItem = ({ req, isPending, handleStatusUpdate, currentUserId }: { req: IRequestWithPostDetails } & { isPending: boolean, handleStatusUpdate: (id: string, status: RequestStatus) => void, currentUserId: string }) => {
    const router = useRouter();
    const createConversationId = (id1: string, id2: string) => [id1, id2].sort().join('_');

    return (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
            <div className="flex items-center gap-2 overflow-hidden">
                <Image src={req.requester.avatarUrl || '/default-avatar.png'} width={32} height={32} alt={req.requester.fullName} className="rounded-full flex-shrink-0" />
                <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate text-gray-800">{req.requester.fullName}</p>
                    <p className="text-xs text-gray-500">{req.status}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <button onClick={() => {
                    const conversationId = createConversationId(currentUserId, req.requester._id as string);
                    router.push(`/chat/${conversationId}`);
                }} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-800 rounded-full">
                    <MessageSquare size={16} />
                </button>
                <div className='flex gap-1'>
                    {req.status === RequestStatus.PENDING && (
                        <>
                            <button disabled={isPending} onClick={() => handleStatusUpdate(req._id as string, RequestStatus.ACCEPTED)} className="text-xs bg-emerald-500 text-white px-2 py-1 rounded hover:bg-emerald-600 disabled:opacity-50">Accept</button>
                            <button disabled={isPending} onClick={() => handleStatusUpdate(req._id as string, RequestStatus.REJECTED)} className="text-xs bg-rose-500 text-white px-2 py-1 rounded hover:bg-rose-600 disabled:opacity-50">Reject</button>
                        </>
                    )}
                    {req.status === RequestStatus.ACCEPTED && (
                        <button disabled={isPending} onClick={() => handleStatusUpdate(req._id as string, RequestStatus.SHIPPED)} className="text-xs bg-sky-500 text-white px-3 py-1 rounded hover:bg-sky-600 disabled:opacity-50">📦 Ship</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const RequestList = ({ requests, ...props }: { requests: IRequestWithPostDetails[] } & Omit<TabProps, 'isPending' | 'handleStatusUpdate'> & { isPending: boolean; handleStatusUpdate: (id: string, status: RequestStatus) => void; }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="mt-auto pt-3 border-t border-gray-100">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left text-sm font-semibold text-gray-600 hover:text-gray-900">
                <span>Requests ({requests.length})</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="max-h-[152px] overflow-y-auto space-y-2 pt-3 pr-2">
                            {requests.length > 0 ? requests.map(req => (
                                <RequestItem key={req._id as string} req={req} {...props} />
                            )) : <p className="text-xs text-gray-500 text-center py-2">No requests yet.</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FeaturedPostCard = ({ post, ...props }: { post: IPostWithRequests } & TabProps) => {
    const isDeletable = post.isAvailable;
    const categoryColor = getCategoryColor(post.category);
    // href={`/donations/${d.category}/detail?slug=${d.slug}`}
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
            <div className="flex-grow flex flex-col md:flex-row gap-5">
                <Link href={`/donations/${post.category}/detail?slug=${post.slug}`} className="relative block w-full md:w-2/5 aspect-square md:aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0 group">
                    <Image src={post.thumbnailUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </Link>
                <div className="flex flex-col flex-grow">
                    <div className="flex-grow">
                        <span style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }} className="text-xs font-semibold px-2 py-1 rounded-full capitalize mb-2 inline-block">
                            {post.category}
                        </span>
                        <h3 className="font-bold text-2xl leading-tight text-gray-800 hover:text-gray-900 transition">{post.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                            <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            <span className="flex items-center gap-1.5"><Leaf size={12} /> {post.carbonKg?.toFixed(1) || 0} kg CO₂ saved</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-3 line-clamp-4 flex-grow">{post.description}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className={`text-sm font-bold ${post.isAvailable ? 'text-emerald-600' : 'text-rose-500'}`}>{post.isAvailable ? "Available" : "Claimed"}</span>
                        <DeletePostButton slug={post.slug} isDeletable={isDeletable} />
                    </div>
                </div>
            </div>
            <RequestList requests={post.requests} {...props} />
        </div>
    );
};

const StandardPostCard = ({ post, ...props }: { post: IPostWithRequests } & TabProps) => {
    const isDeletable = post.isAvailable;
    const categoryColor = getCategoryColor(post.category);
    return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 flex flex-col">
            <div className="flex-grow">
                <Link href={`/donations/${post.category}/detail?slug=${post.slug}`} className="group">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3">
                        <Image src={post.thumbnailUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <span style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }} className="text-xs font-semibold px-2 py-1 rounded-full capitalize mb-1 inline-block">
                        {post.category}
                    </span>
                    <h3 className="font-bold text-base leading-tight group-hover:text-gray-900 transition line-clamp-2">{post.title}</h3>
                </Link>
                <div className="flex flex-col gap-1 text-xs text-gray-400 mt-2">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    <span className="flex items-center gap-1"><Leaf size={12} /> {post.carbonKg?.toFixed(1) || 0} kg CO₂</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                    <span className={`text-xs font-bold ${post.isAvailable ? 'text-emerald-600' : 'text-rose-500'}`}>{post.isAvailable ? "Available" : "Claimed"}</span>
                    <DeletePostButton slug={post.slug} isDeletable={isDeletable} />
                </div>
            </div>
            <RequestList requests={post.requests} {...props} />
        </div>
    );
};

export function MyPostsTab({ posts, currentUserId, refreshData }: { posts: IPostWithRequests[] } & TabProps) {
    const [isPending, startTransition] = useTransition();

    const handleStatusUpdate = (id: string, status: RequestStatus) => {
        startTransition(async () => {
            const result = await updateRequestStatusAction(id, { status });
            if (result.success) {
                toast.success(result.message || 'Status updated!');
                refreshData();
            } else {
                toast.error('Failed to update status.');
            }
        });
    };

    if (posts.length === 0) {
        return <div className="text-center text-gray-500 py-8">You haven&apos;t made any donations yet.</div>
    }

    const [latestPost, ...olderPosts] = posts;

    const commonProps = { isPending, handleStatusUpdate, currentUserId, refreshData };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {latestPost && (
                <div>
                    <h2 className="text-sm font-bold uppercase text-gray-500 tracking-wider mb-3">Latest Donation</h2>
                    <FeaturedPostCard post={latestPost} {...commonProps} />
                </div>
            )}

            {olderPosts.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider mb-3">Older Donations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        {olderPosts.map(post => (
                            <StandardPostCard key={post._id as string} post={post} {...commonProps} />
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}