// API utility for Supabase-backed server

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

const configuredApiUrl = import.meta.env.VITE_API_URL
  ? normalizeBaseUrl(import.meta.env.VITE_API_URL)
  : null;

const fallbackApiUrl = import.meta.env.VITE_API_FALLBACK_URL
  ? normalizeBaseUrl(import.meta.env.VITE_API_FALLBACK_URL)
  : null;

const apiOrigins = Array.from(
  new Set([configuredApiUrl, fallbackApiUrl].filter(Boolean) as string[])
);

let propertyReadsTemporarilyDisabledUntil = 0;

const withApiPrefix = (origin: string, path: string) => `${origin}/api${path}`;

async function fetchWithApiFallback(path: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown = null;
  let lastResponse: Response | null = null;

  for (const origin of apiOrigins) {
    try {
      const response = await fetch(withApiPrefix(origin, path), init);
      if (response.ok) {
        return response;
      }
      lastResponse = response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error('Unable to reach API endpoint.');
}

export interface Property {
  _id?: string;
  id?: string;
  title: string;
  location: string;
  bhk: string;
  price: number;
  type: string;
  category: string;
  purpose: string;
  description?: string;
  builder?: string;
  specification?: string;
  tower?: string;
  carpetArea?: string;
  units?: number;
  possession?: string;
  amenities?: string[];
  projectName?: string;
  salesPerson?: string;
  image_url?: string;
  images?: string[];
  status?: 'active' | 'hidden';
  created_at?: string;
  updated_at?: string;
}

export interface PropertyListParams {
  includeHidden?: boolean;
  page?: number;
  limit?: number;
  fields?: 'full' | 'card';
  search?: string;
  type?: string;
  bhk?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface Enquiry {
  _id?: string;
  id?: string;
  propertyId?: string;
  propertyTitle?: string;
  name: string;
  email?: string;
  phone: string;
  message?: string;
  status: 'new' | 'contacted' | 'closed';
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalProperties: number;
  totalEnquiries: number;
  newEnquiries: number;
  activeListings: number;
}

export const propertyAPI = {
  // Get paginated properties with optional server-side filtering
  async list(params: PropertyListParams = {}, signal?: AbortSignal): Promise<PaginatedResponse<Property>> {
    const requestedPage = params.page ?? 1;
    const requestedLimit = params.limit ?? 20;

    if (Date.now() < propertyReadsTemporarilyDisabledUntil) {
      return {
        items: [],
        page: requestedPage,
        limit: requestedLimit,
        total: 0,
        totalPages: 1,
        hasMore: false,
      };
    }

    const query = new URLSearchParams();

    if (params.includeHidden) query.set('includeHidden', 'true');
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.fields) query.set('fields', params.fields);
    if (params.search) query.set('search', params.search);
    if (params.type) query.set('type', params.type);
    if (params.bhk) query.set('bhk', params.bhk);
    if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));

    try {
      const response = await fetchWithApiFallback(
        `/properties${query.toString() ? `?${query.toString()}` : ''}`,
        { signal }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch properties (${response.status})`);
      }

      const data = await response.json();

      // Backward compatibility for environments still returning a plain array.
      if (Array.isArray(data)) {
        return {
          items: data,
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
          hasMore: false
        };
      }

      return data;
    } catch (error) {
      propertyReadsTemporarilyDisabledUntil = Date.now() + 60_000;

      return {
        items: [],
        page: requestedPage,
        limit: requestedLimit,
        total: 0,
        totalPages: 1,
        hasMore: false,
      };
    }
  },

  // Get all properties
  async getAll(includeHidden: boolean = false): Promise<Property[]> {
    try {
      const response = await fetchWithApiFallback(
        includeHidden ? '/properties?includeHidden=true' : '/properties'
      );
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  },

  // Get single property
  async getById(id: string): Promise<Property> {
    const response = await fetchWithApiFallback(`/properties/${id}`);
    if (!response.ok) throw new Error('Property not found');
    return response.json();
  },

  // Create property
  async create(property: Omit<Property, '_id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const response = await fetchWithApiFallback('/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property),
    });
    if (!response.ok) throw new Error('Failed to create property');
    return response.json();
  },

  // Bulk create properties
  async createBulk(properties: Omit<Property, '_id' | 'created_at' | 'updated_at'>[]): Promise<{ success: boolean; count: number; properties: Property[] }> {
    const response = await fetchWithApiFallback('/properties/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(properties),
    });
    if (!response.ok) throw new Error('Failed to bulk create properties');
    return response.json();
  },

  // Delete all properties (for cleanup)
  async deleteAll(): Promise<{ success: boolean; deletedCount: number; message: string }> {
    const response = await fetchWithApiFallback('/properties', {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete all properties');
    return response.json();
  },

  // Update property
  async update(id: string, property: Partial<Property>): Promise<Property> {
    const response = await fetchWithApiFallback(`/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property),
    });
    if (!response.ok) throw new Error('Failed to update property');
    return response.json();
  },

  // Delete property
  async delete(id: string): Promise<{ success: boolean }> {
    const response = await fetchWithApiFallback(`/properties/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete property');
    return response.json();
  },

  // Health check
  async healthCheck(): Promise<{ status: string; supabase: boolean }> {
    const response = await fetchWithApiFallback('/health');
    return response.json();
  },
};

export const enquiryAPI = {
  // Get all enquiries
  async getAll(): Promise<Enquiry[]> {
    const response = await fetchWithApiFallback('/enquiries');
    if (!response.ok) throw new Error('Failed to fetch enquiries');
    return response.json();
  },

  // Create enquiry
  async create(enquiry: Omit<Enquiry, '_id' | 'created_at' | 'updated_at' | 'status'>): Promise<Enquiry> {
    const response = await fetchWithApiFallback('/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
    if (!response.ok) throw new Error('Failed to create enquiry');
    return response.json();
  },

  // Update enquiry
  async update(id: string, enquiry: Partial<Enquiry>): Promise<Enquiry> {
    const response = await fetchWithApiFallback(`/enquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
    if (!response.ok) throw new Error('Failed to update enquiry');
    return response.json();
  },

  // Delete enquiry
  async delete(id: string): Promise<{ success: boolean }> {
    const response = await fetchWithApiFallback(`/enquiries/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete enquiry');
    return response.json();
  },
};

export const statsAPI = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetchWithApiFallback('/stats');
      if (!response.ok) {
        return {
          totalProperties: 0,
          totalEnquiries: 0,
          newEnquiries: 0,
          activeListings: 0,
        };
      }
      return response.json();
    } catch {
      return {
        totalProperties: 0,
        totalEnquiries: 0,
        newEnquiries: 0,
        activeListings: 0,
      };
    }
  },
};

export const userAPI = {
  // Update user role
  async updateRole(userId: string, role: 'admin' | 'customer'): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithApiFallback(`/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error('Failed to update user role');
    return response.json();
  },
};
