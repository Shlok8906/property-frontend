-- Add read column to legacy_enquiries table (if it doesn't exist)
ALTER TABLE public.legacy_enquiries
ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT false;

-- Add read column to contact_messages table (if it doesn't exist)
ALTER TABLE public.contact_messages
ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT false;
