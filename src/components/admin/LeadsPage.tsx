import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Phone, Mail, Trash2, Eye, Star, TrendingUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://property-frontend-80y9.onrender.com';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  budget: string;
  location: string;
  priority: 'hot' | 'warm' | 'cold';
  source: string;
  created_at: string;
  notes?: string;
  conversionPotential: number;
  status?: string;
}

const LEAD_ACTIONS = {
  RESPONSE_STATUS: [
    { label: 'Not Answering', value: 'not_answering' },
    { label: 'No Requirement', value: 'no_requirement' },
    { label: 'Budget Mismatch', value: 'budget_mismatch' },
    { label: 'Locality Mismatch', value: 'locality_mismatch' },
    { label: 'Broker', value: 'broker' },
    { label: 'Already Purchased', value: 'already_purchased' },
  ],
  LEAD_STATUS: [
    { label: 'Interested', value: 'interested' },
    { label: 'Followup / Callback', value: 'followup' },
    { label: 'Site Visit', value: 'site_visit' },
    { label: 'Deal Success', value: 'deal_success' },
    { label: 'Rejected', value: 'rejected' },
  ],
};

const PRIORITY_COLORS: Record<string, string> = {
  hot: 'status-new',
  warm: 'status-follow-up',
  cold: 'status-rejected',
};

const PRIORITY_LABELS: Record<string, string> = {
  hot: '🔥 Hot Lead',
  warm: '🌤️ Warm Lead',
  cold: '❄️ Cold Lead',
};

