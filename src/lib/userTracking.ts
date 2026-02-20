/**
 * User Tracking Utility
 * Handles recording login events and user activity to MongoDB
 */

const PRODUCTION_API_URL = 'https://property-frontend-80y9.onrender.com';

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

const configuredApiUrl = import.meta.env.VITE_API_URL
  ? normalizeBaseUrl(import.meta.env.VITE_API_URL)
  : null;

const apiOrigins = Array.from(
  new Set([configuredApiUrl, PRODUCTION_API_URL].filter(Boolean) as string[])
);

const withApiPrefix = (origin: string, path: string) => `${origin}/api${path}`;

async function fetchWithApiFallback(path: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown = null;

  for (const origin of apiOrigins) {
    try {
      return await fetch(withApiPrefix(origin, path), init);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error('Unable to reach API endpoint.');
}

interface TrackLoginParams {
  supabaseId: string;
  email: string;
  fullName?: string;
  deviceInfo?: string;
}

/**
 * Track user login to MongoDB
 * Should be called after successful Supabase authentication
 */
export async function trackUserLogin(params: TrackLoginParams): Promise<void> {
  try {
    const response = await fetchWithApiFallback('/users/track-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        supabaseId: params.supabaseId,
        email: params.email,
        fullName: params.fullName || 'User',
        deviceInfo: params.deviceInfo || getDeviceInfo(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to track login: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Login tracked successfully:', data);
  } catch (error) {
    console.error('❌ Error tracking login:', error);
    // Don't throw - allow login to proceed even if tracking fails
  }
}

/**
 * Get user login information
 */
export async function getUserData(supabaseId: string) {
  try {
    const response = await fetchWithApiFallback(`/users/${supabaseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
}

/**
 * Track property view for user
 */
export async function trackPropertyView(supabaseId: string): Promise<void> {
  try {
    const response = await fetchWithApiFallback(
      `/users/${supabaseId}/track-property-view`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to track property view: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error tracking property view:', error);
  }
}

/**
 * Track enquiry for user
 */
export async function trackEnquiry(supabaseId: string): Promise<void> {
  try {
    const response = await fetchWithApiFallback(
      `/users/${supabaseId}/track-enquiry`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to track enquiry: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error tracking enquiry:', error);
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  supabaseId: string,
  data: {
    phone?: string;
    searchInterests?: string[];
    preferredLocations?: string[];
  }
): Promise<void> {
  try {
    const response = await fetchWithApiFallback(`/users/${supabaseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
  }
}

/**
 * Get user login history
 */
export async function getUserLoginHistory(supabaseId: string) {
  try {
    const response = await fetchWithApiFallback(
      `/users/${supabaseId}/login-history`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get login history: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error getting login history:', error);
    return null;
  }
}

/**
 * Detect device information
 */
function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Mobile')) return 'Mobile';
  if (ua.includes('Tablet')) return 'Tablet';
  if (ua.includes('iPad')) return 'iPad';
  return 'Desktop';
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  try {
    const response = await fetchWithApiFallback('/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get users: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error getting users:', error);
    return null;
  }
}

/**
 * Get user statistics (admin only)
 */
export async function getUserStats() {
  try {
    const response = await fetchWithApiFallback('/users/stats/overview', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user stats: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    return null;
  }
}
