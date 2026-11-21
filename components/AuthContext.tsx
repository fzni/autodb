'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AuthUser {
  id: string;
  handle: string;
  secret_key?: string;
  role?: 'admin' | 'contributor';
  email?: string;
  email_verified?: number;
  key_fingerprint?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  authModalMessage: string | null;
  openAuthModal: (tab?: 'login' | 'register', message?: string) => void;
  closeAuthModal: () => void;
  // Aliases for admin modal calls
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  loginWithSecretKey: (secretKey: string) => Promise<{ ok: boolean; error?: string }>;
  registerWithHandle: (handle: string, email?: string) => Promise<{ ok: boolean; error?: string; secretKey?: string }>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  isAuthModalOpen: false,
  authModalTab: 'login',
  authModalMessage: null,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isAdminModalOpen: false,
  openAdminModal: () => {},
  closeAdminModal: () => {},
  loginWithSecretKey: async () => ({ ok: false }),
  registerWithHandle: async () => ({ ok: false }),
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalMessage, setAuthModalMessage] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setIsAdmin(data.isAdmin || data.user.role === 'admin' || data.user.handle.toLowerCase() === '@admin');
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    } catch (e) {
      console.error('Failed to verify session', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login', message?: string) => {
    setAuthModalTab(tab);
    setAuthModalMessage(message || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalMessage(null);
  };

  const loginWithSecretKey = async (secretKey: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Invalid Secret Key.' };
      }

      setUser(data.user);
      setIsAdmin(data.isAdmin || data.user.role === 'admin' || data.user.handle.toLowerCase() === '@admin');
      setIsAuthModalOpen(false);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Connection error during login' };
    }
  };

  const registerWithHandle = async (handle: string, email?: string): Promise<{ ok: boolean; error?: string; secretKey?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Failed to register account' };
      }

      setUser(data.user);
      setIsAdmin(false);
      return { ok: true, secretKey: data.secretKey };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Connection error during registration' };
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsAdmin(false);
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        isAuthModalOpen,
        authModalTab,
        authModalMessage,
        openAuthModal,
        closeAuthModal,
        isAdminModalOpen: isAuthModalOpen,
        openAdminModal: () => openAuthModal('login'),
        closeAdminModal: closeAuthModal,
        loginWithSecretKey,
        registerWithHandle,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
