"use client";
import { DotWave } from "@uiball/loaders";

export const LoadingDots = () => {
  return (
    <div className="flex justify-center items-center h-32">
      <DotWave size={47} speed={1.2} color="#1c695f" />
    </div>
  );
};
