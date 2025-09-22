-- Drop the problematic policy first
DROP POLICY IF EXISTS "Business members can view employee profiles" ON public.profiles;

-- Create a security definer function to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_business_id()
RETURNS UUID AS $$
  SELECT business_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create a function to check if current user can view employee profiles
CREATE OR REPLACE FUNCTION public.can_view_employee_profile(profile_business_id UUID, profile_role user_role)
RETURNS BOOLEAN AS $$
  SELECT 
    CASE 
      -- Users can always view their own profile
      WHEN profile_business_id IS NULL THEN true
      -- Business members can view employee profiles in their business
      WHEN profile_role = 'employee' AND profile_business_id = public.get_current_user_business_id() THEN true
      ELSE false
    END;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create the corrected policy
CREATE POLICY "Business members can view employee profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  public.can_view_employee_profile(business_id, role)
);