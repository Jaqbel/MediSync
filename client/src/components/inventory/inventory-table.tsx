import { useState } from "react";
import { useInventory } from "@/hooks/use-inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit, Plus, Pill } from "lucide-react";
import { Medication } from "@shared/schema";

const CATEGORIES = [
  "antibiotics",
  "pain-relief", 
  "heart-medication",
  "diabetes",
  "respiratory",
  "other"
];

interface InventoryTableProps {
  onEditMedication: (medication: Medication) => void;
}

export default function InventoryTable({ onEditMedication }: InventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { medications, isLoading, deleteMedication, isDeleting } = useInventory();
  const { toast } = useToast();

  const getStockStatus = (medication: Medication) => {
    const daysToExpiry = Math.ceil(
      (new Date(medication.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysToExpiry <= 30) return "expiring";
    if (medication.quantity <= medication.minStock) return "low";
    return "in-stock";
  };

  const filteredMedications = medications.filter((medication) => {
    const matchesSearch = 
      medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || medication.category === categoryFilter;
    
    const status = getStockStatus(medication);
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "in-stock" && status === "in-stock") ||
      (statusFilter === "low-stock" && status === "low") ||
      (statusFilter === "expiring" && status === "expiring");
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteMedication = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await deleteMedication(id);
      toast({
        title: "Success",
        description: "Medication deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete medication",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (medication: Medication) => {
    const status = getStockStatus(medication);
    
    switch (status) {
      case "expiring":
        return <Badge className="stock-expiring">Expiring Soon</Badge>;
      case "low":
        return <Badge className="stock-low">Low Stock</Badge>;
      default:
        return <Badge className="stock-in-stock">In Stock</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">
                {medications.filter(m => getStockStatus(m) === "low").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Pill className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-red-600">
                {medications.filter(m => getStockStatus(m) === "expiring").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Pill className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search medications by name, brand, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Medication</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Pill className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    {searchQuery || categoryFilter !== "all" || statusFilter !== "all" 
                      ? "No medications found matching your filters" 
                      : "No medications in inventory yet"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredMedications.map((medication) => (
                <TableRow key={medication.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Pill className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{medication.name}</p>
                        {medication.brand && (
                          <p className="text-sm text-gray-500">{medication.brand}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 capitalize">
                    {medication.category.replace('-', ' ')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{medication.quantity} units</p>
                      <p className="text-sm text-gray-500">Min: {medication.minStock} units</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(medication.expirationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(medication)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditMedication(medication)}
                        className="text-primary hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditMedication({ ...medication, quantity: medication.quantity + 10 })}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
