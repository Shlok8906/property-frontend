import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Loader2, Save, ShieldCheck, Zap } from 'lucide-react';

export default function Profile() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .single();

        if (data) {
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
        }
        if (error) throw error;
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    getProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved to the cloud.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email: string) => email.slice(0, 2).toUpperCase();

  if (initialLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background relative pb-20">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="container py-12 max-w-3xl relative z-10">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
              Account <span className="text-primary">Settings</span>
            </h1>
            <p className="text-muted-foreground font-medium">
              Manage your identity and contact preferences across Nivvaas.
            </p>
          </div>

          <div className="grid gap-8">
            {/* Header Card */}
            <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <Avatar className="h-24 w-24 border-4 border-background relative">
                      <AvatarFallback className="bg-primary text-white text-3xl font-black">
                        {getInitials(user?.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 bg-emerald-500 h-6 w-6 rounded-full border-4 border-background" title="Account Verified" />
                  </div>
                  
                  <div className="text-center md:text-left space-y-3">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <h2 className="text-2xl font-bold text-foreground tracking-tight">
                        {user?.email}
                      </h2>
                      <Badge className="bg-primary/20 text-primary border-primary/20 uppercase text-[10px] font-black px-3 py-1">
                        {role || 'Customer'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure Account
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-amber-500" /> Pro Member
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Card */}
            <Card className="bg-card border-border rounded-[2.5rem] shadow-2xl">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  Personal Details
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  This information will be used for your property enquiries.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Registered Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="pl-12 h-14 bg-muted border-border rounded-2xl text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Display Name</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className="pl-12 h-14 bg-background border-border rounded-2xl focus:border-primary focus:ring-primary/20 text-foreground transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Contact Number</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="pl-12 h-14 bg-background border-border rounded-2xl focus:border-primary focus:ring-primary/20 text-foreground transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full md:w-auto h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Synchronizing...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}