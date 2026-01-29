import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, MessageSquare, Trash2, Eye, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enquiryAPI, Enquiry } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-green-500/20 text-green-700 border-green-500',
  contacted: 'bg-blue-500/20 text-blue-700 border-blue-500',
  closed: 'bg-gray-500/20 text-gray-700 border-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
};

export function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<Enquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEnquiries();
  }, []);

  useEffect(() => {
    const filtered = enquiries.filter(
      (enq) =>
        enq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.propertyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEnquiries(filtered);
  }, [searchTerm, enquiries]);

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const data = await enquiryAPI.getAll();
      setEnquiries(data);
      setFilteredEnquiries(data);
    } catch (error) {
      console.error('Error loading enquiries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load enquiries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'new' | 'contacted' | 'closed') => {
    try {
      await enquiryAPI.update(id, { status: newStatus });
      setEnquiries(enquiries.map(enq => 
        (enq._id === id || enq.id === id) ? { ...enq, status: newStatus } : enq
      ));
      toast({
        title: 'Status Updated',
        description: `Enquiry marked as ${STATUS_LABELS[newStatus]}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;

    try {
      await enquiryAPI.delete(id);
      setEnquiries(enquiries.filter(enq => enq._id !== id && enq.id !== id));
      toast({
        title: 'Enquiry Deleted',
        description: 'The enquiry has been removed',
      });
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete enquiry',
        variant: 'destructive',
      });
    }
  };

  const newEnquiriesCount = enquiries.filter(e => e.status === 'new').length;

  return (
    <AdminLayout title="Enquiries" subtitle="Manage customer enquiries">
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Enquiries</p>
                  <p className="text-2xl font-bold">{enquiries.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    New Enquiries
                    {newEnquiriesCount > 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        <Bell className="w-3 h-3 mr-1" />
                        {newEnquiriesCount}
                      </Badge>
                    )}
                  </p>
                  <p className="text-2xl font-bold text-green-600">{newEnquiriesCount}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contacted</p>
                  <p className="text-2xl font-bold">
                    {enquiries.filter(e => e.status === 'contacted').length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>All Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, phone, email, or property..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading enquiries...</div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No enquiries found matching your search' : 'No enquiries yet'}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnquiries.map((enquiry) => (
                      <TableRow key={enquiry._id || enquiry.id}>
                        <TableCell className="text-sm">
                          {new Date(enquiry.created_at || '').toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">{enquiry.name}</TableCell>
                        <TableCell>{enquiry.phone}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {enquiry.propertyTitle || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={enquiry.status}
                            onValueChange={(value: any) =>
                              handleStatusChange(enquiry._id || enquiry.id || '', value)
                            }
                          >
                            <SelectTrigger className={`w-32 ${STATUS_COLORS[enquiry.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEnquiry(enquiry);
                              setShowViewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(enquiry._id || enquiry.id || '')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Enquiry Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>View and manage enquiry information</DialogDescription>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{selectedEnquiry.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{selectedEnquiry.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedEnquiry.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">
                    {new Date(selectedEnquiry.created_at || '').toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Property</Label>
                <p className="text-sm">{selectedEnquiry.propertyTitle || 'N/A'}</p>
              </div>

              {selectedEnquiry.message && (
                <div>
                  <Label className="text-sm font-medium">Message</Label>
                  <Textarea
                    value={selectedEnquiry.message}
                    readOnly
                    className="mt-1 min-h-24"
                  />
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={selectedEnquiry.status}
                  onValueChange={(value: any) => {
                    handleStatusChange(selectedEnquiry._id || selectedEnquiry.id || '', value);
                    setShowViewDialog(false);
                  }}
                >
                  <SelectTrigger className={`w-full mt-1 ${STATUS_COLORS[selectedEnquiry.status]}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
