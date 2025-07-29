import { getMyProfileData } from "@/actions/action";
import { ProfileView } from "@/components/profile/ProfileView";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const data = await getMyProfileData().catch(err => {
    console.error("Failed to fetch profile data, redirecting.", err);
    redirect('/auth/login');
  });

  // The 'data' object is now correctly passed to 'ProfileView'
  return <ProfileView initialData={data} />;
}
