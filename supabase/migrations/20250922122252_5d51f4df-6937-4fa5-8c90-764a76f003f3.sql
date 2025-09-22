-- Allow business owners and employees to view profiles of other employees in their business
CREATE POLICY "Business members can view employee profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always view their own profile
  auth.uid() = id
  OR
  -- Business owners and employees can view profiles of employees in their business
  (
    role = 'employee'::user_role
    AND business_id IN (
      SELECT p.business_id
      FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('owner'::user_role, 'employee'::user_role)
    )
  )
);