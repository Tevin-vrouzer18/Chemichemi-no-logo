-- Create service_records table for daily service tracking
CREATE TABLE public.service_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  service_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  vehicle_plate TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'cash')),
  service_price NUMERIC NOT NULL,
  service_duration INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;

-- Create policies for service records
CREATE POLICY "Business members can view service records" 
ON public.service_records 
FOR SELECT 
USING (business_id IN ( 
  SELECT profiles.business_id
  FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['owner'::user_role, 'employee'::user_role])))
));

CREATE POLICY "Business members can manage service records" 
ON public.service_records 
FOR ALL 
USING (business_id IN ( 
  SELECT profiles.business_id
  FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['owner'::user_role, 'employee'::user_role])))
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_service_records_updated_at
BEFORE UPDATE ON public.service_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key relationships
ALTER TABLE public.service_records 
ADD CONSTRAINT fk_service_records_service 
FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;

ALTER TABLE public.service_records 
ADD CONSTRAINT fk_service_records_employee 
FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;