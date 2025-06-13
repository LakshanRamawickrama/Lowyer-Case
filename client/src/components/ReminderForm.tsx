import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReminderSchema, type InsertReminder } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCases } from "@/hooks/use-cases";

interface ReminderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertReminder) => void;
  isLoading?: boolean;
  initialData?: Partial<InsertReminder>;
}

const reminderTypes = [
  { value: "hearing", label: "Court Hearing" },
  { value: "deadline", label: "Document Deadline" },
  { value: "meeting", label: "Client Meeting" },
  { value: "filing", label: "Filing Deadline" },
  { value: "general", label: "General Reminder" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function ReminderForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading = false,
  initialData 
}: ReminderFormProps) {
  const { data: cases = [] } = useCases();
  
  const form = useForm<InsertReminder>({
    resolver: zodResolver(insertReminderSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : new Date(),
      location: initialData?.location || "",
      type: initialData?.type || "general",
      priority: initialData?.priority || "medium",
      completed: initialData?.completed || false,
      caseId: initialData?.caseId || undefined,
    },
  });

  const handleSubmit = (data: InsertReminder) => {
    // Ensure caseId is properly formatted and date is a Date object
    const formattedData = {
      ...data,
      dueDate: new Date(data.dueDate), // Convert to Date object
      caseId: data.caseId || null,
      completed: data.completed ?? false,
      description: data.description || null,
      location: data.location || null,
    };
    console.log("Submitting reminder data:", formattedData);
    onSubmit(formattedData);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-xl font-semibold text-white">
            {initialData ? "Edit Reminder" : "Add New Reminder"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            {initialData ? "Update reminder information." : "Create a new reminder for important dates and deadlines."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-sm font-medium">Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter reminder title" 
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            {/* Type and Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 text-sm font-medium">Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-10 focus:ring-2 focus:ring-indigo-500">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {reminderTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 text-sm font-medium">Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-10 focus:ring-2 focus:ring-indigo-500">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Case Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 text-sm font-medium">Due Date & Time *</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local"
                        className="bg-slate-700 border-slate-600 text-white h-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="caseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 text-sm font-medium">Related Case</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-10 focus:ring-2 focus:ring-indigo-500">
                          <SelectValue placeholder="Select case (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-600 max-h-48">
                        <SelectItem value="none" className="text-slate-400 hover:bg-slate-700">
                          No case selected
                        </SelectItem>
                        {cases.map((caseItem) => (
                          <SelectItem key={caseItem.id} value={caseItem.id.toString()} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                            <div className="flex flex-col">
                              <span className="font-medium">{caseItem.title}</span>
                              <span className="text-xs text-slate-400">{caseItem.caseNumber}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Field */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-sm font-medium">Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter location or address" 
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-sm font-medium">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter reminder description and notes"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto order-2 sm:order-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600 hover:border-slate-500 h-10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-10 font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  initialData ? "Update Reminder" : "Add Reminder"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
