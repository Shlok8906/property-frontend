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
import { Search, MessageSquare, Trash2, Eye, Mail, Phone, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contactAPI } from '@/lib/api';

interface ContactMessage {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: 'new' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
  read?: boolean;
}

export function MessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  // Mark all unread messages as read when page loads
  useEffect(() => {
    const markAsRead = async () => {
      try {
        const allMessages = await contactAPI.getAll();
        const unreadMessages = allMessages.filter((m: any) => !m.read);
        
        for (const message of unreadMessages) {
          const msgId = message.id || message._id;
          if (msgId) {
            await contactAPI.markAsRead(msgId);
          }
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markAsRead();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, statusFilter]);

  const fetchMessages = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/contact-messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((msg) => msg.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.name.toLowerCase().includes(search) ||
          msg.email.toLowerCase().includes(search) ||
          msg.phone.includes(search) ||
          msg.message.toLowerCase().includes(search)
      );
    }

    setFilteredMessages(filtered);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/contact-messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast({
        title: 'Success',
        description: 'Message status updated',
      });

      fetchMessages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update message status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/contact-messages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      toast({
        title: 'Success',
        description: 'Message deleted',
      });

      fetchMessages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'new':
        return 'default';
      case 'responded':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const stats = {
    total: messages.length,
    new: messages.filter((m) => m.status === 'new').length,
    responded: messages.filter((m) => m.status === 'responded').length,
    closed: messages.filter((m) => m.status === 'closed').length,
  };

  return (
    <AdminLayout title="Contact Messages" subtitle="Manage customer messages and inquiries">
      <div className="space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Messages</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{stats.new}</div>
              <p className="text-sm text-muted-foreground mt-1">New Messages</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-500">{stats.responded}</div>
              <p className="text-sm text-muted-foreground mt-1">Responded</p>
            </CardContent>
          </Card>
          <Card className="card-premium">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-500">{stats.closed}</div>
              <p className="text-sm text-muted-foreground mt-1">Closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, phone, or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages ({filteredMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages found
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Message Preview</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.map((message) => (
                      <TableRow key={message._id || message.id}>
                        <TableCell className="font-medium">{message.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{message.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{message.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {message.message}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(message.status)}>
                            {message.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(message.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewMessage(message)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Select
                              value={message.status}
                              onValueChange={(value) => handleUpdateStatus(message._id || message.id || '', value)}
                            >
                              <SelectTrigger className="w-[120px] h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="responded">Responded</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(message._id || message.id || '')}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Message Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
              <DialogDescription>Complete message information</DialogDescription>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Name</p>
                    <p className="text-base">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Status</p>
                    <Badge variant={getStatusVariant(selectedMessage.status)}>
                      {selectedMessage.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Email</p>
                    <a href={`mailto:${selectedMessage.email}`} className="text-base text-primary hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Phone</p>
                    <a href={`tel:${selectedMessage.phone}`} className="text-base text-primary hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Message</p>
                  <p className="text-base bg-muted p-4 rounded-lg">{selectedMessage.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold">Received</p>
                    <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Last Updated</p>
                    <p>{new Date(selectedMessage.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
