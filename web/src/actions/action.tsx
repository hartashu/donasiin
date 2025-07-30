"use server";

import { getSession } from "@/utils/getSession";
import { UserModel } from "@/models/user.model";
import { PostModel } from "@/models/post";
import { RequestModel } from "@/models/request.model";
import { ChatModel } from "@/models/chat.model";
import { updateProfileSchema } from "@/utils/validations/user";
import { getCoordinates } from "@/utils/geocoding/geocodingService";
import { uploadFile } from "@/utils/cloudinary/cloudinaryService";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { sendShippingNotificationEmail } from "@/lib/utils/email";
import { cookies } from "next/headers";

import {
  IRequestWithPostDetails,
  RequestStatus,
  Achievement,
  IPost, // 🔥 FIX: Menambahkan import IPost
} from "@/types/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// ==profile
// 🔥 FIX: Menghapus semua import lucide-react yang tidak digunakan

// 🔥 FIX: Tipe dikoreksi dengan menambahkan tanda kurung (...)[]
const allAchievements: (Omit<Achievement, "unlocked" | "icon"> & {
  icon: string;
})[] = [
    {
      id: "FIRST_DONATION",
      icon: "PackagePlus",
      title: "First Step",
      description: "Make your first donation.",
    },
    {
      id: "FIVE_DONATIONS",
      icon: "Award",
      title: "Generous Giver",
      description: "Donate 5 items.",
    },
    {
      id: "TEN_DONATIONS",
      icon: "Crown",
      title: "Donation Champion",
      description: "Donate 10 items.",
    },
    {
      id: "FIRST_REQUEST",
      icon: "GitMerge",
      title: "Active Requester",
      description: "Make your first request.",
    },
    {
      id: "FIVE_REQUESTS",
      icon: "Users",
      title: "Community Pillar",
      description: "Make 5 requests.",
    },
    {
      id: "HIGH_DEMAND",
      icon: "Zap",
      title: "In High Demand",
      description: "Receive 10 requests on your items.",
    },
    {
      id: "GOOD_SAMARITAN",
      icon: "HeartHandshake",
      title: "Good Samaritan",
      description: "Have 5 of your donations completed.",
    },
    {
      id: "FAST_STARTER",
      icon: "Rocket",
      title: "Fast Starter",
      description: "Make a donation within 24 hours of joining.",
    },
    {
      id: "NIGHT_OWL",
      icon: "Moon",
      title: "Night Owl",
      description: "Post a donation between 10 PM and 6 AM.",
    },
    {
      id: "EARLY_BIRD",
      icon: "Sun",
      title: "Early Bird",
      description: "Post a donation between 6 AM and 9 AM.",
    },
    {
      id: "CONSISTENT",
      icon: "CalendarCheck",
      title: "Consistent Contributor",
      description: "Donate at least once a week for a month.",
    },
    {
      id: "BOOKWORM",
      icon: "Feather",
      title: "Bookworm",
      description: "Donate a book.",
    },
    {
      id: "FASHIONISTA",
      icon: "Star",
      title: "Fashionista",
      description: "Donate a fashion item.",
    },
    {
      id: "TECH_SAVVY",
      icon: "Coffee",
      title: "Tech Savvy",
      description: "Donate an electronic item.",
    },
    {
      id: "TRUSTED_MEMBER",
      icon: "ShieldCheck",
      title: "Trusted Member",
      description: "Be an active member of the community.",
    },
  ];

// 🔥 Tipe Activity baru yang lebih deskriptif
export interface Activity {
  type:
  | "I_CREATED_A_POST"
  | "SOMEONE_REQUESTED_MY_ITEM"
  | "I_UPDATED_A_REQUEST"
  | "I_MADE_A_REQUEST"
  | "MY_REQUEST_WAS_UPDATED";
  title: string;
  otherUserName?: string;
  date: string;
  status?: RequestStatus;
}

