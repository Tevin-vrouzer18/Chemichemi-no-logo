import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabaseMutation } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id?: string;
  profile_id: string;
  position: string;
  salary?: number;
  hire_date: string;
  is_active: boolean;
  shift_schedule?: any;
  // Flattened profile fields from JOIN
  name?: string;
  email?: string;
  phone?: string;
  profiles?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess?: () => void;
}

const POSITIONS = [
  'Manager',
  'Supervisor',
  'Car Wash Attendant',
  'Cashier',
  'Quality Controller',
  'Maintenance Staff',
  'Customer Service Representative'
];

const SHIFTS = [
  { value: 'morning', label: 'Morning (6AM - 2PM)' },
  { value: 'afternoon', label: 'Afternoon (2PM - 10PM)' },
  { value: 'night', label: 'Night (10PM - 6AM)' },
  { value: 'flexible', label: 'Flexible' }
];

export function EmployeeForm({ open, onOpenChange, employee, onSuccess }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    salary: 0,
    hire_date: new Date().toISOString().split('T')[0],
    is_active: true,
    shift: "morning"
  });
  const [loading, setLoading] = useState(false);
  
  const { insert, update } = useSupabaseMutation('employees');
  const { update: updateProfile } = useSupabaseMutation('profiles');
  const { toast } = useToast();

  // Initialize form data when employee prop changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || employee.profiles?.name || "",
        email: employee.email || employee.profiles?.email || "",
        phone: employee.phone || employee.profiles?.phone || "",
        position: employee.position || "",
        salary: employee.salary || 0,
        hire_date: employee.hire_date || new Date().toISOString().split('T')[0],
        is_active: employee.is_active ?? true,
        shift: employee.shift_schedule?.shift || "morning"
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        salary: 0,
        hire_date: new Date().toISOString().split('T')[0],
        is_active: true,
        shift: "morning"
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.position.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, email, and position are required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      if (employee?.id) {
        // Update existing employee - await both operations together
        const employeeData = {
          position: formData.position,
          salary: formData.salary,
          hire_date: formData.hire_date,
          is_active: formData.is_active,
          shift_schedule: { shift: formData.shift }
        };
        
        const profileData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        };

        // Execute both updates together and wait for completion
        await Promise.all([
          update(employee.id, employeeData),
          employee.profile_id ? updateProfile(employee.profile_id, profileData) : Promise.resolve()
        ]);
        
        toast({
          title: "Success",
          description: "Employee information updated successfully"
        });
      } else {
        // Create new employee using edge function
        const { data, error } = await supabase.functions.invoke('create-employee', {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            position: formData.position,
            salary: formData.salary,
            hire_date: formData.hire_date,
            is_active: formData.is_active,
            shift: formData.shift
          }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        toast({
          title: "Success",
          description: "Employee created successfully"
        });
      }
      
      onOpenChange(false);
      onSuccess?.();
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        salary: 0,
        hire_date: new Date().toISOString().split('T')[0],
        is_active: true,
        shift: "morning"
      });
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: "Failed to save employee. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {employee ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Employee full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="employee@example.com"
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Employee full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="employee@example.com"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {employee && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+254 7XX XXX XXX"
              />
            </div>
          )}

          {!employee && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+254 7XX XXX XXX"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select 
                value={formData.position} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map(position => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Monthly Salary (KES)</Label>
              <Input
                id="salary"
                name="salary"
                type="number"
                min="0"
                step="0.01"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="50000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                name="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Preferred Shift</Label>
              <Select 
                value={formData.shift} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, shift: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {SHIFTS.map(shift => (
                    <SelectItem key={shift.value} value={shift.value}>
                      {shift.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active">Active Employee</Label>
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
              {loading ? "Saving..." : (employee ? "Update" : "Add Employee")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}