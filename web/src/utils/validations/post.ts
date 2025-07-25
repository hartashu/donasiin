import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  thumbnailUrl: z.string().url({ message: "Invalid URL format" }),
  imageUrls: z.array(z.string().url()).optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  category: z.string().min(1, "Category is required."),
  isAvailable: z.boolean().default(true),
  aiAnalysis: z.string().optional(),
});

// Skema untuk mengedit post
export const updatePostSchema = postSchema.partial();
