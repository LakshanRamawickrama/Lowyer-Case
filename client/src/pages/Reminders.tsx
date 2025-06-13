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
    switch (type.toLowerCase()) {
      case "hearing":
        return <Gavel className="w-6 h-6 text-white" />;
      case "deadline":
        return <FileText className="w-6 h-6 text-white" />;
      case "meeting":
        return <Handshake className="w-6 h-6 text-white" />;
      case "filing":
        return <FileText className="w-6 h-6 text-white" />;
      default:
        return <Calendar className="w-6 h-6 text-white" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
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
          <h1 className="text-3xl font-bold text-white">Reminders</h1>
          <p className="text-slate-400 mt-1">Stay on top of important deadlines and appointments</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Reminder Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-red-400">Urgent</h3>
                <p className="text-2xl font-bold text-white mt-1">{urgentReminders.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <p className="text-sm text-red-300">Due today or overdue</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-yellow-400">This Week</h3>
                <p className="text-2xl font-bold text-white mt-1">{thisWeekReminders.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-sm text-yellow-300">Due within 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-green-400">Upcoming</h3>
                <p className="text-2xl font-bold text-white mt-1">{upcomingReminders.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-sm text-green-300">Due later this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">All Reminders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-slate-700">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <div className="flex space-x-4">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="w-8 h-8 rounded" />
                      <Skeleton className="w-8 h-8 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No reminders yet</h3>
              <p className="text-slate-400 mb-6">Create your first reminder to stay organized</p>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="p-6 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getPriorityColor(reminder.priority).includes('red') ? 'from-red-500 to-red-600' : getPriorityColor(reminder.priority).includes('yellow') ? 'from-yellow-500 to-yellow-600' : 'from-green-500 to-green-600'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        {getReminderIcon(reminder.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{reminder.title}</h4>
                        {reminder.description && (
                          <p className="text-slate-400 text-sm mb-2 line-clamp-2">{reminder.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm">
                          <div className={`flex items-center ${getDateColor(reminder.dueDate)}`}>
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{formatReminderDate(reminder.dueDate)}</span>
                          </div>
                          {reminder.location && (
                            <div className="flex items-center text-slate-400">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{reminder.location}</span>
                            </div>
                          )}
                        </div>
                        {reminder.case && (
                          <p className="text-sm text-indigo-400 mt-1">
                            Related to: {reminder.case.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeColor(reminder.type)}>
                        {reminder.type}
                      </Badge>
                      <Badge className={getPriorityColor(reminder.priority)}>
                        {reminder.priority}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-slate-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-slate-400 hover:text-red-400"
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
