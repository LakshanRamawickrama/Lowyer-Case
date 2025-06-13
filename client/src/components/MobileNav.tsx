import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Folder, 
  Users, 
  Bell, 
  User, 
  Moon, 
  Sun, 
  LogOut,
  Scale
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Cases", href: "/cases", icon: Folder },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
];

export function MobileNav() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">LegalFlow</span>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-white hover:bg-red-600"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 px-4 py-2 z-50">
        <div className="flex justify-around">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex flex-col items-center py-2 transition-colors",
                    isActive
                      ? "text-indigo-500"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{item.name}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
