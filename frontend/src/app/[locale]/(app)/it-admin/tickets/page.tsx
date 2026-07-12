'use client';

import { RoleGuard } from '@/components/security/RoleGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { Role } from '@/lib/rbac/permissions';
import { Check, ClipboardList, Clock, Edit, MoreVertical, Plus, Search, Ticket, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface ITTicket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: 'hardware' | 'software' | 'network' | 'access' | 'security' | 'other';
  impact: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
  status: 'new' | 'assigned' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  assetId?: string;
  requestedBy: {
    userId: string;
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
    userId: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ITTicketsPage() {
  const [tickets, setTickets] = useState<ITTicket[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<ITTicket | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ITTicket>>({
    category: 'other',
    impact: 'medium',
    urgency: 'medium',
    status: 'new',
    assetId: undefined,
  });
  
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    loadTickets();
    loadAssets();
  }, [filterStatus]);

  const loadAssets = async () => {
      try {
          const res = await api.get('/api/it-assets');
          setAssets(res.data.assets || []);
      } catch (err) {
          console.error('Failed to load assets', err);
      }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;

      const res = await api.get('/api/it-tickets', { params });
      setTickets(res.data.data || []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTicket(null);
    setFormData({ category: 'other', impact: 'medium', urgency: 'medium', status: 'new', assetId: undefined });
    setIsDialogOpen(true);
  };

  const handleEdit = (ticket: ITTicket) => {
    setEditingTicket(ticket);
    setFormData({ ...ticket });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await api.delete(`/api/it-tickets/${id}`);
      toast.success('Ticket deleted successfully');
      loadTickets();
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      toast.error('Failed to delete ticket');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTicket) {
        await api.put(`/api/it-tickets/${editingTicket._id}`, formData);
        toast.success('Ticket updated successfully');
      } else {
        await api.post('/api/it-tickets', formData);
        toast.success('Ticket created successfully');
      }
      setIsDialogOpen(false);
      loadTickets();
    } catch (error) {
      console.error('Failed to save ticket:', error);
      toast.error('Failed to save ticket');
    }
  };

  const handleStatusChange = async (ticket: ITTicket, newStatus: string) => {
     try {
        await api.put(`/api/it-tickets/${ticket._id}`, { status: newStatus });
        toast.success(`Ticket status updated to ${newStatus}`);
        loadTickets();
     } catch (error) {
        console.error('Failed to update status:', error);
        toast.error('Failed to update status');
     }
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase()) ||
    ticket.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
    ticket.description.toLowerCase().includes(search.toLowerCase())
  );

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600 text-white border-red-700',
      urgent: 'bg-primary text-white border-orange-700',
      high: 'bg-yellow-600 text-white border-yellow-700',
      medium: 'bg-primary text-white border-blue-700',
      low: 'bg-gray-600 text-white border-gray-700',
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colors[priority] || 'bg-gray-600 text-white'}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      assigned: 'bg-purple-100 text-purple-800 border-purple-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading && tickets.length === 0) {
    return <div className="flex items-center justify-center h-screen">Loading IT Tickets...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IT Helpdesk</h1>
          <p className="text-gray-500 mt-1">Track, manage, and resolve IT support requests.</p>
        </div>
        <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => loadTickets()}>
                <span className="mr-2">↻</span> Refresh
            </Button>
            <Button type="button" className="bg-primary hover:bg-primary-700" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
            </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets by ID, title, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket._id} className="hover:shadow-md transition-shadow group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{ticket.ticketNumber}</span>
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                    <span className="text-xs text-gray-400">• {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {ticket.title}
                  </CardTitle>
                </div>

                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <RoleGuard minRole={Role.TECHNICIAN}>
                      <DropdownMenuItem onClick={() => handleEdit(ticket)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Details
                      </DropdownMenuItem>
                      {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                           <DropdownMenuItem onClick={() => handleStatusChange(ticket, 'resolved')}>
                              <Check className="mr-2 h-4 w-4" /> Mark Resolved
                          </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(ticket._id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </RoleGuard>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{ticket.description}</p>

              <div className="flex flex-wrap items-center justify-between pt-4 border-t gap-4">
                 <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>Requested by: <span className="font-medium text-black">{ticket.requestedBy.firstName} {ticket.requestedBy.lastName}</span></span>
                    </div>
                    {ticket.assignedTo && (
                         <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>Assigned to: <span className="font-medium text-black">{ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span></span>
                        </div>
                    )}
                     <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-gray-400" />
                        <span className="capitalize">Category: {ticket.category}</span>
                    </div>
                    {ticket.assetId && (
                         <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">Asset: {assets.find(a => a._id === ticket.assetId)?.name || 'Linked'}</span>
                        </div>
                    )}
                 </div>

                 <div className="flex gap-2">
                    <RoleGuard minRole={Role.TECHNICIAN}>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(ticket)}>View Details</Button>
                    </RoleGuard>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredTickets.length === 0 && (
        <Card className="py-16 border-dashed">
          <CardContent className="text-center">
            <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {search ? 'No tickets match your search filters.' : 'There are no active IT support tickets at the moment.'}
            </p>
            <Button type="button" onClick={handleCreate} className="bg-primary hover:bg-primary-700">
                <Plus className="mr-2 h-4 w-4" />
                Create First Ticket
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Ticket Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
            <DialogDescription>
              {editingTicket ? 'Update ticket details and status.' : 'Describe the issue or request for the IT team.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="title">Subject *</Label>
                <Input
                    id="title"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Cannot connect to VPN"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Please provide detailed information about the issue..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(val: any) => setFormData({...formData, category: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="hardware">Hardware</SelectItem>
                            <SelectItem value="software">Software</SelectItem>
                            <SelectItem value="network">Network</SelectItem>
                            <SelectItem value="access">Access / Account</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="assetId">Related Asset (Optional)</Label>
                    <Select value={formData.assetId || ''} onValueChange={(val: any) => setFormData({...formData, assetId: val === 'none' ? undefined : val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Asset" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">-- No Asset --</SelectItem>
                            {assets.map(asset => (
                                <SelectItem key={asset._id} value={asset._id}>{asset.name} ({asset.assetTag})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="impact">Impact *</Label>
                    <Select value={formData.impact} onValueChange={(val: any) => setFormData({...formData, impact: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Impact" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low (1 user)</SelectItem>
                            <SelectItem value="medium">Medium (Team)</SelectItem>
                            <SelectItem value="high">High (Departement)</SelectItem>
                            <SelectItem value="critical">Critical (Organization)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency *</Label>
                    <Select value={formData.urgency} onValueChange={(val: any) => setFormData({...formData, urgency: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Urgency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low (Next Week)</SelectItem>
                            <SelectItem value="medium">Medium (48h)</SelectItem>
                            <SelectItem value="high">High (Today)</SelectItem>
                            <SelectItem value="critical">Critical (Immediate)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            </div>

            {editingTicket && (
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(val: any) => setFormData({...formData, status: val})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary-700">Save Ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

