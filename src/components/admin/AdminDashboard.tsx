import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MessageSquare, 
  TrendingUp,
  ArrowRight,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { statsAPI, DashboardStats } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    activeListings: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsAPI.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard statistics',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Manage your property business efficiently"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="card-premium p-6 hover:border-primary/50 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Properties</p>
              <p className="text-3xl font-bold">{loading ? '...' : stats.totalProperties}</p>
            </div>
            <Building2 className="w-8 h-8 text-primary opacity-80" />
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {loading ? 'Loading...' : `${stats.activeListings} active listings`}
          </p>
        </Card>

        <Card className="card-premium p-6 hover:border-primary/50 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Enquiries</p>
              <p className="text-3xl font-bold">{loading ? '...' : stats.totalEnquiries}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-accent opacity-80" />
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            All enquiries received
          </p>
        </Card>

        <Card className="card-premium p-6 hover:border-green-500/50 transition-all border-green-500/30 bg-green-500/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                New Enquiries
                {stats.newEnquiries > 0 && (
                  <Badge variant="destructive" className="h-5 px-2 animate-pulse">
                    <Bell className="w-3 h-3 mr-1" />
                    {stats.newEnquiries}
                  </Badge>
                )}
              </p>
              <p className="text-3xl font-bold text-green-600">{loading ? '...' : stats.newEnquiries}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-600 opacity-80" />
          </div>
          <p className="text-xs text-green-600 mt-4 font-medium">
            Pending responses
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties Management */}
        <Card className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Properties</h3>
              <p className="text-sm text-muted-foreground">Manage all properties</p>
            </div>
            <Building2 className="w-8 h-8 text-primary opacity-40" />
          </div>
          
          <div className="space-y-3 mb-4">
            <p className="text-sm">
              Create new properties, edit existing ones, update details, and manage inventory.
            </p>
            <div className="text-sm space-y-2">
              <p><span className="font-medium">Total:</span> {stats.totalProperties} properties</p>
              <p><span className="font-medium">Active:</span> {stats.activeListings} for sale</p>
            </div>
          </div>

          <Link to="/admin/properties">
            <Button className="w-full gap-2">
              Manage Properties
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>

        {/* Enquiries Management */}
        <Card className="card-premium p-6 border-green-500/30 bg-green-500/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Enquiries
                {stats.newEnquiries > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {stats.newEnquiries} New
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">Respond to enquiries</p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-600 opacity-40" />
          </div>
          
          <div className="space-y-3 mb-4">
            <p className="text-sm">
              View all enquiries from potential buyers and manage your responses.
            </p>
            <div className="text-sm space-y-2">
              <p><span className="font-medium">Total:</span> {stats.totalEnquiries} enquiries</p>
              <p><span className="font-medium text-green-600">New:</span> <span className="text-green-600 font-bold">{stats.newEnquiries} need response</span></p>
            </div>
          </div>

          <Link to="/admin/enquiries">
            <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
              View Enquiries
              {stats.newEnquiries > 0 && <Bell className="w-4 h-4 animate-pulse" />}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="card-premium p-6 mt-6 border-primary/20 bg-primary/5">
        <h3 className="font-semibold mb-3">Quick Tips</h3>
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li>✨ Add high-quality images to increase property visibility</li>
          <li>📝 Write detailed descriptions with all key features and amenities</li>
          <li>⏱️ Respond to enquiries quickly to maximize conversion</li>
          <li>📊 Track leads and follow up regularly for better results</li>
        </ul>
      </Card>
    </AdminLayout>
  );
}
