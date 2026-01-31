// API utility for MongoDB backend
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'https://property-frontend-80y9.onrender.com/api';

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
  // Get all properties
  async getAll(includeHidden: boolean = false): Promise<Property[]> {
    const url = includeHidden 
      ? `${API_BASE_URL}/properties?includeHidden=true`
      : `${API_BASE_URL}/properties`;
    console.log('Fetching from:', url);
    const response = await fetch(url);
    console.log('Response status:', response.status);
    if (!response.ok) throw new Error('Failed to fetch properties');
    const data = await response.json();
    console.log('Received properties:', data.length, data);
    return data;
  },

  // Get single property
  async getById(id: string): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`);
    if (!response.ok) throw new Error('Property not found');
    return response.json();
  },

  // Create property
  async create(property: Omit<Property, '_id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property),
    });
    if (!response.ok) throw new Error('Failed to create property');
    return response.json();
  },

  // Bulk create properties
  async createBulk(properties: Omit<Property, '_id' | 'created_at' | 'updated_at'>[]): Promise<{ success: boolean; count: number; properties: Property[] }> {
    const response = await fetch(`${API_BASE_URL}/properties/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(properties),
    });
    if (!response.ok) throw new Error('Failed to bulk create properties');
    return response.json();
  },

  // Delete all properties (for cleanup)
  async deleteAll(): Promise<{ success: boolean; deletedCount: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete all properties');
    return response.json();
  },

  // Update property
  async update(id: string, property: Partial<Property>): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property),
    });
    if (!response.ok) throw new Error('Failed to update property');
    return response.json();
  },

  // Delete property
  async delete(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete property');
    return response.json();
  },

  // Health check
  async healthCheck(): Promise<{ status: string; mongodb: boolean }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
};

export const enquiryAPI = {
  // Get all enquiries
  async getAll(): Promise<Enquiry[]> {
    const response = await fetch(`${API_BASE_URL}/enquiries`);
    if (!response.ok) throw new Error('Failed to fetch enquiries');
    return response.json();
  },

  // Create enquiry
  async create(enquiry: Omit<Enquiry, '_id' | 'created_at' | 'updated_at' | 'status'>): Promise<Enquiry> {
    const response = await fetch(`${API_BASE_URL}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
    if (!response.ok) throw new Error('Failed to create enquiry');
    return response.json();
  },

  // Update enquiry
  async update(id: string, enquiry: Partial<Enquiry>): Promise<Enquiry> {
    const response = await fetch(`${API_BASE_URL}/enquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
    if (!response.ok) throw new Error('Failed to update enquiry');
    return response.json();
  },

  // Delete enquiry
  async delete(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/enquiries/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete enquiry');
    return response.json();
  },
};

export const statsAPI = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
};
