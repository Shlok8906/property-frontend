import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Building2,
  Home,
  CalendarIcon,
  Save,
  Loader2,
  ImagePlus,
  X
} from 'lucide-react';
import {
  PROPERTY_TYPES,
  BHK_OPTIONS,
  FURNISHING_ITEMS,
  PARKING_OPTIONS,
  type PropertyCategory,
  type PropertyPurpose,
  type PropertyType,
  type BHKType,
  type FurnishingType,
  type TenantPreference,
  type SecurityDeposit,
  type LockInPeriod,
  type Brokerage,
} from '@/types/property';

const purposes = [
  { value: 'rent', label: 'Rent' },
  { value: 'sell', label: 'Sell' },
  { value: 'pg', label: 'PG' },
  { value: 'coliving', label: 'Co-Living' },
];

const furnishingTypes = [
  { value: 'fully_furnished', label: 'Fully Furnished' },
  { value: 'semi_furnished', label: 'Semi Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

const tenantPreferences = [
  { value: 'family', label: 'Family' },
  { value: 'bachelors', label: 'Bachelors' },
  { value: 'company_lease', label: 'Company Lease' },
];

const securityDepositOptions = [
  { value: 'none', label: 'None' },
  { value: '1_month', label: '1 Month' },
  { value: '2_months', label: '2 Months' },
  { value: 'custom', label: 'Custom' },
];

const lockInOptions = [
  { value: 'none', label: 'None' },
  { value: '1_month', label: '1 Month' },
  { value: '6_months', label: '6 Months' },
  { value: 'custom', label: 'Custom' },
];

const brokerageOptions = [
  { value: 'no_brokerage', label: 'No Brokerage' },
  { value: '15_days', label: '15 Days Rent' },
  { value: '30_days', label: '30 Days Rent' },
  { value: 'custom', label: 'Custom' },
];

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form State
  const [category, setCategory] = useState<PropertyCategory>('residential');
  const [purpose, setPurpose] = useState<PropertyPurpose>('rent');
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
  const [bhkType, setBhkType] = useState<BHKType | ''>('');
  
  // Basic Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Area
  const [carpetArea, setCarpetArea] = useState('');
  const [builtUpArea, setBuiltUpArea] = useState('');
  const [superBuiltUpArea, setSuperBuiltUpArea] = useState('');
  
  // Floor
  const [floorNumber, setFloorNumber] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [propertyAge, setPropertyAge] = useState('');
  
  // Rooms
  const [bathrooms, setBathrooms] = useState('1');
  const [balconies, setBalconies] = useState('0');
  
  // Furnishing
  const [furnishingType, setFurnishingType] = useState<FurnishingType | ''>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Parking
  const [coveredParking, setCoveredParking] = useState(0);
  const [openParking, setOpenParking] = useState(0);
  
  // Tenant Preferences
  const [selectedTenantPrefs, setSelectedTenantPrefs] = useState<TenantPreference[]>([]);
  const [petFriendly, setPetFriendly] = useState(false);
  
  // Availability & Pricing
  const [availableFrom, setAvailableFrom] = useState<Date>();
  const [monthlyRent, setMonthlyRent] = useState('');
  const [maintenanceIncluded, setMaintenanceIncluded] = useState(true);
  const [maintenanceAmount, setMaintenanceAmount] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState<SecurityDeposit>('1_month');
  const [securityDepositAmount, setSecurityDepositAmount] = useState('');
  const [lockInPeriod, setLockInPeriod] = useState<LockInPeriod>('none');
  const [lockInMonths, setLockInMonths] = useState('');
  
  // Brokerage
  const [brokerage, setBrokerage] = useState<Brokerage>('no_brokerage');
  const [brokerageAmount, setBrokerageAmount] = useState('');
  
  // Sale
  const [salePrice, setSalePrice] = useState('');
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  
  // Location
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [address, setAddress] = useState('');
  
  // Images
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleAddImage = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      setImageUrls([...imageUrls, newImageUrl]);
      if (!featuredImage) setFeaturedImage(newImageUrl);
      setNewImageUrl('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || !user) return;

    setUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `property-images/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) {
          // If the bucket does not exist, attempt a best-effort creation (may fail on client)
          const msg = (uploadError && (uploadError.message || '')).toString();
          if (msg.toLowerCase().includes('bucket') || uploadError.status === 404) {
            try {
              // Try to create the bucket (will fail if using anon key)
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const { error: createErr } = await supabase.storage.createBucket('property-images', { public: true });
              if (createErr) {
                console.warn('Could not create bucket from client:', createErr.message || createErr);
                throw uploadError; // continue to outer catch to show instructions
              }

              // Retry upload once after creating bucket
              const { error: retryError } = await supabase.storage
                .from('property-images')
                .upload(filePath, file);

              if (retryError) throw retryError;
            } catch (e) {
              // Rethrow original uploadError to be handled in outer catch
              throw uploadError;
            }
          } else {
            throw uploadError;
          }
        }

        const { data } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        const imageUrl = data.publicUrl;
        if (imageUrl && !imageUrls.includes(imageUrl)) {
          setImageUrls(prev => [...prev, imageUrl]);
          if (!featuredImage) setFeaturedImage(imageUrl);
        }
      }

      toast({
        title: 'Success',
        description: 'Images uploaded successfully',
      });
    } catch (error: any) {
      const message = error?.message || String(error) || 'Failed to upload images';

      // If error indicates missing bucket, provide actionable instructions
      if (message.toLowerCase().includes('bucket') || message.toLowerCase().includes('not found')) {
        toast({
          title: 'Storage Bucket Missing',
          description: 'The storage bucket "property-images" was not found. Create a public bucket named "property-images" in your Supabase project Storage settings, or create it using the Supabase CLI/service role. See console for details.',
          variant: 'destructive',
        });

        // Log helpful instructions to console
        // eslint-disable-next-line no-console
        console.error('Bucket "property-images" not found. Create it in Supabase > Storage > New bucket (name: property-images, Public: yes).');
        // Also show CLI command the user can run if they have the service role key
        // eslint-disable-next-line no-console
        console.info('To create with supabase CLI or server-side SDK (requires service role key): supabase.storage.createBucket("property-images", { public: true })');
      } else {
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (e.currentTarget) {
        e.currentTarget.value = '';
      }
    }
  };

  const handleRemoveImage = (url: string) => {
    setImageUrls(imageUrls.filter(u => u !== url));
    if (featuredImage === url) {
      setFeaturedImage(imageUrls[0] || '');
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const toggleTenantPref = (pref: TenantPreference) => {
    setSelectedTenantPrefs(prev =>
      prev.includes(pref)
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !propertyType || !city || !locality || !title) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('properties').insert({
        category,
        purpose,
        property_type: propertyType,
        title,
        description: description || null,
        bhk_type: bhkType || null,
        carpet_area: carpetArea ? parseFloat(carpetArea) : null,
        built_up_area: builtUpArea ? parseFloat(builtUpArea) : null,
        super_built_up_area: superBuiltUpArea ? parseFloat(superBuiltUpArea) : null,
        floor_number: floorNumber ? parseInt(floorNumber) : null,
        total_floors: totalFloors ? parseInt(totalFloors) : null,
        property_age: propertyAge ? parseInt(propertyAge) : null,
        bathrooms: parseInt(bathrooms) || 1,
        balconies: parseInt(balconies) || 0,
        furnishing_type: furnishingType || null,
        furnishing_items: selectedAmenities.length > 0 ? selectedAmenities : null,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : null,
        covered_parking: coveredParking,
        open_parking: openParking,
        tenant_preference: selectedTenantPrefs.length > 0 ? selectedTenantPrefs : null,
        pet_friendly: petFriendly,
        available_from: availableFrom ? format(availableFrom, 'yyyy-MM-dd') : null,
        monthly_rent: monthlyRent ? parseFloat(monthlyRent) : null,
        maintenance_type: maintenanceIncluded ? 'included' : 'separate',
        maintenance_amount: maintenanceAmount ? parseFloat(maintenanceAmount) : null,
        security_deposit: securityDeposit,
        security_deposit_amount: securityDepositAmount ? parseFloat(securityDepositAmount) : null,
        lock_in_period: lockInPeriod,
        lock_in_months: lockInMonths ? parseInt(lockInMonths) : null,
        brokerage,
        brokerage_amount: brokerageAmount ? parseFloat(brokerageAmount) : null,
        sale_price: salePrice ? parseFloat(salePrice) : null,
        price_negotiable: priceNegotiable,
        city,
        locality,
        landmark: landmark || null,
        address: address || null,
        images: imageUrls.length > 0 ? imageUrls : null,
        featured_image: featuredImage || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Property Added!',
        description: 'Your property listing has been created successfully.',
      });

      navigate('/admin/projects');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create property',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout 
      title="Add Property" 
      subtitle="Create a new property listing"
      actions={
        <Button onClick={handleSubmit} disabled={loading} className="gradient-primary">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Property
            </>
          )}
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category & Purpose */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Category & Purpose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category */}
            <div className="space-y-3">
              <Label>Property Category</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={category === 'residential' ? 'default' : 'outline'}
                  className={cn(
                    "flex-1 h-14",
                    category === 'residential' && "gradient-primary border-0"
                  )}
                  onClick={() => setCategory('residential')}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Residential
                </Button>
                <Button
                  type="button"
                  variant={category === 'commercial' ? 'default' : 'outline'}
                  className={cn(
                    "flex-1 h-14",
                    category === 'commercial' && "gradient-secondary border-0"
                  )}
                  onClick={() => setCategory('commercial')}
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  Commercial
                </Button>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-3">
              <Label>Property Purpose</Label>
              <div className="flex flex-wrap gap-3">
                {purposes.map((p) => (
                  <Button
                    key={p.value}
                    type="button"
                    variant={purpose === p.value ? 'default' : 'outline'}
                    className={cn(purpose === p.value && "gradient-primary border-0")}
                    onClick={() => setPurpose(p.value as PropertyPurpose)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-3">
              <Label>Property Type *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PROPERTY_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={propertyType === type.value ? 'default' : 'outline'}
                    className={cn(
                      "h-auto py-4 flex-col",
                      propertyType === type.value && "gradient-primary border-0"
                    )}
                    onClick={() => setPropertyType(type.value)}
                  >
                    {type.icon ? <span className="text-2xl mb-2">{type.icon}</span> : null}
                    <span className="text-xs">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* BHK Type */}
            <div className="space-y-3">
              <Label>BHK Type</Label>
              <div className="flex flex-wrap gap-2">
                {BHK_OPTIONS.map((bhk) => (
                  <Button
                    key={bhk}
                    type="button"
                    size="sm"
                    variant={bhkType === bhk ? 'default' : 'outline'}
                    className={cn(bhkType === bhk && "gradient-primary border-0")}
                    onClick={() => setBhkType(bhk)}
                  >
                    {bhk}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Details */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Spacious 2BHK in Prime Location"
                className="bg-background"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your property..."
                rows={4}
                className="bg-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* Area Details */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Area Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carpetArea">Carpet Area (sq.ft)</Label>
                <Input
                  id="carpetArea"
                  type="number"
                  value={carpetArea}
                  onChange={(e) => setCarpetArea(e.target.value)}
                  placeholder="850"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="builtUpArea">Built-up Area (sq.ft)</Label>
                <Input
                  id="builtUpArea"
                  type="number"
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(e.target.value)}
                  placeholder="950"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="superBuiltUpArea">Super Built-up Area (sq.ft)</Label>
                <Input
                  id="superBuiltUpArea"
                  type="number"
                  value={superBuiltUpArea}
                  onChange={(e) => setSuperBuiltUpArea(e.target.value)}
                  placeholder="1100"
                  className="bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floor & Age */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Floor & Age Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floorNumber">Floor Number</Label>
                <Input
                  id="floorNumber"
                  type="number"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(e.target.value)}
                  placeholder="5"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalFloors">Total Floors</Label>
                <Input
                  id="totalFloors"
                  type="number"
                  value={totalFloors}
                  onChange={(e) => setTotalFloors(e.target.value)}
                  placeholder="12"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyAge">Property Age (years)</Label>
                <Input
                  id="propertyAge"
                  type="number"
                  value={propertyAge}
                  onChange={(e) => setPropertyAge(e.target.value)}
                  placeholder="3"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Number of Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balconies">Number of Balconies</Label>
                <Input
                  id="balconies"
                  type="number"
                  value={balconies}
                  onChange={(e) => setBalconies(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Furnishing */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Furnishing & Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Furnishing Type */}
            <div className="space-y-3">
              <Label>Furnishing Type</Label>
              <div className="flex flex-wrap gap-3">
                {furnishingTypes.map((ft) => (
                  <Button
                    key={ft.value}
                    type="button"
                    variant={furnishingType === ft.value ? 'default' : 'outline'}
                    className={cn(furnishingType === ft.value && "gradient-primary border-0")}
                    onClick={() => setFurnishingType(ft.value as FurnishingType)}
                  >
                    {ft.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label>Amenities & Furnishings</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {FURNISHING_ITEMS.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedAmenities.includes(item) 
                        ? "border-primary bg-primary/10" 
                        : "border-border/50 hover:border-primary/50"
                    )}
                    onClick={() => toggleAmenity(item)}
                  >
                    <Checkbox
                      checked={selectedAmenities.includes(item)}
                      className="pointer-events-none"
                    />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parking */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Parking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Covered Parking</Label>
                <div className="flex gap-2">
                  {PARKING_OPTIONS.map((num) => (
                    <Button
                      key={num}
                      type="button"
                      size="sm"
                      variant={coveredParking === (typeof num === 'string' ? 4 : num) ? 'default' : 'outline'}
                      className={cn(
                        coveredParking === (typeof num === 'string' ? 4 : num) && "gradient-primary border-0"
                      )}
                      onClick={() => setCoveredParking(typeof num === 'string' ? 4 : num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label>Open Parking</Label>
                <div className="flex gap-2">
                  {PARKING_OPTIONS.map((num) => (
                    <Button
                      key={num}
                      type="button"
                      size="sm"
                      variant={openParking === (typeof num === 'string' ? 4 : num) ? 'default' : 'outline'}
                      className={cn(
                        openParking === (typeof num === 'string' ? 4 : num) && "gradient-primary border-0"
                      )}
                      onClick={() => setOpenParking(typeof num === 'string' ? 4 : num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenant Preferences (for Rent) */}
        {(purpose === 'rent' || purpose === 'pg' || purpose === 'coliving') && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Tenant Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Preferred Tenant</Label>
                <div className="flex flex-wrap gap-3">
                  {tenantPreferences.map((pref) => (
                    <Button
                      key={pref.value}
                      type="button"
                      variant={selectedTenantPrefs.includes(pref.value as TenantPreference) ? 'default' : 'outline'}
                      className={cn(
                        selectedTenantPrefs.includes(pref.value as TenantPreference) && "gradient-primary border-0"
                      )}
                      onClick={() => toggleTenantPref(pref.value as TenantPreference)}
                    >
                      {pref.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="petFriendly"
                  checked={petFriendly}
                  onCheckedChange={(checked) => setPetFriendly(!!checked)}
                />
                <Label htmlFor="petFriendly" className="cursor-pointer">Pet Friendly</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">
              {purpose === 'sell' ? 'Sale Price' : 'Rent & Availability'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {purpose === 'sell' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price (₹)</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="5000000"
                    className="bg-background"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="priceNegotiable"
                    checked={priceNegotiable}
                    onCheckedChange={(checked) => setPriceNegotiable(!!checked)}
                  />
                  <Label htmlFor="priceNegotiable" className="cursor-pointer">Price Negotiable</Label>
                </div>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Available From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !availableFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {availableFrom ? format(availableFrom, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={availableFrom}
                          onSelect={setAvailableFrom}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      placeholder="25000"
                      className="bg-background"
                    />
                  </div>
                </div>

                {/* Maintenance */}
                <div className="space-y-3">
                  <Label>Maintenance</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={maintenanceIncluded ? 'default' : 'outline'}
                      className={cn(maintenanceIncluded && "gradient-primary border-0")}
                      onClick={() => setMaintenanceIncluded(true)}
                    >
                      Included in Rent
                    </Button>
                    <Button
                      type="button"
                      variant={!maintenanceIncluded ? 'default' : 'outline'}
                      className={cn(!maintenanceIncluded && "gradient-secondary border-0")}
                      onClick={() => setMaintenanceIncluded(false)}
                    >
                      Separate
                    </Button>
                  </div>
                  {!maintenanceIncluded && (
                    <Input
                      type="number"
                      value={maintenanceAmount}
                      onChange={(e) => setMaintenanceAmount(e.target.value)}
                      placeholder="Maintenance amount"
                      className="bg-background mt-2"
                    />
                  )}
                </div>

                {/* Security Deposit */}
                <div className="space-y-3">
                  <Label>Security Deposit</Label>
                  <div className="flex flex-wrap gap-2">
                    {securityDepositOptions.map((opt) => (
                      <Button
                        key={opt.value}
                        type="button"
                        size="sm"
                        variant={securityDeposit === opt.value ? 'default' : 'outline'}
                        className={cn(securityDeposit === opt.value && "gradient-primary border-0")}
                        onClick={() => setSecurityDeposit(opt.value as SecurityDeposit)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                  {securityDeposit === 'custom' && (
                    <Input
                      type="number"
                      value={securityDepositAmount}
                      onChange={(e) => setSecurityDepositAmount(e.target.value)}
                      placeholder="Custom deposit amount"
                      className="bg-background mt-2"
                    />
                  )}
                </div>

                {/* Lock-in Period */}
                <div className="space-y-3">
                  <Label>Lock-in Period</Label>
                  <div className="flex flex-wrap gap-2">
                    {lockInOptions.map((opt) => (
                      <Button
                        key={opt.value}
                        type="button"
                        size="sm"
                        variant={lockInPeriod === opt.value ? 'default' : 'outline'}
                        className={cn(lockInPeriod === opt.value && "gradient-primary border-0")}
                        onClick={() => setLockInPeriod(opt.value as LockInPeriod)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                  {lockInPeriod === 'custom' && (
                    <Input
                      type="number"
                      value={lockInMonths}
                      onChange={(e) => setLockInMonths(e.target.value)}
                      placeholder="Lock-in months"
                      className="bg-background mt-2"
                    />
                  )}
                </div>
              </>
            )}

            {/* Brokerage */}
            <div className="space-y-3">
              <Label>Brokerage</Label>
              <div className="flex flex-wrap gap-2">
                {brokerageOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={brokerage === opt.value ? 'default' : 'outline'}
                    className={cn(brokerage === opt.value && "gradient-primary border-0")}
                    onClick={() => setBrokerage(opt.value as Brokerage)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              {brokerage === 'custom' && (
                <Input
                  type="number"
                  value={brokerageAmount}
                  onChange={(e) => setBrokerageAmount(e.target.value)}
                  placeholder="Brokerage amount"
                  className="bg-background mt-2"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className="bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locality">Locality *</Label>
                <Input
                  id="locality"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="Andheri West"
                  className="bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Metro Station"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete address"
                  className="bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Upload Images</Label>
              <div className="flex flex-col gap-3">
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  variant="outline"
                  disabled={uploadingImage}
                  className="w-full"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Select Images from Device
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative pt-2 pb-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="image-url">Add Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="bg-background"
                />
                <Button type="button" onClick={handleAddImage} variant="outline">
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={url} 
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {featuredImage === url && (
                      <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setFeaturedImage(url)}
                      >
                        Set Featured
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => handleRemoveImage(url)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button (Mobile) */}
        <div className="md:hidden">
          <Button 
            type="submit" 
            className="w-full h-12 gradient-primary" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Property
              </>
            )}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
