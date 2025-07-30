export type User = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  address?: string;
  dailyRequestLimit: number;
  usedRequests: number;
  createdAt: Date;
};

export type DonationPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  ownerId: string;
  owner: User;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  isRequested?: boolean;
};

export type DonationRequest = {
  id: string;
  postId: string;
  post: DonationPost;
  requesterId: string;
  requester: User;
  status: 'pending' | 'accepted' | 'shipped' | 'rejected' | 'completed';
  trackingCode?: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  sender: User;
  content: string;
  createdAt: Date;
  isRead: boolean;
};

export type Chat = {
  id: string;
  participants: User[];
  lastMessage?: ChatMessage;
  updatedAt: Date;
};

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  verifyEmail: (code: string) => Promise<void>;
};

export type RegisterData = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  address: string;
};
