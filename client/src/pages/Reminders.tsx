import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReminderForm } from "@/components/ReminderForm";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { useReminders, useCreateReminder, useDeleteReminder } from "@/hooks/use-reminders";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  AlertTriangle,
  Calendar,
  CalendarCheck,
  Gavel,
  FileText,
  Handshake
} from "lucide-react";
import type { InsertReminder, ReminderWithCase } from "@shared/schema";
import { format, isToday, isTomorrow, isThisWeek, isPast } from "date-fns";

export default function Reminders() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<ReminderWithCase | null>(null);

  const { data: reminders = [], isLoading } = useReminders();
  const createReminderMutation = useCreateReminder();
  const deleteReminderMutation = useDeleteReminder();

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "hearing": return <Gavel className="w-6 h-6" />;
      case "deadline": return <FileText className="w-6 h-6" />;
      case "meeting": return <Handshake className="w-6 h-6" />;
      case "filing": return <FileText className="w-6 h-6" />;
      default: return <Calendar className="w-6 h-6" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30";
      case "high":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30";
      case "low":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-900/30";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "hearing":
        return "bg-red-500/20 text-red-400";
      case "deadline":
        return "bg-blue-500/20 text-blue-400";
      case "meeting":
        return "bg-green-500/20 text-green-400";
      case "filing":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatReminderDate = (date: Date) => {
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

  const getDateColor = (date: Date) => {
    const reminderDate = new Date(date);
    if (isPast(reminderDate) && !isToday(reminderDate)) {
      return "text-red-400";
    } else if (isToday(reminderDate)) {
      return "text-red-400";
    } else if (isTomorrow(reminderDate)) {
      return "text-yellow-400";
    } else {
      return "text-green-400";
    }
  };

  // Group reminders by urgency
  const urgentReminders = reminders.filter(r =>
    !r.completed && (
      r.priority === "urgent" ||
      isToday(new Date(r.dueDate)) ||
      isPast(new Date(r.dueDate))
    )
  );

  const thisWeekReminders = reminders.filter(r =>
    !r.completed &&
    !urgentReminders.includes(r) &&
    isThisWeek(new Date(r.dueDate))
  );

  const upcomingReminders = reminders.filter(r =>
    !r.completed &&
    !urgentReminders.includes(r) &&
    !thisWeekReminders.includes(r)
  );

  const handleCreateReminder = async (data: InsertReminder) => {
    try {
      await createReminderMutation.mutateAsync(data);
      setIsFormOpen(false);
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

  const handleDeleteReminder = (reminder: ReminderWithCase) => {
    setReminderToDelete(reminder);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reminderToDelete) return;

    try {
      await deleteReminderMutation.mutateAsync(reminderToDelete.id);
      setDeleteDialogOpen(false);
      setReminderToDelete(null);
      toast({
        title: "Success",
        description: "Reminder deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reminders</h1>
          <p className="text-muted-foreground mt-1">Stay on top of important deadlines and appointments</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Reminder Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="premium-card bg-red-500/5 dark:bg-red-500/10 border-red-500/10 dark:border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Urgent</h3>
                <p className="text-2xl font-bold text-foreground mt-1">{urgentReminders.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Due today or overdue</p>
          </CardContent>
        </Card>

        <Card className="premium-card bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/10 dark:border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">This Week</h3>
                <p className="text-2xl font-bold text-foreground mt-1">{thisWeekReminders.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Due within 7 days</p>
          </CardContent>
        </Card>

        <Card className="premium-card bg-green-500/5 dark:bg-green-500/10 border-green-500/10 dark:border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Upcoming</h3>
                <p className="text-2xl font-bold text-foreground mt-1">{upcomingReminders.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Due later this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      {/* Reminders List */}
      <Card className="premium-card">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-xl font-semibold text-foreground">All Reminders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-border/50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">No reminders yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create reminders to keep track of hearings, meetings, and filings.</p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Reminder
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="p-6 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${getPriorityColor(reminder.priority)}`}>
                        {getReminderIcon(reminder.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-foreground truncate">{reminder.title}</h3>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 border-none capitalize ${getPriorityColor(reminder.priority)}`}>
                            {reminder.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(reminder.dueDate), "MMM d, h:mm a")}</span>
                          </div>
                          {reminder.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[100px]">{reminder.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {reminder.case && (
                      <div className="inline-flex items-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full mt-2 font-medium">
                        Related to: {reminder.case.title}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full capitalize border-none ${getTypeColor(reminder.type)}`}>
                        {reminder.type}
                      </Badge>
                      {reminder.case && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                          Case: {reminder.case.title}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => handleDeleteReminder(reminder)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Form Modal */}
      <ReminderForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateReminder}
        isLoading={createReminderMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Reminder"
        itemName={reminderToDelete?.title}
      />
    </div>
  );
}
