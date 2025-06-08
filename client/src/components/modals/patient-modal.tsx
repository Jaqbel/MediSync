import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePatients } from "@/hooks/use-patients";
import { insertPatientSchema, type Patient } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const patientFormSchema = insertPatientSchema.omit({ userId: true });
type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
}

export default function PatientModal({ isOpen, onClose, patient }: PatientModalProps) {
  const { createPatient, updatePatient, isCreating, isUpdating } = usePatients();
  const { toast } = useToast();
  const isEditing = !!patient;

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      medicalHistory: "",
    },
  });

  useEffect(() => {
    if (patient) {
      form.reset({
        name: patient.name,
        phone: patient.phone || "",
        email: patient.email || "",
        dateOfBirth: patient.dateOfBirth || "",
        medicalHistory: patient.medicalHistory || "",
      });
    } else {
      form.reset({
        name: "",
        phone: "",
        email: "",
        dateOfBirth: "",
        medicalHistory: "",
      });
    }
  }, [patient, form]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (isEditing && patient) {
        await updatePatient({ id: patient.id, data });
        toast({
          title: "Success",
          description: "Patient updated successfully",
        });
      } else {
        await createPatient(data);
        toast({
          title: "Success",
          description: "Patient created successfully",
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} patient`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Patient" : "Add New Patient"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update patient information" : "Enter patient details to add them to your records"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter patient's full name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...form.register("phone")}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="patient@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...form.register("dateOfBirth")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              {...form.register("medicalHistory")}
              placeholder="Enter relevant medical history, allergies, current medications..."
              rows={4}
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
                ? (isEditing ? "Updating..." : "Creating...")
                : (isEditing ? "Update Patient" : "Add Patient")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
