import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          if (data.user) {
            localStorage.setItem("legal-flow-user", JSON.stringify(data.user));
          }
        } else {
          localStorage.removeItem("legal-flow-user");
          setUser(null);
        }
      } catch (error) {
        // Fallback to localStorage if server is down or request fails
        const storedUser = localStorage.getItem("legal-flow-user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            localStorage.removeItem("legal-flow-user");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("DEBUG: Login response data", data);
        setUser(data.user);
        localStorage.setItem("legal-flow-user", JSON.stringify(data.user));
        return true;
      }

      const errorData = await response.json();
      console.error("Login failed:", errorData.message);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (e) {
      console.error("Logout error", e);
    }
    setUser(null);
    localStorage.removeItem("legal-flow-user");
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.user) {
          localStorage.setItem("legal-flow-user", JSON.stringify(data.user));
        } else {
          localStorage.removeItem("legal-flow-user");
          window.location.href = "/login";
        }
      } else {
        setUser(null);
        localStorage.removeItem("legal-flow-user");
        window.location.href = "/login";
      }
    } catch (e) {
      console.error("Refresh user error", e);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
