import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Search, Clock, DollarSign, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSupabaseQuery } from "@/hooks/useSupabase";
import { ServiceRecordForm } from "@/components/forms/ServiceRecordForm";
import { format } from "date-fns";

interface ServiceRecord {
  id: string;
  service_id: string;
  employee_id: string;
  vehicle_plate: string;
  vehicle_type: string;
  payment_method: string;
  service_price: number;
  service_duration: number;
  completed_at: string;
  created_at: string;
  services?: {
    name: string;
  };
  employees?: {
    profiles?: {
      name: string;
    };
  };
}

export default function ServiceRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { data: serviceRecords, loading, refetch } = useSupabaseQuery<ServiceRecord>(
    'service_records',
    `
      *,
      services!inner(name),
      employees!inner(
        profiles!inner(name)
      )
    `
  );

  const filteredRecords = serviceRecords.filter(record =>
    record.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.services?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.employees?.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onFormSuccess = () => {
    refetch();
  };

  const getTotalRevenue = () => {
    return serviceRecords.reduce((total, record) => total + Number(record.service_price), 0);
  };

  const getTodayRecords = () => {
    const today = new Date().toDateString();
    return serviceRecords.filter(record => 
      new Date(record.completed_at).toDateString() === today
    ).length;
  };

  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Service Records
          </h1>
          <p className="text-muted-foreground">
            Record and track daily carwash services
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Service
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Services</p>
                <p className="text-2xl font-bold text-primary">{getTodayRecords()}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                <p className="text-2xl font-bold text-primary">{serviceRecords.length}</p>
              </div>
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">KES {getTotalRevenue().toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Service Records</CardTitle>
          <CardDescription>
            View and track all completed carwash services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : serviceRecords.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No service records yet</p>
                <p className="text-sm">Record your first service to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by plate number, vehicle type, service, or employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(record.completed_at), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-muted-foreground">
                              {format(new Date(record.completed_at), 'hh:mm a')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{record.services?.name}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{record.vehicle_plate}</div>
                            <div className="text-muted-foreground">{record.vehicle_type}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{record.employees?.profiles?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={record.payment_method === 'mpesa' ? 'default' : 'secondary'}>
                            {record.payment_method.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">
                            KES {Number(record.service_price).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{record.service_duration} mins</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceRecordForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={onFormSuccess}
      />
    </motion.div>
  );
}