import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInventory } from "@/hooks/use-inventory";
import { insertMedicationSchema, type Medication } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const medicationFormSchema = insertMedicationSchema.omit({ userId: true });
type MedicationFormData = z.infer<typeof medicationFormSchema>;

const CATEGORIES = [
  { value: "antibiotics", label: "Antibiotics" },
  { value: "pain-relief", label: "Pain Relief" },
  { value: "heart-medication", label: "Heart Medication" },
  { value: "diabetes", label: "Diabetes" },
  { value: "respiratory", label: "Respiratory" },
  { value: "other", label: "Other" },
];

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication?: Medication | null;
}

export default function MedicationModal({ isOpen, onClose, medication }: MedicationModalProps) {
  const { createMedication, updateMedication, isCreating, isUpdating } = useInventory();
  const { toast } = useToast();
  const isEditing = !!medication;

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: "",
      brand: "",
      category: "",
      quantity: 0,
      minStock: 0,
      expirationDate: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (medication) {
      form.reset({
        name: medication.name,
        brand: medication.brand || "",
        category: medication.category,
        quantity: medication.quantity,
        minStock: medication.minStock,
        expirationDate: medication.expirationDate,
        notes: medication.notes || "",
      });
    } else {
      form.reset({
        name: "",
        brand: "",
        category: "",
        quantity: 0,
        minStock: 0,
        expirationDate: "",
        notes: "",
      });
    }
  }, [medication, form]);

  const onSubmit = async (data: MedicationFormData) => {
    try {
      if (isEditing && medication) {
        await updateMedication({ id: medication.id, data });
        toast({
          title: "Success",
          description: "Medication updated successfully",
        });
      } else {
        await createMedication(data);
        toast({
          title: "Success",
          description: "Medication added to inventory",
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'add'} medication`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Medication" : "Add Medication to Inventory"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update medication information" : "Enter medication details to add to your inventory"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medication Name *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g., Aspirin 325mg"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand/Manufacturer</Label>
            <Input
              id="brand"
              {...form.register("brand")}
              placeholder="e.g., Bayer Healthcare"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(value) => form.setValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                {...form.register("quantity", { valueAsNumber: true })}
                placeholder="0"
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Min. Stock Level *</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                {...form.register("minStock", { valueAsNumber: true })}
                placeholder="0"
              />
              {form.formState.errors.minStock && (
                <p className="text-sm text-red-600">{form.formState.errors.minStock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expirationDate">Expiration Date *</Label>
            <Input
              id="expirationDate"
              type="date"
              {...form.register("expirationDate")}
            />
            {form.formState.errors.expirationDate && (
              <p className="text-sm text-red-600">{form.formState.errors.expirationDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional notes, storage requirements, etc."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating
                ? (isEditing ? "Updating..." : "Adding...")
                : (isEditing ? "Update Medication" : "Add to Inventory")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
