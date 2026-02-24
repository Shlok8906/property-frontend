import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { propertyAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  Circle,
  CircleCheck,
  Loader2,
  Phone,
  Plus,
  Upload,
} from 'lucide-react';
import {
  BHK_OPTIONS,
  PARKING_OPTIONS,
  PROPERTY_TYPES,
  type PropertyCategory,
  type PropertyPurpose,
  type PropertyType,
} from '@/types/property';

type StepKey = 'property-details' | 'address' | 'photos' | 'verify' | 'highlights' | 'review';

interface StepMeta {
  key: StepKey;
  title: string;
  score?: string;
}

const steps: StepMeta[] = [
  { key: 'property-details', title: 'Property Details' },
  { key: 'address', title: 'Address' },
  { key: 'photos', title: 'Photos', score: '+15%' },
  { key: 'verify', title: 'Verify', score: '+20%' },
  { key: 'highlights', title: 'Property Highlights' },
  { key: 'review', title: 'Review' },
];

const lookingToOptions: { value: PropertyPurpose; label: string }[] = [
  { value: 'rent', label: 'Rent' },
  { value: 'sell', label: 'Sell' },
  { value: 'pg', label: 'PG/Co-living' },
];

const bathroomOptions = ['1', '2', '3', '4+'];
const balconyOptions = ['0', '1', '2', '3'];
const facingOptions = ['North', 'East', 'West', 'South', 'North - East', 'North - West', 'South - East', 'South - West'];
const monthlyOptions = ['None', '1 month', '2 month', 'Custom'];
const brokerageOptions = ['None', '15 Days', '30 Days', 'Custom'];
const tenantOptions = ['Family', 'Bachelors', 'Company Lease'];
const restrictionOptions = ['No Pets', 'No Cooking', 'Vegetarians Only', 'No Visitors', 'No Students'];
const flatToggleItems = [
  'Dining Table',
  'Washing Machine',
  'Cupboard',
  'Sofa',
  'Microwave',
  'Stove',
  'Fridge',
  'Water Purifier',
  'Gas Pipeline',
  'Chimney',
  'Modular Kitchen',
];
const flatCountItems = ['Fan', 'Light', 'AC', 'Wardrobe', 'TV', 'Bed', 'Geyser'];
const societyAmenityItems = [
  'Power Backup',
  'AC',
  'TV',
  'Geyser',
  'Swimming Pool',
  'Lift',
  'Gym',
  'Intercom',
  'Garden',
  'Sports',
  'Kids Area',
  'CCTV',
  'Gated Community',
  'Club House',
  'Community Hall',
  'Regular Water Supply',
  'Attached Balcony',
];

const ensureNumber = (value: string, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseLabeledDescriptionValue = (description: string, label: string) => {
  const lines = description.split('\n');
  const target = `${label.toLowerCase()}:`;
  const match = lines.find((line) => line.trim().toLowerCase().startsWith(target));
  if (!match) return '';
  const separator = match.indexOf(':');
  if (separator < 0) return '';
  return match.slice(separator + 1).trim();
};

const parseLocation = (location: string) => {
  const parts = location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { city: 'Pune', locality: '', subLocality: '' };
  }

  if (parts.length === 1) {
    return { city: parts[0], locality: '', subLocality: '' };
  }

  if (parts.length === 2) {
    return { city: parts[1], locality: parts[0], subLocality: '' };
  }

  return {
    city: parts[parts.length - 1],
    locality: parts[parts.length - 2],
    subLocality: parts.slice(0, -2).join(', '),
  };
};

const parseFurnishingDescription = (flatFurnishingLine: string) => {
  if (!flatFurnishingLine) {
    return { toggles: [] as string[], counts: {} as Record<string, number> };
  }

  const items = flatFurnishingLine
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const toggles: string[] = [];
  const counts: Record<string, number> = {};

  items.forEach((item) => {
    const countMatch = item.match(/^(.*)\sx(\d+)$/i);
    if (countMatch) {
      const name = countMatch[1].trim();
      const count = Number(countMatch[2]);
      if (name && Number.isFinite(count) && count > 0) {
        counts[name] = count;
      }
      return;
    }

    toggles.push(item);
  });

  return { toggles, counts };
};

