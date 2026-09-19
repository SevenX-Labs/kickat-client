import { api, setAccessToken } from './api';
import { CONFIG } from '../constants/config';

export interface AuthUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  profileCompleted?: boolean;
  isProfileComplete?: boolean;
  isNewUser?: boolean;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  isNewUser?: boolean;
  user: AuthUser;
  message?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  user?: AuthUser;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

let activeRefreshPromise: Promise<RefreshTokenResponse> | null = null;

export const authService = {
  /**
   * Request 6-digit Mobile OTP via SMS (POST /auth/otp/send)
   */
  async sendMobileOtp(phone: string): Promise<SendOtpResponse> {
    const sanitizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;
    return api<SendOtpResponse>('/auth/otp/send', {
      method: 'POST',
      data: { phone: sanitizedPhone },
    });
  },

  /**
   * Verify Mobile OTP (POST /auth/otp/verify)
   * Sets isPhoneVerified: true and issues tokens (refreshToken in HttpOnly cookie, accessToken in memory)
   */
  async verifyMobileOtp(phone: string, otp: string): Promise<AuthResponse> {
    const sanitizedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;
    const res = await api<AuthResponse>('/auth/otp/verify', {
      method: 'POST',
      data: { phone: sanitizedPhone, otp },
    });

    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }

    return res;
  },

  /**
   * Authenticate via Google OAuth Code (POST /auth/google)
   */
  async googleAuth(code: string, redirectUri?: string): Promise<AuthResponse> {
    const defaultRedirectUri = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback/google`
      : '/auth/callback/google';

    const res = await api<AuthResponse>('/auth/google', {
      method: 'POST',
      data: {
        code,
        redirectUri: redirectUri || defaultRedirectUri,
      },
    });

    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }

    return res;
  },

  /**
   * Get Google OAuth Login Consent Screen URL (GET /auth/login/google)
   */
  getGoogleLoginUrl(): string {
    return `${CONFIG.API_BASE_URL}/auth/login/google`;
  },

  /**
   * Get Current Authenticated User Profile (GET /users/me)
   */
  async getMe(): Promise<AuthUser> {
    const res = await api<any>('/users/me', {
      method: 'GET',
    });
    const user = res?.profile?.user || res?.data || res?.user || res;
    return user;
  },

  /**
   * Rotate 30-day refreshToken cookie & issue new Bearer accessToken (POST /auth/refresh)
   * Single-flight deduplication prevents concurrent refresh requests from invalidating tokens.
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    if (activeRefreshPromise) {
      return activeRefreshPromise;
    }

    activeRefreshPromise = (async () => {
      try {
        const res = await api<any>('/auth/refresh', {
          method: 'POST',
        });

        const user = res?.profile?.user || res?.data || res?.user;
        const token = res?.accessToken;

        if (token) {
          setAccessToken(token);
        }

        return {
          success: Boolean(res?.success ?? true),
          accessToken: token,
          user,
        };
      } finally {
        activeRefreshPromise = null;
      }
    })();

    return activeRefreshPromise;
  },

  /**
   * Revoke current refresh token session & clear cookie (POST /auth/logout)
   */
  async logout(): Promise<MessageResponse> {
    try {
      await api<MessageResponse>('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignore API error if session already revoked
    } finally {
      setAccessToken(null);
    }
    return { success: true, message: 'Logged out successfully' };
  },

  /**
   * Revoke all active sessions across all devices (POST /auth/logout-all)
   */
  async logoutAll(password?: string): Promise<MessageResponse> {
    try {
      await api<MessageResponse>('/auth/logout-all', {
        method: 'POST',
        data: password ? { password } : {},
      });
    } finally {
      setAccessToken(null);
    }
    return { success: true, message: 'All sessions revoked successfully' };
  },
};
