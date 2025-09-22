import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSupabaseQuery, useSupabaseMutation } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, Car, CreditCard } from "lucide-react";

const formSchema = z.object({
  service_id: z.string().min(1, "Service is required"),
  employee_id: z.string().min(1, "Employee is required"),
  vehicle_plate: z.string().min(1, "Vehicle plate number is required"),
  vehicle_type: z.string().min(1, "Vehicle type is required"),
  payment_method: z.enum(["mpesa", "cash"], {
    required_error: "Payment method is required",
  }),
});

interface ServiceRecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  is_active: boolean;
}

interface Employee {
  id: string;
  profile_id: string;
  is_active: boolean;
  position: string;
  profiles?: {
    name: string;
  };
}

export function ServiceRecordForm({ open, onOpenChange, onSuccess }: ServiceRecordFormProps) {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Fetch services and employees
  const { data: services, loading: servicesLoading } = useSupabaseQuery<Service>('services', '*', { is_active: true });
  const { data: employees, loading: employeesLoading, error: employeesError } = useSupabaseQuery<Employee>(
    'employees',
    `
      id,
      profile_id,
      position,
      is_active,
      profiles!employees_profile_id_fkey(name)
    `,
    { is_active: true }
  );

  // Debug log to check if employees are being fetched
  useEffect(() => {
    if (employees && employees.length > 0) {
      console.log('Employees loaded:', employees);
    } else if (employeesError) {
      console.error('Error loading employees:', employeesError);
    }
  }, [employees, employeesError]);

  const { insert } = useSupabaseMutation('service_records');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_id: "",
      employee_id: "",
      vehicle_plate: "",
      vehicle_type: "",
      payment_method: "cash",
    },
  });

  // Auto-fill service details when service is selected
  useEffect(() => {
    const serviceId = form.watch("service_id");
    if (serviceId) {
      const service = services.find(s => s.id === serviceId);
      setSelectedService(service || null);
    } else {
      setSelectedService(null);
    }
  }, [form.watch("service_id"), services]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!selectedService) {
        toast({
          title: "Error",
          description: "Please select a valid service",
          variant: "destructive",
        });
        return;
      }

      await insert({
        service_id: values.service_id,
        employee_id: values.employee_id,
        vehicle_plate: values.vehicle_plate.toUpperCase(),
        vehicle_type: values.vehicle_type,
        payment_method: values.payment_method,
        service_price: selectedService.price,
        service_duration: selectedService.duration,
      });

      toast({
        title: "Success",
        description: "Service record created successfully",
      });

      form.reset();
      setSelectedService(null);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating service record:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSelectedService(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Service</DialogTitle>
          <DialogDescription>
            Record a completed carwash service. Service details will be auto-filled when you select a service.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Selection */}
              <FormField
                control={form.control}
                name="service_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - KES {service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employee Selection */}
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employeesLoading ? (
                          <SelectItem value="" disabled>Loading employees...</SelectItem>
                        ) : employees.length === 0 ? (
                          <SelectItem value="" disabled>No active employees found</SelectItem>
                        ) : (
                          employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.profiles?.name || 'Unknown Employee'} - {employee.position}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vehicle Plate */}
              <FormField
                control={form.control}
                name="vehicle_plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Plate Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., KCA 123A"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vehicle Type */}
              <FormField
                control={form.control}
                name="vehicle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Sedan">Sedan</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Hatchback">Hatchback</SelectItem>
                        <SelectItem value="Pickup">Pickup Truck</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Coupe">Coupe</SelectItem>
                        <SelectItem value="Convertible">Convertible</SelectItem>
                        <SelectItem value="Station Wagon">Station Wagon</SelectItem>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Service Details Preview */}
            {selectedService && (
              <Card className="bg-gradient-card border-primary/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 text-primary">Service Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Service</p>
                        <p className="font-medium">{selectedService.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium text-green-600">KES {selectedService.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{selectedService.duration} mins</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                <CreditCard className="w-4 h-4 mr-2" />
                Record Service
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}