import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Lock, User, ShieldCheck, Mail } from "lucide-react";
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
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [adminEmail, setAdminEmail] = useState("admin@gmail.com");
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    fetch("/api/system-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.adminEmail) {
          setAdminEmail(data.adminEmail);
        }
      })
      .catch((err) => console.error("Failed to fetch system settings", err));
  }, []);

  if (user) {
    return <Redirect to="/" />;
  }

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
    <div className="h-screen w-screen overflow-hidden bg-[#050510] flex relative">
      <style>
        {`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-left {
            animation: slideInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-slide-right {
            animation: slideInRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse [animation-duration:8s]" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]" />
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 relative z-10 animate-slide-left">
        <div className="relative group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
          <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 relative z-10 mb-8 transform group-hover:scale-105 transition-transform duration-500">
            <Scale className="w-16 h-16 text-white" />
          </div>
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter mb-4 text-center">
          Legal<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Flow</span>
        </h1>
        <p className="text-indigo-200/60 text-lg font-medium tracking-wide uppercase text-center max-w-md">
          Professional Case Management System
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative z-10 bg-slate-900/0 backdrop-blur-sm lg:backdrop-blur-none animate-slide-right">
        <div className="w-full max-w-md">
          {/* Mobile Branding (Visible only on small screens) */}
          <div className="lg:hidden text-center mb-8 animate-slide-left">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Legal<span className="text-indigo-500">Flow</span>
            </h1>
          </div>

          <Card className="bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

            <CardContent className="p-8">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-indigo-200/60 text-sm">Please sign in to your admin account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-semibold text-indigo-200/70 ml-1 uppercase tracking-wider">
                    Username
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-3 w-5 h-5 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      className="bg-white/5 border-white/10 pl-11 h-11 text-white placeholder:text-white/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-xs font-semibold text-indigo-200/70 uppercase tracking-wider">
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
                          <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Lock className="w-5 h-5 text-indigo-500" />
                            Account Recovery
                          </DialogTitle>
                          <DialogDescription className="text-indigo-200/60 pt-2">
                            Please contact the administrator to reset your password.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center py-6 space-y-4">
                          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                            <Mail className="w-8 h-8 text-indigo-500" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-xs text-indigo-200/40 uppercase tracking-widest font-bold">Admin Email</p>
                            <p className="text-lg font-mono font-bold text-indigo-400 select-all">{adminEmail}</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white" onClick={() => {
                            window.location.href = `mailto:${adminEmail}?subject=Password Reset Request&body=I need assistance resetting my password for LegalFlow.`;
                          }}>
                            Send Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-3 w-5 h-5 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="bg-white/5 border-white/10 pl-11 h-11 text-white placeholder:text-white/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all rounded-lg"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold h-11 rounded-lg shadow-lg shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center gap-2 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-indigo-200/20 font-mono">
              Secure System v1.2.0 • Protected by 256-bit Encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
