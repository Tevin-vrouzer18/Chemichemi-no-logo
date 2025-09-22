-- Add RLS policy to allow business owners to create employee profiles
CREATE POLICY "Business owners can create employee profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  role = 'employee' AND 
  EXISTS (
    SELECT 1 FROM public.profiles owner_profile 
    WHERE owner_profile.id = auth.uid() 
    AND owner_profile.role = 'owner'
  )
);