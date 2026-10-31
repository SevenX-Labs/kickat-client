"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';
import { getAccessToken, setAccessToken, setOnUnauthenticated } from '../services/api';
import { authService, AuthUser, AuthResponse, SendOtpResponse } from '../services/authService';
import { SignOutModal } from '@/components/common/SignOutModal/SignOutModal';
import modalStyles from '@/components/common/SignOutModal/SignOutModal.module.css';

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendMobileOtp: (phone: string) => Promise<SendOtpResponse>;
  verifyMobileOtp: (phone: string, otp: string) => Promise<AuthResponse>;
  sendEmailOtp: (email: string) => Promise<SendOtpResponse>;
  verifyEmailOtp: (email: string, otp: string) => Promise<AuthResponse>;
  googleAuth: (code: string, redirectUri?: string) => Promise<AuthResponse>;
  loginWithToken: (token: string, providedUser?: AuthUser) => Promise<AuthUser>;
  logout: () => Promise<void>;
  logoutAll: (password?: string) => Promise<void>;
  showSignOutModal: () => void;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const [logoutToast, setLogoutToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Register unauthenticated handler for automatic token refresh failures
    setOnUnauthenticated(() => {
      setUser(null);
      setAccessTokenState(null);
    });

    // App Initialization: Token restoration & Silent Auth Check
    const initAuth = async () => {
      try {
        const storedToken = getAccessToken();
        if (storedToken) {
          setAccessTokenState(storedToken);
          try {
            const fetchedUser = await authService.getMe();
            setUser(fetchedUser);
            setIsLoading(false);
            return;
          } catch (err) {
            console.warn('[AuthContext] Stored token verification failed, attempting refresh...', err);
            setAccessToken(null);
            setAccessTokenState(null);
          }
        }

        const refreshRes = await authService.refreshToken();
        if (refreshRes.accessToken) {
          setAccessToken(refreshRes.accessToken);
          setAccessTokenState(refreshRes.accessToken);
          if (refreshRes.user) {
            setUser(refreshRes.user);
          } else {
            try {
              const fetchedUser = await authService.getMe();
              setUser(fetchedUser);
            } catch {
              // Ignore if profile fetch fails on init
            }
          }
        } else {
          console.warn('[AuthContext] Refresh succeeded but no accessToken returned');
        }
      } catch {
        // If refresh fails (e.g., no active session or cookie expired), allow clean public browsing
        setAccessToken(null);
        setAccessTokenState(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const sendMobileOtp = async (phone: string): Promise<SendOtpResponse> => {
    return authService.sendMobileOtp(phone);
  };

  const verifyMobileOtp = async (phone: string, otp: string): Promise<AuthResponse> => {
    const res = await authService.verifyMobileOtp(phone, otp);
    if (res.accessToken) {
      setAccessToken(res.accessToken);
      setAccessTokenState(res.accessToken);
      setUser(res.user);
    }
    return res;
  };

  const sendEmailOtp = async (email: string): Promise<SendOtpResponse> => {
    return authService.sendEmailOtp(email);
  };

  const verifyEmailOtp = async (email: string, otp: string): Promise<AuthResponse> => {
    const res = await authService.verifyEmailOtp(email, otp);
    if (res.accessToken) {
      setAccessToken(res.accessToken);
      setAccessTokenState(res.accessToken);
      setUser(res.user);
    }
    return res;
  };

  const googleAuth = async (code: string, redirectUri?: string): Promise<AuthResponse> => {
    const res = await authService.googleAuth(code, redirectUri);
    if (res.accessToken) {
      setAccessToken(res.accessToken);
      setAccessTokenState(res.accessToken);
      setUser(res.user);
    }
    return res;
  };

  const loginWithToken = async (token: string, providedUser?: AuthUser): Promise<AuthUser> => {
    setAccessToken(token);
    setAccessTokenState(token);

    if (providedUser) {
      setUser(providedUser);
      return providedUser;
    }

    try {
      const fetchedUser = await authService.getMe();
      setUser(fetchedUser);
      return fetchedUser;
    } catch {
      const fallbackUser: AuthUser = { id: 'user' };
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
  };

  const logoutAll = async (password?: string): Promise<void> => {
    await authService.logoutAll(password);
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
  };

  const showSignOutModal = () => {
    setIsSignOutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      setLogoutToast('Logged out successfully');
      setTimeout(() => {
        setLogoutToast(null);
      }, 3500);

      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.startsWith('/account') || path.startsWith('/orders')) {
          router.push('/');
        } else {
          router.refresh();
        }
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAuthenticated = Boolean(accessTokenState && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: accessTokenState,
        isAuthenticated,
        isLoading,
        sendMobileOtp,
        verifyMobileOtp,
        sendEmailOtp,
        verifyEmailOtp,
        googleAuth,
        loginWithToken,
        logout,
        logoutAll,
        showSignOutModal,
        setUser,
      }}
    >
      {children}

      {/* Global Confirmation Dialog for Logout */}
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* Global Logout Success Notification Toast */}
      {logoutToast && mounted && createPortal(
        <div className={modalStyles.logoutToast} role="status" aria-live="polite">
          <CheckCircle2 size={19} strokeWidth={2.4} />
          <span>{logoutToast}</span>
        </div>,
        document.body
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
