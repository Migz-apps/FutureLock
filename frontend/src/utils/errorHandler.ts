// src/utils/errorHandler.ts
// Custom error handler to prevent backend exposure and provide user-friendly messages

export const getErrorMessage = (error: any): string => {
  // Network / Connection issues
  if (error?.code === 'ECONNREFUSED' || 
      error?.message?.toLowerCase().includes('fetch') || 
      error?.message?.toLowerCase().includes('network') ||
      !navigator.onLine) {
    return 'Connection error. Please check your internet and try again.';
  }

  // HTTP status codes from backend
  if (error?.response?.status || error?.status) {
    const status = error.response?.status || error.status;
    switch (status) {
      case 400:
        return 'Invalid input. Please check your details.';
      case 401:
        return 'Invalid email or password.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Email already exists. Please use another one.';
      case 422:
        return 'Invalid data provided.';
      case 429:
        return 'Too many attempts. Please try again later.';
      case 500:
      case 502:
      case 503:
        return 'Server error. Please try again later.';
      default:
        return 'Request failed. Please try again.';
    }
  }

  // Backend error messages (safely mapped)
  const msg = error?.message || error?.error || '';
  if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('exist')) {
    return 'Email already exists. Please use a different email.';
  }
  if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('invalid credentials')) {
    return 'Invalid email or password.';
  }
  if (msg.toLowerCase().includes('verification') || msg.toLowerCase().includes('code')) {
    return 'Invalid or expired verification code.';
  }
  if (msg.toLowerCase().includes('username')) {
    return 'Username is already taken or invalid.';
  }

  // Wallet / Web3 specific
  if (msg.toLowerCase().includes('wallet') || 
      msg.toLowerCase().includes('metamask') || 
      msg.toLowerCase().includes('ethereum')) {
    return 'Wallet connection failed. Please try again.';
  }

  // Default safe message
  return 'Something went wrong. Please try again.';
};

// Helper to safely run any async auth operation
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>
): Promise<{ data?: T; error?: string }> => {
  try {
    const data = await asyncFn();
    return { data };
  } catch (error: any) {
    console.error('Auth Error:', error); // Log for debugging only
    return { error: getErrorMessage(error) };
  }
};