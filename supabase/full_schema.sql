-- Consolidated Supabase schema for Nivvaas

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Roles
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'customer');

-- Functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');

  RETURN NEW;
END;
$$;

-- Core tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  builder TEXT NOT NULL,
  sales_person TEXT,
  land_parcel TEXT,
  tower TEXT,
  construction TEXT,
  amenities TEXT,
  description TEXT,
  location TEXT NOT NULL,
  possession TEXT,
  launch_date TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_uuid UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  bhk_type TEXT NOT NULL,
  carpet TEXT,
  carpet_min NUMERIC,
  carpet_max NUMERIC,
  price TEXT,
  price_min NUMERIC,
  price_max NUMERIC,
  floor TEXT,
  flat_per_floor INTEGER,
  total_units INTEGER,
  parking TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_uuid UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.csv_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size INTEGER,
  total_rows INTEGER,
  projects_created INTEGER DEFAULT 0,
  projects_updated INTEGER DEFAULT 0,
  units_added INTEGER DEFAULT 0,
  rows_skipped INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  mode TEXT NOT NULL CHECK (mode IN ('replace', 'append')),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Extended tables
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  budget TEXT,
  interested_localities TEXT,
  property_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  rejection_reason TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'residential',
  purpose TEXT NOT NULL DEFAULT 'rent',
  property_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  bhk_type TEXT,
  carpet_area NUMERIC,
  built_up_area NUMERIC,
  super_built_up_area NUMERIC,
  area_unit TEXT DEFAULT 'sqft',
  floor_number INTEGER,
  total_floors INTEGER,
  property_age INTEGER,
  bathrooms INTEGER DEFAULT 1,
  balconies INTEGER DEFAULT 0,
  furnishing_type TEXT,
  furnishing_items TEXT[],
  amenities TEXT[],
  covered_parking INTEGER DEFAULT 0,
  open_parking INTEGER DEFAULT 0,
  tenant_preference TEXT[],
  pet_friendly BOOLEAN DEFAULT false,
  available_from DATE,
  monthly_rent NUMERIC,
  maintenance_type TEXT DEFAULT 'separate',
  maintenance_amount NUMERIC,
  security_deposit TEXT,
  security_deposit_amount NUMERIC,
  lock_in_period TEXT,
  lock_in_months INTEGER,
  brokerage TEXT DEFAULT 'no_brokerage',
  brokerage_amount NUMERIC,
  sale_price NUMERIC,
  price_negotiable BOOLEAN DEFAULT false,
  city TEXT NOT NULL,
  locality TEXT NOT NULL,
  landmark TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  images TEXT[],
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_featured BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.properties_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_uuid UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Legacy Mongo replacement tables
CREATE TABLE IF NOT EXISTS public.legacy_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  bhk TEXT,
  price NUMERIC,
  type TEXT,
  category TEXT,
  purpose TEXT,
  description TEXT,
  builder TEXT,
  specification TEXT,
  tower TEXT,
  carpet_area TEXT,
  units INTEGER,
  possession TEXT,
  amenities TEXT[],
  project_name TEXT,
  sales_person TEXT,
  image_url TEXT,
  images TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legacy_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT,
  property_title TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legacy_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  property_type TEXT,
  budget TEXT,
  location TEXT,
  priority TEXT NOT NULL DEFAULT 'warm' CHECK (priority IN ('hot', 'warm', 'cold')),
  source TEXT,
  notes TEXT,
  status TEXT,
  notes_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  conversion_potential INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'responded', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  account_created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ NOT NULL DEFAULT now(),
  login_count INTEGER NOT NULL DEFAULT 1,
  login_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  role TEXT NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legacy_properties_updated_at
  BEFORE UPDATE ON public.legacy_properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legacy_enquiries_updated_at
  BEFORE UPDATE ON public.legacy_enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legacy_leads_updated_at
  BEFORE UPDATE ON public.legacy_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tracking_updated_at
  BEFORE UPDATE ON public.user_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_images_property_uuid 
  ON public.properties_images(property_uuid);

CREATE INDEX IF NOT EXISTS idx_properties_images_is_featured 
  ON public.properties_images(property_uuid, is_featured);

CREATE INDEX IF NOT EXISTS idx_properties_images_order 
  ON public.properties_images(property_uuid, order_index);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csv_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties_images ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view units"
  ON public.units FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage units"
  ON public.units FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can submit enquiries"
  ON public.enquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view enquiries"
  ON public.enquiries FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update enquiries"
  ON public.enquiries FOR UPDATE
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete enquiries"
  ON public.enquiries FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view csv uploads"
  ON public.csv_uploads FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage csv uploads"
  ON public.csv_uploads FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

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

DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;

CREATE POLICY "Public can submit leads from website"
ON public.leads FOR INSERT
WITH CHECK (
  source IN ('website', 'whatsapp', 'call') AND
  status = 'new'
);

CREATE POLICY "Admins can manage all properties"
ON public.properties FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active properties"
ON public.properties FOR SELECT
USING (status = 'active');

CREATE POLICY "Allow public to view properties_images" ON public.properties_images
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow admins to manage properties_images" ON public.properties_images
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
    )
  );

-- Triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
