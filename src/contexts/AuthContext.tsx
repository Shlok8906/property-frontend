import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { trackUserLogin } from '@/lib/userTracking';

type UserRole = 'admin' | 'customer' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching user role, using default:', error);
        return 'customer';
      }

      return (data?.role as UserRole) || 'customer';
    } catch (err) {
      console.warn('Error fetching user role, using default:', err);
      return 'customer';
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            const userRole = await fetchUserRole(session.user.id);
            setRole(userRole);
            setIsLoading(false);
          }, 0);
        } else {
          setRole('customer');
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserRole(session.user.id).then((userRole) => {
          setRole(userRole);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Subscribe to changes in the user_roles table
    const userRolesSubscription = supabase
      .channel('user_roles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_roles' },
        (payload) => {
          console.log('Realtime subscription triggered:', payload);
          if (payload.new.user_id === user?.id) {
            console.log('Updating role to:', payload.new.role);
            setRole(payload.new.role as UserRole);
          }
        }
      )
      .subscribe();

    return () => {
      userRolesSubscription.unsubscribe();
      authSubscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error && data?.user) {
      if (!data.session) {
        // If email confirmations are disabled, try to create a session immediately.
        await supabase.auth.signInWithPassword({ email, password });
      }

      const now = new Date().toISOString();
      const profilePayload = {
        id: data.user.id,
        full_name: fullName || null,
        updated_at: now,
      };

      const rolePayload = {
        user_id: data.user.id,
        role: 'customer' as const,
      };

      const [{ error: profileError }, { error: roleError }] = await Promise.all([
        supabase.from('profiles').upsert(profilePayload),
        supabase.from('user_roles').upsert(rolePayload),
      ]);

      if (profileError) {
        console.warn('Unable to create profile record:', profileError);
      }

      if (roleError) {
        console.warn('Unable to create user role record:', roleError);
      }

      await trackUserLogin({
        supabaseId: data.user.id,
        email: data.user.email || email,
        fullName: fullName || 'User',
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Track login in MongoDB if authentication successful
    if (!error && data?.user) {
      await trackUserLogin({
        supabaseId: data.user.id,
        email: data.user.email || email,
        fullName: data.user.user_metadata?.full_name || 'User',
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isLoading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
