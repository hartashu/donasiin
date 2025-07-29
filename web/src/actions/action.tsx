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
import { RequestStatus, IPost } from "@/types/types";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
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
  } catch (err: any) {
    return { success: false, error: err.message };
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

// --- DATA FETCHING ACTIONS ---

export async function getMyProfileData() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized: You must be logged in.");

  const userId = new ObjectId(session.user.id);
  const [userProfile, userPosts, userRequests] = await Promise.all([
    UserModel.getUserById(userId.toString()),
    PostModel.findUserPostsWithRequesters(userId),
    RequestModel.findUserRequests(userId.toString()),
  ]);

  if (!userProfile) throw new Error("User not found");

  const { password: _, ...safeUserProfile } = userProfile;

  return JSON.parse(JSON.stringify({
    profile: safeUserProfile,
    posts: userPosts,
    requests: userRequests,
  }));
}

export const getPosts = async (
  category?: string,
  search?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ posts: IPost[]; totalPages: number }> => {
  const { posts, total } = await PostModel.getAllPosts({ category, search, page, limit });
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
    await UserModel.updateUserProfile(
      new ObjectId(session.user.id),
      { ...validatedData, location }
    );

    revalidatePath("/profile");
    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function updateRequestStatusAction(
  id: string,
  data: { status: RequestStatus; trackingCode?: string }
) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { status, trackingCode } = data;
  await RequestModel.updateRequestStatus(id, status, trackingCode);

  if (status === RequestStatus.SHIPPED && trackingCode) {
    await sendShippingNotificationAction(id, trackingCode);
  }

  revalidatePath("/profile");
  return { success: true, message: `Request status updated to ${status}` };
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


// "use server";

// import {
//   IUser,
//   IPost,
//   IPostWithRequests,
//   IRequestWithPostDetails,
// } from "@/types/types";
// import { cookies } from "next/headers";

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// // ----------------------------------------------
// // PUBLIC GET POSTS
// // ----------------------------------------------
// export const getPosts = async (
//   category?: string,
//   search?: string,
//   page: number = 1,
//   limit: number = 10
// ): Promise<{ posts: IPost[]; totalPages: number }> => {
//   const params = new URLSearchParams();

//   if (category) params.append("category", category);
//   if (search) params.append("search", search);
//   params.append("page", String(page));
//   params.append("limit", String(limit));

//   const res = await fetch(`${BASE_URL}/api/posts?${params.toString()}`, {
//     method: "GET",
//     cache: "no-store",
//   });

//   const dataJson = await res.json();
//   console.log(dataJson);

//   return {
//     posts: dataJson.data.posts,
//     totalPages: dataJson.data.totalPages,
//   };
// };

// // ----------------------------------------------
// // CREATE POST (AUTH REQUIRED)
// // ----------------------------------------------
// type CreatePostParams = {
//   title: string;
//   thumbnailUrl: string;
//   description: string;
//   category: string;
//   imageUrls: string[];
//   isAvailable: boolean;
// };

// export async function createPostAction(data: CreatePostParams) {
//   const cookie = await cookies();

//   const res = await fetch(`${BASE_URL}/api/posts`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Cookie: cookie.toString(),
//     },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) throw new Error("Failed to create post");

//   return await res.json();
// }

// // ----------------------------------------------
// // DELETE POST (AUTH REQUIRED)
// // ----------------------------------------------
// export async function deletePostAction(
//   slug: string
// ): Promise<{ success: boolean; error?: string }> {
//   try {
//     const cookie = await cookies();

//     const res = await fetch(`${BASE_URL}/api/posts/${slug}`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//         Cookie: cookie.toString(),
//       },
//       cache: "no-store",
//     });

//     const result = await res.json();

//     if (!res.ok) {
//       return {
//         success: false,
//         error: result?.error || "Failed to delete post",
//       };
//     }

//     return { success: true };
//   } catch (err: any) {
//     return { success: false, error: err.message };
//   }
// }

// // ----------------------------------------------
// // UPLOAD IMAGE (AUTH REQUIRED)
// // ----------------------------------------------
// export async function uploadImageAction(formData: FormData): Promise<string[]> {
//   const cookie = await cookies();

//   const res = await fetch(`${BASE_URL}/api/upload`, {
//     method: "POST",
//     body: formData,
//     headers: {
//       Cookie: cookie.toString(),
//     },
//   });

//   const result = await res.json();
//   return result?.data?.itemUrls || [];
// }

// // ----------------------------------------------
// // GET MY POSTS (AUTH REQUIRED)
// // ----------------------------------------------
// export async function getMyPostsAction(): Promise<IPostWithRequests[]> {
//   const cookie = await cookies();

//   const res = await fetch(`${BASE_URL}/api/users/me/posts`, {
//     method: "GET",
//     headers: {
//       Cookie: cookie.toString(),
//     },
//     cache: "no-store",
//   });

//   if (!res.ok) throw new Error("Failed to fetch my posts");

//   const json = await res.json();

//   return json.data;
// }

// // ----------------------------------------------
// // GET MY REQUESTS (AUTH REQUIRED)
// // ----------------------------------------------
// export async function getMyRequestsAction(): Promise<
//   IRequestWithPostDetails[]
// > {
//   const cookie = await cookies();

//   const res = await fetch(`${BASE_URL}/api/users/me/requests`, {
//     method: "GET",
//     headers: {
//       Cookie: cookie.toString(),
//     },
//     cache: "no-store",
//   });

//   if (!res.ok) throw new Error("Failed to fetch my requests");

//   const json = await res.json();
//   return json.data;
// }

// // ----------------------------------------------
// // GET MY USER (AUTH REQUIRED)
// // ----------------------------------------------

// export async function getMyUser(): Promise<IUser> {
//   const cookie = await cookies();

//   const res = await fetch(`${BASE_URL}/api/users/me`, {
//     method: "GET",
//     headers: {
//       Cookie: cookie.toString(),
//     },
//     cache: "no-store",
//   });

//   if (!res.ok) throw new Error("Failed to fetch user info");

//   const json = await res.json();
//   return json.data;
// }

// // ----------------------------------------------
// // PATH REQUEST STATUS (AUTH REQUIRED)
// // ----------------------------------------------

// export async function updateRequestStatus(
//   id: string,
//   data: { status: string }
// ) {
//   const cookie = await cookies();

//   const res = await fetch(`${BASE_URL}/api/requests/${id}`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//       Cookie: cookie.toString(),
//     },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) throw new Error("Failed to update request status");
//   return res.json();
// }