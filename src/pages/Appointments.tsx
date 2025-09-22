import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Search, Filter, Edit, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseQuery, useSupabaseMutation } from "@/hooks/useSupabase";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { useToast } from "@/hooks/use-toast";

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Handle quick actions from dashboard
  useEffect(() => {
    const quickAction = sessionStorage.getItem('quickAction');
    if (quickAction === 'new-appointment') {
      setShowForm(true);
      sessionStorage.removeItem('quickAction');
    }
  }, []);

  const { data: appointments, loading, refetch } = useSupabaseQuery(
    'appointments', 
    '*, customers(name, phone), services(name, price), vehicles(make, model, plate_number)'
  );
  const { remove } = useSupabaseMutation('appointments');
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'confirmed': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'in_progress': return 'bg-purple-500/20 text-purple-700 dark:text-purple-400';
      case 'completed': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-700 dark:text-red-400';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'confirmed': return <CheckCircle className="w-3 h-3" />;
      case 'in_progress': return <AlertCircle className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'cancelled': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const filteredAppointments = appointments?.filter(appointment => {
    const matchesSearch = appointment.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.services?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      try {
        await remove(id);
        toast({
          title: "Success",
          description: "Appointment deleted successfully"
        });
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setSelectedAppointment(null);
  };

  const upcomingAppointments = appointments?.filter(a => 
    new Date(a.scheduled_date) > new Date() && a.status !== 'cancelled'
  ).length || 0;

  const todayAppointments = appointments?.filter(a => {
    const today = new Date();
    const appointmentDate = new Date(a.scheduled_date);
    return appointmentDate.toDateString() === today.toDateString();
  }).length || 0;

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
            <Calendar className="w-8 h-8 text-primary" />
            Appointments
          </h1>
          <p className="text-muted-foreground">
            Manage car wash appointments and scheduling
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => {
            setSelectedAppointment(null);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold text-primary">{todayAppointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-primary">{upcomingAppointments}</p>
              </div>
              <Clock className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold text-primary">{appointments?.length || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Appointment Management</CardTitle>
          <CardDescription>
            View and manage all scheduled appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by customer or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.customers?.name}</div>
                          <div className="text-sm text-muted-foreground">{appointment.customers?.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.services?.name}</TableCell>
                      <TableCell>
                        {appointment.vehicles ? (
                          `${appointment.vehicles.make} ${appointment.vehicles.model} - ${appointment.vehicles.plate_number}`
                        ) : (
                          <span className="text-muted-foreground">No vehicle specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(appointment.scheduled_date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status.replace('_', ' ')}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>KES {appointment.total_amount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(appointment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(appointment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No appointments found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? "Try adjusting your search criteria"
                  : "Get started by scheduling your first appointment"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentForm
        open={showForm}
        onOpenChange={setShowForm}
        appointment={selectedAppointment}
        onSuccess={handleFormSuccess}
      />
    </motion.div>
  );
}