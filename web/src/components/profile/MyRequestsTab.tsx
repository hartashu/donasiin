'use client';

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Calendar, Trash2, Eye, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { IRequestWithPostDetails, RequestStatus } from "@/types/types";
import Masonry from 'react-masonry-css';
import { getCategoryColor } from '@/utils/colorUtils';
import toast from "react-hot-toast";
import { updateRequestStatusAction, deleteRequestAction } from "@/actions/action";

// Komponen modal simpel buat nampilin gambar gede
const ImageViewerModal = ({ imageUrl, onClose }: { imageUrl: string, onClose: () => void }) => {
    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] p-4 cursor-zoom-out"
        >
            <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2">
                <X size={24} />
            </button>
            <motion.div
                layoutId={`receipt-${imageUrl}`} // Animasi dari gambar kecil ke besar
                onClick={(e) => e.stopPropagation()} // Biar klik di gambar gak nutup modal
                className="relative max-w-full max-h-full"
            >
                <Image
                    src={imageUrl}
                    alt="Receipt full view"
                    width={800} // Ukuran maksimum
                    height={800}
                    style={{ width: 'auto', height: 'auto', maxHeight: '90vh', maxWidth: '90vw' }}
                    className="rounded-lg object-contain"
                />
            </motion.div>
        </div>
    );
};

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

const DeleteRequestButton = ({ req, refreshData }: { req: IRequestWithPostDetails, refreshData: () => void }) => {
    const [isDeleting, startDeleteTransition] = useTransition();
    const canBeDeleted = req.status === RequestStatus.PENDING;

    const handleDelete = () => {
        if (!canBeDeleted) return;
        if (window.confirm("Are you sure you want to cancel this request?")) {
            startDeleteTransition(async () => {
                toast.loading("Cancelling request...");
                const result = await deleteRequestAction(req._id);
                toast.dismiss();
                if (result.success) {
                    toast.success("Request cancelled.");
                    refreshData();
                } else {
                    toast.error(result.error || "Failed to cancel request.");
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={!canBeDeleted || isDeleting}
            title={canBeDeleted ? "Cancel request" : "Cannot cancel request at this stage"}
            className="p-1.5 text-gray-400 hover:bg-rose-100 hover:text-rose-600 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
};

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
    const [viewingImage, setViewingImage] = useState<string | null>(null); // State buat modal gambar

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
        <>
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

                                        {/* INI BAGIAN BARUNYA */}
                                        {req.trackingCode && (
                                            <div className="bg-gray-100 p-2 rounded-md text-xs space-y-1">
                                                <p className="font-semibold text-gray-700">Tracking: {req.trackingCode}</p>
                                                {req.trackingCodeUrl && (
                                                    <motion.div layoutId={`receipt-${req.trackingCodeUrl}`}>
                                                        <button onClick={() => setViewingImage(req.trackingCodeUrl!)} className="relative w-full h-24 rounded-md overflow-hidden group cursor-zoom-in">
                                                            <Image src={req.trackingCodeUrl} alt="Receipt thumbnail" fill className="object-cover" />
                                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Eye size={20} className="text-white" />
                                                            </div>
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
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
                                    <div className="flex items-center gap-1">
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
                                        <DeleteRequestButton req={req} refreshData={refreshData} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Masonry>
            </motion.div>

            {/* Render modal jika ada gambar yang mau dilihat */}
            {viewingImage && (
                <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
            )}
        </>
    );
}
