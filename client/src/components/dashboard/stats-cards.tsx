import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-inventory";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Pill, AlertTriangle, Calendar } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Patients",
      value: stats?.totalPatients || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12 this month",
      changeColor: "text-green-600",
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "Needs attention",
      changeColor: "text-orange-600",
    },
    {
      title: "Expiring Soon",
      value: stats?.expiringSoonCount || 0,
      icon: Calendar,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: "Within 30 days",
      changeColor: "text-red-600",
    },
    {
      title: "Total Medications",
      value: stats?.totalMedications || 0,
      icon: Pill,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "In stock",
      changeColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${card.changeColor}`}>
                  {card.change}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
