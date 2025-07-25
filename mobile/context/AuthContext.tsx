import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '../services/auth';
import { User, RegisterData, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // The login service now handles storing the token and user data securely
      const user = await AuthService.login(email, password);
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      await AuthService.register(userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.removeToken();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const verifyEmail = async (code: string) => {
    if (!user) throw new Error('No user to verify');
    const isValid = await AuthService.verifyEmail(user.email, code);
    if (!isValid) {
      throw new Error('Invalid verification code');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
