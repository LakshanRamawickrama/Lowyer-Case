import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  Folder,
  TrendingUp,
  Users,
  Bell,
  Plus,
  Gavel,
  Handshake,
  Building,
  Clock,
  MapPin
} from "lucide-react";
import type { DashboardStats, CaseWithClient, ReminderWithCase, InsertCase } from "@shared/schema";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { CaseForm } from "@/components/CaseForm";
import { ReminderForm } from "@/components/ReminderForm";
import { useCreateCase } from "@/hooks/use-cases";
import { useCreateReminder } from "@/hooks/use-reminders";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
  const createCaseMutation = useCreateCase();
  const createReminderMutation = useCreateReminder();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentCases, isLoading: casesLoading } = useQuery<CaseWithClient[]>({
    queryKey: ["/api/cases"],
    select: (data) => data.slice(0, 3), // Get first 3 cases
  });

  const { data: upcomingReminders, isLoading: remindersLoading } = useQuery<ReminderWithCase[]>({
    queryKey: ["/api/reminders"],
    select: (data) => data
      .filter((reminder) => !reminder.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3), // Get first 3 upcoming reminders
  });

  const getCaseIcon = (type: string) => {
    switch (type) {
      case "Criminal Law": return <Gavel className="w-5 h-5" />;
      case "Family Law": return <Handshake className="w-5 h-5" />;
      case "Corporate Law": return <Building className="w-5 h-5" />;
      default: return <Folder className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
      case "review":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      case "closed":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20";
    }
  };

  const formatReminderDate = (date: Date | string) => {
    const reminderDate = new Date(date);

    if (isToday(reminderDate)) {
      return `Today, ${format(reminderDate, "h:mm a")}`;
    } else if (isTomorrow(reminderDate)) {
      return `Tomorrow, ${format(reminderDate, "h:mm a")}`;
    } else if (isThisWeek(reminderDate)) {
      return format(reminderDate, "EEEE, h:mm a");
    } else {
      return format(reminderDate, "MMM d, h:mm a");
    }
  };

  const handleCreateCase = async (data: InsertCase) => {
    try {
      await createCaseMutation.mutateAsync(data);
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Case created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create case. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateReminder = async (data: any) => {
    try {
      await createReminderMutation.mutateAsync(data);
      setIsReminderFormOpen(false);
      toast({
        title: "Success",
        description: "Reminder created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.fullName || user?.username}
          </p>
        </div>
        <div className="hidden md:block">
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Cases</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-2">{stats?.totalCases || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">+12%</span>
              <span className="text-muted-foreground text-sm ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Cases</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-2">{stats?.activeCases || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">+8%</span>
              <span className="text-muted-foreground text-sm ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Clients</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-2">{stats?.totalClients || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">+24%</span>
              <span className="text-muted-foreground text-sm ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Pending Reminders</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-2">{stats?.pendingReminders || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-red-600 dark:text-red-400 text-sm font-medium">+2</span>
              <span className="text-muted-foreground text-sm ml-2">urgent today</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases & Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-foreground">Recent Cases</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/cases")}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {casesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 text-foreground" />
                      <Skeleton className="h-3 w-1/2 text-muted-foreground" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : (
                recentCases?.map((caseItem) => (
                  <div key={caseItem.id} className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-indigo-500/50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                        {getCaseIcon(caseItem.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{caseItem.title}</h4>
                        <p className="text-sm text-muted-foreground">{caseItem.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(caseItem.status)}>
                        {caseItem.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(caseItem.updatedAt), "MMM d")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Reminders */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-foreground">Upcoming</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReminderFormOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {remindersLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            ) : (
              upcomingReminders?.map((reminder) => (
                <div key={reminder.id} className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getPriorityColor(reminder.priority)}>
                      {reminder.type}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatReminderDate(reminder.dueDate)}
                    </div>
                  </div>
                  <h4 className="font-medium text-foreground text-sm">{reminder.title}</h4>
                  {reminder.case && (
                    <p className="text-xs text-muted-foreground">{reminder.case.title}</p>
                  )}
                  {reminder.location && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {reminder.location}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Add Button */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Button
          size="lg"
          onClick={() => setIsFormOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Case Form Modal */}
      <CaseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateCase}
        isLoading={createCaseMutation.isPending}
      />

      {/* Reminder Form Modal */}
      <ReminderForm
        open={isReminderFormOpen}
        onOpenChange={setIsReminderFormOpen}
        onSubmit={handleCreateReminder}
        isLoading={createReminderMutation.isPending}
      />
    </div>
  );
}
