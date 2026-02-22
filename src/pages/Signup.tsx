import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2, Mail, Lock, User, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordChecks = useMemo(() => {
    return {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(
    () => Object.values(passwordChecks).filter(Boolean).length,
    [passwordChecks]
  );

  const passwordStrengthLabel =
    passwordScore <= 2 ? 'Weak' : passwordScore === 3 ? 'Fair' : passwordScore === 4 ? 'Good' : 'Strong';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordScore < 4) {
      toast({
        title: 'Security Alert',
        description: 'Use at least 8 characters with uppercase, lowercase, number, and special character.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast({
        title: 'Signup Failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'Welcome to Nivvaas',
        description: 'Your luxury journey begins now.',
      });
      navigate('/profile', { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      toast({
        title: 'Google Sign-In Failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Cinematic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]" />
      
      <Card className="w-full max-w-lg relative border-border bg-card/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl">
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.3)]">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Join Nivvaas
            </CardTitle>
            <CardDescription className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em]">
              Premium Real Estate Access
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-10">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Legal Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="fullName"
                  placeholder="Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-12 h-14 border-border focus:border-primary/50 rounded-2xl bg-background text-foreground font-medium transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@luxury.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 border-border focus:border-primary/50 rounded-2xl bg-background text-foreground font-medium transition-all"
                  required
                />
              </div>
            </div>

            {/* Passwords Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 border-border focus:border-primary/50 rounded-2xl bg-background text-foreground transition-all"
                    required
                  />
                </div>
                {password.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
                      <span className="text-muted-foreground">Password Strength</span>
                      <span className={passwordScore <= 2 ? 'text-destructive font-bold' : 'text-primary font-bold'}>
                        {passwordStrengthLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 rounded-full ${passwordScore >= level ? (passwordScore <= 2 ? 'bg-destructive' : 'bg-primary') : 'bg-muted'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Confirm</Label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 h-14 border-border focus:border-primary/50 rounded-2xl bg-background text-foreground transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-6 px-10 pb-12 pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 border-border text-foreground hover:bg-muted rounded-2xl font-bold transition-all"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirecting to Google...
                </>
              ) : (
                <>
                  <img src="/google-logo.svg" alt="Google" className="mr-2 h-5 w-5" />
                  Continue with Google
                </>
              )}
            </Button>

            <Button
              type="submit"
              className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Create Profile'
              )}
            </Button>

            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 border-t border-border" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Existing User?</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              asChild
              className="w-full h-14 border-border text-foreground hover:bg-muted rounded-2xl font-bold transition-all"
            >
              <Link to="/login">Sign In To Vault</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}