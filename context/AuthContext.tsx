'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserRecord,
  StrictRole,
  NotificationItem,
  roleToRouteRole,
  RouteRole,
} from '@/types/auth';
import { authService, RegisterParams } from '@/lib/auth/authService';
import { DEMO_NOTIFICATIONS } from '@/lib/demoData';

interface AuthContextType {
  currentUser: UserRecord | null;
  currentRole: StrictRole | null;
  routeRole: RouteRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, selectedRole: StrictRole) => Promise<UserRecord>;
  loginWithGoogle: (selectedRole: StrictRole) => Promise<UserRecord>;
  register: (params: RegisterParams) => Promise<UserRecord>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateProfile: (updates: Partial<UserRecord>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);

  // Initialize and listen to real persistent Firebase auth
  useEffect(() => {
    const unsubscribe = authService.subscribeToAuth((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string, selectedRole: StrictRole): Promise<UserRecord> => {
      setIsLoading(true);
      try {
        const result = await authService.login(email, password, selectedRole);
        setCurrentUser(result.user);
        setIsLoading(false);
        return result.user;
      } catch (err) {
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (selectedRole: StrictRole): Promise<UserRecord> => {
      setIsLoading(true);
      try {
        const result = await authService.loginWithGoogle(selectedRole);
        setCurrentUser(result.user);
        setIsLoading(false);
        return result.user;
      } catch (err) {
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const register = useCallback(async (params: RegisterParams): Promise<UserRecord> => {
    setIsLoading(true);
    try {
      const result = await authService.register(params);
      setCurrentUser(result.user);
      setIsLoading(false);
      return result.user;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await authService.logout();
    setCurrentUser(null);
    setIsLoading(false);
    router.replace('/login');
  }, [router]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const updateProfile = useCallback((updates: Partial<UserRecord>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentRole = currentUser?.role || null;
  const routeRole = currentRole ? roleToRouteRole(currentRole) : 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        routeRole,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        loginWithGoogle,
        register,
        resetPassword,
        logout,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
