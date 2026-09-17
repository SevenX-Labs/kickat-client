import { CONFIG } from '../constants/config';

interface FetchOptions extends RequestInit {
  data?: Record<string, unknown>;
}

/**
 * A wrapper around the native fetch API to automatically handle:
 * - Base URL prefixing
 * - JSON stringifying
 * - Attaching the Bearer token from localStorage
 * - Passing HttpOnly credentials (cookies)
 * - Automatic 401 token refresh retry
 */
export async function api<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options;

  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

  const config: RequestInit = {
    ...customConfig,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const url = `${CONFIG.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response = await fetch(url, config);

  // Attempt automatic token refresh on 401 Unauthorized (except for auth endpoints)
  if (
    response.status === 401 &&
    !endpoint.includes('/auth/refresh') &&
    !endpoint.includes('/auth/logout') &&
    !endpoint.includes('/auth/logout-all') &&
    !endpoint.includes('/auth/otp/send') &&
    !endpoint.includes('/auth/otp/verify') &&
    !endpoint.includes('/auth/google')
  ) {
    try {
      const refreshRes = await fetch(`${CONFIG.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.accessToken && typeof window !== 'undefined') {
          localStorage.setItem('accessToken', refreshData.accessToken);
          if (refreshData.user) {
            localStorage.setItem('user', JSON.stringify(refreshData.user));
          }
          const retryHeaders = {
            ...(config.headers as Record<string, string>),
            Authorization: `Bearer ${refreshData.accessToken}`,
          };
          response = await fetch(url, { ...config, headers: retryHeaders });
        }
      }
    } catch {
      // If refresh fails, original 401 error will be thrown below
    }
  }

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  return response.json();
}
