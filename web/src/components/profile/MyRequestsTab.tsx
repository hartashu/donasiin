// @/components/profile/MyRequestsTab.tsx
'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Calendar, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { IRequestWithPostDetails, RequestStatus } from "@/types/types";
import Masonry from 'react-masonry-css';
import { getCategoryColor } from '@/utils/colorUtils';
import { useTransition } from "react";
import toast from "react-hot-toast";
import { updateRequestStatusAction } from "@/actions/action";

// Kartu khusus untuk menampilkan request dari post yang sudah dihapus
const DeletedPostRequestCard = ({ req }: { req: IRequestWithPostDetails }) => (
    <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 flex flex-col justify-between mb-4 break-inside-avoid">
        <div>
            <div className="flex items-center gap-3 text-gray-400">
                <Trash2 size={20} />
                <h3 className="font-bold text-gray-500 italic">
                    Original post has been deleted
                </h3>
            </div>
            <div className="mt-3 space-y-2 text-sm">
                <p>Status: <span className="font-semibold px-2 py-0.5 bg-gray-200 text-gray-600 rounded">{req.status}</span></p>
                <p className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={12} /> Requested {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                </p>
            </div>
        </div>
    </div>
);


export function MyRequestsTab({
    requests,
    currentUserId,
    refreshData,
}: {
    requests: IRequestWithPostDetails[],
    currentUserId: string,
    refreshData: () => void,
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleStatusUpdate = (id: string, status: RequestStatus) => {
        startTransition(async () => {
            const result = await updateRequestStatusAction(id, { status });
            if (result.success) {
                toast.success(result.message || 'Status updated successfully!');
                refreshData();
            } else {
                toast.error('Failed to update status.');
            }
        });
    };

    const createConversationId = (id1: string, id2: string) =>
        [id1, id2].sort().join('_');

    if (requests.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                You haven&apos;t requested any items yet.
            </div>
        );
    }

    const breakpointColumnsObj = {
        default: 3,
        1280: 3,
        1024: 2,
        768: 1,
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="flex w-auto -ml-4"
                columnClassName="pl-4 bg-clip-padding"
            >
                {requests.map((req) => {
                    if (!req.postDetails) {
                        return <DeletedPostRequestCard key={req._id as string} req={req} />;
                    }

                    const author = req.postDetails.author;
                    const authorId = author?._id?.toString();
                    const categoryColor = getCategoryColor(req.postDetails.category);

                    return (
                        <div key={req._id as string} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-between mb-4 break-inside-avoid">
                            <div>
                                <div className="flex items-start gap-4">
                                    <Link href={`/posts/${req.postDetails.slug}`} className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 group">
                                        <Image
                                            src={req.postDetails.thumbnailUrl}
                                            alt={req.postDetails.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </Link>
                                    <div className="flex-grow">
                                        <span style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }} className="text-xs font-semibold px-2 py-1 rounded-full capitalize mb-1 inline-block">
                                            {req.postDetails.category}
                                        </span>
                                        <h3 className="font-bold leading-tight text-gray-800">
                                            {req.postDetails.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-2 text-sm">
                                    <p>Status: <span style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }} className="font-semibold px-2 py-0.5 rounded">{req.status}</span></p>
                                    <p className="flex items-center gap-1.5 text-xs text-gray-400"><Calendar size={12} /> Requested {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</p>
                                </div>
                                {req.status === RequestStatus.SHIPPED && (
                                    <button
                                        disabled={isPending}
                                        onClick={() => handleStatusUpdate(req._id as string, RequestStatus.COMPLETED)}
                                        className="w-full mt-3 bg-gray-800 text-white px-3 py-1.5 rounded text-sm whitespace-nowrap hover:bg-gray-900 transition disabled:opacity-50"
                                    >
                                        ✔️ Confirm Reception
                                    </button>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Image src={author?.avatarUrl || '/default-avatar.png'} width={24} height={24} alt={author?.fullName || 'Donator'} className="rounded-full" />
                                    <span className="text-xs text-gray-600">
                                        By <span className="font-semibold">{author?.fullName || '...'}</span>
                                    </span>
                                </div>
                                {authorId && (
                                    <button
                                        onClick={() => {
                                            const conversationId = createConversationId(currentUserId, authorId);
                                            router.push(`/chat/${conversationId}`);
                                        }}
                                        className="p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-800 rounded-full"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </Masonry>
        </motion.div>
    );
}