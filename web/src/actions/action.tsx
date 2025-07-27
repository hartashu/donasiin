"use server";

import {
  IUser,
  IPost,
  IPostWithRequests,
  IRequestWithPostDetails,
} from "@/types/types";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// ----------------------------------------------
// PUBLIC GET POSTS
// ----------------------------------------------
export const getPosts = async (
  category?: string,
  search?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ posts: IPost[]; totalPages: number }> => {
  const params = new URLSearchParams();

  if (category) params.append("category", category);
  if (search) params.append("search", search);
  params.append("page", String(page));
  params.append("limit", String(limit));

  const res = await fetch(`${BASE_URL}/api/posts?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const dataJson = await res.json();
  console.log(dataJson);

  return {
    posts: dataJson.data.posts,
    totalPages: dataJson.data.totalPages,
  };
};

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

// ----------------------------------------------
// GET MY POSTS (AUTH REQUIRED)
// ----------------------------------------------
export async function getMyPostsAction(): Promise<IPostWithRequests[]> {
  const cookie = await cookies();

  const res = await fetch(`${BASE_URL}/api/users/me/posts`, {
    method: "GET",
    headers: {
      Cookie: cookie.toString(),
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch my posts");

  const json = await res.json();
  console.log("mypost", json);

  return json.data;
}

// ----------------------------------------------
// GET MY REQUESTS (AUTH REQUIRED)
// ----------------------------------------------
export async function getMyRequestsAction(): Promise<
  IRequestWithPostDetails[]
> {
  const cookie = await cookies();

  const res = await fetch(`${BASE_URL}/api/users/me/requests`, {
    method: "GET",
    headers: {
      Cookie: cookie.toString(),
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch my requests");

  const json = await res.json();
  console.log("myrequest", json);

  return json.data;
}

// ----------------------------------------------
// GET MY USER (AUTH REQUIRED)
// ----------------------------------------------

export async function getMyUser(): Promise<IUser> {
  const cookie = await cookies();

  const res = await fetch(`${BASE_URL}/api/users/me`, {
    method: "GET",
    headers: {
      Cookie: cookie.toString(),
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch user info");

  const json = await res.json();
  console.log("myuser", json);

  return json.data;
}

// ----------------------------------------------
// PATH REQUEST STATUS (AUTH REQUIRED)
// ----------------------------------------------

export async function updateRequestStatus(
  id: string,
  data: { status: string }
) {
  const cookie = await cookies();

  const res = await fetch(`${BASE_URL}/api/requests/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie.toString(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update request status");
  return res.json();
}
