-- Create leads table for CRM functionality
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  budget TEXT,
  interested_localities TEXT,
  property_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'website', -- website, whatsapp, call
  status TEXT NOT NULL DEFAULT 'new', -- new, follow_up, interested, successful, rejected
  rejection_reason TEXT,
  notes JSONB DEFAULT '[]'::jsonb, -- timestamped internal notes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extended properties table for manual listing form
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Category and Purpose
  category TEXT NOT NULL DEFAULT 'residential', -- residential, commercial
  purpose TEXT NOT NULL DEFAULT 'rent', -- rent, sell, pg, coliving
  property_type TEXT NOT NULL, -- apartment, independent_house, duplex, villa, etc.
  
  -- Basic Details
  title TEXT NOT NULL,
  description TEXT,
  bhk_type TEXT, -- 1RK, 1BHK, 2BHK, etc.
  
  -- Area Details
  carpet_area NUMERIC,
  built_up_area NUMERIC,
  super_built_up_area NUMERIC,
  area_unit TEXT DEFAULT 'sqft',
  
  -- Floor Details
  floor_number INTEGER,
  total_floors INTEGER,
  property_age INTEGER, -- in years
  
  -- Rooms & Spaces
  bathrooms INTEGER DEFAULT 1,
  balconies INTEGER DEFAULT 0,
  
  -- Furnishing
  furnishing_type TEXT, -- fully_furnished, semi_furnished, unfurnished
  furnishing_items TEXT[], -- array of items: bed, sofa, ac, etc.
  amenities TEXT[], -- array of amenities
  
  -- Parking
  covered_parking INTEGER DEFAULT 0,
  open_parking INTEGER DEFAULT 0,
  
  -- Tenant Preferences
  tenant_preference TEXT[], -- family, bachelors, company_lease
  pet_friendly BOOLEAN DEFAULT false,
  
  -- Availability & Pricing
  available_from DATE,
  monthly_rent NUMERIC,
  maintenance_type TEXT DEFAULT 'separate', -- included, separate
  maintenance_amount NUMERIC,
  security_deposit TEXT, -- none, 1_month, 2_months, custom
  security_deposit_amount NUMERIC,
  lock_in_period TEXT, -- none, 1_month, 6_months, custom
  lock_in_months INTEGER,
  
  -- Brokerage
  brokerage TEXT DEFAULT 'no_brokerage', -- no_brokerage, 15_days, 30_days, custom
  brokerage_amount NUMERIC,
  
  -- Sale specific
  sale_price NUMERIC,
  price_negotiable BOOLEAN DEFAULT false,
  
  -- Location
  city TEXT NOT NULL,
  locality TEXT NOT NULL,
  landmark TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Images
  images TEXT[], -- array of image URLs
  featured_image TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, sold, rented
  is_featured BOOLEAN DEFAULT false,
  
  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for leads
CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert leads"
ON public.leads FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Public can create leads (from website)
CREATE POLICY "Anyone can create leads"
ON public.leads FOR INSERT
WITH CHECK (true);

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- RLS policies for properties
CREATE POLICY "Admins can manage all properties"
ON public.properties FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active properties"
ON public.properties FOR SELECT
USING (status = 'active');

-- Triggers for updated_at
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();