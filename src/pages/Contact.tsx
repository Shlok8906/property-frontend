import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { emailVerificationAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpRequestId, setOtpRequestId] = useState('');
  const [otpVerificationToken, setOtpVerificationToken] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const resetOtpState = () => {
    setOtpCode('');
    setOtpRequestId('');
    setOtpVerificationToken('');
    setOtpVerified(false);
  };

  const handleRequestOtp = async () => {
    if (!formData.email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email to receive OTP.',
        variant: 'destructive',
      });
      return;
    }

    setOtpSending(true);
    try {
      const result = await emailVerificationAPI.requestOtp(formData.email, 'contact');
      setOtpRequestId(result.requestId);
      setOtpVerified(false);
      setOtpVerificationToken('');

      toast({
        title: 'OTP Sent',
        description: 'Check your email for the verification code.',
      });
    } catch (error) {
      toast({
        title: 'OTP Failed',
        description: error instanceof Error ? error.message : 'Unable to send OTP.',
        variant: 'destructive',
      });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpRequestId || !otpCode) {
      toast({
        title: 'Verification Required',
        description: 'Request OTP and enter the code first.',
        variant: 'destructive',
      });
      return;
    }

    setOtpVerifying(true);
    try {
      const result = await emailVerificationAPI.verifyOtp(formData.email, otpRequestId, otpCode);
      setOtpVerificationToken(result.verificationToken);
      setOtpVerified(true);

      toast({
        title: 'Email Verified',
        description: 'You can now submit your inquiry.',
      });
    } catch (error) {
      toast({
        title: 'Invalid OTP',
        description: error instanceof Error ? error.message : 'OTP verification failed.',
        variant: 'destructive',
      });
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpVerified || !otpVerificationToken) {
      toast({
        title: 'Email Not Verified',
        description: 'Please verify your email with OTP before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          emailVerificationToken: otpVerificationToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send message');
      }

      toast({
        title: 'Message Sent!',
        description: 'We will get back to you soon.',
      });

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: '',
      });
      resetOtpState();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f7f8fb] to-white py-20">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="p-8 bg-card border-border backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <a 
                    href="tel:+919168596655" 
                    className="flex items-center gap-4 text-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold">Phone</p>
                      <p className="text-base font-medium">+91 916 859 6655</p>
                    </div>
                  </a>

                  <a 
                    href="mailto:contact@nexprime.in" 
                    className="flex items-center gap-4 text-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold">Email</p>
                      <p className="text-base font-medium">contact@nexprime.in</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 text-foreground">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold">Office Address</p>
                      <p className="text-base font-medium leading-relaxed">
                        Office no 204, Magnolia Business Center,<br />
                        Baner Pashan Link road, Pune 411021
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-foreground mb-3">Need Help?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Our support team is here to help you find your perfect property. Reach out anytime!
                </p>
                <div className="flex gap-3">
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm"
                    className="border-primary/30 text-primary hover:bg-primary/20"
                  >
                    <a href="tel:+919168596655">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm"
                    className="border-primary/30 text-primary hover:bg-primary/20"
                  >
                    <a href="https://wa.me/919168596655" target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="p-8 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-border backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-muted-foreground">Name</Label>
                    <div className="relative">
                      <Input
                        id="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-muted-foreground">Phone</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Your Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      resetOtpState();
                    }}
                    required
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={otpSending || !formData.email || loading}
                      onClick={handleRequestOtp}
                      className="md:col-span-1"
                    >
                      {otpSending ? 'Sending...' : otpRequestId ? 'Resend OTP' : 'Send OTP'}
                    </Button>

                    <Input
                      placeholder="Enter OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="md:col-span-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      disabled={otpVerifying || !otpRequestId || otpCode.length < 6 || loading || otpVerified}
                      onClick={handleVerifyOtp}
                      className="md:col-span-1"
                    >
                      {otpVerified ? 'Verified' : otpVerifying ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-muted-foreground">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
