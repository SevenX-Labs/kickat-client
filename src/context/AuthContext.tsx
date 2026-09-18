"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAccessToken, setOnUnauthenticated } from '../services/api';
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
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Register unauthenticated handler for automatic token refresh failures
    setOnUnauthenticated(() => {
      setUser(null);
      setAccessTokenState(null);
    });

    // App Initialization: Silent Auth Check via HttpOnly cookie
    const initAuth = async () => {
      try {
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
        }
      } catch {
        // If refresh fails (e.g., no active session or cookie expired after 30 days), allow clean public browsing
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
