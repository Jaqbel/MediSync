import { useState } from "react";
import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getInitials, formatLastVisit } from "@/lib/auth";
import { Search, Edit, Trash2, User, FileText } from "lucide-react";
import { Patient } from "@shared/schema";

interface PatientTableProps {
  onEditPatient: (patient: Patient) => void;
  onViewTreatmentHistory?: (patient: Patient) => void;
}

export default function PatientTable({ onEditPatient, onViewTreatmentHistory }: PatientTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { patients, isLoading, deletePatient, isDeleting } = usePatients();
  const { toast } = useToast();

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePatient = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await deletePatient(id);
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search patients by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Patients table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Patient</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    {searchQuery ? "No patients found matching your search" : "No patients yet"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-white text-sm font-medium">
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-500">ID: P{patient.id.toString().padStart(3, '0')}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {patient.phone && (
                        <p className="text-sm text-gray-900">{patient.phone}</p>
                      )}
                      {patient.email && (
                        <p className="text-sm text-gray-500">{patient.email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatLastVisit(patient.updatedAt.toISOString())}
                  </TableCell>
                  <TableCell>
                    <Badge className="status-active">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPatient(patient)}
                        className="text-primary hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {onViewTreatmentHistory && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewTreatmentHistory(patient)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePatient(patient.id, patient.name)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
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
