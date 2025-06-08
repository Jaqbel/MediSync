import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDashboardAlerts } from "@/hooks/use-inventory";
import { usePatients } from "@/hooks/use-patients";
import { getInitials, formatLastVisit } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Calendar, Info, User, ArrowRight } from "lucide-react";

export default function RecentActivity() {
  const { data: alerts, isLoading: alertsLoading } = useDashboardAlerts();
  const { patients, isLoading: patientsLoading } = usePatients();

  const recentPatients = patients.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Patients */}
      <Card className="border border-gray-100">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Patients</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {patientsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentPatients.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No patients yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-white text-sm font-medium">
                        {getInitials(patient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">
                        Last visit: {formatLastVisit(patient.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      <Card className="border border-gray-100">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-900">Critical Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {alertsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {alerts?.expiringSoon?.map((medication) => (
                <div key={medication.id} className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <Calendar className="w-5 h-5 text-amber-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-900">{medication.name} expires soon</p>
                    <p className="text-sm text-amber-700">
                      Expires: {new Date(medication.expirationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {alerts?.lowStock?.map((medication) => (
                <div key={medication.id} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">{medication.name} stock is low</p>
                    <p className="text-sm text-red-700">
                      Only {medication.quantity} units remaining
                    </p>
                  </div>
                </div>
              ))}

              {(!alerts?.expiringSoon?.length && !alerts?.lowStock?.length) && (
                <div className="text-center py-8">
                  <Info className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No critical alerts</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
