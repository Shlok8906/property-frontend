-- Legacy tables to replace MongoDB collections

CREATE TABLE IF NOT EXISTS public.legacy_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  bhk TEXT,
  price NUMERIC,
  type TEXT,
  category TEXT,
  purpose TEXT,
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

-- Updated_at triggers
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
