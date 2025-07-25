// File: src/app/posts/[slug]/page.tsx

import { PostModel } from "@/models/post";
import { auth } from "@/lib/auth";
import Image from 'next/image';
import { StartChatForm } from "@/components/chat/StartChatForm";

interface PostDetailPageProps {
    params: {
        slug: string;
    };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
    const session = await auth();
    const post = await PostModel.getPostBySlug(params.slug);

    if (!post) {
        return <div className="text-center py-20">Post not found.</div>;
    }

    // Ambil author dari data post (hasil dari $lookup di model Anda)
    const author = post.author;
    const isMyPost = session?.user?.id === author._id.toString();

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-12">

                {/* Kolom Detail & Aksi */}
                <div>

                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                        <div className="w-12 h-12 rounded-full bg-gray-200">
                            {author.avatarUrl ? (
                                <Image src={author.avatarUrl} alt={author.fullName} width={48} height={48} className="rounded-full" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                                    {author.fullName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold">{author.fullName}</p>
                            <p className="text-sm text-gray-500">@{author.username}</p>
                        </div>
                    </div>

                    {/* Form untuk memulai chat, hanya muncul jika ini bukan post milik sendiri */}
                    {!isMyPost && session?.user?.id && (
                        <StartChatForm receiverId={author._id.toString()} />
                    )}

                    {/* Pesan jika pengguna belum login */}
                    {!session?.user?.id && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                            You must be logged in to contact the owner.
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}