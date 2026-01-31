import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { propertyAPI, enquiryAPI, Property } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { 
  MapPin, 
  Building2, 
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Briefcase,
  Home,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Maximize2,
  Users,
  Ruler
} from 'lucide-react';

// Amenity icon mapping
const amenityIcons: Record<string, any> = {
  'Swimming Pool': '🏊',
  'Gym': '💪',
  'Clubhouse': '🏛️',
  'Garden': '🌳',
  'Parking': '🚗',
  'Security': '🔒',
  'Play Area': '🎮',
  'Power Backup': '⚡',
  'Lift': '🛗',
  'CCTV': '📹',
  'Maintenance': '🔧',
  'Water Supply': '💧',
  'Fire Safety': '🚒',
  'Intercom': '📞',
  'Vastu': '🧭',
  'Earthquake': '🏗️',
  'Visitor Parking': '🅿️',
  'Shopping': '🛒',
  'Sports': '⚽',
  'Community Hall': '🏢'
};

export default function PropertyDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Enquiry form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await propertyAPI.getById(id);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
        toast({
          title: 'Error',
          description: 'Failed to load property details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, toast]);

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your name and phone number',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Save enquiry to MongoDB
      await enquiryAPI.create({
        propertyId: property?._id || property?.id || '',
        propertyTitle: property?.title || '',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      });

      toast({
        title: 'Enquiry Submitted',
        description: 'Thank you! We will contact you shortly.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      toast({
        title: 'Submission Failed',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Get all images for gallery
  const allImages = property?.images && property.images.length > 0 
    ? property.images 
    : property?.image_url 
    ? [property.image_url] 
    : [];

  const nextImage = () => {
    if (allImages.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (allImages.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-3xl" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Building2 className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/properties">Browse Properties</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-foreground">Properties</Link>
          <span>/</span>
          <span className="text-foreground">{property.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {property.bhk && (
              <Badge variant="secondary" className="text-sm">
                {property.bhk}
              </Badge>
            )}
            {property.type && (
              <Badge variant="outline" className="text-sm">
                {property.type}
              </Badge>
            )}
            {property.purpose && (
              <Badge variant="outline" className="text-sm">
                {property.purpose}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{property.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{property.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-muted group">
                {allImages.length > 0 ? (
                  <>
                    <img 
                      src={allImages[selectedImageIndex]} 
                      alt={`${property.title} - Image ${selectedImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Zoom button */}
                    <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Maximize2 className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-7xl w-full p-0">
                        <DialogTitle className="hidden">{property.title} - Full size image</DialogTitle>
                        <DialogDescription className="hidden">Full size image gallery for {property.title}</DialogDescription>
                        <div className="relative bg-black">
                          <img 
                            src={allImages[selectedImageIndex]} 
                            alt={`${property.title} - Full size`}
                            className="w-full h-auto max-h-[90vh] object-contain"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-white hover:bg-white/20"
                            onClick={() => setShowImageModal(false)}
                          >
                            <X className="h-6 w-6" />
                          </Button>
                          {allImages.length > 1 && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                                onClick={prevImage}
                              >
                                <ChevronLeft className="h-8 w-8" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                                onClick={nextImage}
                              >
                                <ChevronRight className="h-8 w-8" />
                              </Button>
                            </>
                          )}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                            {selectedImageIndex + 1} / {allImages.length}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {/* Navigation arrows */}
                    {allImages.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {selectedImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Building2 className="h-32 w-32 text-white/10" />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-primary scale-105' 
                          : 'border-transparent hover:border-primary/50'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Key Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {property.price && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">Pricing</div>
                    <div className="text-2xl font-bold">{formatPrice(property.price)}</div>
                  </CardContent>
                </Card>
              )}
              {property.possession && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Possession</span>
                    </div>
                    <div className="text-xl font-semibold">{property.possession}</div>
                  </CardContent>
                </Card>
              )}
              {property.builder && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Briefcase className="h-4 w-4" />
                      <span>Builder</span>
                    </div>
                    <div className="text-xl font-semibold">{property.builder}</div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.projectName && (
                    <div>
                      <div className="text-sm text-muted-foreground">Project</div>
                      <div className="font-medium">{property.projectName}</div>
                    </div>
                  )}
                  {property.specification && (
                    <div>
                      <div className="text-sm text-muted-foreground">Specification</div>
                      <div className="font-medium">{property.specification}</div>
                    </div>
                  )}
                  {property.tower && (
                    <div>
                      <div className="text-sm text-muted-foreground">Tower</div>
                      <div className="font-medium">{property.tower}</div>
                    </div>
                  )}
                  {property.carpetArea && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Ruler className="h-4 w-4" />
                        <span>Carpet Area</span>
                      </div>
                      <div className="font-medium">{property.carpetArea}</div>
                    </div>
                  )}
                  {property.units && property.units > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Units Available</span>
                      </div>
                      <div className="font-medium">{property.units}</div>
                    </div>
                  )}
                  {property.category && (
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <div className="font-medium">{property.category}</div>
                    </div>
                  )}
                  {property.salesPerson && (
                    <div>
                      <div className="text-sm text-muted-foreground">Sales Contact</div>
                      <div className="font-medium">{property.salesPerson}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <span className="text-2xl">{amenityIcons[amenity] || '✓'}</span>
                        <span className="text-sm font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Enquiry Form */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Enquire Now</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="I'm interested in this property..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Enquiry
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const message = `Hi, I'm interested in ${property.title} at ${property.location}`;
                      const phone = '919168596655';
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </form>

                <Separator className="my-6" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Verified Builder</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>RERA Approved</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Best Price Guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
