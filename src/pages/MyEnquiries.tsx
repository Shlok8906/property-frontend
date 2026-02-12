import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Building2,
  Clock,
  MapPin,
  ChevronRight,
  ExternalLink
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
  projects: {
    id: string;
    project_name: string;
    location: string;
    image_url: string | null;
  } | null;
}

export default function MyEnquiries() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select(`
            *,
            projects:project_uuid (
              id,
              project_name,
              location,
              image_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEnquiries(data || []);
      } catch (error) {
        console.error('Error fetching enquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [user]);

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case 'contacted':
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'resolved':
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background relative">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container py-12 relative z-10">
          <div className="mb-10 space-y-2">
            <h1 className="text-4xl font-black text-foreground tracking-tight">
              My <span className="text-primary">Enquiries</span>
            </h1>
            <p className="text-muted-foreground font-medium">
              Keep track of your conversations with property developers.
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-3xl bg-muted" />
              ))}
            </div>
          ) : enquiries.length === 0 ? (
            <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden">
              <CardContent className="py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Quiet in here...</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    You haven't made any enquiries yet. Start exploring the finest properties in Pune.
                  </p>
                </div>
                <Link 
                  to="/properties" 
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
                >
                  Browse Properties <ChevronRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {enquiries.map((enquiry) => (
                <Card 
                  key={enquiry.id} 
                  className="bg-card border-border rounded-[2rem] overflow-hidden hover:bg-muted transition-all hover:border-primary/30 group"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Project Image/Icon */}
                    <div className="w-full md:w-56 h-48 md:h-auto overflow-hidden relative">
                      {enquiry.projects?.image_url ? (
                        <img
                          src={enquiry.projects.image_url}
                          alt={enquiry.projects.project_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                          <Building2 className="h-12 w-12 text-foreground/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div className="space-y-1">
                            {enquiry.projects && (
                              <Link 
                                to={`/properties/${enquiry.projects.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/link flex items-center gap-2 text-xl font-black text-foreground hover:text-primary transition-colors"
                              >
                                {enquiry.projects.project_name}
                                <ExternalLink className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                              </Link>
                            )}
                            {enquiry.projects && (
                              <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                <MapPin className="h-3 w-3 text-primary" />
                                {enquiry.projects.location}
                              </div>
                            )}
                          </div>
                          <Badge className={`px-4 py-1.5 rounded-full border text-[10px] uppercase font-black tracking-widest ${getStatusConfig(enquiry.status)}`}>
                            {enquiry.status}
                          </Badge>
                        </div>

                        {enquiry.message && (
                          <div className="relative bg-muted p-4 rounded-2xl mb-6 border border-border">
                            <p className="text-muted-foreground text-sm leading-relaxed italic">
                              "{enquiry.message}"
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between pt-6 border-t border-border gap-4">
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col">
                             <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Inquiry Date</span>
                             <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                               <Clock className="h-3 w-3 text-primary" />
                               {format(new Date(enquiry.created_at), 'MMMM do, yyyy')}
                             </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Support Assigned</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
    ;
}
