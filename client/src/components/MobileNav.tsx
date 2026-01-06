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
  Monitor,
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
      <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">LegalFlow</span>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => {
              if (theme === "light") setTheme("dark");
              else if (theme === "dark") setTheme("system");
              else setTheme("light");
            }}
          >
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
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
                      ? "text-indigo-600 dark:text-indigo-500"
                      : "text-muted-foreground hover:text-foreground"
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
