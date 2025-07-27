import { ObjectId } from "mongodb";

export enum RequestStatus {
  PENDING = "PENDING", // Saat permintaan pertama kali dibuat oleh penerima
  ACCEPTED = "ACCEPTED", // Saat donatur menyetujui permintaan
  REJECTED = "REJECTED", // Saat donatur menolak permintaan
  SHIPPED = "SHIPPED", // Saat donatur sudah mengirim barang
  COMPLETED = "COMPLETED", // Saat penerima sudah mengkonfirmasi penerimaan barang
}

export interface IUser {
  _id?: ObjectId; // Unique user identifier.
  avatarUrl: string; // URL for the user's profile picture.
  username: string; // Unique public username.
  fullName: string; // User's full name.
  email: string; // User's primary email address.
  // isEmailVerified: boolean; // Indicates if the user's email has been verified.
  password?: string | null; // Securely hashed password.
  address: string; // User's primary address.
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  dailyLimit: number; // Max daily requests (default: 5).
  createdAt: Date; // Creation timestamp.
  updatedAt: Date; // Last update timestamp.
}

export interface IPost {
  _id: ObjectId; // Unique post identifier. //ObjectId
  title: string; // The title of the post.
  slug: string; // URL-friendly version of the title.
  thumbnailUrl: string; // URL for the post's thumbnail image.
  imageUrls: string[]; // Array of additional image URLs.
  description: string; // Detailed description of the post's content.
  category: string; // A single category used for filtering, searching, and classification.
  isAvailable: boolean; // Availability status of the item.
  userId: ObjectId; // Reference to the author's user ID.
  aiAnalysis?: string; // AI-generated carbon savings analysis.
  carbonKg?: number;
  createdAt?: Date; // Creation timestamp.
  updatedAt?: Date; // Last update timestamp.
  author?: IAuthor;
}

export interface IRequest {
  _id?: ObjectId; // Unique request identifier.
  userId: ObjectId; // ID of the user making the request.
  postId: ObjectId; // ID of the related post.
  status: RequestStatus; // Status of the request from the enum.
  trackingCode: string; // Shipping tracking code, if applicable.
  createdAt: Date; // Creation timestamp.
  updatedAt: Date; // Last update timestamp.
}

export interface IMessage {
  _id?: ObjectId; // Unique message identifier.
  conversationId: string;
  senderId: ObjectId; // ID of the user who sent the message.
  receiverId: ObjectId; // ID of the message recipient.
  text: string; // The text content of the message.
  createdAt: Date; // Creation timestamp.
  // updatedAt: Date; // Last update timestamp.
}

export interface ICarbonFootprint {
  _id: ObjectId; // ID unik dari MongoDB
  itemName: string; // Kata kunci utama (e.g., "cotton t-shirt")
  aliases: string[]; // Nama lain untuk item yang sama (e.g., ["kaos", "t-shirt"])
  carbonKg: number; // Estimasi jejak karbon dalam Kg CO2
  displayMessage: string; // Pesan yang akan ditampilkan ke pengguna
}

export interface IJsonResponse<T> {
  statusCode: number;
  message?: string;
  data?: T;
  error?: string;
}

export interface IConversationInboxItem {
  conversationId: string;
  lastMessageText: string;
  lastMessageAt: Date;
  otherUser: {
    _id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface IPendingRegistration {
  _id: ObjectId;
  email: string;
  password?: string;
  fullName?: string;
  username?: string;
  address?: string;
  token: string;
  expires: Date;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface IPasswordResetToken {
  _id: ObjectId;
  email: string;
  token: string;
  expires: Date;
}

export interface IVerificationToken {
  _id: ObjectId;
  identifier: string;
  token: string;
  expires: Date;
}

export interface IAuthor {
  _id: ObjectId;
  avatarUrl?: string;
  fullName?: string;
  username?: string;
  email?: string;
  address: string;
}
