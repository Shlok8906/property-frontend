-- Create properties_images table for storing property gallery images
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

-- Create index for faster property image lookups
CREATE INDEX IF NOT EXISTS idx_properties_images_property_uuid 
  ON public.properties_images(property_uuid);

-- Create index for featured images
CREATE INDEX IF NOT EXISTS idx_properties_images_is_featured 
  ON public.properties_images(property_uuid, is_featured);

-- Create index for order
CREATE INDEX IF NOT EXISTS idx_properties_images_order 
  ON public.properties_images(property_uuid, order_index);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.properties_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view images
CREATE POLICY "Allow public to view properties_images" ON public.properties_images
  FOR SELECT USING (TRUE);

-- Allow authenticated users (admins) to insert/update/delete
CREATE POLICY "Allow admins to manage properties_images" ON public.properties_images
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
    )
  );
