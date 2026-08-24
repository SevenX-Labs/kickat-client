import { CONFIG } from '../constants/config';

interface FetchOptions extends RequestInit {
  data?: any;
}

/**
 * A wrapper around the native fetch API to automatically handle:
 * - Base URL prefixing
 * - JSON stringifying
 * - Attaching the Bearer token from localStorage
 */
export async function api<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options;

  // Retrieve token from local storage (only works on client-side)
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

  const config: RequestInit = {
    ...customConfig,
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

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  return response.json();
}
