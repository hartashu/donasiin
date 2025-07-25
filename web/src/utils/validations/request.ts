import { z } from "zod";
import { RequestStatus } from "@/types/types";

export const createRequestSchema = z.object({
  postId: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: "Invalid Post ID format",
  }),
});

// Skema untuk mengupdate status oleh donatur
export const updateRequestStatusSchema = z.object({
  status: z.enum([
    RequestStatus.ACCEPTED,
    RequestStatus.REJECTED,
    RequestStatus.SHIPPED,
  ]),
  trackingCode: z.string().optional(),
});
