import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClientForm } from "@/components/ClientForm";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { useClients, useCreateClient, useDeleteClient } from "@/hooks/use-clients";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  Users
} from "lucide-react";
import type { InsertClient, Client } from "@shared/schema";

export default function Clients() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clients = [], isLoading } = useClients();
  const createClientMutation = useCreateClient();
  const deleteClientMutation = useDeleteClient();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-emerald-500 to-emerald-600",
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "inactive":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const filteredClients = clients.filter((client) => {
    return client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateClient = async (data: InsertClient) => {
    try {
      await createClientMutation.mutateAsync(data);
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Client created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClientMutation.mutateAsync(clientToDelete.id);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      toast({
        title: "Success",
        description: "Client deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client relationships and information</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card border-border text-foreground placeholder-muted-foreground"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Skeleton className="w-12 h-12 rounded-full mr-3" />
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
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by adding your first client"}
            </p>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Client
            </Button>
          </div>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="bg-card border-border hover:border-indigo-500/50 transition-all hover:shadow-md group">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center min-w-0 flex-1">
                    <Avatar className={`w-10 h-10 lg:w-12 lg:h-12 mr-3 bg-gradient-to-br ${getAvatarColor(client.name)} flex-shrink-0 shadow-sm shadow-indigo-500/10`}>
                      <AvatarFallback className="text-white font-semibold bg-transparent text-sm lg:text-base">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm lg:text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{client.name}</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground truncate">{client.email || "No email address"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 lg:space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 lg:p-2 text-muted-foreground hover:text-foreground h-8 w-8"
                    >
                      <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 lg:p-2 text-muted-foreground hover:text-red-500 h-8 w-8"
                      onClick={() => handleDeleteClient(client)}
                    >
                      <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 lg:space-y-3">
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground font-medium truncate ml-2">{client.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="text-foreground font-medium truncate ml-2">{client.address || "Not provided"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className={`${getStatusColor(client.status)} border-none py-0 px-2`}>
                      {client.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-border/50 flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border-none text-xs lg:text-sm h-8 lg:h-9 font-medium"
                    onClick={() => {/* Navigate to client cases */ }}
                  >
                    View Cases
                  </Button>
                  <div className="flex gap-2">
                    {client.phone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 w-8 lg:w-9 h-8 lg:h-9 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                        onClick={() => window.open(`tel:${client.phone}`)}
                      >
                        <Phone className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </Button>
                    )}
                    {client.email && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 w-8 lg:w-9 h-8 lg:h-9 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                        onClick={() => window.open(`mailto:${client.email}`)}
                      >
                        <Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Client Form Modal */}
      <ClientForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateClient}
        isLoading={createClientMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Client"
        itemName={clientToDelete?.name}
      />
    </div>
  );
}
