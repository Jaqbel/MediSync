import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  Pill, 
  BarChart3, 
  Settings, 
  Wifi, 
  WifiOff 
} from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Drug Inventory", href: "/inventory", icon: Pill },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer",
                    isActive
                      ? "text-primary bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Connection status */}
      <div className="mx-6 mb-6">
        <div className={cn(
          "flex items-center px-3 py-2 rounded-lg text-sm",
          isOnline 
            ? "bg-green-50 text-green-700"
            : "bg-orange-50 text-orange-700"
        )}>
          {isOnline ? (
            <Wifi className="w-4 h-4 mr-2" />
          ) : (
            <WifiOff className="w-4 h-4 mr-2" />
          )}
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
    </aside>
  );
}
