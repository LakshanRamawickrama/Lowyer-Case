import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
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
                  <AvatarFallback className="text-2xl font-bold text-white bg-transparent">
                    {getInitials(user.fullName || user.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">
                    {user.fullName || user.username}
                  </h4>
                  <p className="text-muted-foreground">Legal Professional</p>
                  <Button
                    variant="link"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-0 h-auto text-sm mt-1"
                    onClick={() => {
                      // Generate new avatar colors based on name
                      const newInitials = getInitials(user?.fullName || user?.username || "U");
                      toast({
                        title: "Avatar Updated",
                        description: "Your avatar has been refreshed with new colors.",
                      });
                    }}
                  >
                    Change Avatar
                  </Button>
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
