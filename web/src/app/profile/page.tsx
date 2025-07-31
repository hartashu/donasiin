import { getMyProfileData } from "@/actions/action";
import { ProfileView } from "@/components/profile/ProfileView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const data = await getMyProfileData().catch((err) => {
    console.error("Failed to fetch profile data, redirecting.", err);
    redirect("/auth/login");
  });

  return <ProfileView initialData={data} />;
}