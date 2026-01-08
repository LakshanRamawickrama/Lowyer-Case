import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

const profileUpdateSchema = insertUserSchema.pick({
  fullName: true,
  email: true,
  phone: true,
  barNumber: true,
  practiceAreas: true,
}).extend({
  fullName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  barNumber: z.string().optional(),
  practiceAreas: z.string().optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
type PasswordChangeData = z.infer<typeof passwordChangeSchema>;

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profileForm = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      barNumber: user?.barNumber || "",
      practiceAreas: user?.practiceAreas || "",
    },
  });

  const passwordForm = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      if (!user) throw new Error("User not found");
      const response = await apiRequest("PUT", `/api/user/${user.id}`, data);
      return response.json();
    },
    onSuccess: async () => {
      await refreshUser();
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeData) => {
      if (!user) throw new Error("User not found");
      const response = await apiRequest("PUT", `/api/user/${user.id}`, {
        password: data.newPassword,
      });
      return response.json();
    },
    onSuccess: async () => {
      await refreshUser();
      toast({
        title: "Success",
        description: "Password changed successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("User not found");
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`/api/user/${user.id}`, {
        method: "PUT",
        body: formData,
        // Don't set Content-Type, browser will set it with boundary
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to upload avatar");
      }

      return response.json();
    },
    onSuccess: async () => {
      await refreshUser();
      toast({
        title: "Success",
        description: "Avatar updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar.",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = (data: ProfileUpdateData) => {
    updateProfileMutation.mutate(data);
  };

  const handlePasswordChange = (data: PasswordChangeData) => {
    changePasswordMutation.mutate(data);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="premium-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xl font-semibold text-foreground">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20">
                  {user.avatar && <AvatarImage src={user.avatar} className="object-cover" />}
                  <AvatarFallback className="text-2xl font-bold text-white bg-transparent">
                    {getInitials(user.fullName || user.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">
                    {user.fullName || user.username}
                  </h4>
                  <p className="text-muted-foreground">Legal Professional</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadAvatarMutation.mutate(file);
                      }
                    }}
                  />
                  <div className="flex items-center space-x-3 mt-1">
                    <Button
                      variant="link"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-0 h-auto text-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadAvatarMutation.isPending}
                    >
                      {uploadAvatarMutation.isPending ? "Uploading..." : "Change Avatar"}
                    </Button>
                    {user.avatar && (
                      <>
                        <span className="text-muted-foreground text-xs">•</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="link"
                              className="text-red-500 hover:text-red-600 p-0 h-auto text-sm"
                            >
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">Remove Profile Photo?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                This will delete your custom profile picture and revert to the default initials. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-muted hover:bg-muted/80 text-foreground border-border">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white border-none"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/user/${user.id}`, {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ avatar: null }),
                                    });
                                    if (response.ok) {
                                      await refreshUser();
                                      toast({ title: "Success", description: "Avatar removed." });
                                    }
                                  } catch (e) {
                                    toast({ title: "Error", description: "Failed to remove avatar.", variant: "destructive" });
                                  }
                                }}
                              >
                                Remove Photo
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-foreground/70">Username</Label>
                      <Input
                        value={user.username}
                        disabled
                        className="bg-muted border-border text-muted-foreground mt-1.5"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/70">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-card border-border text-foreground"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/70">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              className="bg-card border-border text-foreground"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/70">Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              className="bg-card border-border text-foreground"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="barNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/70">Bar Number</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-card border-border text-foreground"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormField
                      control={profileForm.control}
                      name="practiceAreas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/70">Practice Areas</FormLabel>
                          <FormControl>
                            <Textarea
                              className="bg-card border-border text-foreground min-h-[100px]"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>


                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => profileForm.reset()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Security & Preferences */}
        <div className="space-y-6">
          {/* Change Password */}
          <Card className="premium-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg font-semibold text-foreground">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/70">Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="bg-card border-border text-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/70">New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="bg-card border-border text-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/70">Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="bg-card border-border text-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                  >
                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="premium-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg font-semibold text-foreground">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Case updates and alerts</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Reminders and appointments</p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Interface Theme</h4>
                  <p className="text-sm text-muted-foreground">Select your preferred appearance</p>
                </div>
                <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                  <SelectTrigger className="w-[140px] bg-card border-border">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  className="w-full border-indigo-500/30 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30"
                  onClick={async () => {
                    try {
                      const response = await apiRequest("POST", "/api/test-email", { email: user.email });
                      if (response.ok) {
                        toast({
                          title: "Success",
                          description: "Test email sent successfully! Please check your inbox.",
                        });
                      } else {
                        const error = await response.json();
                        toast({
                          title: "Email Error",
                          description: error.message || "Failed to send test email.",
                          variant: "destructive",
                        });
                      }
                    } catch (err) {
                      toast({
                        title: "Connection Error",
                        description: "Could not connect to the server to send test email.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Test Email Connection
                </Button>
                <p className="text-[10px] text-muted-foreground mt-2 text-center uppercase tracking-wider font-semibold">
                  Verify SMTP settings in .env file
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="premium-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg font-semibold text-foreground">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Member Since</span>
                <span className="text-foreground font-semibold">
                  {format(new Date(user.createdAt), "MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Cases</span>
                <span className="text-foreground font-semibold">{stats?.totalCases || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Cases</span>
                <span className="text-foreground font-semibold">{stats?.activeCases || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending Reminders</span>
                <span className="text-foreground font-semibold">{stats?.pendingReminders || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
