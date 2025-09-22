import { useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, Plus, Search, Filter, Edit, Trash2, Users, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseQuery, useSupabaseMutation } from "@/hooks/useSupabase";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { data: employees, loading, refetch } = useSupabaseQuery('employees', '*, profiles(name, email, phone)');
  const { remove } = useSupabaseMutation('employees');
  const { toast } = useToast();

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-500/20 text-green-700 dark:text-green-400'
      : 'bg-red-500/20 text-red-700 dark:text-red-400';
  };

  const filteredEmployees = employees?.filter(employee => {
    const name = employee.profiles?.name || '';
    const email = employee.profiles?.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'all' || employee.position === positionFilter;
    return matchesSearch && matchesPosition;
  }) || [];

  const positions = [...new Set(employees?.map(emp => emp.position) || [])];
  const activeEmployees = employees?.filter(emp => emp.is_active).length || 0;
  const totalSalary = employees?.filter(emp => emp.is_active).reduce((sum, emp) => sum + (emp.salary || 0), 0) || 0;

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await remove(id);
        toast({
          title: "Success",
          description: "Employee record deleted successfully"
        });
        refetch();
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast({
          title: "Error",
          description: "Failed to delete employee. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setSelectedEmployee(null);
  };

  const getShiftDisplay = (shiftSchedule: any) => {
    if (!shiftSchedule || !shiftSchedule.shift) return "Not set";
    const shiftMap = {
      morning: "Morning (6AM - 2PM)",
      afternoon: "Afternoon (2PM - 10PM)",
      night: "Night (10PM - 6AM)",
      flexible: "Flexible"
    };
    return shiftMap[shiftSchedule.shift] || shiftSchedule.shift;
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
            <UserCheck className="w-8 h-8 text-primary" />
            Employees
          </h1>
          <p className="text-muted-foreground">
            Manage staff and work schedules
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => {
            setSelectedEmployee(null);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Employees</p>
                <p className="text-2xl font-bold text-primary">{activeEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-primary">{employees?.length || 0}</p>
              </div>
              <UserCheck className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Payroll</p>
                <p className="text-2xl font-bold text-primary">KES {totalSalary.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Management */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Staff Management</CardTitle>
          <CardDescription>
            Handle employee information and scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map(position => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">
                            {employee.profiles?.name || "Name not available"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee.profiles?.email || "Email not available"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee.profiles?.phone || "Phone not available"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{new Date(employee.hire_date).toLocaleDateString()}</TableCell>
                      <TableCell>KES {employee.salary?.toLocaleString() || "N/A"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getShiftDisplay(employee.shift_schedule)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(employee.is_active)}>
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(employee)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(employee.id)}
                            className="text-destructive hover:text-destructive"
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
              <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No employees found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || positionFilter !== 'all'
                  ? "Try adjusting your search criteria to find employees"
                  : "Get started by adding your first employee to begin managing your team"}
              </p>
              <Button 
                onClick={() => {
                  setSelectedEmployee(null);
                  setShowForm(true);
                }}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Employee
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeForm
        open={showForm}
        onOpenChange={setShowForm}
        employee={selectedEmployee}
        onSuccess={handleFormSuccess}
      />
    </motion.div>
  );
}