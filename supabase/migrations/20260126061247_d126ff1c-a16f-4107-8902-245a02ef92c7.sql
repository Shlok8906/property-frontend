-- Fix the permissive RLS policy on leads
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;

-- Create a more specific policy that still allows public lead creation
-- but only for specific fields (website leads are unauthenticated)
CREATE POLICY "Public can submit leads from website"
ON public.leads FOR INSERT
WITH CHECK (
  source IN ('website', 'whatsapp', 'call') AND
  status = 'new'
);