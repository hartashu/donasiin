// File: src/utils/validations/user.ts
import { z } from "zod";

export const updateProfileSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters long"),
    username: z.string().min(3, "Username must be at least 3 characters long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
    address: z.string().min(10, "Address must be at least 10 characters long"),
    avatarUrl: z.string().url().optional().or(z.literal('')),
});