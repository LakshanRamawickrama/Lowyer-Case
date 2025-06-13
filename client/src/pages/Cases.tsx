import { useState } from "react";
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
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { useCases, useCreateCase, useDeleteCase } from "@/hooks/use-cases";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<CaseWithClient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const { data: cases = [], isLoading } = useCases();
  const createCaseMutation = useCreateCase();
  const deleteCaseMutation = useDeleteCase();

  const getCaseIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "personal injury":
        return <Gavel className="w-6 h-6 text-white" />;
      case "estate law":
        return <Handshake className="w-6 h-6 text-white" />;
      case "corporate law":
        return <Building className="w-6 h-6 text-white" />;
      default:
        return <Gavel className="w-6 h-6 text-white" />;
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
                         caseItem.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    const matchesType = typeFilter === "all" || caseItem.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
          <h1 className="text-3xl font-bold text-white">Cases</h1>
          <p className="text-slate-400 mt-1">Manage your legal cases and documentation</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Case
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400 h-10 text-sm lg:text-base"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] bg-slate-800 border-slate-700 text-white h-10 text-sm lg:text-base">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">All Status</SelectItem>
            <SelectItem value="active" className="text-white hover:bg-slate-700">Active</SelectItem>
            <SelectItem value="pending" className="text-white hover:bg-slate-700">Pending</SelectItem>
            <SelectItem value="review" className="text-white hover:bg-slate-700">Review</SelectItem>
            <SelectItem value="closed" className="text-white hover:bg-slate-700">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] bg-slate-800 border-slate-700 text-white h-10 text-sm lg:text-base">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">All Types</SelectItem>
            <SelectItem value="Personal Injury" className="text-white hover:bg-slate-700">Personal Injury</SelectItem>
            <SelectItem value="Corporate Law" className="text-white hover:bg-slate-700">Corporate Law</SelectItem>
            <SelectItem value="Estate Law" className="text-white hover:bg-slate-700">Estate Law</SelectItem>
            <SelectItem value="Criminal Law" className="text-white hover:bg-slate-700">Criminal Law</SelectItem>
            <SelectItem value="Family Law" className="text-white hover:bg-slate-700">Family Law</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Skeleton className="w-12 h-12 rounded-lg mr-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="w-8 h-8 rounded" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCases.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
              <Gavel className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No cases found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by creating your first case"}
            </p>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-9 text-sm px-3"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Case
            </Button>
          </div>
        ) : (
          filteredCases.map((caseItem) => (
            <Card key={caseItem.id} className="bg-slate-800 border-slate-700 hover:border-indigo-500 transition-all hover:shadow-lg">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      {getCaseIcon(caseItem.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-sm lg:text-base truncate">{caseItem.title}</h3>
                      <p className="text-xs lg:text-sm text-slate-400 truncate">{caseItem.caseNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 lg:space-x-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 lg:p-2 text-slate-400 hover:text-white h-8 w-8"
                    >
                      <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 lg:p-2 text-slate-400 hover:text-red-400 h-8 w-8"
                      onClick={() => handleDeleteCase(caseItem)}
                    >
                      <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm text-slate-400">Type:</span>
                    <span className="text-xs lg:text-sm text-white truncate ml-2">{caseItem.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm text-slate-400">Client:</span>
                    <span className="text-xs lg:text-sm text-white truncate ml-2">{caseItem.client?.name || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm text-slate-400">Status:</span>
                    <Badge className={`text-xs ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm text-slate-400">Created:</span>
                    <span className="text-xs lg:text-sm text-white">
                      {format(new Date(caseItem.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-slate-700">
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-8 lg:h-10 text-xs lg:text-sm">
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
        onSubmit={handleCreateCase}
        isLoading={createCaseMutation.isPending}
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
