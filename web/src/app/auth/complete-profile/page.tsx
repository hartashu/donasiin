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
    return redirect("/auth/register?error=missing_token");
  }

  const profile = await UserModel.getIncompleteProfileByToken(token);
  if (!profile) {
    return redirect("/auth/register?error=invalid_or_expired_token");
  }

  const plainProfile: PlainIncompleteProfile = {
    ...profile,
    _id: profile._id.toString(),
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <CompleteProfileForm profile={plainProfile} />
    </div>
  );
}