const buildDescription = (values: {
  city: string;
  locality: string;
  subLocality: string;
  buildingName: string;
  propertyAge: string;
  bathrooms: string;
  balconies: string;
  furnishingType: string;
  coveredParking: string;
  openParking: string;
  tenantPreference: string[];
  restrictions: string[];
  addOns: string[];
  societyAmenities: string[];
  flatFurnishings: string[];
  facing: string;
  customNotes: string;
  fullAddress: string;
}) => {
  const rows = [
    values.buildingName ? `Building/Society: ${values.buildingName}` : '',
    values.city || values.locality ? `Area: ${[values.subLocality, values.locality, values.city].filter(Boolean).join(', ')}` : '',
    values.propertyAge ? `Age: ${values.propertyAge} years` : '',
    values.bathrooms ? `Bathrooms: ${values.bathrooms}` : '',
    values.balconies ? `Balconies: ${values.balconies}` : '',
    values.furnishingType ? `Furnishing: ${values.furnishingType}` : '',
    values.facing ? `Facing: ${values.facing}` : '',
    `Parking: Covered ${values.coveredParking || '0'}, Open ${values.openParking || '0'}`,
    values.tenantPreference.length > 0 ? `Preferred Tenant: ${values.tenantPreference.join(', ')}` : '',
    values.restrictions.length > 0 ? `Restrictions: ${values.restrictions.join(', ')}` : '',
    values.flatFurnishings.length > 0 ? `Flat Furnishings: ${values.flatFurnishings.join(', ')}` : '',
    values.societyAmenities.length > 0 ? `Society Amenities: ${values.societyAmenities.join(', ')}` : '',
    values.addOns.length > 0 ? `Additional Details: ${values.addOns.join(', ')}` : '',
    values.fullAddress ? `Address: ${values.fullAddress}` : '',
    values.customNotes ? `Notes: ${values.customNotes}` : '',
  ].filter(Boolean);

  return rows.join('\n');
};