// Helper to format status display
const getStatusLabel = (status: string | undefined): string => {
  if (!status) return 'No status';
  
  const allStatuses = [...LEAD_ACTIONS.LEAD_STATUS, ...LEAD_ACTIONS.RESPONSE_STATUS];
  const statusObj = allStatuses.find(s => s.value === status);
  return statusObj?.label || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRejectionMenu, setShowRejectionMenu] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    budget: '',
    location: '',
    priority: 'warm' as const,
    source: '',
    notes: '',
    conversionPotential: 50,
  });
  const { toast } = useToast();

  // Fetch leads from API
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/leads`);
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data);
      setFilteredLeads(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter leads
  useEffect(() => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(term) ||
          l.email.toLowerCase().includes(term) ||
          l.phone.includes(term) ||
          l.propertyType.toLowerCase().includes(term)
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((l) => l.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }

    // Sort by conversion potential (highest first)
    filtered.sort((a, b) => b.conversionPotential - a.conversionPotential);

    setFilteredLeads(filtered);
  }, [searchTerm, priorityFilter, statusFilter, leads]);

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete lead');
      
      setLeads(leads.filter((l) => l._id !== id));
      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      });
    }
  };

  const handlePriorityChange = async (id: string, newPriority: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (!response.ok) throw new Error('Failed to update priority');
      
      const updatedLead = await response.json();
      setLeads(leads.map((l) => (l._id === id ? updatedLead : l)));
      toast({
        title: 'Success',
        description: `Priority updated to ${PRIORITY_LABELS[newPriority]}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update priority',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      
      const updatedLead = await response.json();
      setLeads(leads.map((l) => (l._id === id ? updatedLead : l)));
      
      const statusLabel = [...LEAD_ACTIONS.LEAD_STATUS, ...LEAD_ACTIONS.RESPONSE_STATUS]
        .find(s => s.value === newStatus)?.label || newStatus;
      
      toast({
        title: 'Success',
        description: `Status updated to ${statusLabel}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/${selectedLead._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error('Failed to save notes');
      
      const updatedLead = await response.json();
      setLeads(leads.map((l) => (l._id === selectedLead._id ? updatedLead : l)));
      toast({
        title: 'Success',
        description: 'Notes saved successfully',
      });
      setShowNotesDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive',
      });
    }
  };

  const handleCreateLead = async () => {
    if (!newLead.name || !newLead.email || !newLead.phone) {
      toast({
        title: 'Error',
        description: 'Name, email, and phone are required',
        variant: 'destructive',
      });
      return;
    }

    // Validate budget format (should be like "50-100" for lakhs)
    if (newLead.budget && !/^\d+(-\d+)?$/.test(newLead.budget)) {
      toast({
        title: 'Error',
        description: 'Budget must be in format: "50-100" (in lakhs) or single value "50"',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      if (!response.ok) throw new Error('Failed to create lead');
      
      const createdLead = await response.json();
      setLeads([createdLead, ...leads]);
      toast({
        title: 'Success',
        description: 'Lead created successfully',
      });
      setShowAddDialog(false);
      setNewLead({
        name: '',
        email: '',
        phone: '',
        propertyType: '',
        budget: '',
        location: '',
        priority: 'warm',
        source: '',
        notes: '',
        conversionPotential: 50,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create lead',
        variant: 'destructive',
      });
    }
  };

  const hotLeadsCount = leads.filter((l) => l.priority === 'hot').length;
  const totalBudget = leads.reduce((sum, l) => {
    const min = parseInt(l.budget.split('-')[0]);
    return sum + (isNaN(min) ? 0 : min);
  }, 0);
  const avgConversion =
    leads.length > 0
      ? Math.round(
          leads.reduce((sum, l) => sum + l.conversionPotential, 0) / leads.length
        )
      : 0;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sales Leads</h1>
            <p className="text-muted-foreground mt-1">Manage and track your property buyer leads</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{leads.length}</div>
              <p className="text-muted-foreground text-sm">Total Leads</p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <span>+</span> Add Lead
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-500">{hotLeadsCount}</div>
              <p className="text-sm text-muted-foreground mt-1">🔥 Hot Leads</p>
              <p className="text-xs text-muted-foreground mt-2">High conversion potential</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-500">
                {leads.filter((l) => l.priority === 'warm').length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">🌤️ Warm Leads</p>
              <p className="text-xs text-muted-foreground mt-2">Needs follow-up</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-500">{avgConversion}%</div>
              <p className="text-sm text-muted-foreground mt-1">Avg Conversion</p>
              <p className="text-xs text-muted-foreground mt-2">Average potential</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">
                ₹{(totalBudget / 100).toFixed(2)} Cr
              </div>
              <p className="text-sm text-muted-foreground mt-1">Total Budget</p>
              <p className="text-xs text-muted-foreground mt-2">Combined buying power</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, phone, or property type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="hot">🔥 Hot</SelectItem>
                  <SelectItem value="warm">🌤️ Warm</SelectItem>
                  <SelectItem value="cold">❄️ Cold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {LEAD_ACTIONS.LEAD_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="separator" disabled>
                    ────────────────
                  </SelectItem>
                  {LEAD_ACTIONS.RESPONSE_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden">
          <CardHeader>
            <CardTitle>Lead List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-muted-foreground">Loading leads...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Property Type</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Potential</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => (
                        <TableRow key={lead._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-sm text-muted-foreground">{lead.source}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium">{lead.propertyType}</p>
                            <p className="text-xs text-muted-foreground">{lead.location}</p>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{lead.budget}</p>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={lead.priority}
                              onValueChange={(value) => handlePriorityChange(lead._id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hot">🔥 Hot</SelectItem>
                                <SelectItem value="warm">🌤️ Warm</SelectItem>
                                <SelectItem value="cold">❄️ Cold</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              {getStatusLabel(lead.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/50"
                                  style={{ width: `${lead.conversionPotential}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {lead.conversionPotential}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <DropdownMenu 
                                open={showRejectionMenu === lead._id ? true : undefined}
                                onOpenChange={(open) => {
                                  if (!open) setShowRejectionMenu(null);
                                }}
                              >
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline" className="gap-1">
                                    Actions
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  {showRejectionMenu === lead._id ? (
                                    <>
                                      <DropdownMenuLabel className="flex items-center justify-between">
                                        <span>Response Issues</span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 px-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowRejectionMenu(null);
                                          }}
                                        >
                                          ← Back
                                        </Button>
                                      </DropdownMenuLabel>
                                      {LEAD_ACTIONS.RESPONSE_STATUS.map((action) => (
                                        <DropdownMenuItem
                                          key={action.value}
                                          onClick={() => {
                                            handleStatusUpdate(lead._id, action.value);
                                            setShowRejectionMenu(null);
                                          }}
                                        >
                                          <span className="text-sm">{action.label}</span>
                                        </DropdownMenuItem>
                                      ))}
                                    </>
                                  ) : (
                                    <>
                                      <DropdownMenuLabel>Lead Status</DropdownMenuLabel>
                                      {LEAD_ACTIONS.LEAD_STATUS.filter(a => a.value !== 'rejected').map((action) => (
                                        <DropdownMenuItem
                                          key={action.value}
                                          onClick={() => handleStatusUpdate(lead._id, action.value)}
                                        >
                                          <span className="text-sm">{action.label}</span>
                                        </DropdownMenuItem>
                                      ))}
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setShowRejectionMenu(lead._id);
                                        }}
                                      >
                                        <span className="text-sm">Rejected</span>
                                        <span className="ml-auto text-xs text-muted-foreground">→</span>
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setShowDetailsDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setNotes(lead.notes || '');
                                  setShowNotesDialog(true);
                                }}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleDeleteLead(lead._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-muted-foreground">No leads found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              View detailed information about this lead
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Name</Label>
                  <p className="font-medium mt-1">{selectedLead.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Email</Label>
                  <p className="font-medium mt-1">{selectedLead.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Phone</Label>
                  <p className="font-medium mt-1">{selectedLead.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Source</Label>
                  <p className="font-medium mt-1">{selectedLead.source}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Property Type</Label>
                  <p className="font-medium mt-1">{selectedLead.propertyType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Budget</Label>
                  <p className="font-medium mt-1">{selectedLead.budget}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Location Preference</Label>
                  <p className="font-medium mt-1">{selectedLead.location}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Conversion Potential</Label>
                  <p className="font-medium mt-1">{selectedLead.conversionPotential}%</p>
                </div>
              </div>

              {selectedLead.notes && (
                <div>
                  <Label className="text-muted-foreground text-sm">Notes</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedLead.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add/Edit Notes</DialogTitle>
            <DialogDescription>
              Add internal notes and follow-up reminders for this lead
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add follow-up reminders, buyer preferences, negotiation notes, or any other important information..."
                rows={8}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Create a new sales lead in your pipeline
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="Email address"
                  type="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  placeholder="Website, Referral, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Input
                  id="propertyType"
                  value={newLead.propertyType}
                  onChange={(e) => setNewLead({ ...newLead, propertyType: e.target.value })}
                  placeholder="e.g., 3BHK Apartment"
                />
              </div>
              <div>
                <Label htmlFor="budget">
                  Budget <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="budget"
                  value={newLead.budget}
                  onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                  placeholder="e.g., 50-100 or 50 (in lakhs)"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Format: min-max or single value (e.g., 50-100 or 75)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newLead.location}
                  onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                  placeholder="Preferred location"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newLead.priority}
                  onValueChange={(value) => setNewLead({ ...newLead, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">🔥 Hot</SelectItem>
                    <SelectItem value="warm">🌤️ Warm</SelectItem>
                    <SelectItem value="cold">❄️ Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newLead.notes}
                onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLead}>
              Create Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