export async function getMyProfileData() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = new ObjectId(session.user.id);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [userProfile, userPosts, userRequests] = await Promise.all([
    UserModel.getUserById(session.user.id),
    PostModel.findUserPostsWithRequesters(userId),
    RequestModel.findUserRequests(userId.toString()),
  ]);

  if (!userProfile) throw new Error("User not found");

  const dailyRequestsMade = userRequests.filter(
    (req) => new Date(req.createdAt) >= todayStart
  ).length;

  // 🔥 FIX: Menggunakan 'as unknown as' untuk type casting yang lebih aman
  const totalIncomingRequests = userPosts.reduce(
    (sum, post) => (post.requests as unknown as IRequestWithPostDetails[]).length + sum,
    0
  );
  const completedDonations = userPosts.filter((p) => !p.isAvailable).length;

  const stats = {
    totalPosts: userPosts.length,
    totalIncomingRequests,
    totalOutgoingRequests: userRequests.length,
    // 🔥 FIX: Menambahkan cast ke IPost untuk mengakses carbonKg
    totalCarbonSavings: userPosts
      .filter((p) => !p.isAvailable)
      .reduce((sum, p) => sum + ((p as IPost).carbonKg || 0), 0),
    completedDonations,
    dailyRequestsMade,
  };

  const unlockedAchievements = allAchievements.map((ach) => {
    let unlocked = false;
    const userJoinedDate = new Date(userProfile.createdAt);
    switch (ach.id) {
      case "FIRST_DONATION":
        unlocked = stats.totalPosts > 0;
        break;
      case "FIVE_DONATIONS":
        unlocked = stats.totalPosts >= 5;
        break;
      case "TEN_DONATIONS":
        unlocked = stats.totalPosts >= 10;
        break;
      case "FIRST_REQUEST":
        unlocked = stats.totalOutgoingRequests > 0;
        break;
      case "FIVE_REQUESTS":
        unlocked = stats.totalOutgoingRequests >= 5;
        break;
      case "HIGH_DEMAND":
        unlocked = stats.totalIncomingRequests >= 10;
        break;
      case "GOOD_SAMARITAN":
        unlocked = stats.completedDonations >= 5;
        break;
      case "FAST_STARTER":
        const firstPostDate =
          userPosts.length > 0
            ? new Date(userPosts[userPosts.length - 1].createdAt)
            : null;
        if (firstPostDate) {
          unlocked =
            firstPostDate.getTime() - userJoinedDate.getTime() <
            24 * 60 * 60 * 1000;
        }
        break;
      case "NIGHT_OWL":
        unlocked = userPosts.some((p) => {
          const hour = new Date(p.createdAt).getHours();
          return hour >= 22 || hour < 6;
        });
        break;
      case "EARLY_BIRD":
        unlocked = userPosts.some((p) => {
          const hour = new Date(p.createdAt).getHours();
          return hour >= 6 && hour < 9;
        });
        break;
      case "BOOKWORM":
        unlocked = userPosts.some((p) => p.category.toLowerCase() === "books");
        break;
      case "FASHIONISTA":
        unlocked = userPosts.some(
          (p) => p.category.toLowerCase() === "fashion"
        );
        break;
      case "TECH_SAVVY":
        unlocked = userPosts.some(
          (p) => p.category.toLowerCase() === "electronics"
        );
        break;
      case "TRUSTED_MEMBER":
        unlocked = true;
        break;
    }
    return { ...ach, unlocked };
  });

  // 🔥 FIX: Tipe 'Activity' sekarang merujuk ke interface lokal
  const activityFeed: Activity[] = [];

  // 1. Aktivitas terkait donasi SAYA (userPosts)
  userPosts.forEach((post) => {
    activityFeed.push({
      type: "I_CREATED_A_POST",
      title: post.title,
      // 🔥 FIX: Mengonversi Date menjadi string
      date: new Date(post.createdAt).toISOString(),
    });
    // 🔥 FIX: Menggunakan 'as unknown as' untuk type casting
    (post.requests as unknown as IRequestWithPostDetails[]).forEach((req) => {
      activityFeed.push({
        type: "SOMEONE_REQUESTED_MY_ITEM",
        title: post.title,
        // 🔥 FIX: Menggunakan non-null assertion (!) karena requester diharapkan ada
        otherUserName: req.requester!.fullName,
        // 🔥 FIX: Mengonversi Date menjadi string
        date: new Date(req.createdAt).toISOString(),
      });
      if (req.status !== RequestStatus.PENDING) {
        activityFeed.push({
          type: "I_UPDATED_A_REQUEST",
          title: post.title,
          // 🔥 FIX: Menggunakan non-null assertion (!)
          otherUserName: req.requester!.fullName,
          status: req.status,
          // 🔥 FIX: Mengonversi Date menjadi string
          date: new Date(req.updatedAt || req.createdAt).toISOString(),
        });
      }
    });
  });

  // 2. Aktivitas terkait request SAYA (userRequests)
  userRequests.forEach((req) => {
    if (req.postDetails) {
      activityFeed.push({
        type: "I_MADE_A_REQUEST",
        title: req.postDetails.title,
        // 🔥 FIX: Menggunakan non-null assertion (!) karena author diharapkan ada di dalam if block
        otherUserName: req.postDetails.author!.fullName,
        // 🔥 FIX: Mengonversi Date menjadi string
        date: new Date(req.createdAt).toISOString(),
      });
      if (req.status !== RequestStatus.PENDING) {
        activityFeed.push({
          type: "MY_REQUEST_WAS_UPDATED",
          title: req.postDetails.title,
          // 🔥 FIX: Menggunakan non-null assertion (!)
          otherUserName: req.postDetails.author!.fullName,
          status: req.status,
          // 🔥 FIX: Mengonversi Date menjadi string
          date: new Date(req.updatedAt || req.createdAt).toISOString(),
        });
      }
    }
  });

  const uniqueActivities = Array.from(
    new Map(activityFeed.map((act) => [JSON.stringify(act), act])).values()
  );
  uniqueActivities.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 🔥 FIX: Menggunakan '_' untuk variabel yang tidak terpakai
  const { password: _, ...safeUserProfile } = userProfile;
  return JSON.parse(
    JSON.stringify({
      profile: safeUserProfile,
      posts: userPosts,
      requests: userRequests,
      stats,
      achievements: unlockedAchievements,
      activityFeed: uniqueActivities,
    })
  );
}

