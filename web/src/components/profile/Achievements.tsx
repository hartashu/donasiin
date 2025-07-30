'use client';

import { Achievement as AchievementType } from '@/types/types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Award, GitMerge, PackagePlus, ShieldCheck, Rocket, Zap, Crown, Users, HeartHands, CalendarCheck, Coffee, Star, Feather, Sun, Moon } from "lucide-react";

const iconMap: { [key: string]: React.ElementType } = {
    Award, GitMerge, PackagePlus, ShieldCheck, Rocket, Zap, Crown, Users, HeartHands,
    CalendarCheck, Coffee, Star, Feather, Sun, Moon
};

const AchievementBadge = ({ ach }: { ach: AchievementType & { icon: string } }) => {
    // Kalau ach-nya null, jangan render apa-apa.
    if (!ach) return null;

    const Icon = iconMap[ach.icon] || Lock;

    return (
        <div className={`flex items-center gap-3 p-2 rounded-md transition-all duration-300 ${ach.unlocked ? 'bg-gray-100' : 'bg-gray-50'}`}>
            <div className={`p-2 rounded-full ${ach.unlocked ? 'bg-amber-100' : 'bg-gray-200'}`}>
                {ach.unlocked ? <Icon className="w-5 h-5 text-amber-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
            </div>
            <div className="flex-grow">
                <p className={`font-semibold ${ach.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>{ach.title}</p>
                <p className="text-xs text-gray-400">{ach.description}</p>
            </div>
        </div>
    );
}

export function Achievements({ allAchievements }: { allAchievements: (AchievementType & { icon: string })[] }) {
    const [showAll, setShowAll] = useState(false);

    // 🔥 FIX: Tambahkan pengecekan `a` sebelum akses properti `unlocked`.
    // Ini mencegah error kalau ada elemen `null` atau `undefined` di dalam array.
    const validAchievements = allAchievements?.filter(Boolean) || [];
    const unlockedAchievements = validAchievements.filter(a => a.unlocked);
    const lockedAchievements = validAchievements.filter(a => !a.unlocked);

    // 🔥 FIX: Cek `validAchievements` biar lebih aman.
    if (validAchievements.length === 0) return null;

    return (
        <div>
            <h3 className="font-semibold text-gray-800 mb-3">Achievements ({unlockedAchievements.length}/{validAchievements.length})</h3>
            <div className="space-y-2">
                {unlockedAchievements.slice(0, 3).map(ach => (
                    <AchievementBadge key={ach.id} ach={ach} />
                ))}
            </div>
            <AnimatePresence>
                {showAll && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2 pt-2">
                            {unlockedAchievements.slice(3).map(ach => (
                                <AchievementBadge key={ach.id} ach={ach} />
                            ))}
                            {lockedAchievements.map(ach => (
                                <AchievementBadge key={ach.id} ach={ach} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <button onClick={() => setShowAll(!showAll)} className="text-sm font-semibold text-gray-500 hover:text-gray-900 mt-3 w-full text-center">
                {showAll ? 'Show Less' : `Show all ${validAchievements.length} achievements...`}
            </button>
        </div>
    );
}
