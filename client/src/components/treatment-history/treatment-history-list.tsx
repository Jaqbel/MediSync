import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Pill, FileText, Image, Plus, Eye, Trash2 } from "lucide-react";
import { useTreatmentHistory, useDeleteTreatment } from "@/hooks/use-treatment-history";
import { useInventory } from "@/hooks/use-inventory";
import { useToast } from "@/hooks/use-toast";
import TreatmentModal from "@/components/modals/treatment-modal";
import type { TreatmentHistory } from "@shared/schema";

interface TreatmentHistoryListProps {
  patientId: number;
  patientName: string;
}

export default function TreatmentHistoryList({ patientId, patientName }: TreatmentHistoryListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: treatments, isLoading } = useTreatmentHistory(patientId);
  const { medications } = useInventory();
  const deleteTreatment = useDeleteTreatment();
  const { toast } = useToast();

  const handleDeleteTreatment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this treatment record?")) {
      return;
    }

    try {
      await deleteTreatment.mutateAsync(id);
      toast({
        title: "Treatment deleted",
        description: "Treatment record has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete treatment record.",
        variant: "destructive",
      });
    }
  };

  const getMedicationName = (medicationId: number) => {
    const medication = medications?.find(med => med.id === medicationId);
    return medication ? `${medication.name} (${medication.brand})` : "Unknown Medication";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Treatment History</h2>
          <p className="text-gray-600">Medical treatment records for {patientName}</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Record Treatment</span>
        </Button>
      </div>

      {treatments && treatments.length > 0 ? (
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <Card key={treatment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(treatment.date).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="secondary">
                          {new Date(treatment.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTreatment(treatment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Pill className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        {getMedicationName(treatment.medicationId)}
                      </span>
                    </div>

                    {treatment.notes && (
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                        <p className="text-gray-700 line-clamp-2">
                          {treatment.notes.length > 150 
                            ? `${treatment.notes.substring(0, 150)}...` 
                            : treatment.notes
                          }
                        </p>
                      </div>
                    )}

                    {treatment.photoUrls && treatment.photoUrls.length > 0 && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Image className="w-4 h-4" />
                          <span>{treatment.photoUrls.length} photo(s)</span>
                        </div>
                        <div className="flex space-x-2">
                          {treatment.photoUrls.slice(0, 3).map((photoUrl, index) => (
                            <img
                              key={index}
                              src={photoUrl}
                              alt={`Treatment photo ${index + 1}`}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ))}
                          {treatment.photoUrls.length > 3 && (
                            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                              +{treatment.photoUrls.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Treatment Records</h3>
            <p className="text-gray-600 mb-6">
              Start documenting medical treatments for {patientName}
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Treatment</span>
            </Button>
          </CardContent>
        </Card>
      )}

      <TreatmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        patientId={patientId}
        patientName={patientName}
      />
    </div>
  );
}