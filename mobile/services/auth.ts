import * as SecureStore from 'expo-secure-store';
// import bcrypt from 'bcryptjs';
// import { SignJWT, jwtVerify } from 'jose';
import { User, RegisterData } from '../types';

const TOKEN_KEY = 'auth_token';

// Internal type for mock storage to include password.
// This prevents the password from being leaked to the client.
type MockUser = User & { password?: string };

// Mock user storage (in a real app, this would be a backend API)
const mockUsers: MockUser[] = [
  {
    id: '1',
    username: 'john_doe',
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'password', // Store plain text password for demo
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    address: '123 Main St, City, State',
    dailyRequestLimit: 5,
    usedRequests: 2,
    createdAt: new Date(),
  }
];

export class AuthService {
  // Register a new user with a plain text password
  static async register(userData: RegisterData): Promise<User> {
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email || u.username === userData.username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const newUser: MockUser = {
      id: Date.now().toString(),
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password, // Store plain text password
      dailyRequestLimit: 5,
      usedRequests: 0,
      createdAt: new Date(),
    };

    mockUsers.push(newUser);
    
    // Never return the password to the client
    const { password, ...userToReturn } = newUser;
    return userToReturn;
  }

  // Login with a plain text password
  static async login(email: string, password: string): Promise<User> {
    const user = mockUsers.find(u => u.email === email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }
    
    // Never return the password to the client
    const { password: _, ...userToReturn } = user;
    return userToReturn;
  }

  // "Token" is now just the user's ID
  static async generateToken(user: User): Promise<string> {
    const token = user.id;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return token;
  }

  static async getStoredToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }

  static async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  // Get the current user by reading the ID from storage
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userId = await this.getStoredToken();
      if (!userId) return null;

      const user = mockUsers.find(u => u.id === userId);
      if (!user) return null;

      // Never return the password to the client
      const { password, ...userToReturn } = user;
      return userToReturn;
    } catch {
      return null;
    }
  }
  
  static async verifyEmail(email: string, code: string): Promise<boolean> {
    // Mock email verification - in real app, this would verify with backend
    return code === '123456';
  }
}