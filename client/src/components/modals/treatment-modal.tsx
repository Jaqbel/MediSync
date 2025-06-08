import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, X, Calendar, Pill, FileText, Image } from "lucide-react";
import { useInventory } from "@/hooks/use-inventory";
import { useCreateTreatment, useUploadTreatmentPhotos } from "@/hooks/use-treatment-history";
import { useToast } from "@/hooks/use-toast";
import type { TreatmentHistory } from "@shared/schema";

const treatmentFormSchema = z.object({
  medicationId: z.number().min(1, "Please select a medication"),
  date: z.string().min(1, "Please select a date"),
  notes: z.string().optional(),
  photoUrls: z.array(z.string()).optional(),
});

type TreatmentFormData = z.infer<typeof treatmentFormSchema>;

interface TreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
  treatment?: TreatmentHistory | null;
}

export default function TreatmentModal({ 
  isOpen, 
  onClose, 
  patientId, 
  patientName,
  treatment 
}: TreatmentModalProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(treatment?.photoUrls || []);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  
  const { medications } = useInventory();
  const createTreatment = useCreateTreatment(patientId);
  const uploadPhotos = useUploadTreatmentPhotos();
  const { toast } = useToast();

  const form = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues: {
      medicationId: treatment?.medicationId || undefined,
      date: treatment ? new Date(treatment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: treatment?.notes || "",
      photoUrls: treatment?.photoUrls || [],
    },
  });

  const onSubmit = async (data: TreatmentFormData) => {
    try {
      await createTreatment.mutateAsync({
        ...data,
        photoUrls: selectedPhotos,
      });

      toast({
        title: "Treatment recorded",
        description: "Treatment history has been successfully recorded.",
      });

      onClose();
      form.reset();
      setSelectedPhotos([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record treatment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = async () => {
    try {
      setUploadingPhotos(true);
      const photoCount = Math.floor(Math.random() * 3) + 1; // Simulate 1-3 photos
      const result = await uploadPhotos.mutateAsync(photoCount);
      setSelectedPhotos(prev => [...prev, ...result.photoUrls]);
      
      toast({
        title: "Photos uploaded",
        description: `${result.photoUrls.length} photo(s) uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const selectedMedication = medications?.find(med => med.id === form.watch("medicationId"));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Record Treatment for {patientName}</span>
          </DialogTitle>
          <DialogDescription>
            Document medication administration with clinical notes and photos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Treatment Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Treatment Date</span>
            </Label>
            <Input
              id="date"
              type="date"
              {...form.register("date")}
              className="w-full"
            />
            {form.formState.errors.date && (
              <p className="text-sm text-red-600">{form.formState.errors.date.message}</p>
            )}
          </div>

          {/* Medication Selection */}
          <div className="space-y-2">
            <Label htmlFor="medication" className="flex items-center space-x-2">
              <Pill className="w-4 h-4" />
              <span>Medication Administered</span>
            </Label>
            <Select
              value={form.watch("medicationId")?.toString() || ""}
              onValueChange={(value) => form.setValue("medicationId", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                {medications?.map((medication) => (
                  <SelectItem key={medication.id} value={medication.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{medication.name}</span>
                      <span className="text-sm text-gray-500">
                        {medication.brand} • {medication.category.replace('-', ' ')}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.medicationId && (
              <p className="text-sm text-red-600">{form.formState.errors.medicationId.message}</p>
            )}
            
            {selectedMedication && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-blue-900">{selectedMedication.name}</h4>
                    <p className="text-sm text-blue-700">
                      Brand: {selectedMedication.brand} • Category: {selectedMedication.category.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-blue-700">
                      Stock: {selectedMedication.quantity} units • Expires: {selectedMedication.expirationDate}
                    </p>
                  </div>
                  <Badge variant={selectedMedication.quantity > selectedMedication.minStock ? "secondary" : "destructive"}>
                    {selectedMedication.quantity > selectedMedication.minStock ? "In Stock" : "Low Stock"}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Clinical Notes</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Enter clinical observations, dosage, patient response, etc."
              rows={4}
              {...form.register("notes")}
            />
          </div>

          {/* Photo Documentation */}
          <div className="space-y-4">
            <Label className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Photo Documentation</span>
            </Label>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePhotoUpload}
                disabled={uploadingPhotos}
                className="flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>{uploadingPhotos ? "Uploading..." : "Take Photos"}</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handlePhotoUpload}
                disabled={uploadingPhotos}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Files</span>
              </Button>
            </div>

            {selectedPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedPhotos.map((photoUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photoUrl}
                      alt={`Treatment photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTreatment.isPending}
              className="flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>{createTreatment.isPending ? "Recording..." : "Record Treatment"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}