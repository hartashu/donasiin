'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MyPostsTab } from './MyPostsTab';
import { MyRequestsTab } from './MyRequestsTab';
import { IPostWithRequests, IRequestWithPostDetails, IUser } from '@/types/types';

interface MyActivityProps {
    profile: IUser;
    posts: IPostWithRequests[];
    requests: IRequestWithPostDetails[];
    refreshData: () => void;
}

// Komponen kecil buat tombol tab, biar ada animasinya
const TabButton = ({ label, count, isActive, onClick }: { label: string, count: number, isActive: boolean, onClick: () => void }) => (
    <button onClick={onClick} className="relative px-1 py-2 text-sm sm:text-base font-semibold outline-none transition-colors duration-300">
        <span className={isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}>{label}</span>
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}>{count}</span>
        {isActive && (
            <motion.div
                layoutId="active-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
            />
        )}
    </button>
);

export function MyActivity({ profile, posts, requests, refreshData }: MyActivityProps) {
    const [activeTab, setActiveTab] = useState<'posts' | 'requests'>('posts');

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                <div className="flex border-b border-gray-200 space-x-4">
                    <TabButton label="My Donations" count={posts.length} isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                    <TabButton label="My Requests" count={requests.length} isActive={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />
                </div>
                <div className="pt-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'posts' ? (
                                <MyPostsTab posts={posts} currentUserId={profile._id as string} refreshData={refreshData} />
                            ) : (
                                <MyRequestsTab requests={requests} currentUserId={profile._id as string} refreshData={refreshData} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
