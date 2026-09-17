"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { authService, AuthUser, AuthResponse, SendOtpResponse } from '../services/authService';
import { SignOutModal } from '../components/common/SignOutModal/SignOutModal';

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendMobileOtp: (phone: string) => Promise<SendOtpResponse>;
  verifyMobileOtp: (phone: string, otp: string) => Promise<AuthResponse>;
  googleAuth: (token: string, redirectUri?: string) => Promise<AuthResponse>;
  loginWithToken: (token: string) => Promise<AuthUser>;
  showSignOutModal: () => void;
  hideSignOutModal: () => void;
  logout: () => Promise<void>;
  logoutAll: (password?: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const hasCheckedRefreshRef = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      let isLoggedIn = false;

      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (storedToken) {
          setAccessToken(storedToken);
        }
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // Ignore JSON parse error
          }
        }
      }

      // Execute silent token refresh check ONCE per session ONLY if previously logged in
      if (isLoggedIn && !hasCheckedRefreshRef.current) {
        hasCheckedRefreshRef.current = true;
        try {
          const refreshRes = await authService.refreshToken();
          if (refreshRes.accessToken) {
            setAccessToken(refreshRes.accessToken);
            if (refreshRes.user) {
              setUser(refreshRes.user);
            }
          }
        } catch {
          // Silent refresh failed (e.g. cookie expired), retain existing stored session
        }
      }

      setIsLoading(false);
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
      setUser(res.user);
    }
    return res;
  };

  const googleAuth = async (token: string, redirectUri?: string): Promise<AuthResponse> => {
    const res = await authService.googleAuth(token, redirectUri);
    if (res.accessToken) {
      setAccessToken(res.accessToken);
      setUser(res.user);
    }
    return res;
  };

  const loginWithToken = async (token: string): Promise<AuthUser> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('isLoggedIn', 'true');
    }
    setAccessToken(token);
    const fetchedUser = await authService.getMe();
    setUser(fetchedUser);
    return fetchedUser;
  };

  const showSignOutModal = () => setIsSignOutModalOpen(true);
  const hideSignOutModal = () => setIsSignOutModalOpen(false);

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
      }
    }
  };

  const logoutAll = async (password?: string): Promise<void> => {
    await authService.logoutAll(password);
    setAccessToken(null);
    setUser(null);
  };

  const handleConfirmSignOut = async () => {
    await logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const isAuthenticated = Boolean(accessToken && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        sendMobileOtp,
        verifyMobileOtp,
        googleAuth,
        loginWithToken,
        showSignOutModal,
        hideSignOutModal,
        logout,
        logoutAll,
        setUser,
      }}
    >
      {children}
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={hideSignOutModal}
        onConfirm={handleConfirmSignOut}
      />
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
