import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Search, Filter, Edit, Trash2, AlertTriangle, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseQuery, useSupabaseMutation } from "@/hooks/useSupabase";
import { InventoryForm } from "@/components/forms/InventoryForm";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: inventory, loading, refetch } = useSupabaseQuery('inventory');
  const { remove } = useSupabaseMutation('inventory');
  const { toast } = useToast();

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { status: 'out-of-stock', color: 'bg-red-500/20 text-red-700 dark:text-red-400' };
    if (current <= minimum) return { status: 'low-stock', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' };
    return { status: 'in-stock', color: 'bg-green-500/20 text-green-700 dark:text-green-400' };
  };

  const filteredInventory = inventory?.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = [...new Set(inventory?.map(item => item.category) || [])];
  const lowStockItems = inventory?.filter(item => item.current_stock <= item.minimum_stock).length || 0;
  const outOfStockItems = inventory?.filter(item => item.current_stock === 0).length || 0;
  const totalValue = inventory?.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0) || 0;

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await remove(id);
        toast({
          title: "Success",
          description: "Inventory item deleted successfully"
        });
      } catch (error) {
        console.error('Error deleting inventory item:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setSelectedItem(null);
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
            <Package className="w-8 h-8 text-primary" />
            Inventory
          </h1>
          <p className="text-muted-foreground">
            Manage stock levels and supplies
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => {
            setSelectedItem(null);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-primary">{inventory?.length || 0}</p>
              </div>
              <Package className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-primary">KES {totalValue.toLocaleString()}</p>
              </div>
              <Package className="w-8 h-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Management */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Stock Management</CardTitle>
          <CardDescription>
            Track inventory levels and supply needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredInventory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Minimum Stock</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Cost per Unit</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const stockStatus = getStockStatus(item.current_stock, item.minimum_stock);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.current_stock}</TableCell>
                        <TableCell>{item.minimum_stock}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>KES {item.cost_per_unit}</TableCell>
                        <TableCell>{item.supplier || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            {stockStatus.status === 'out-of-stock' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {stockStatus.status === 'low-stock' && <TrendingDown className="w-3 h-3 mr-1" />}
                            <span className="capitalize">{stockStatus.status.replace('-', ' ')}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No inventory items found</h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== 'all'
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first inventory item"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <InventoryForm
        open={showForm}
        onOpenChange={setShowForm}
        item={selectedItem}
        onSuccess={handleFormSuccess}
      />
    </motion.div>
  );
}