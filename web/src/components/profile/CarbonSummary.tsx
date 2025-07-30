// @/components/profile/CarbonSummary.tsx
'use client';

import { Leaf } from "lucide-react";

export function CarbonSummary({ totalCarbonSavings }: { totalCarbonSavings: number; }) {
    const Equivalent = Math.floor(totalCarbonSavings / 21);

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg text-center border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Your Green Impact</h3>
            <div className="flex items-center justify-center gap-2">
                <Leaf className="w-10 h-10 text-emerald-500" />
                <p className="text-4xl font-bold text-gray-800">
                    {totalCarbonSavings.toFixed(1)}
                </p>
                <span className="font-semibold text-gray-500 mt-2">kg CO₂</span>
            </div>
            {totalCarbonSavings > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                    Equivalent to the carbon absorbed by <strong>{Equivalent} trees</strong> in a year!
                </p>
            )}
        </div>
    );
}