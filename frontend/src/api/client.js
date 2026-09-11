/**
 * MahaSetu Centralized API Client
 * Provides normalized error handling, base URL configuration, and request wrappers.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Normalizes backend error responses into friendly messages.
 */
function normalizeErrorMessage(status, backendError) {
  if (status === 404) {
    return 'This application could not be found.';
  }
  if (status === 409) {
    return 'This request has already been processed.';
  }
  if (status === 400) {
    return backendError?.message || 'Invalid request. Please check the submitted data.';
  }
  if (status >= 500) {
    return 'Something went wrong on the server. Please try again.';
  }
  return backendError?.message || 'An unexpected error occurred.';
}

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    let json = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      json = await response.json();
    }

    if (!response.ok) {
      const code = json?.error?.code || json?.code || `HTTP_${response.status}`;
      const message = normalizeErrorMessage(response.status, json?.error || json);
      throw new ApiError(response.status, code, message, json);
    }

    return json;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network / connection error
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Unable to connect to MahaSetu server. Please check your network or server status.',
      err
    );
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};