// 🔥 ACTION BARU UNTUK UPLOAD GAMBAR RESI (MODE IMAGE+MANUAL)
export async function uploadReceiptImageAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const receiptFile = formData.get("receiptImage") as File | null;
    if (!receiptFile || receiptFile.size === 0) {
      return { success: false, error: "No image file provided." };
    }

    const buffer = Buffer.from(await receiptFile.arrayBuffer());
    const result = await uploadFile(buffer);

    return { success: true, url: result.secure_url };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred during upload.",
    };
  }
}

// ----------------------------------------------
// CREATE POST (AUTH REQUIRED)
// ----------------------------------------------
type CreatePostParams = {
  title: string;
  thumbnailUrl: string;
  description: string;
  category: string;
  imageUrls: string[];
  isAvailable: boolean;
};

export async function createPostAction(data: CreatePostParams) {
  const cookie = await cookies();

  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie.toString(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create post");

  return await res.json();
}

// ----------------------------------------------
// DELETE POST (AUTH REQUIRED)
// ----------------------------------------------
export async function deletePostAction(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookie = await cookies();

    const res = await fetch(`${BASE_URL}/api/posts/${slug}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie.toString(),
      },
      cache: "no-store",
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: result?.error || "Failed to delete post",
      };
    }

    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "An unknown error occurred" };
  }
}

// ----------------------------------------------
// UPLOAD IMAGE (AUTH REQUIRED)
// ----------------------------------------------
export async function uploadImageAction(formData: FormData): Promise<string[]> {
  const cookie = await cookies();

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Cookie: cookie.toString(),
    },
  });

  const result = await res.json();
  return result?.data?.itemUrls || [];
}

// (Kode yang dikomentari dipertahankan seperti aslinya)

export const getPosts = async (
  category?: string,
  search?: string,
  page: number = 1,
  limit: number = 10
  // 🔥 FIX: IPost sekarang dikenali karena sudah diimpor
): Promise<{ posts: IPost[]; totalPages: number }> => {
  const { posts, total } = await PostModel.getAllPosts({
    category,
    search,
    page,
    limit,
  });
  return {
    posts: JSON.parse(JSON.stringify(posts)),
    totalPages: Math.ceil(total / limit),
  };
};

// --- MUTATION ACTIONS ---

export async function updateUserProfileAction(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const avatarFile = formData.get("avatarFile") as File | null;
    let avatarUrl = formData.get("avatarUrl") as string;

    if (avatarFile && avatarFile.size > 0) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const result = await uploadFile(buffer);
      avatarUrl = result.secure_url;
    }

    const dataToUpdate = {
      fullName: formData.get("fullName"),
      username: formData.get("username"),
      address: formData.get("address"),
      avatarUrl: avatarUrl,
    };

    const validatedData = updateProfileSchema.parse(dataToUpdate);
    const { username, address } = validatedData;

    const existingUser = await UserModel.getUserByUsername(username);
    if (existingUser && existingUser._id.toString() !== session.user.id) {
      return { success: false, error: "Username is already taken." };
    }

    const coordinates = await getCoordinates(address);
    if (!coordinates) throw new Error("Could not verify the provided address.");

    const location = { type: "Point" as const, coordinates };
    await UserModel.updateUserProfile(new ObjectId(session.user.id), {
      ...validatedData,
      location,
    });

    revalidatePath("/profile");
    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function updateRequestStatusAction(
  id: string,
  data: {
    status: RequestStatus;
    trackingCode?: string;
    trackingCodeUrl?: string;
  }
) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { status, trackingCode, trackingCodeUrl } = data;
  await RequestModel.updateRequestStatus(id, status, {
    code: trackingCode,
    url: trackingCodeUrl,
  });

  // logic notifikasi email tetap jalan
  if (status === RequestStatus.SHIPPED && trackingCode) {
    await sendShippingNotificationAction(id, trackingCode);
  }

  revalidatePath("/profile");
  return { success: true, message: `Request status updated to ${status}` };
}

// 🔥 ACTION BARU UNTUK HAPUS REQUEST
export async function deleteRequestAction(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const result = await RequestModel.deleteRequest(requestId, session.user.id);

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Request not found or cannot be deleted.",
      };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "An unknown error occurred" };
  }
}

export async function sendShippingNotificationAction(
  requestId: string,
  trackingCode: string
) {
  const request = await RequestModel.getRequestById(requestId);
  if (!request) return;

  const post = await PostModel.getPostById(request.postId.toString());
  const requester = await UserModel.getUserById(request.userId.toString());

  if (post && requester) {
    await sendShippingNotificationEmail(
      requester.email,
      post.title,
      trackingCode
    );

    await ChatModel.createMessage(
      post.userId.toString(),
      requester._id.toString(),
      `Great news! Your item "${post.title}" has been shipped. Tracking number: ${trackingCode}`
    );
  }
}