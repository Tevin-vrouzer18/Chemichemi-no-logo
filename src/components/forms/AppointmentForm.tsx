import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseMutation, useSupabaseQuery } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id?: string;
  customer_id: string;
  service_id: string;
  vehicle_id?: string;
  scheduled_date: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  notes?: string;
}

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  onSuccess?: () => void;
}

const APPOINTMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export function AppointmentForm({ open, onOpenChange, appointment, onSuccess }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    customer_id: appointment?.customer_id || "",
    service_id: appointment?.service_id || "",
    vehicle_id: appointment?.vehicle_id || "none",
    scheduled_date: appointment?.scheduled_date ? 
      new Date(appointment.scheduled_date).toISOString().slice(0, 16) : "",
    status: appointment?.status || "pending" as const,
    total_amount: appointment?.total_amount || 0,
    notes: appointment?.notes || ""
  });
  const [loading, setLoading] = useState(false);
  
  const { insert, update } = useSupabaseMutation('appointments');
  const { data: customers } = useSupabaseQuery('customers', 'id, name');
  const { data: services } = useSupabaseQuery('services', 'id, name, price');
  
  // Custom query for vehicles (join through customers to get business_id filter)
  const [vehicles, setVehicles] = useState<any[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!profile?.business_id) return;
      
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id, make, model, plate_number, customer_id,
          customers!inner(business_id)
        `)
        .eq('customers.business_id', profile.business_id);
        
      if (!error) {
        setVehicles(data || []);
      }
    };
    
    fetchVehicles();
  }, [profile?.business_id]);
  const { toast } = useToast();

  // Update total amount when service changes
  useEffect(() => {
    if (formData.service_id) {
      const selectedService = services?.find(s => s.id === formData.service_id);
      if (selectedService) {
        setFormData(prev => ({ ...prev, total_amount: selectedService.price }));
      }
    }
  }, [formData.service_id, services]);

  // Filter vehicles by selected customer
  const customerVehicles = vehicles?.filter(v => v.customer_id === formData.customer_id) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        vehicle_id: formData.vehicle_id === "none" ? null : formData.vehicle_id
      };

      if (appointment?.id) {
        await update(appointment.id, dataToSave);
      } else {
        await insert(dataToSave);
      }
      
      onOpenChange(false);
      onSuccess?.();
      setFormData({
        customer_id: "",
        service_id: "",
        vehicle_id: "none",
        scheduled_date: "",
        status: "pending",
        total_amount: 0,
        notes: ""
      });
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: "Error",
        description: "Failed to save appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Edit Appointment" : "New Appointment"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer</Label>
              <Select 
                value={formData.customer_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value, vehicle_id: "none" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_id">Service</Label>
              <Select 
                value={formData.service_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services?.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - KES {service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Vehicle (Optional)</Label>
              <Select 
                value={formData.vehicle_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific vehicle</SelectItem>
                  {customerVehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} - {vehicle.plate_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Scheduled Date & Time</Label>
              <Input
                id="scheduled_date"
                name="scheduled_date"
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount (KES)</Label>
              <Input
                id="total_amount"
                name="total_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_amount}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes or special instructions"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : (appointment ? "Update" : "Book Appointment")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}