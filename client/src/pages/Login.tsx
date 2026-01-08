import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Lock, User, LifeBuoy, ShieldCheck, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [adminEmail, setAdminEmail] = useState("admin@gmail.com");

  useEffect(() => {
    fetch("/api/system-settings")
      .then(res => res.json())
      .then(data => {
        if (data && data.adminEmail) {
          setAdminEmail(data.adminEmail);
        }
      })
      .catch(err => console.error("Failed to fetch system settings", err));
  }, []);

  // If already logged in, go to dashboard
  if (user) {
    return <Redirect to="/" />;
  }
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(credentials.username, credentials.password);

      if (success) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to LegalFlow.",
        });
        window.location.href = "/";
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050510] px-4 overflow-hidden relative">
      {/* Dynamic Background Elements - Using CSS Only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[150px] animate-pulse [animation-duration:8s]" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 relative group transition-transform hover:scale-110 duration-500">
            <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            <Scale className="w-12 h-12 text-white relative z-10" />
          </div>

          <h1 className="text-5xl font-black text-white tracking-tighter mb-3">
            Legal<span className="text-indigo-500">Flow</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-indigo-500/30" />
            <p className="text-indigo-200/60 font-medium tracking-wide uppercase text-xs">
              Professional Case Management
            </p>
            <div className="h-px w-8 bg-indigo-500/30" />
          </div>
        </div>

        <Card className="bg-slate-900/80 backdrop-blur-2xl border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-500" />

          <CardHeader className="space-y-2 pt-10 pb-6 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              Sign In
            </CardTitle>
            <CardDescription className="text-indigo-200/60 text-base">
              Enter your credentials to access the legal vault.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <Label htmlFor="username" className="text-sm font-semibold text-indigo-200/70 ml-1">
                  Username
                </Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-3.5 w-5 h-5 text-indigo-400 group-focus-within:text-white transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="bg-white/5 border-white/10 pl-11 h-12 text-white placeholder:text-white/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-sm font-semibold text-indigo-200/70">
                    Password
                  </Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 p-0 h-auto">
                        Forgot Password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                          <Lock className="w-5 h-5 text-indigo-500" />
                          Account Access
                        </DialogTitle>
                        <DialogDescription className="text-indigo-200/60 pt-2 text-base">
                          For security reasons, password resets must be handled by an administrator.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center py-8 space-y-6">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                          <Mail className="w-10 h-10 text-indigo-500" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-sm text-indigo-200/40 uppercase tracking-widest font-semibold">Contact Your Admin At:</p>
                          <p className="text-xl font-mono font-bold text-indigo-400 select-all">{adminEmail}</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white" onClick={() => {
                          window.location.href = `mailto:${adminEmail}?subject=Password Reset Request&body=Hello, I need assistance resetting my password for LegalFlow.`;
                        }}>
                          Send Email
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-indigo-400 group-focus-within:text-white transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="bg-white/5 border-white/10 pl-11 h-12 text-white placeholder:text-white/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Access Portal</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-6 text-indigo-200/10 grayscale opacity-30">
          <div className="text-xs font-medium cursor-default">v1.2.0</div>
          <div className="w-1 h-1 bg-white/10 rounded-full" />
          <div className="text-xs font-medium cursor-pointer hover:text-white transition-colors">Security Policy</div>
        </div>
      </div>
    </div>
  );
}
