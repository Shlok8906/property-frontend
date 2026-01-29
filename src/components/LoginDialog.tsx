import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function LoginDialog({ isOpen, onClose, message }: LoginDialogProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login', { state: { from: location } });
  };

  const handleSignup = () => {
    onClose();
    navigate('/signup', { state: { from: location } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl">Sign In Required</DialogTitle>
          <DialogDescription className="mt-4 text-base">
            {message || 'Please sign in to your account to submit an enquiry for this property.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={handleLogin}
            className="w-full h-12 gradient-primary text-white font-semibold rounded-lg group"
          >
            Sign In
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            onClick={handleSignup}
            variant="outline"
            className="w-full h-12 border-2 border-primary text-primary hover:bg-primary/10 font-semibold rounded-lg group"
          >
            Create Account
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center text-sm text-muted-foreground">
          🏠 Browse properties freely, but sign in to save enquiries and contact sellers.
        </div>
      </DialogContent>
    </Dialog>
  );
}
