import { useState } from "react";
import { Button } from "@/components/ui/button";
import InventoryTable from "@/components/inventory/inventory-table";
import MedicationModal from "@/components/modals/medication-modal";
import { Plus } from "lucide-react";
import { Medication } from "@shared/schema";

export default function Inventory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  const handleAddMedication = () => {
    setSelectedMedication(null);
    setIsModalOpen(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMedication(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Drug Inventory</h1>
          <p className="text-gray-600 mt-1">Manage your medication stock</p>
        </div>
        <Button 
          onClick={handleAddMedication}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </Button>
      </div>

      {/* Inventory table */}
      <InventoryTable onEditMedication={handleEditMedication} />

      {/* Medication modal */}
      <MedicationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        medication={selectedMedication}
      />
    </div>
  );
}
