import { Suspense } from "react";
import { UserModel } from "@/models/user.model";
import { redirect } from "next/navigation";
import { CompleteProfileForm } from "@/components/auth/CompleteProfileForm";
import type { IIncompleteProfile } from "@/types/types";

interface CompleteProfilePageProps {
  searchParams: Promise<{ token?: string }>;
}

type PlainIncompleteProfile = Omit<IIncompleteProfile, "_id"> & { _id: string };

export default async function CompleteProfilePage({
  searchParams,
}: CompleteProfilePageProps) {
  const { token } = await searchParams;

  if (!token) {
    return redirect("/auth/register?toast_error=missing_token");
  }

  const profile = await UserModel.getIncompleteProfileByToken(token);
  if (!profile) {
    return redirect("/auth/register?toast_error=invalid_or_expired_token");
  }

  const plainProfile: PlainIncompleteProfile = {
    ...profile,
    _id: profile._id.toString(),
  };

  return (
    <Suspense>
      <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(225deg,rgb(9, 62, 50), rgb(9, 62, 50), rgb(142, 202, 195), rgb(2, 54, 42), rgb(9, 62, 50), rgb(142, 202, 195), rgb(9, 62, 50), rgb(255, 255, 255), rgb(255, 255, 255) )',
            backgroundSize: '400% 400%',
            animation: 'gradient-flow 90s ease infinite',
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <CompleteProfileForm profile={plainProfile} />
        </div>
      </main>
    </Suspense>
  );
}