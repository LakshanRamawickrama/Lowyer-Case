import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    ExternalLink,
    MessageSquare,
    Clock,
    Hash
} from "lucide-react";
import type { Client } from "@shared/schema";
import { format } from "date-fns";
import { useCases } from "@/hooks/use-cases";
import { useLocation } from "wouter";

interface ClientDetailsProps {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (client: Client) => void;
}

export function ClientDetails({ client, open, onOpenChange, onEdit }: ClientDetailsProps) {
    const [, setLocation] = useLocation();
    const { data: allCases = [] } = useCases();

    if (!client) return null;

    const clientCases = allCases.filter(c => c.clientId === client.id);

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
                return "bg-green-500/20 text-green-400 border-green-500/30";
            case "inactive":
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] bg-card border-border p-0 overflow-hidden flex flex-col">
                <div className={`h-20 bg-gradient-to-br ${getAvatarColor(client.name)} shrink-0`} />

                <div className="px-6 pb-6 -mt-10 overflow-hidden">
                    <div className="flex flex-col items-center text-center">
                        <Avatar className="w-20 h-20 border-4 border-card shadow-xl mb-3">
                            <AvatarFallback className={`text-xl text-white font-bold bg-gradient-to-br ${getAvatarColor(client.name)}`}>
                                {getInitials(client.name)}
                            </AvatarFallback>
                        </Avatar>

                        <DialogHeader>
                            <div className="flex flex-col items-center space-y-1">
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    {client.name}
                                </DialogTitle>
                                <Badge variant="outline" className={`${getStatusColor(client.status)} font-medium`}>
                                    {client.status.toUpperCase()}
                                </Badge>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Email</p>
                                        <p className="text-xs font-medium text-foreground truncate">{client.email || "Not provided"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                        <Phone className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Phone</p>
                                        <p className="text-xs font-medium text-foreground truncate">{client.phone || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                                        <Hash className="w-3 h-3" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">NIC</p>
                                        <p className="text-xs font-medium text-foreground truncate">{client.nic || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                                        <MapPin className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Address</p>
                                        <p className="text-xs font-medium text-foreground truncate">{client.address || "Not provided"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-purple-500/10 group-hover:text-purple-500 transition-colors">
                                        <Calendar className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Joined At</p>
                                        <p className="text-xs font-medium text-foreground truncate">{format(new Date(client.createdAt), "PP")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Briefcase className="w-3 h-3" /> Cases ({clientCases.length})
                            </h4>

                            {clientCases.length > 0 ? (
                                <div className="grid grid-cols-1 gap-1.5">
                                    {clientCases.slice(0, 2).map(caseItem => (
                                        <div
                                            key={caseItem.id}
                                            className="p-2 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => {
                                                onOpenChange(false);
                                                setLocation(`/cases?search=${caseItem.title}`);
                                            }}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-foreground truncate ">{caseItem.title}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] h-4 bg-background px-1.5">
                                                {caseItem.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] text-muted-foreground italic">No cases found.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50 shrink-0">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 border-border hover:bg-muted text-foreground h-9 text-xs font-semibold"
                                onClick={() => onEdit?.(client)}
                            >
                                <Clock className="w-3 h-3 mr-2" />
                                Edit
                            </Button>
                            <Button
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-xs font-semibold"
                                onClick={() => {
                                    onOpenChange(false);
                                    setLocation(`/cases?search=${client.name}`);
                                }}
                            >
                                <Briefcase className="w-3 h-3 mr-2" />
                                View Cases
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="w-9 h-9 border-border p-0"
                                    onClick={() => client.phone && window.open(`tel:${client.phone}`)}
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-9 h-9 border-border p-0"
                                    onClick={() => client.email && window.open(`mailto:${client.email}`)}
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
