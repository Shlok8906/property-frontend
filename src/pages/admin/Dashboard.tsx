import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2,
  Home,
  Upload,
  MessageSquare,
  Users,
  TrendingUp,
  Plus,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';

interface DashboardStats {
  totalListings: number;
  residentialCount: number;
  commercialCount: number;
  totalLeads: number;
  newLeadsToday: number;
  followUpsPending: number;
  successfulDeals: number;
  rejectedLeads: number;
  pendingEnquiries: number;
}

interface RecentLead {
  id: string;
  customer_name: string;
  phone: string;
  source: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    residentialCount: 0,
    commercialCount: 0,
    totalLeads: 0,
    newLeadsToday: 0,
    followUpsPending: 0,
    successfulDeals: 0,
    rejectedLeads: 0,
    pendingEnquiries: 0,
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch projects count (our existing projects table)
        const { count: projectsCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        // Fetch properties count (new manual listings)
        const { count: propertiesCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });

        // Fetch residential properties
        const { count: residentialCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('category', 'residential');

        // Fetch commercial properties
        const { count: commercialCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('category', 'commercial');

        // Fetch leads stats
        const { count: totalLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        // New leads today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: newLeadsToday } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());

        // Follow-ups pending
        const { count: followUpsPending } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'follow_up');

        // Successful deals
        const { count: successfulDeals } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'successful');

        // Rejected leads
        const { count: rejectedLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'rejected');

        // Pending enquiries
        const { count: pendingEnquiries } = await supabase
          .from('enquiries')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch recent leads
        const { data: leads } = await supabase
          .from('leads')
          .select('id, customer_name, phone, source, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalListings: (projectsCount || 0) + (propertiesCount || 0),
          residentialCount: residentialCount || 0,
          commercialCount: commercialCount || 0,
          totalLeads: totalLeads || 0,
          newLeadsToday: newLeadsToday || 0,
          followUpsPending: followUpsPending || 0,
          successfulDeals: successfulDeals || 0,
          rejectedLeads: rejectedLeads || 0,
          pendingEnquiries: pendingEnquiries || 0,
        });

        setRecentLeads(leads || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [role, navigate]);

  const quickActions = [
    {
      title: 'Add Property',
      description: 'Create a new property listing manually',
      icon: Plus,
      href: '/admin/add-property',
      gradient: 'gradient-primary',
    },
    {
      title: 'Upload CSV',
      description: 'Bulk import properties from CSV file',
      icon: Upload,
      href: '/admin/upload',
      gradient: 'gradient-secondary',
    },
    {
      title: 'Manage Leads',
      description: 'View and manage all customer leads',
      icon: Users,
      href: '/admin/leads',
      gradient: 'gradient-accent',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-primary/20 text-primary',
      follow_up: 'bg-amber-500/20 text-amber-500',
      interested: 'bg-blue-500/20 text-blue-500',
      successful: 'bg-emerald-500/20 text-emerald-500',
      rejected: 'bg-destructive/20 text-destructive',
    };
    return styles[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back! Here's your overview.">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Listings"
          value={stats.totalListings}
          icon={Building2}
          variant="primary"
          loading={loading}
        />
        <StatsCard
          title="Residential"
          value={stats.residentialCount}
          icon={Home}
          variant="secondary"
          loading={loading}
        />
        <StatsCard
          title="Commercial"
          value={stats.commercialCount}
          icon={Building2}
          variant="accent"
          loading={loading}
        />
        <StatsCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={Users}
          variant="success"
          loading={loading}
        />
      </div>

      {/* Lead Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : stats.newLeadsToday}</p>
                <p className="text-xs text-muted-foreground">New Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : stats.followUpsPending}</p>
                <p className="text-xs text-muted-foreground">Follow-ups</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : stats.successfulDeals}</p>
                <p className="text-xs text-muted-foreground">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : stats.rejectedLeads}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className="h-full hover:border-primary/50 transition-colors border-border/50 hover:shadow-elevated">
                  <CardContent className="p-5">
                    <div className={`w-12 h-12 rounded-xl ${action.gradient} flex items-center justify-center mb-4`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Leads */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Leads</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/leads">
                View All <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Card className="border-border/50">
            <CardContent className="p-0">
              {recentLeads.length === 0 && !loading ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No leads yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{lead.customer_name}</span>
                        <Badge className={getStatusBadge(lead.status)}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started */}
      {stats.totalListings === 0 && !loading && (
        <Card className="mt-8 border-2 border-dashed border-primary/50 bg-primary/5">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Get Started</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your first property listing to start managing your real estate business.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild className="gradient-primary">
                <Link to="/admin/add-property">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
