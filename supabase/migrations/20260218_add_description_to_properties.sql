-- Add description column to legacy_properties table
ALTER TABLE public.legacy_properties 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Also add description to projects table for consistency
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS description TEXT;
