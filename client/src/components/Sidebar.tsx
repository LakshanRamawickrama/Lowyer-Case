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
  Scale,
  Monitor
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Cases", href: "/cases", icon: Folder },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4 border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">LegalFlow</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location === item.href ||
                    (item.href !== "/" && location.startsWith(item.href));

                  return (
                    <li key={item.name}>
                      <Link href={item.href}>
                        <a
                          className={cn(
                            isActive
                              ? "bg-indigo-600 text-white"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                            "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.name}
                        </a>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* Theme Toggle & Logout */}
            <li className="mt-auto space-y-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => {
                  if (theme === "light") setTheme("dark");
                  else if (theme === "dark") setTheme("system");
                  else setTheme("light");
                }}
              >
                {theme === "light" ? (
                  <div className="flex items-center">
                    <Sun className="h-4 w-4 mr-3" />
                    <span>Light Mode</span>
                  </div>
                ) : theme === "dark" ? (
                  <div className="flex items-center">
                    <Moon className="h-4 w-4 mr-3" />
                    <span>Dark Mode</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Monitor className="h-4 w-4 mr-3" />
                    <span>System Mode</span>
                  </div>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-red-500 hover:bg-red-500/10"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
