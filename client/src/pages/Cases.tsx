import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaseForm } from "@/components/CaseForm";
import { CaseDetails } from "@/components/CaseDetails";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { useCases, useCreateCase, useUpdateCase, useDeleteCase, useUploadDocument } from "@/hooks/use-cases";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Gavel,
  Handshake,
  Building,
  Filter
} from "lucide-react";
import type { InsertCase, CaseWithClient } from "@shared/schema";
import { format } from "date-fns";

export default function Cases() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseWithClient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<CaseWithClient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search");
    if (search) {
      setSearchTerm(search);
    }
  }, []);

  const { data: cases = [], isLoading } = useCases();
  const createCaseMutation = useCreateCase();
  const updateCaseMutation = useUpdateCase();
  const deleteCaseMutation = useDeleteCase();
  const uploadDocumentMutation = useUploadDocument();

  const getCaseIcon = (type: string) => {
    switch (type) {
      case "Criminal Law": return <Gavel className="w-6 h-6" />;
      case "Family Law": return <Handshake className="w-6 h-6" />;
      case "Corporate Law": return <Building className="w-6 h-6" />;
      default: return <Gavel className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "review":
        return "bg-blue-500/20 text-blue-400";
      case "closed":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.nic?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    const matchesType = typeFilter === "all" || caseItem.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSubmitCase = async (data: InsertCase, files?: File[]) => {
    try {
      if (selectedCase) {
        await updateCaseMutation.mutateAsync({ id: selectedCase.id, data });
        toast({
          title: "Success",
          description: "Case updated successfully.",
        });
      } else {
        const newCase = await createCaseMutation.mutateAsync(data);

        // Upload any documents attached during creation
        if (files && files.length > 0) {
          await Promise.all(
            files.map(file =>
              uploadDocumentMutation.mutateAsync({
                caseId: newCase.id,
                title: file.name,
                file: file
              })
            )
          );
        }

        toast({
          title: "Success",
          description: "Case created successfully with documents.",
        });
      }
      setIsFormOpen(false);
      setSelectedCase(null);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${selectedCase ? 'update' : 'create'} case. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (caseItem: CaseWithClient) => {
    setSelectedCase(caseItem);
    setIsDetailsOpen(true);
  };

  const handleEditCase = (caseItem: CaseWithClient) => {
    setSelectedCase(caseItem);
    setIsDetailsOpen(false);
    setIsFormOpen(true);
  };

  const handleDeleteCase = (caseItem: CaseWithClient) => {
    setCaseToDelete(caseItem);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!caseToDelete) return;

    try {
      await deleteCaseMutation.mutateAsync(caseToDelete.id);
      setDeleteDialogOpen(false);
      setCaseToDelete(null);
      toast({
        title: "Success",
        description: "Case deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete case. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cases</h1>
          <p className="text-muted-foreground mt-1">Manage your legal cases and documentation</p>
        </div>
        <Button
          onClick={() => {
            setSelectedCase(null);
            setIsFormOpen(true);
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Case
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border text-foreground placeholder-muted-foreground h-10 text-sm lg:text-base"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] bg-card border-border text-foreground h-10 text-sm lg:text-base">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-foreground hover:bg-muted">All Status</SelectItem>
            <SelectItem value="active" className="text-foreground hover:bg-muted">Active</SelectItem>
            <SelectItem value="pending" className="text-foreground hover:bg-muted">Pending</SelectItem>
            <SelectItem value="review" className="text-foreground hover:bg-muted">Review</SelectItem>
            <SelectItem value="closed" className="text-foreground hover:bg-muted">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] bg-card border-border text-foreground h-10 text-sm lg:text-base">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-foreground hover:bg-muted">All Types</SelectItem>
            <SelectItem value="Personal Injury" className="text-foreground hover:bg-muted">Personal Injury</SelectItem>
            <SelectItem value="Corporate Law" className="text-foreground hover:bg-muted">Corporate Law</SelectItem>
            <SelectItem value="Estate Law" className="text-foreground hover:bg-muted">Estate Law</SelectItem>
            <SelectItem value="Criminal Law" className="text-foreground hover:bg-muted">Criminal Law</SelectItem>
            <SelectItem value="Family Law" className="text-foreground hover:bg-muted">Family Law</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-card border-border animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Skeleton className="w-12 h-12 rounded-lg mr-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCases.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Gavel className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">No cases found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first legal case"}
            </p>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Case
            </Button>
          </div>
        ) : (
          filteredCases.map((caseItem) => (
            <Card key={caseItem.id} className="premium-card group">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 shadow-sm shadow-indigo-500/20">
                      {getCaseIcon(caseItem.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm lg:text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{caseItem.title}</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground truncate font-mono uppercase tracking-wider">{caseItem.caseNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 lg:space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 lg:p-2 text-muted-foreground hover:text-foreground h-8 w-8"
                      onClick={() => handleEditCase(caseItem)}
                    >
                      <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 lg:p-2 text-muted-foreground hover:text-red-500 h-8 w-8"
                      onClick={() => handleDeleteCase(caseItem)}
                    >
                      <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 lg:space-y-3">
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="text-foreground font-medium truncate ml-2">{caseItem.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-muted-foreground">Client:</span>
                    <span className="text-foreground font-medium truncate ml-2">{caseItem.client?.name || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-muted-foreground">NIC:</span>
                    <span className="text-foreground font-medium truncate ml-2">{caseItem.nic || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className={`${getStatusColor(caseItem.status)} border-none py-0 px-2`}>
                      {caseItem.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-foreground font-medium">
                      {format(new Date(caseItem.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-border/50">
                  <Button
                    className="w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border-none h-8 lg:h-10 text-xs lg:text-sm font-medium transition-colors"
                    onClick={() => handleViewDetails(caseItem)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Case Form Modal */}
      <CaseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitCase}
        isLoading={createCaseMutation.isPending || updateCaseMutation.isPending}
        initialData={selectedCase || undefined}
      />

      {/* Case Details Modal */}
      <CaseDetails
        caseData={selectedCase}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={handleEditCase}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Case"
        itemName={caseToDelete?.title}
      />
    </div>
  );
}
