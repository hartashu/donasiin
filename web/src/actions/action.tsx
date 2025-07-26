// actions/action.ts
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
