import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientTable from "@/components/patients/patient-table";
import PatientModal from "@/components/modals/patient-modal";
import TreatmentHistoryList from "@/components/treatment-history/treatment-history-list";
import { Plus, User, FileText } from "lucide-react";
import { Patient } from "@shared/schema";

export default function Patients() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("records");

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setIsModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleViewTreatmentHistory = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab("treatments");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600 mt-1">Manage patient records and treatment history</p>
        </div>
        <Button 
          onClick={handleAddPatient}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Patient Records</span>
          </TabsTrigger>
          <TabsTrigger value="treatments" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Treatment History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
          <PatientTable 
            onEditPatient={handleEditPatient}
            onViewTreatmentHistory={handleViewTreatmentHistory}
          />
        </TabsContent>

        <TabsContent value="treatments" className="space-y-6">
          {selectedPatient ? (
            <TreatmentHistoryList 
              patientId={selectedPatient.id} 
              patientName={selectedPatient.name}
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
              <p className="text-gray-600">
                Choose a patient from the Patient Records tab to view their treatment history
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PatientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        patient={selectedPatient}
      />
    </div>
  );
}
