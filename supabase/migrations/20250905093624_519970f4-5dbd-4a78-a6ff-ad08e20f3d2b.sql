-- Create enum types
CREATE TYPE public.user_role AS ENUM ('owner', 'employee', 'customer');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.expense_status AS ENUM ('paid', 'pending');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  business_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  last_visit DATE,
  loyalty_points INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  is_active BOOLEAN DEFAULT true,
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  plate_number TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status appointment_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  status expense_status DEFAULT 'pending',
  receipt_url TEXT,
  employee_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  cost_per_unit DECIMAL(10,2),
  supplier TEXT,
  last_restocked DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response TEXT,
  feedback_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table (extends profiles)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  position TEXT NOT NULL,
  salary DECIMAL(10,2),
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  shift_schedule JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  transaction_id TEXT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily metrics table
CREATE TABLE public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  revenue DECIMAL(10,2) DEFAULT 0,
  expenses DECIMAL(10,2) DEFAULT 0,
  wash_count INTEGER DEFAULT 0,
  customer_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  net_profit DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, metric_date)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for business data (owner/employee access)
CREATE POLICY "Business members can view customers" ON public.customers FOR SELECT USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);
CREATE POLICY "Business members can manage customers" ON public.customers FOR ALL USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);

CREATE POLICY "Business members can view services" ON public.services FOR SELECT USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);
CREATE POLICY "Business members can manage services" ON public.services FOR ALL USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);

CREATE POLICY "Business members can view appointments" ON public.appointments FOR SELECT USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);
CREATE POLICY "Business members can manage appointments" ON public.appointments FOR ALL USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);

CREATE POLICY "Business members can view expenses" ON public.expenses FOR SELECT USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);
CREATE POLICY "Business members can manage expenses" ON public.expenses FOR ALL USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);

CREATE POLICY "Business members can view inventory" ON public.inventory FOR SELECT USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);
CREATE POLICY "Business members can manage inventory" ON public.inventory FOR ALL USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);

CREATE POLICY "Business members can view feedback" ON public.feedback FOR SELECT USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);
CREATE POLICY "Business members can manage feedback" ON public.feedback FOR ALL USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);

CREATE POLICY "Business members can view employees" ON public.employees FOR SELECT USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);
CREATE POLICY "Business owners can manage employees" ON public.employees FOR ALL USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

CREATE POLICY "Business members can view payments" ON public.payments FOR SELECT USING (
  appointment_id IN (
    SELECT id FROM public.appointments 
    WHERE business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
  )
);
CREATE POLICY "Business members can manage payments" ON public.payments FOR ALL USING (
  appointment_id IN (
    SELECT id FROM public.appointments 
    WHERE business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
  )
);

CREATE POLICY "Business members can view daily metrics" ON public.daily_metrics FOR SELECT USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);
CREATE POLICY "Business members can manage daily metrics" ON public.daily_metrics FOR ALL USING (
  business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
);

CREATE POLICY "Users can view vehicles for their customers" ON public.vehicles FOR SELECT USING (
  customer_id IN (
    SELECT id FROM public.customers 
    WHERE business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
  )
);
CREATE POLICY "Users can manage vehicles for their customers" ON public.vehicles FOR ALL USING (
  customer_id IN (
    SELECT id FROM public.customers 
    WHERE business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'employee'))
  )
);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_metrics_updated_at BEFORE UPDATE ON public.daily_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, business_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'owner'),
    gen_random_uuid()
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for carwash assets
INSERT INTO storage.buckets (id, name, public) VALUES ('carwash-assets', 'carwash-assets', true);

-- Create storage policies
CREATE POLICY "Business members can view carwash assets" ON storage.objects FOR SELECT USING (bucket_id = 'carwash-assets');
CREATE POLICY "Business members can upload carwash assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'carwash-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Business members can update carwash assets" ON storage.objects FOR UPDATE USING (bucket_id = 'carwash-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Business members can delete carwash assets" ON storage.objects FOR DELETE USING (bucket_id = 'carwash-assets' AND auth.role() = 'authenticated');