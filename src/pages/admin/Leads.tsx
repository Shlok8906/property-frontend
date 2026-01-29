import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Phone, 
  Mail, 
  MessageSquare, 
  Filter,
  Plus,
  ExternalLink,
  StickyNote,
  Clock
} from 'lucide-react';
import { LEAD_STATUSES, REJECTION_REASONS } from '@/types/property';
import { format } from 'date-fns';

interface LeadNote {
  id: string;
  text: string;
  created_at: string;
}

interface Lead {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  budget: string | null;
  interested_localities: string | null;
  property_id: string | null;
  source: string;
  status: string;
  rejection_reason: string | null;
  notes: LeadNote[] | null;
  created_at: string;
  updated_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  
  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    budget: '',
    interested_localities: '',
    source: 'walk-in',
    status: 'new',
  });
  
  const { toast } = useToast();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery) {
        query = query.or(`customer_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      // Parse notes from JSON
      const parsedLeads = (data || []).map((lead: any) => ({
        ...lead,
        notes: Array.isArray(lead.notes) ? lead.notes : [],
      }));
      setLeads(parsedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, searchQuery]);

  const updateLeadStatus = async () => {
    if (!selectedLead || !newStatus) return;

    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', selectedLead.id);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Lead status changed to ${newStatus}`,
      });

      setIsStatusDialogOpen(false);
      setSelectedLead(null);
      setNewStatus('');
      setRejectionReason('');
      fetchLeads();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const addNote = async () => {
    if (!selectedLead || !newNote.trim()) return;

    try {
      const notes = Array.isArray(selectedLead.notes) ? selectedLead.notes : [];
      const updatedNotes = [
        ...notes,
        {
          id: crypto.randomUUID(),
          text: newNote.trim(),
          created_at: new Date().toISOString(),
        },
      ];

      const { error } = await supabase
        .from('leads')
        .update({ notes: updatedNotes as any })
        .eq('id', selectedLead.id);

      if (error) throw error;

      toast({
        title: 'Note Added',
        description: 'Internal note has been saved',
      });

      setIsNoteDialogOpen(false);
      setSelectedLead(null);
      setNewNote('');
      fetchLeads();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add note',
        variant: 'destructive',
      });
    }
  };

  const createNewLead = async () => {
    if (!newLeadForm.customer_name || !newLeadForm.phone) {
      toast({
        title: 'Validation Error',
        description: 'Customer name and phone are required',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingLead(true);
    try {
      const { error } = await supabase.from('leads').insert({
        customer_name: newLeadForm.customer_name,
        phone: newLeadForm.phone,
        email: newLeadForm.email || null,
        budget: newLeadForm.budget || null,
        interested_localities: newLeadForm.interested_localities || null,
        source: newLeadForm.source,
        status: newLeadForm.status,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Lead created successfully!',
      });

      // Reset form
      setNewLeadForm({
        customer_name: '',
        phone: '',
        email: '',
        budget: '',
        interested_localities: '',
        source: 'walk-in',
        status: 'new',
      });
      setIsAddLeadDialogOpen(false);
      fetchLeads();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create lead',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingLead(false);
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const message = `Hi ${name}, I'm reaching out regarding your property inquiry. How can I help you?`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = LEAD_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-muted text-muted-foreground';
  };

  return (
    <AdminLayout 
      title="Leads Management" 
      subtitle="Track and manage all customer leads"
      actions={
        <Button 
          className="gradient-primary"
          onClick={() => setIsAddLeadDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      }
    >
      {/* Filters */}
      <Card className="mb-6 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background border-border/50">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No leads found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Leads will appear here when customers enquire'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-muted/30">
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.customer_name}</p>
                        {lead.budget && (
                          <p className="text-sm text-muted-foreground">Budget: {lead.budget}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {lead.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(lead.status)}>
                        {lead.status.replace('_', ' ')}
                      </Badge>
                      {lead.rejection_reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {lead.rejection_reason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(lead.created_at), 'dd MMM yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openWhatsApp(lead.phone, lead.customer_name)}
                        >
                          <MessageSquare className="h-4 w-4 text-emerald-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsNoteDialogOpen(true);
                          }}
                        >
                          <StickyNote className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLead(lead);
                            setNewStatus(lead.status);
                            setIsStatusDialogOpen(true);
                          }}
                        >
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Add Internal Note</DialogTitle>
            <DialogDescription>
              Add a private note for {selectedLead?.customer_name}
            </DialogDescription>
          </DialogHeader>
          
          {/* Existing Notes */}
          {selectedLead && Array.isArray(selectedLead.notes) && selectedLead.notes.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedLead.notes.map((note: any) => (
                <div key={note.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p>{note.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(note.created_at), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label>New Note</Label>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addNote} disabled={!newNote.trim()}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
            <DialogDescription>
              Change the status for {selectedLead?.customer_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'rejected' && (
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REJECTION_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateLeadStatus} disabled={!newStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={isAddLeadDialogOpen} onOpenChange={setIsAddLeadDialogOpen}>
        <DialogContent className="bg-card border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
            <DialogDescription>
              Add a new lead to track customer interest
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                placeholder="Full name"
                value={newLeadForm.customer_name}
                onChange={(e) => setNewLeadForm({...newLeadForm, customer_name: e.target.value})}
                className="bg-background border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="10-digit phone number"
                value={newLeadForm.phone}
                onChange={(e) => setNewLeadForm({...newLeadForm, phone: e.target.value})}
                className="bg-background border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={newLeadForm.email}
                onChange={(e) => setNewLeadForm({...newLeadForm, email: e.target.value})}
                className="bg-background border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                placeholder="e.g., 50L - 1Cr"
                value={newLeadForm.budget}
                onChange={(e) => setNewLeadForm({...newLeadForm, budget: e.target.value})}
                className="bg-background border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localities">Interested Localities</Label>
              <Input
                id="localities"
                placeholder="e.g., Baner, Hinjewadi"
                value={newLeadForm.interested_localities}
                onChange={(e) => setNewLeadForm({...newLeadForm, interested_localities: e.target.value})}
                className="bg-background border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={newLeadForm.source} onValueChange={(value) => setNewLeadForm({...newLeadForm, source: value})}>
                <SelectTrigger className="bg-background border-border/50">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">Walk-in</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLeadDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createNewLead} 
              disabled={isCreatingLead || !newLeadForm.customer_name || !newLeadForm.phone}
              className="gradient-primary"
            >
              {isCreatingLead ? 'Creating...' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
