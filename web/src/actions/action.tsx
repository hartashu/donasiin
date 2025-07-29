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
import { IPost, IRequestWithPostDetails, IUser, RequestStatus } from "@/types/types";

// --- DATA FETCHING ACTIONS ---

export async function getMyProfileData() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized: You must be logged in.");

  const userId = new ObjectId(session.user.id);
  const [userProfile, userPosts, userRequests] = await Promise.all([
    UserModel.getUserById(session.user.id),
    PostModel.findUserPostsWithRequesters(userId),
    RequestModel.findUserRequests(userId)
  ]);

  if (!userProfile) throw new Error("User not found");

  const { password: _, ...safeUserProfile } = userProfile;

  return JSON.parse(JSON.stringify({
    profile: safeUserProfile,
    posts: userPosts,
    requests: userRequests
  }));
}

export const getPosts = async (category?: string, search?: string, page: number = 1, limit: number = 10): Promise<{ posts: IPost[]; totalPages: number }> => {
  const { posts, total } = await PostModel.getAllPosts({ category, search, page, limit });
  return {
    posts: JSON.parse(JSON.stringify(posts)),
    totalPages: Math.ceil(total / limit),
  };
};

// --- MUTATION ACTIONS ---

export async function updateUserProfileAction(formData: FormData): Promise<{ success: boolean; message?: string; error?: string; }> {
  const session = await getSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  try {
    const avatarFile = formData.get('avatarFile') as File | null;
    let avatarUrl = formData.get('avatarUrl') as string;
    if (avatarFile && avatarFile.size > 0) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const result = await uploadFile(buffer);
      avatarUrl = result.secure_url;
    }
    const dataToUpdate = {
      fullName: formData.get('fullName'), username: formData.get('username'),
      address: formData.get('address'), avatarUrl: avatarUrl,
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
    await UserModel.updateUserProfile(new ObjectId(session.user.id), { ...validatedData, location });
    revalidatePath('/profile');
    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function updateRequestStatusAction(id: string, data: { status: RequestStatus, trackingCode?: string }) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const { status, trackingCode } = data;
  await RequestModel.updateRequestStatus(id, status, trackingCode);
  if (status === RequestStatus.SHIPPED && trackingCode) {
    await sendShippingNotificationAction(id, trackingCode);
  }
  revalidatePath('/profile');
  return { success: true, message: `Request status updated to ${status}` };
}

export async function sendShippingNotificationAction(requestId: string, trackingCode: string) {
  const request = await RequestModel.getRequestById(requestId);
  if (!request) return;
  const post = await PostModel.getPostById(request.postId.toString());
  const requester = await UserModel.getUserById(request.userId.toString());
  if (post && requester) {
    await sendShippingNotificationEmail(requester.email, post.title, trackingCode);
    await ChatModel.createMessage(post.userId.toString(), requester._id.toString(), `Great news! Your item "${post.title}" has been shipped. Tracking number: ${trackingCode}`);
  }
}