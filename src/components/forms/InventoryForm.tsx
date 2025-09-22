import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabaseMutation } from "@/hooks/useSupabase";

interface InventoryItem {
  id?: string;
  name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  cost_per_unit: number;
  supplier?: string;
}

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSuccess?: () => void;
}

const INVENTORY_CATEGORIES = [
  'Cleaning Supplies',
  'Equipment',
  'Tools',
  'Chemicals',
  'Accessories',
  'Safety Equipment',
  'Other'
];

const UNITS = [
  'pieces',
  'bottles',
  'liters',
  'kilograms',
  'boxes',
  'rolls',
  'sets'
];

export function InventoryForm({ open, onOpenChange, item, onSuccess }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    category: item?.category || "",
    current_stock: item?.current_stock || 0,
    minimum_stock: item?.minimum_stock || 0,
    unit: item?.unit || "",
    cost_per_unit: item?.cost_per_unit || 0,
    supplier: item?.supplier || ""
  });
  const [loading, setLoading] = useState(false);
  
  const { insert, update } = useSupabaseMutation('inventory');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        last_restocked: new Date().toISOString().split('T')[0]
      };

      if (item?.id) {
        await update(item.id, dataToSave);
      } else {
        await insert(dataToSave);
      }
      
      onOpenChange(false);
      onSuccess?.();
      setFormData({
        name: "",
        category: "",
        current_stock: 0,
        minimum_stock: 0,
        unit: "",
        cost_per_unit: 0,
        supplier: ""
      });
    } catch (error) {
      console.error('Error saving inventory item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Inventory Item" : "Add New Item"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Item name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {INVENTORY_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Current Stock</Label>
              <Input
                id="current_stock"
                name="current_stock"
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Minimum Stock</Label>
              <Input
                id="minimum_stock"
                name="minimum_stock"
                type="number"
                min="0"
                value={formData.minimum_stock}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map(unit => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">Cost per Unit (KES)</Label>
              <Input
                id="cost_per_unit"
                name="cost_per_unit"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost_per_unit}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier (Optional)</Label>
            <Input
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              placeholder="Supplier name"
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
              {loading ? "Saving..." : (item ? "Update" : "Add Item")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}