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
import { Search, Phone, Mail, Trash2, Eye, Star, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  budget: string;
  location: string;
  priority: 'hot' | 'warm' | 'cold';
  source: string;
  createdAt: string;
  notes?: string;
  conversionPotential: number; // 0-100
}

// Mock data
const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 99876 54321',
    propertyType: '3BHK Apartment',
    budget: '50-60 Lakhs',
    location: 'Hinjewadi, Baner',
    priority: 'hot',
    source: 'Website',
    createdAt: '2026-01-27',
    notes: 'Serious buyer, ready to purchase within 2 weeks',
    conversionPotential: 85,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43210',
    propertyType: '2BHK Villa',
    budget: '35-45 Lakhs',
    location: 'Wakad',
    priority: 'warm',
    source: 'Referral',
    createdAt: '2026-01-26',
    notes: 'First-time buyer, needs mortgage assistance',
    conversionPotential: 60,
  },
  {
    id: '3',
    name: 'Ankit Patel',
    email: 'ankit@example.com',
    phone: '+91 87654 32109',
    propertyType: '4BHK Penthouse',
    budget: '80-100 Lakhs',
    location: 'Koregaon Park, Viman Nagar',
    priority: 'hot',
    source: 'Phone Call',
    createdAt: '2026-01-25',
    conversionPotential: 75,
  },
  {
    id: '4',
    name: 'Sneha Desai',
    email: 'sneha@example.com',
    phone: '+91 76543 21098',
    propertyType: '1BHK Apartment',
    budget: '20-25 Lakhs',
    location: 'Hadapsar',
    priority: 'cold',
    source: 'Email Campaign',
    createdAt: '2026-01-24',
    notes: 'Just browsing, no immediate plans',
    conversionPotential: 25,
  },
];

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

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(MOCK_LEADS);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

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

    // Sort by conversion potential (highest first)
    filtered.sort((a, b) => b.conversionPotential - a.conversionPotential);

    setFilteredLeads(filtered);
  }, [searchTerm, priorityFilter, leads]);

  const handleDeleteLead = (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      setLeads(leads.filter((l) => l.id !== id));
      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });
    }
  };

  const handlePriorityChange = (id: string, newPriority: string) => {
    setLeads(
      leads.map((l) =>
        l.id === id ? { ...l, priority: newPriority as any } : l
      )
    );
    toast({
      title: 'Success',
      description: `Priority updated to ${PRIORITY_LABELS[newPriority]}`,
    });
  };

  const handleSaveNotes = () => {
    if (selectedLead) {
      setLeads(
        leads.map((l) =>
          l.id === selectedLead.id ? { ...l, notes } : l
        )
      );
      toast({
        title: 'Success',
        description: 'Notes saved successfully',
      });
      setShowNotesDialog(false);
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
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{leads.length}</div>
            <p className="text-muted-foreground text-sm">Total Leads</p>
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
                ₹{totalBudget / 100000}Cr+
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
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="card-premium overflow-hidden">
          <CardHeader>
            <CardTitle>Lead List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Property Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Potential</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
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
                            onValueChange={(value) => handlePriorityChange(lead.id, value)}
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
                          <div className="flex items-center gap-1">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-gradient-success h-2 rounded-full"
                                style={{ width: `${lead.conversionPotential}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium ml-2">{lead.conversionPotential}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
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
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteLead(lead.id)}
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
    </AdminLayout>
  );
}