export default function AddPropertyPage() {
  const { id: editPropertyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(editPropertyId);

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<StepKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(false);

  const [category, setCategory] = useState<PropertyCategory>('residential');
  const [purpose, setPurpose] = useState<PropertyPurpose>('rent');
  const [city, setCity] = useState('Pune');
  const [buildingName, setBuildingName] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [bhkType, setBhkType] = useState('2BHK');
  const [builtUpArea, setBuiltUpArea] = useState('');
  const [propertyAge, setPropertyAge] = useState('');
  const [bathrooms, setBathrooms] = useState('2');
  const [balconies, setBalconies] = useState('1');
  const [furnishingType, setFurnishingType] = useState('Unfurnished');
  const [coveredParking, setCoveredParking] = useState('0');
  const [openParking, setOpenParking] = useState('0');
  const [tenantPreference, setTenantPreference] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [maintenanceType, setMaintenanceType] = useState('Include in rent');
  const [securityDeposit, setSecurityDeposit] = useState('1 month');
  const [lockInPeriod, setLockInPeriod] = useState('None');
  const [brokerage, setBrokerage] = useState('None');
  const [brokerageNegotiable, setBrokerageNegotiable] = useState(false);
  const [monthlyRent, setMonthlyRent] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [addOns, setAddOns] = useState<string[]>([]);
  const [facing, setFacing] = useState('');

  const [locality, setLocality] = useState('');
  const [subLocality, setSubLocality] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  const [verified, setVerified] = useState(false);
  const [isAmenitiesDialogOpen, setIsAmenitiesDialogOpen] = useState(false);
  const [societyAmenities, setSocietyAmenities] = useState<string[]>([]);
  const [flatFurnishingToggles, setFlatFurnishingToggles] = useState<string[]>([]);
  const [flatFurnishingCounts, setFlatFurnishingCounts] = useState<Record<string, number>>({});

  const isUnfurnished = furnishingType === 'Unfurnished';
  const selectedFlatCount = Object.values(flatFurnishingCounts).reduce((sum, value) => sum + (value > 0 ? 1 : 0), 0);
  const selectedFlatFurnishings = [
    ...flatFurnishingToggles,
    ...flatCountItems
      .filter((item) => (flatFurnishingCounts[item] || 0) > 0)
      .map((item) => `${item} x${flatFurnishingCounts[item]}`),
  ];

  const progress = useMemo(() => {
    return Math.round((completed.length / steps.length) * 100);
  }, [completed.length]);

  const markCompleted = (index: number) => {
    const key = steps[index].key;
    setCompleted((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const validateStep = (index: number) => {
    const key = steps[index].key;

    if (key === 'property-details') {
      if (!buildingName || !builtUpArea || !bhkType) {
        toast({
          title: 'Missing details',
          description: 'Please fill building name, BHK and built up area.',
          variant: 'destructive',
        });
        return false;
      }
    }

    if (key === 'address') {
      if (!locality || !fullAddress) {
        toast({
          title: 'Address incomplete',
          description: 'Please enter locality and full address.',
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep(activeStep)) return;
    markCompleted(activeStep);
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const toggleArrayValue = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const updateFurnishingCount = (item: string, delta: number) => {
    setFlatFurnishingCounts((prev) => {
      const current = prev[item] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [item]: next };
    });
  };

  useEffect(() => {
    const loadPropertyForEdit = async () => {
      if (!editPropertyId) return;

      setLoadingProperty(true);
      try {
        const property = await propertyAPI.getById(editPropertyId);

        const parsedLocation = parseLocation(property.location || '');
        const description = property.description || '';
        const building = property.projectName || property.title || '';

        const parsedBathrooms = parseLabeledDescriptionValue(description, 'Bathrooms');
        const parsedBalconies = parseLabeledDescriptionValue(description, 'Balconies');
        const parsedFurnishingType = parseLabeledDescriptionValue(description, 'Furnishing');
        const parsedPropertyAge = parseLabeledDescriptionValue(description, 'Age').replace(/\s*years?$/i, '').trim();
        const parsedFacing = parseLabeledDescriptionValue(description, 'Facing');
        const parsedAddress = parseLabeledDescriptionValue(description, 'Address');
        const parsedParking = parseLabeledDescriptionValue(description, 'Parking');
        const parsedTenant = parseLabeledDescriptionValue(description, 'Preferred Tenant');
        const parsedRestrictions = parseLabeledDescriptionValue(description, 'Restrictions');
        const parsedSocietyAmenities = parseLabeledDescriptionValue(description, 'Society Amenities');
        const parsedFlatFurnishings = parseLabeledDescriptionValue(description, 'Flat Furnishings');
        const parsedNotes = parseLabeledDescriptionValue(description, 'Notes');

        const coveredMatch = parsedParking.match(/covered\s*(\d+)/i);
        const openMatch = parsedParking.match(/open\s*(\d+)/i);
        const parsedFurnishing = parseFurnishingDescription(parsedFlatFurnishings);

        setCategory((property.category as PropertyCategory) || 'residential');
        setPurpose((property.purpose as PropertyPurpose) || 'rent');
        setPropertyType((property.type as PropertyType) || 'apartment');
        setBhkType(property.bhk || '2BHK');
        setBuiltUpArea(property.carpetArea || '');
        setBuildingName(building);
        setCity(parsedLocation.city || 'Pune');
        setLocality(parsedLocation.locality || '');
        setSubLocality(parsedLocation.subLocality || '');
        setFullAddress(parsedAddress || property.location || '');
        setPropertyAge(parsedPropertyAge || '');
        setBathrooms(parsedBathrooms || '2');
        setBalconies(parsedBalconies || '1');
        setFurnishingType(parsedFurnishingType || 'Unfurnished');
        setCoveredParking(coveredMatch?.[1] || '0');
        setOpenParking(openMatch?.[1] || '0');
        setFacing(parsedFacing || '');
        setTenantPreference(
          parsedTenant
            ? parsedTenant
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            : []
        );
        setRestrictions(
          parsedRestrictions
            ? parsedRestrictions
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            : []
        );
        setSocietyAmenities(
          parsedSocietyAmenities
            ? parsedSocietyAmenities
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            : []
        );
        setFlatFurnishingToggles(parsedFurnishing.toggles);
        setFlatFurnishingCounts(parsedFurnishing.counts);
        setCustomNotes(parsedNotes || '');
        setImages(property.images || (property.image_url ? [property.image_url] : []));

        if ((property.purpose || 'rent') === 'sell') {
          setSalePrice(String(property.price || ''));
        } else {
          setMonthlyRent(String(property.price || ''));
        }

        setVerified(true);
        setCompleted(steps.map((step) => step.key));
      } catch (error) {
        toast({
          title: 'Load failed',
          description: error instanceof Error ? error.message : 'Unable to load property for editing.',
          variant: 'destructive',
        });
        navigate('/admin/properties');
      } finally {
        setLoadingProperty(false);
      }
    };

    loadPropertyForEdit();
  }, [editPropertyId, navigate, toast]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newImages: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;

        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'Image too large',
            description: `${file.name} exceeds 5MB limit.`,
            variant: 'destructive',
          });
          continue;
        }

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newImages.push(base64);
      }

      setImages((prev) => [...prev, ...newImages]);
      if (newImages.length > 0) {
        toast({ description: `${newImages.length} image(s) uploaded.` });
      }
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;
    if (!images.includes(trimmed)) {
      setImages((prev) => [...prev, trimmed]);
    }
    setImageUrl('');
  };

  const handleSubmit = async () => {
    if (!verified) {
      toast({
        title: 'Verification required',
        description: 'Please complete verification before posting.',
        variant: 'destructive',
      });
      return;
    }

    if (!buildingName || !locality || !city) {
      toast({
        title: 'Missing required data',
        description: 'Building name, city and locality are required.',
        variant: 'destructive',
      });
      return;
    }

    const numericPrice = purpose === 'sell' ? ensureNumber(salePrice) : ensureNumber(monthlyRent);
    if (!numericPrice) {
      toast({
        title: 'Price required',
        description: purpose === 'sell' ? 'Please add sale price.' : 'Please add monthly rent.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: buildingName,
        location: [subLocality, locality, city].filter(Boolean).join(', '),
        bhk: bhkType,
        price: numericPrice,
        deposit: securityDeposit.toLowerCase().includes('none') ? undefined : securityDeposit,
        type: propertyType,
        category,
        purpose,
        description: buildDescription({
          city,
          locality,
          subLocality,
          buildingName,
          propertyAge,
          bathrooms,
          balconies,
          furnishingType,
          coveredParking,
          openParking,
          tenantPreference,
          restrictions,
          addOns,
          flatFurnishings: isUnfurnished ? [] : selectedFlatFurnishings,
          societyAmenities,
          facing,
          customNotes,
          fullAddress,
        }),
        projectName: buildingName,
        builder: buildingName,
        carpetArea: builtUpArea,
        amenities: Array.from(
          new Set([
            ...(isUnfurnished ? [] : selectedFlatFurnishings),
            ...societyAmenities,
            ...addOns,
            furnishingType,
          ])
        ),
        image_url: images[0],
        images,
        status: 'active' as const,
      };

      if (editPropertyId) {
        await propertyAPI.update(editPropertyId, payload);
      } else {
        await propertyAPI.create(payload);
      }

      toast({
        title: editPropertyId ? 'Property updated' : 'Property posted',
        description: editPropertyId
          ? 'Listing changes are updated on the client side.'
          : 'Listing is now available on the client side.',
      });

      navigate('/admin/properties');
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Unable to post property.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    const current = steps[activeStep].key;

    if (current === 'property-details') {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold">Add Property Details</h2>
            <p className="text-sm text-muted-foreground">Some fields are pre-filled based on your past patterns</p>
          </div>

          <div className="space-y-3">
            <Label>Property Type *</Label>
            <div className="flex gap-3">
              <Button variant={category === 'residential' ? 'default' : 'outline'} onClick={() => setCategory('residential')} type="button">Residential</Button>
              <Button variant={category === 'commercial' ? 'default' : 'outline'} onClick={() => setCategory('commercial')} type="button">Commercial</Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Looking to *</Label>
            <div className="flex flex-wrap gap-3">
              {lookingToOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={purpose === option.value ? 'default' : 'outline'}
                  onClick={() => setPurpose(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingName">Building / Apartment / Society Name *</Label>
            <Input
              id="buildingName"
              value={buildingName}
              onChange={(event) => setBuildingName(event.target.value)}
              placeholder="Please fill this to continue"
            />
          </div>

          <div className="space-y-3">
            <Label>Property Type *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PROPERTY_TYPES.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={propertyType === item.value ? 'default' : 'outline'}
                  onClick={() => setPropertyType(item.value)}
                  className="h-20 flex-col"
                >
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="builtUpArea">Built Up Area *</Label>
              <Input id="builtUpArea" value={builtUpArea} onChange={(event) => setBuiltUpArea(event.target.value)} placeholder="Sq. ft." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyAge">Age of Property (in years) *</Label>
              <Input id="propertyAge" value={propertyAge} onChange={(event) => setPropertyAge(event.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <Label>BHK Type *</Label>
            <div className="flex flex-wrap gap-2">
              {BHK_OPTIONS.map((option) => (
                <Button key={option} type="button" size="sm" variant={bhkType === option ? 'default' : 'outline'} onClick={() => setBhkType(option)}>
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Bathroom *</Label>
              <div className="flex flex-wrap gap-2">
                {bathroomOptions.map((option) => (
                  <Button key={option} type="button" variant={bathrooms === option ? 'default' : 'outline'} onClick={() => setBathrooms(option)}>
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Balcony *</Label>
              <div className="flex flex-wrap gap-2">
                {balconyOptions.map((option) => (
                  <Button key={option} type="button" variant={balconies === option ? 'default' : 'outline'} onClick={() => setBalconies(option)}>
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Furnish Type *</Label>
            <div className="flex flex-wrap gap-3">
              {['Fully Furnished', 'Semi Furnished', 'Unfurnished'].map((type) => (
                <Button key={type} type="button" variant={furnishingType === type ? 'default' : 'outline'} onClick={() => setFurnishingType(type)}>
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Covered Parking *</Label>
              <div className="flex flex-wrap gap-2">
                {PARKING_OPTIONS.map((option) => {
                  const value = String(option);
                  return (
                    <Button key={value} type="button" variant={coveredParking === value ? 'default' : 'outline'} onClick={() => setCoveredParking(value)}>
                      {value}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Open Parking *</Label>
              <div className="flex flex-wrap gap-2">
                {PARKING_OPTIONS.map((option) => {
                  const value = String(option);
                  return (
                    <Button key={value} type="button" variant={openParking === value ? 'default' : 'outline'} onClick={() => setOpenParking(value)}>
                      {value}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible defaultValue="details" className="border rounded-lg px-4">
            <AccordionItem value="details" className="border-none">
              <AccordionTrigger className="text-base font-semibold">Add Additional Details</AccordionTrigger>
              <AccordionContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Maintenance Charges *</Label>
                  <div className="flex gap-3">
                    {['Include in rent', 'Separate'].map((option) => (
                      <Button key={option} type="button" variant={maintenanceType === option ? 'default' : 'outline'} onClick={() => setMaintenanceType(option)}>
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Security Deposit *</Label>
                  <div className="flex flex-wrap gap-3">
                    {monthlyOptions.map((option) => (
                      <Button key={option} type="button" variant={securityDeposit === option ? 'default' : 'outline'} onClick={() => setSecurityDeposit(option)}>
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Lock-in Period *</Label>
                  <div className="flex flex-wrap gap-3">
                    {['None', '1 month', '6 month', 'Custom'].map((option) => (
                      <Button key={option} type="button" variant={lockInPeriod === option ? 'default' : 'outline'} onClick={() => setLockInPeriod(option)}>
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Do you charge brokerage? *</Label>
                  <div className="flex flex-wrap gap-3">
                    {brokerageOptions.map((option) => (
                      <Button key={option} type="button" variant={brokerage === option ? 'default' : 'outline'} onClick={() => setBrokerage(option)}>
                        {option}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="brokerageNegotiable"
                      checked={brokerageNegotiable}
                      onCheckedChange={(checked) => setBrokerageNegotiable(Boolean(checked))}
                    />
                    <Label htmlFor="brokerageNegotiable">Brokerage Negotiable</Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Facing</Label>
                  <div className="flex flex-wrap gap-2">
                    {facingOptions.map((option) => (
                      <Button key={option} type="button" variant={facing === option ? 'default' : 'outline'} onClick={() => setFacing(option)}>
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Servant Room</Label>
                  <div className="flex gap-3">
                    {['Yes', 'No'].map((value) => (
                      <Button key={value} type="button" variant={addOns.includes(`Servant Room: ${value}`) ? 'default' : 'outline'} onClick={() => toggleArrayValue(`Servant Room: ${value}`, setAddOns)}>
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      );
    }

    if (current === 'address') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <ChevronLeft className="h-5 w-5" />
            <span>Add Address</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locality">Locality / Sector *</Label>
            <Input id="locality" value={locality} onChange={(event) => setLocality(event.target.value)} placeholder="Enter locality" />
            <p className="text-sm text-muted-foreground">Locality is updated as per building information in our database</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subLocality">Sublocality / Area / Street</Label>
            <Input id="subLocality" value={subLocality} onChange={(event) => setSubLocality(event.target.value)} placeholder="Area / Street" />
            <p className="text-sm text-muted-foreground">Sub locality is updated as per building information in our database</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullAddress">Full Address *</Label>
            <Textarea id="fullAddress" rows={4} value={fullAddress} onChange={(event) => setFullAddress(event.target.value)} />
          </div>
        </div>
      );
    }

    if (current === 'photos') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Add Photos</h2>
          <div className="space-y-3">
            <Label htmlFor="images">Upload Photos</Label>
            <div className="flex items-center gap-3">
              <label htmlFor="images" className="inline-flex items-center">
                <Button type="button" variant="outline" asChild>
                  <span>
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Choose Images
                  </span>
                </Button>
              </label>
              <Input id="images" type="file" className="hidden" multiple accept="image/*" onChange={(event) => handleImageUpload(event.target.files)} />
              <p className="text-sm text-muted-foreground">{images.length} image(s) added</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Add image URL</Label>
            <div className="flex gap-3">
              <Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." />
              <Button type="button" onClick={addImageUrl} variant="outline"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div key={`${image}-${index}`} className="relative rounded-lg border overflow-hidden aspect-video bg-muted">
                  <img src={image} alt={`Property ${index + 1}`} className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (current === 'verify') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Verify Listing Details</h2>
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                This section is admin-only. Clients who want to sell or rent will contact admin from the website.
              </p>
              <div className="flex items-center gap-3">
                <Checkbox id="verify" checked={verified} onCheckedChange={(checked) => setVerified(Boolean(checked))} />
                <Label htmlFor="verify">I confirm the listing data is verified by admin.</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (current === 'highlights') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Property Highlights</h2>
              <p className="text-sm text-muted-foreground mt-1">Add property furnishings and society amenities for client-side details.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => setIsAmenitiesDialogOpen(true)}>
              + Add Amenities
            </Button>
          </div>

          <Card className="border-border/60">
            <CardContent className="pt-6 grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-2">Flat Furnishings</p>
                {isUnfurnished ? (
                  <p className="font-medium">Unfurnished selected — flat furnishing section hidden.</p>
                ) : (
                  <p className="font-medium">{selectedFlatFurnishings.length} selected</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground mb-2">Society Amenities</p>
                <p className="font-medium">{societyAmenities.length} selected</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2">Restrictions</p>
                <p className="font-medium">{restrictions.length} selected</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Label>Preferred Tenant Type</Label>
            <div className="flex flex-wrap gap-2">
              {tenantOptions.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={tenantPreference.includes(option) ? 'default' : 'outline'}
                  onClick={() => toggleArrayValue(option, setTenantPreference)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Restrictions</Label>
            <div className="flex flex-wrap gap-2">
              {restrictionOptions.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={restrictions.includes(option) ? 'default' : 'outline'}
                  onClick={() => toggleArrayValue(option, setRestrictions)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <Dialog open={isAmenitiesDialogOpen} onOpenChange={setIsAmenitiesDialogOpen}>
            <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add property furnishings and amenities</DialogTitle>
              </DialogHeader>

              {!isUnfurnished && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Flat Furnishings</h3>
                    <span className="text-sm text-muted-foreground">{flatFurnishingToggles.length + selectedFlatCount} selected</span>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3">
                    {flatToggleItems.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleArrayValue(item, setFlatFurnishingToggles)}
                        className={cn(
                          'h-24 rounded-lg border px-3 text-sm font-medium transition-colors',
                          flatFurnishingToggles.includes(item) ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted/40'
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-4 gap-3">
                    {flatCountItems.map((item) => (
                      <div key={item} className="h-24 rounded-lg border px-3 py-3 flex flex-col justify-between">
                        <p className="text-sm font-medium">{item}</p>
                        <div className="flex items-center justify-center gap-3 text-sm">
                          <button type="button" className="font-semibold" onClick={() => updateFurnishingCount(item, -1)}>-</button>
                          <span>{flatFurnishingCounts[item] || 0}</span>
                          <button type="button" className="font-semibold" onClick={() => updateFurnishingCount(item, 1)}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Society Amenities</h3>
                  <span className="text-sm text-muted-foreground">{societyAmenities.length} selected</span>
                </div>

                <div className="grid md:grid-cols-4 gap-3">
                  {societyAmenityItems.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayValue(item, setSocietyAmenities)}
                      className={cn(
                        'h-24 rounded-lg border px-3 text-sm font-medium transition-colors',
                        societyAmenities.includes(item) ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted/40'
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="button" className="w-full" onClick={() => setIsAmenitiesDialogOpen(false)}>
                Save
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Review & Post</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 space-y-2 text-sm">
              <p><span className="font-semibold">Property:</span> {buildingName || '-'}</p>
              <p><span className="font-semibold">Location:</span> {[subLocality, locality, city].filter(Boolean).join(', ') || '-'}</p>
              <p><span className="font-semibold">Type:</span> {propertyType}</p>
              <p><span className="font-semibold">BHK:</span> {bhkType}</p>
              <p><span className="font-semibold">Purpose:</span> {purpose}</p>
              <p><span className="font-semibold">Price:</span> {purpose === 'sell' ? salePrice || '-' : monthlyRent || '-'}</p>
              <p><span className="font-semibold">Images:</span> {images.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 space-y-2 text-sm">
              <p><span className="font-semibold">Maintenance:</span> {maintenanceType}</p>
              <p><span className="font-semibold">Security Deposit:</span> {securityDeposit}</p>
              <p><span className="font-semibold">Lock-In:</span> {lockInPeriod}</p>
              <p><span className="font-semibold">Brokerage:</span> {brokerage}</p>
              <p><span className="font-semibold">Brokerage Negotiable:</span> {brokerageNegotiable ? 'Yes' : 'No'}</p>
              <p><span className="font-semibold">Verified:</span> {verified ? 'Yes' : 'No'}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {purpose === 'sell' ? (
            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price *</Label>
              <Input id="salePrice" value={salePrice} onChange={(event) => setSalePrice(event.target.value)} placeholder="Enter sale price" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Monthly Rent *</Label>
              <Input id="monthlyRent" value={monthlyRent} onChange={(event) => setMonthlyRent(event.target.value)} placeholder="Enter monthly rent" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="customNotes">Admin Notes</Label>
            <Input id="customNotes" value={customNotes} onChange={(event) => setCustomNotes(event.target.value)} placeholder="Optional notes" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout
      title={isEditMode ? 'Edit Property' : 'Add Property'}
      subtitle={isEditMode ? 'Update listing using the same wizard flow' : 'Admin-only housing style listing flow'}
    >
      <div className="rounded-2xl border bg-card p-4 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="rounded-xl border bg-muted/30 p-4 flex flex-col lg:sticky lg:top-6 self-start">
            <Link to="/admin/properties" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Return to properties
            </Link>
            <h3 className="text-3xl font-semibold leading-tight">{isEditMode ? 'Edit your property' : 'Post your property'}</h3>
            <p className="text-sm text-muted-foreground mt-1">{isEditMode ? 'Update listing details' : 'Sell or rent your property'}</p>

            <div className="mt-4">
              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mb-2">
                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
                <span>{progress}%</span>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {steps.map((step, index) => {
                const done = completed.includes(step.key);
                const current = index === activeStep;

                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      'w-full flex items-start gap-3 text-left rounded-lg p-3 transition-colors border border-transparent',
                      current ? 'bg-muted' : 'hover:bg-muted/50'
                    )}
                  >
                    <span className="mt-1">
                      {done ? <CircleCheck className="h-5 w-5 text-primary" /> : current ? <Circle className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{step.title}</span>
                      <span className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={done ? 'default' : current ? 'secondary' : 'outline'}>{done ? 'Completed' : current ? 'In progress' : 'Pending'}</Badge>
                        {step.score ? <span>Score ↑ {step.score}</span> : null}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-6 text-sm text-muted-foreground flex items-center gap-1">
              <span>Need Help?</span>
              <Phone className="h-3.5 w-3.5" />
              <a href="tel:+919168596655" className="text-primary underline">Call 9168596655</a>
            </div>
          </aside>

          <section className="rounded-xl border p-4 md:p-6 min-h-[72vh] bg-background">
            {loadingProperty ? (
              <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading property data...
              </div>
            ) : (
              renderStepContent()
            )}

            <div className="pt-8 mt-8 border-t flex items-center gap-3 bg-background">
              {activeStep > 0 && (
                <Button type="button" variant="outline" onClick={prevStep} disabled={saving || loadingProperty}>
                  Back
                </Button>
              )}

              {activeStep < steps.length - 1 ? (
                <Button type="button" className="flex-1" onClick={nextStep} disabled={saving || loadingProperty}>
                  {activeStep === 0 ? 'Next, add address' : activeStep === 1 ? 'Next, add photos' : 'Next'}
                </Button>
              ) : (
                <Button type="button" className="flex-1" onClick={handleSubmit} disabled={saving || loadingProperty}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  {isEditMode ? 'Update Property' : 'Post Property'}
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
