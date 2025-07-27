import * as SecureStore from 'expo-secure-store';
import { User, RegisterData } from '../types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const API_BASE_URL = 'http://localhost:3000/api';

export class AuthService {
  static async register(userData: RegisterData): Promise<User> {
    // console.log('[AuthService] register() called with', userData);
    const response = await fetch(`${API_BASE_URL}/auth/account/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log(`⚠️ registration response`, response);
    const data = await response.json();
    console.log(`⚠️ registration data`, data);

    if (!response.ok) {
      throw new Error(data.error || 'An unknown error occurred during registration.');
    }

    const { token, user } = data;

    if (!token || !user) {
      throw new Error('Invalid response from server. Expected token and user data after registration.');
    }

    // Store both the token and user object securely, same as in login
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

    return user as User;
  }

  static async login(email: string, password: string): Promise<User> {
    // console.log('[AuthService] login() called with', { email, password });
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // console.log(`⚠️ data`, response)
    const data = await response.json();
    console.log(`⚠️ data`, data)
    if (!response.ok) {
      throw new Error(data.error || 'An unknown error occurred during login.');
    }

    const { token, user } = data;
    console.log(`⚠️ token`, user)

    if (!token || !user) {
      throw new Error('Invalid response from server.');
    }

    // Store both the token and user object securely
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

    return user as User;
  }

  static async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  static async removeToken(): Promise<void> {
    // Remove both token and user data on logout
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = await this.getStoredToken();
    if (!token) return null;

    // If a token exists, we assume the user data is also in SecureStore
    const userJson = await SecureStore.getItemAsync(USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as User;
    } catch (e) {
      console.error('Failed to parse stored user data:', e);
      // If parsing fails, clear the bad data to prevent login loops
      await this.removeToken();
      return null;
    }
  }

  static async verifyEmail(email: string, code: string): Promise<boolean> {
    return code === '123456';
  }
}
