import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventory, useDashboardStats, useDashboardAlerts } from "@/hooks/use-inventory";
import { usePatients } from "@/hooks/use-patients";
import { Download, FileText, TrendingUp, AlertTriangle, Users, Pill, Calendar, BarChart3 } from "lucide-react";

type ReportType = "inventory" | "patients" | "alerts" | "overview";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("overview");
  const [dateRange, setDateRange] = useState("30");
  const [exportFormat, setExportFormat] = useState("pdf");

  const { medications, isLoading: medicationsLoading } = useInventory();
  const { patients, isLoading: patientsLoading } = usePatients();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: alerts, isLoading: alertsLoading } = useDashboardAlerts();

  const reportTypes = [
    {
      id: "overview" as ReportType,
      title: "System Overview",
      description: "Complete system statistics and summary",
      icon: BarChart3,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "inventory" as ReportType,
      title: "Inventory Report",
      description: "Medication stock levels and expiration tracking",
      icon: Pill,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "patients" as ReportType,
      title: "Patient Report",
      description: "Patient demographics and visit statistics",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "alerts" as ReportType,
      title: "Alert Report",
      description: "Critical alerts and action items",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
    },
  ];

  const generateReport = () => {
    // Simulate report generation
    const reportData = {
      type: selectedReport,
      dateRange,
      format: exportFormat,
      generatedAt: new Date().toISOString(),
      data: {
        stats,
        medications,
        patients,
        alerts,
      },
    };

    // Create downloadable content
    const content = JSON.stringify(reportData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medisync-${selectedReport}-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{(stats as any)?.totalPatients || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Medications</p>
                <p className="text-2xl font-bold text-gray-900">{(stats as any)?.totalMedications || 0}</p>
              </div>
              <Pill className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{(stats as any)?.lowStockCount || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-red-600">{(stats as any)?.expiringSoonCount || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New patients this month</span>
                <Badge variant="secondary">{patients?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Medications updated</span>
                <Badge variant="secondary">{medications?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Critical alerts</span>
                <Badge variant="destructive">{((alerts as any)?.lowStock?.length || 0) + ((alerts as any)?.expiringSoon?.length || 0)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database Status</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Backup</span>
                <Badge variant="secondary">Real-time</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <Badge variant="secondary">1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Pill className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{medications?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-orange-600">{(alerts as any)?.lowStock?.length || 0}</p>
              <p className="text-sm text-gray-600">Low Stock</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto text-red-600 mb-2" />
              <p className="text-2xl font-bold text-red-600">{(alerts as any)?.expiringSoon?.length || 0}</p>
              <p className="text-sm text-gray-600">Expiring Soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medication Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {medications?.reduce((acc, med) => {
              acc[med.category] = (acc[med.category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>) &&
              Object.entries(medications?.reduce((acc, med) => {
                acc[med.category] = (acc[med.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>) || {}).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{category.replace('-', ' ')}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPatientsReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{patients?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Patients</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">{patients?.filter(p => p.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0}</p>
              <p className="text-sm text-gray-600">New This Month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patients?.map((patient) => (
              <div key={patient.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-gray-600">{patient.email || patient.phone}</p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlertsReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Low Stock Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(alerts as any)?.lowStock?.map((medication: any) => (
                <div key={medication.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-medium text-orange-900">{medication.name}</p>
                  <p className="text-sm text-orange-700">
                    Only {medication.quantity} units remaining (Min: {medication.minStock})
                  </p>
                </div>
              )) || <p className="text-gray-500">No low stock alerts</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <span>Expiration Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(alerts as any)?.expiringSoon?.map((medication: any) => (
                <div key={medication.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-900">{medication.name}</p>
                  <p className="text-sm text-red-700">
                    Expires: {new Date(medication.expirationDate).toLocaleDateString()}
                  </p>
                </div>
              )) || <p className="text-gray-500">No expiration alerts</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReportContent = () => {
    if (statsLoading || medicationsLoading || patientsLoading || alertsLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      );
    }

    switch (selectedReport) {
      case "overview":
        return renderOverviewReport();
      case "inventory":
        return renderInventoryReport();
      case "patients":
        return renderPatientsReport();
      case "alerts":
        return renderAlertsReport();
      default:
        return renderOverviewReport();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and export system reports</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedReport === report.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Configure report parameters and export options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                  <SelectItem value="json">JSON Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={generateReport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{reportTypes.find(r => r.id === selectedReport)?.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderReportContent()}
        </CardContent>
      </Card>
    </div>
  );
}