import { CONFIG } from '../constants/config';

interface FetchOptions extends RequestInit {
  data?: Record<string, unknown>;
}

let accessTokenInMemory: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];
let onUnauthenticatedHandler: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessTokenInMemory;
}

export function setAccessToken(token: string | null): void {
  accessTokenInMemory = token;
}

export function setOnUnauthenticated(handler: () => void): void {
  onUnauthenticatedHandler = handler;
}

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * A wrapper around native fetch API handling:
 * - Base URL prefixing
 * - JSON stringifying
 * - Attaching Bearer token from client memory
 * - Passing HttpOnly credentials (cookies)
 * - Automatic 401 token refresh queueing & retry
 */
export async function api<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options;
  const token = getAccessToken();

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

  const isAuthEndpoint =
    endpoint.includes('/auth/refresh') ||
    endpoint.includes('/auth/logout') ||
    endpoint.includes('/auth/logout-all') ||
    endpoint.includes('/auth/otp/send') ||
    endpoint.includes('/auth/otp/verify') ||
    endpoint.includes('/auth/google');

  // Attempt automatic token refresh on 401 Unauthorized for non-auth endpoints
  if (response.status === 401 && !isAuthEndpoint) {
    if (isRefreshing) {
      try {
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        const retryHeaders = {
          ...(config.headers as Record<string, string>),
          Authorization: `Bearer ${newToken}`,
        };
        response = await fetch(url, { ...config, headers: retryHeaders });
      } catch (err) {
        throw err;
      }
    } else {
      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${CONFIG.API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData.accessToken;

          if (newAccessToken) {
            setAccessToken(newAccessToken);
            processQueue(null, newAccessToken);

            const retryHeaders = {
              ...(config.headers as Record<string, string>),
              Authorization: `Bearer ${newAccessToken}`,
            };
            response = await fetch(url, { ...config, headers: retryHeaders });
          } else {
            throw new Error('No access token returned from refresh');
          }
        } else {
          const errorData = await refreshRes.json().catch(() => ({}));
          const refreshError = new Error(errorData.message || 'Session expired. Please log in again.');
          processQueue(refreshError, null);
          setAccessToken(null);

          if (onUnauthenticatedHandler) {
            onUnauthenticatedHandler();
          }
          throw refreshError;
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);

        if (onUnauthenticatedHandler) {
          onUnauthenticatedHandler();
        }
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
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
