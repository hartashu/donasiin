"use server";
import { IPost } from "@/types/types";

export const getPosts = async (): Promise<IPost[]> => {
  const res = await fetch("http://localhost:3000/api/posts", {
    method: "GET",
    cache: "no-store",
  });
  const dataJson = await res.json();
  console.log(dataJson);

  return dataJson.data.posts;
};
