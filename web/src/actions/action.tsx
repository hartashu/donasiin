// actions/action.ts
import { IPost } from "@/types/types";

export const getPosts = async (
  category?: string,
  search?: string,
  page: number = 1,
  limit: number = 10
): Promise<IPost[]> => {
  const params = new URLSearchParams();

  if (category) params.append("category", category);
  if (search) params.append("search", search);
  params.append("page", String(page));
  params.append("limit", String(limit));

  const res = await fetch(
    `http://localhost:3000/api/posts?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const dataJson = await res.json();
  return dataJson.data.posts;
};

// ----------------------------------------------------------------------------------------
// CREATE POST
type CreatePostParams = {
  title: string;
  thumbnailUrl: string;
  description: string;
  category: string;
  imageUrls: string[];
  isAvailable: boolean;
};

export async function uploadImageAction(formData: FormData): Promise<string[]> {
  const res = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    body: formData,
  });

  const result = await res.json();
  return result?.data?.itemUrls || [];
}

export async function createPostAction(data: CreatePostParams) {
  const res = await fetch("http://localhost:3000/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create post");

  return await res.json();
}

// Delete
export async function deletePostAction(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`http://localhost:3000/api/posts/${slug}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
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
