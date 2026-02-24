import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { enquiryAPI } from '@/lib/api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import {
  MessageSquare,
  Mail,
  Phone,
  Building2,
  RefreshCw,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  status: string;
  created_at: string;
  read?: boolean;
  projects: {
    project_name: string;
    location: string;
  } | null;
}

export default function AdminEnquiries() {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('enquiries')
        .select(`
          *,
          projects:project_uuid (
            project_name,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setEnquiries(data || []);
    } catch (error: any) {
      console.error('Error fetching enquiries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch enquiries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  // Mark all unread enquiries as read when page loads
  useEffect(() => {
    const markAsRead = async () => {
      try {
        const allEnquiries = await enquiryAPI.getAll();
        const unreadEnquiries = allEnquiries.filter((e: any) => !e.read);
        
        for (const enquiry of unreadEnquiries) {
          await enquiryAPI.markAsRead(enquiry.id);
        }
      } catch (error) {
        console.error('Error marking enquiries as read:', error);
      }
    };

    markAsRead();
  }, []);

  const updateStatus = async (enquiryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ status: newStatus })
        .eq('id', enquiryId);

      if (error) throw error;

      setEnquiries(enquiries.map(e => 
        e.id === enquiryId ? { ...e, status: newStatus } : e
      ));

      toast({
        title: 'Status Updated',
        description: `Enquiry marked as ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Pending</Badge>;
      case 'contacted':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Contacted</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">Enquiries</h1>
            </div>
            <Button onClick={fetchEnquiries} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </header>

          <main className="flex-1 p-6">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{enquiries.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {enquiries.filter(e => e.status === 'pending').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Contacted</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {enquiries.filter(e => e.status === 'contacted').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {enquiries.filter(e => e.status === 'resolved').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Enquiries Table */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : enquiries.length === 0 ? (
                  <div className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Enquiries Found</h3>
                    <p className="text-muted-foreground">
                      Enquiries from customers will appear here
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enquiries.map((enquiry) => (
                        <TableRow key={enquiry.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 font-medium">
                                <User className="h-3 w-3" />
                                {enquiry.name}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {enquiry.email}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {enquiry.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {enquiry.projects ? (
                              <div>
                                <p className="font-medium">{enquiry.projects.project_name}</p>
                                <p className="text-sm text-muted-foreground">{enquiry.projects.location}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="max-w-xs truncate text-sm">
                              {enquiry.message || '-'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(enquiry.created_at), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(enquiry.status)}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={enquiry.status}
                              onValueChange={(value) => updateStatus(enquiry.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
