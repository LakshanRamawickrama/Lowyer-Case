import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Gavel,
    Calendar,
    User,
    Activity,
    Tag,
    FileText,
    Clock,
    AlertCircle,
    Hash,
    Handshake,
    Building,
    Upload,
    Trash2,
    Download,
    File,
    Loader2
} from "lucide-react";
import type { CaseWithClient } from "@shared/schema";
import { format } from "date-fns";
import { useUploadDocument, useDeleteDocument } from "@/hooks/use-cases";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface CaseDetailsProps {
    caseData: CaseWithClient | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (caseData: CaseWithClient) => void;
}

export function CaseDetails({ caseData, open, onOpenChange, onEdit }: CaseDetailsProps) {
    const { toast } = useToast();
    const uploadMutation = useUploadDocument();
    const deleteMutation = useDeleteDocument();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!caseData) return null;

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await uploadMutation.mutateAsync({
                caseId: caseData.id,
                title: file.name,
                file: file
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
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteDocument = async (docId: number) => {
        try {
            await deleteMutation.mutateAsync({ id: docId, caseId: caseData.id });
            toast({
                title: "Success",
                description: "Document deleted successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete document",
                variant: "destructive",
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            case "pending":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "review":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "closed":
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "high":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            case "medium":
                return "bg-orange-500/20 text-orange-400 border-orange-500/30";
            case "low":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    const getCaseIcon = (type: string) => {
        switch (type) {
            case "Criminal Law": return <Gavel className="w-6 h-6" />;
            case "Family Law": return <Handshake className="w-6 h-6" />;
            case "Corporate Law": return <Building className="w-6 h-6" />;
            default: return <Gavel className="w-6 h-6" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card border-border p-0">
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 sticky top-0 z-10" />

                <div className="p-6">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className={`${getStatusColor(caseData.status)} font-medium`}>
                                {caseData.status.toUpperCase()}
                            </Badge>
                            <div className="flex items-center text-xs text-muted-foreground font-mono">
                                <Hash className="w-3 h-3 mr-1" />
                                {caseData.caseNumber || "NO-NUMBER"}
                            </div>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
                                {getCaseIcon(caseData.type)}
                            </div>
                            {caseData.title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Tag className="w-3 h-3" /> Case Type
                                </p>
                                <p className="text-sm text-foreground font-medium bg-muted/30 p-2 rounded-md border border-border/50">
                                    {caseData.type}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-3 h-3" /> Client
                                </p>
                                <div className="text-sm text-foreground font-medium bg-muted/30 p-2 rounded-md border border-border/50 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-bold">
                                        {caseData.client?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "UC"}
                                    </div>
                                    {caseData.client?.name || "Unassigned"}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Priority
                                </p>
                                <div>
                                    <Badge variant="outline" className={`${getPriorityColor(caseData.priority)} font-medium`}>
                                        {caseData.priority.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Created Date
                                </p>
                                <p className="text-sm text-foreground font-medium bg-muted/30 p-2 rounded-md border border-border/50">
                                    {format(new Date(caseData.createdAt), "PPP")}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Last Updated
                                </p>
                                <p className="text-sm text-foreground font-medium bg-muted/30 p-2 rounded-md border border-border/50">
                                    {format(new Date(caseData.updatedAt), "PPP")}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" /> Case Status
                                </p>
                                <p className="text-sm text-foreground font-medium bg-muted/30 p-2 rounded-md border border-border/50">
                                    Processing: {caseData.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Description
                        </p>
                        <div className="bg-muted/30 p-4 rounded-lg border border-border/50 min-h-[80px]">
                            <p className="text-sm text-foreground leading-relaxed italic">
                                {caseData.description || "No description provided for this case."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <File className="w-5 h-5 text-indigo-500" /> Documents
                                <span className="text-xs font-normal text-muted-foreground ml-2">
                                    ({caseData.documents?.length || 0})
                                </span>
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Button
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/30 gap-2"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    Upload
                                </Button>
                            </div>
                        </div>

                        <div className="bg-muted/30 rounded-xl border border-border/50 divide-y divide-border/50">
                            {caseData.documents && caseData.documents.length > 0 ? (
                                caseData.documents.map((doc) => (
                                    <div key={doc.id} className="p-3 flex items-center justify-between group hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {doc.title}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Uploaded {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-indigo-500"
                                                asChild
                                            >
                                                <a href={doc.file} target="_blank" rel="noopener noreferrer">
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                onClick={() => handleDeleteDocument(doc.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-border hover:bg-muted text-foreground"
                        >
                            Close
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                            onClick={() => onEdit?.(caseData)}
                        >
                            Edit Case
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
