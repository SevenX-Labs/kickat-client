"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthUser, AuthResponse, SendOtpResponse } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendMobileOtp: (phone: string) => Promise<SendOtpResponse>;
  verifyMobileOtp: (phone: string, otp: string) => Promise<AuthResponse>;
  googleAuth: (code: string, redirectUri?: string) => Promise<AuthResponse>;
  loginWithToken: (token: string, providedUser?: AuthUser) => Promise<AuthUser>;
  logout: () => Promise<void>;
  logoutAll: (password?: string) => Promise<void>;
  showSignOutModal: () => void;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initial hydration from localStorage and silent refresh check
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('accessToken');
          const storedUser = localStorage.getItem('user');

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

        // Silent token refresh check using HttpOnly cookie
        const refreshRes = await authService.refreshToken();
        if (refreshRes.accessToken) {
          setAccessToken(refreshRes.accessToken);
          if (refreshRes.user) {
            setUser(refreshRes.user);
          }
        }
      } catch {
        // If refresh fails or user has no valid session, clear state
        if (typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
          setUser(null);
          setAccessToken(null);
        }
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
      setUser(res.user);
    }
    return res;
  };

  const googleAuth = async (code: string, redirectUri?: string): Promise<AuthResponse> => {
    const res = await authService.googleAuth(code, redirectUri);
    if (res.accessToken) {
      setAccessToken(res.accessToken);
      setUser(res.user);
    }
    return res;
  };

  const loginWithToken = async (token: string, providedUser?: AuthUser): Promise<AuthUser> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('isLoggedIn', 'true');
    }
    setAccessToken(token);

    if (providedUser) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(providedUser));
      }
      setUser(providedUser);
      return providedUser;
    }

    try {
      const fetchedUser = await authService.getMe();
      setUser(fetchedUser);
      return fetchedUser;
    } catch (err) {
      // If profile fetch fails, fallback to bare user object
      const fallbackUser: AuthUser = { id: 'user' };
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setAccessToken(null);
    setUser(null);
  };

  const logoutAll = async (password?: string): Promise<void> => {
    await authService.logoutAll(password);
    setAccessToken(null);
    setUser(null);
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
        logout,
        logoutAll,
        showSignOutModal: logout,
        setUser,
      }}
    >
      {children}
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
