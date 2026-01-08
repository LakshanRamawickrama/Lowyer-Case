import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCaseSchema, type InsertCase, type CaseWithClient } from "@shared/schema";
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
import { useClients } from "@/hooks/use-clients";
import { useState, useRef, useEffect } from "react";
import { FileText, Upload, Trash2, X, Plus, Loader2, File, Download } from "lucide-react";
import { useUploadDocument, useDeleteDocument } from "@/hooks/use-cases";
import { useCaseTypes } from "@/hooks/use-case-types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertCase, files?: File[]) => void;
  isLoading?: boolean;
  initialData?: CaseWithClient;
}


const statusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "review", label: "Review" },
  { value: "closed", label: "Closed" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function CaseForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  initialData
}: CaseFormProps) {
  const { data: clients = [] } = useClients();
  const { data: caseTypes = [] } = useCaseTypes();
  const { toast } = useToast();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<InsertCase>({
    resolver: zodResolver(insertCaseSchema),
    defaultValues: {
      title: initialData?.title || "",
      caseNumber: initialData?.caseNumber || "",
      caseType: initialData?.caseType || undefined,
      status: initialData?.status || "active",
      priority: initialData?.priority || "medium",
      description: initialData?.description || "",
      clientId: initialData?.clientId || undefined,
    },
  });

  // Reset form and files when opening for a new case
  useEffect(() => {
    if (open) {
      if (!initialData) {
        form.reset({
          title: "",
          caseNumber: "",
          caseType: undefined as any,
          status: "active",
          priority: "medium",
          description: "",
          clientId: undefined,
        });
        setPendingFiles([]);
      } else {
        form.reset({
          title: initialData.title,
          caseNumber: initialData.caseNumber || "",
          caseType: initialData.caseType as any,
          status: initialData.status,
          priority: initialData.priority,
          description: initialData.description || "",
          clientId: initialData.clientId || undefined,
        });
      }
    }
  }, [open, initialData, form]);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFile = files[0];

    // If we're editing an existing case, upload immediately
    if (initialData?.id) {
      setIsUploading(true);
      try {
        await uploadDocument.mutateAsync({
          caseId: initialData.id,
          title: newFile.name,
          file: newFile
        });
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload document",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      // If we're creating a new case, add to pending files
      setPendingFiles(prev => [...prev, newFile]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingDoc = async (docId: number) => {
    if (!initialData?.id) return;
    try {
      await deleteDocument.mutateAsync({ id: docId, caseId: initialData.id });
      toast({
        title: "Success",
        description: "Document deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      // Ensure URL is relative to work with the proxy
      const url = fileUrl.startsWith('http')
        ? new URL(fileUrl).pathname
        : fileUrl;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast({
        title: "Download Started",
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      window.open(fileUrl, '_blank');
      toast({
        title: "Download Started",
        description: "Opening document in new tab",
      });
    }
  };

  const handleSubmit = (data: InsertCase) => {
    onSubmit(data, pendingFiles);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl p-0">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 sticky top-0 z-10" />

        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-foreground text-2xl font-bold">
              {initialData ? "Edit Case" : "Add New Case"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {initialData ? "Update case information and documents." : "Create a new legal case and attach initial documents."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-medium">Case Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter case title"
                          className="bg-card border-border text-foreground focus:ring-indigo-500 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-medium">Case Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Auto-generated if empty"
                          className="bg-card border-border text-foreground focus:ring-indigo-500 h-10"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="caseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-medium">Case Type *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                        key={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-card border-border text-foreground focus:ring-indigo-500 h-10 text-left">
                            <SelectValue placeholder="Select case type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border">
                          {caseTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()} className="hover:bg-muted transition-colors">
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-medium">Client *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()} key={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-card border-border text-foreground focus:ring-indigo-500 h-10">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border">
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()} className="hover:bg-muted transition-colors">
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-medium">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} key={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-card border-border text-foreground focus:ring-indigo-500 h-10">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border">
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="hover:bg-muted transition-colors">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-medium">Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} key={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-card border-border text-foreground focus:ring-indigo-500 h-10">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border">
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="hover:bg-muted transition-colors">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter case description and details"
                        className="bg-card border-border text-foreground resize-none focus:ring-indigo-500"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Document Section */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <File className="w-4 h-4 text-indigo-500" /> Documents
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="h-8 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/30 gap-2"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-3 h-3" />}
                      Add Document
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Existing Documents (Edit mode) */}
                  {initialData?.documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50 group">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs text-foreground truncate">{doc.title}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-indigo-500"
                          onClick={() => handleDownload(doc.file, doc.title)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-red-500"
                          onClick={() => handleDeleteExistingDoc(doc.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Pending Documents (New Case mode) */}
                  {pendingFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/20 group">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-foreground truncate">{file.name}</p>
                          <p className="text-[10px] text-indigo-500">Wait for save</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-500"
                        onClick={() => removePendingFile(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  {!initialData?.documents?.length && !pendingFiles.length && (
                    <div className="col-span-full py-6 text-center border border-dashed border-border rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground italic">No documents attached.</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-6 border-t border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:flex-1 text-muted-foreground hover:text-foreground h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-10 font-bold"
                >
                  {isLoading ? "Saving..." : initialData ? "Update Case" : "Add Case"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog >
  );
}
