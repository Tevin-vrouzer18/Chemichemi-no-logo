import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Edit, Trash2, History, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSupabaseQuery, useSupabaseMutation } from "@/hooks/useSupabase";
import { CustomerForm } from "@/components/forms/CustomerForm";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  last_visit: string;
  loyalty_points: number;
  total_visits: number;
  created_at: string;
}

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const { data: customers, loading, refetch } = useSupabaseQuery<Customer>('customers');
  const { remove } = useSupabaseMutation('customers');
  const { toast } = useToast();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await remove(id);
        refetch();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Last Visit', 'Loyalty Points', 'Total Visits'],
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.phone,
        customer.email,
        customer.last_visit || 'Never',
        customer.loyalty_points.toString(),
        customer.total_visits.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers.csv';
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Customer list has been exported to CSV"
    });
  };

  const onFormSuccess = () => {
    refetch();
    setSelectedCustomer(null);
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
            <Users className="w-8 h-8 text-primary" />
            Customers
          </h1>
          <p className="text-muted-foreground">
            Manage customer profiles and relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={filteredCustomers.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => {
              setSelectedCustomer(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {customers.reduce((sum, c) => sum + c.loyalty_points, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Loyalty Points</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {customers.reduce((sum, c) => sum + c.total_visits, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Visits</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
          <CardDescription>
            {filteredCustomers.length} of {customers.length} customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {customers.length === 0 ? "No customers yet" : "No customers match your search"}
                </p>
                <p className="text-sm">
                  {customers.length === 0 
                    ? "Add your first customer to get started" 
                    : "Try adjusting your search terms"
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Loyalty Points</TableHead>
                    <TableHead>Total Visits</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{customer.phone}</div>
                          {customer.email && (
                            <div className="text-xs text-muted-foreground">{customer.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.last_visit ? (
                          <Badge variant="secondary">
                            {new Date(customer.last_visit).toLocaleDateString()}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Never</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-gradient-primary">
                          {customer.loyalty_points} pts
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.total_visits}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Customer Form Modal */}
      <CustomerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        customer={selectedCustomer}
        onSuccess={onFormSuccess}
      />
    </motion.div>
  );
}