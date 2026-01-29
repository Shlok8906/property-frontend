export type PropertyCategory = 'residential' | 'commercial';
export type PropertyPurpose = 'rent' | 'sell' | 'pg' | 'coliving';
export type PropertyType = 
  | 'apartment' 
  | 'independent_house' 
  | 'duplex' 
  | 'independent_floor' 
  | 'villa' 
  | 'farm_house' 
  | 'penthouse' 
  | 'studio_apartment';

export type BHKType = 
  | '1RK' 
  | '1BHK' 
  | '1.5BHK' 
  | '2BHK' 
  | '2.5BHK' 
  | '3BHK' 
  | '3.5BHK' 
  | '4BHK' 
  | '4.5BHK' 
  | '5BHK' 
  | '5+BHK';

export type FurnishingType = 'fully_furnished' | 'semi_furnished' | 'unfurnished';

export type TenantPreference = 'family' | 'bachelors' | 'company_lease';

export type SecurityDeposit = 'none' | '1_month' | '2_months' | 'custom';

export type LockInPeriod = 'none' | '1_month' | '6_months' | 'custom';

export type Brokerage = 'no_brokerage' | '15_days' | '30_days' | 'custom';

export const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'independent_house', label: 'Independent House', icon: '🏠' },
  { value: 'duplex', label: 'Duplex', icon: '🏘️' },
  { value: 'independent_floor', label: 'Independent Floor', icon: '🏛️' },
  { value: 'villa', label: 'Villa', icon: '🏰' },
  { value: 'farm_house', label: 'Farm House', icon: '🌾' },
  { value: 'penthouse', label: 'Penthouse', icon: '✨' },
  { value: 'studio_apartment', label: 'Studio Apartment', icon: '🎨' },
];

export const BHK_OPTIONS: BHKType[] = [
  '1RK', '1BHK', '1.5BHK', '2BHK', '2.5BHK', 
  '3BHK', '3.5BHK', '4BHK', '4.5BHK', '5BHK', '5+BHK'
];

export const FURNISHING_ITEMS = [
  'Bed', 'Sofa', 'AC', 'Wardrobe', 'Modular Kitchen', 
  'Fridge', 'Washing Machine', 'TV', 'Internet', 'Power Backup',
  'Lift', 'Gym', 'Swimming Pool', 'Security', 'CCTV', 
  'Garden', 'Clubhouse', 'Parking', 'Fire Safety', 'Water Storage'
];

export const PARKING_OPTIONS = [0, 1, 2, 3, '3+'] as const;

export interface Property {
  id: string;
  category: PropertyCategory;
  purpose: PropertyPurpose;
  property_type: PropertyType;
  title: string;
  description?: string;
  bhk_type?: BHKType;
  carpet_area?: number;
  built_up_area?: number;
  super_built_up_area?: number;
  area_unit: string;
  floor_number?: number;
  total_floors?: number;
  property_age?: number;
  bathrooms: number;
  balconies: number;
  furnishing_type?: FurnishingType;
  furnishing_items?: string[];
  amenities?: string[];
  covered_parking: number;
  open_parking: number;
  tenant_preference?: TenantPreference[];
  pet_friendly: boolean;
  available_from?: string;
  monthly_rent?: number;
  maintenance_type: string;
  maintenance_amount?: number;
  security_deposit: SecurityDeposit;
  security_deposit_amount?: number;
  lock_in_period: LockInPeriod;
  lock_in_months?: number;
  brokerage: Brokerage;
  brokerage_amount?: number;
  sale_price?: number;
  price_negotiable: boolean;
  city: string;
  locality: string;
  landmark?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  featured_image?: string;
  status: string;
  is_featured: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  customer_name: string;
  phone: string;
  email?: string;
  budget?: string;
  interested_localities?: string;
  property_id?: string;
  source: 'website' | 'whatsapp' | 'call';
  status: 'new' | 'follow_up' | 'interested' | 'successful' | 'rejected';
  rejection_reason?: string;
  notes: LeadNote[];
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  text: string;
  created_at: string;
}

export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'status-new' },
  { value: 'follow_up', label: 'Follow Up', color: 'status-follow-up' },
  { value: 'interested', label: 'Interested', color: 'status-interested' },
  { value: 'successful', label: 'Successful', color: 'status-successful' },
  { value: 'rejected', label: 'Rejected', color: 'status-rejected' },
] as const;

export const REJECTION_REASONS = [
  'Not answering calls',
  'No requirement',
  'Budget mismatch',
  'Locality mismatch',
  'Already purchased',
  'Wants ready-to-move',
  'Negotiation failed',
  'Other',
] as const;
