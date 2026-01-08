import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Cases from "@/pages/Cases";
import Clients from "@/pages/Clients";
import Reminders from "@/pages/Reminders";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  console.log("DEBUG: ProtectedRoute", { user: !!user, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-b-purple-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-white text-xl font-bold tracking-tight animate-pulse">LegalFlow</h2>
          <p className="text-indigo-400/60 font-medium tracking-[0.2em] uppercase text-[10px]">
            Initializing Secure Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("DEBUG: No user found, redirecting to login");
    return <Redirect to="/login" />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/cases" component={() => <ProtectedRoute component={Cases} />} />
      <Route path="/clients" component={() => <ProtectedRoute component={Clients} />} />
      <Route path="/reminders" component={() => <ProtectedRoute component={Reminders} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
