export type ApiError = Error & {
  status?: number;
  data?: unknown;
};

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');

export const getErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred.';

  const status = error?.status ?? error?.response?.status;
  const backendMessage =
    error?.data?.message ||
    error?.message ||
    error?.error ||
    '';

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'You appear to be offline. Check your internet connection.';
  }

  if (status) {
    switch (status) {
      case 400:
        return backendMessage || 'Invalid input. Please check your details.';
      case 401:
        return backendMessage || 'Authentication failed.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'The requested backend endpoint was not found.';
      case 409:
        return backendMessage || 'That account information is already in use.';
      case 422:
        return backendMessage || 'Invalid data provided.';
      case 429:
        return 'Too many attempts. Please try again later.';
      case 500:
      case 502:
      case 503:
        return 'The FutureLock server is currently unavailable. Please try again.';
      default:
        return backendMessage || 'Request failed. Please try again.';
    }
  }

  const lower = String(backendMessage).toLowerCase();

  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('load failed') ||
    lower.includes('timeout') ||
    error?.name === 'AbortError'
  ) {
    return 'Could not reach the FutureLock backend. Make sure it is running on port 8081.';
  }

  return backendMessage || 'Something went wrong. Please try again.';
};

export const apiFetch = async (
  path: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<Response> => {
  if (!BACKEND_URL) {
    throw new Error(
      'NEXT_PUBLIC_BACKEND_URL is not configured. Add it to .env.local and restart Next.js.'
    );
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(`${BACKEND_URL}${normalizedPath}`, {
      ...options,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
  } catch (error: any) {
    const networkError: ApiError = new Error(
      error?.name === 'AbortError'
        ? 'Backend request timed out.'
        : 'Failed to fetch backend.'
    );
    networkError.data = error;
    throw networkError;
  } finally {
    clearTimeout(timeout);
  }
};

export const parseApiResponse = async <T = any>(res: Response): Promise<T> => {
  const contentType = res.headers.get('content-type') || '';

  let data: any = null;

  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => '');
    data = text ? { message: text } : null;
  }

  if (!res.ok) {
    const error: ApiError = new Error(
      data?.message || `Request failed with status ${res.status}.`
    );
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
};

export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>
): Promise<{ data?: T; error?: string }> => {
  try {
    return { data: await asyncFn() };
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('FutureLock request failed:', {
        message: error?.message,
        status: error?.status,
        data: error?.data,
      });
    }

    return { error: getErrorMessage(error) };
  }
};

export const handleError = (error: any): string => getErrorMessage(error);
