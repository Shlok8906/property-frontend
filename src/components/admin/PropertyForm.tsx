import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { AmenitiesSelector } from './AmenitiesSelector';
import { RestrictionsSelector } from './RestrictionsSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  PROPERTY_TYPES,
  BHK_OPTIONS,
  PropertyCategory,
  PropertyPurpose,
  FurnishingType,
} from '@/types/property';

interface PropertyFormProps {
  property?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function PropertyForm({ property, onSave, onCancel }: PropertyFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    type: 'apartment',
    category: 'residential' as PropertyCategory,
    purpose: 'sell' as PropertyPurpose,
    bhk: '2BHK',
    furnishing: 'unfurnished' as FurnishingType,
    area: '',
    facing: 'north',
    flooring: 'ceramic',
    builder: '',
    possession: '',
    projectName: '',
    specification: '',
    tower: '',
    carpetArea: '',
    units: 0,
    salesPerson: '',
    amenities: [] as string[],
    restrictions: [] as string[],
    images: [] as string[],
    status: 'active' as 'active' | 'hidden',
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { toast } = useToast();

  // Pre-fill form with property data if editing
  useEffect(() => {
    if (property) {
      // Parse amenities and restrictions if they're comma-separated strings
      const amenitiesArray = typeof property.amenities === 'string' 
        ? property.amenities.split(',').map((a: string) => a.trim()).filter(Boolean)
        : property.amenities || [];
      
      const restrictionsArray = typeof property.restrictions === 'string' 
        ? property.restrictions.split(',').map((r: string) => r.trim()).filter(Boolean)
        : property.restrictions || [];

      const imagesArray = property.images || (property.image_url ? [property.image_url] : []);

      setFormData({
        title: property.title || '',
        description: property.description || '',
        location: property.location || '',
        price: property.price || '',
        type: property.type || 'apartment',
        category: property.category || 'residential',
        purpose: property.purpose || 'sell',
        bhk: property.bhk || '2BHK',
        furnishing: property.furnishing || 'unfurnished',
        area: property.area || '',
        facing: property.facing || 'north',
        flooring: property.flooring || 'ceramic',
        builder: property.builder || '',
        possession: property.possession || '',
        projectName: property.projectName || '',
        specification: property.specification || '',
        tower: property.tower || '',
        carpetArea: property.carpetArea || '',
        units: property.units || 0,
        salesPerson: property.salesPerson || '',
        amenities: amenitiesArray,
        restrictions: restrictionsArray,
        images: imagesArray,
        status: property.status || 'active',
      });
    }
  }, [property]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file',
            description: `${file.name} is not an image file`,
            variant: 'destructive',
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: `${file.name} exceeds 5MB limit`,
            variant: 'destructive',
          });
          continue;
        }

        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newImages.push(base64);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

      toast({
        description: `${newImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.location || !formData.price) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields: Title, Location, and Price',
        variant: 'destructive',
      });
      return;
    }

    // Set image_url to first image for backward compatibility
    const dataToSave = {
      ...formData,
      image_url: formData.images.length > 0 ? formData.images[0] : undefined,
      images: formData.images,
      status: formData.status || 'active',
    };

    try {
      setLoading(true);
      await onSave(dataToSave);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title={property ? 'Edit Property' : 'Create New Property'}
      subtitle={property ? 'Update property details' : 'Add a new property to the system'}
      actions={
        <Button
          variant="outline"
          onClick={onCancel}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Basic Information */}
        <div className="card-premium p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Luxury 3BHK Apartment"
              />
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Downtown, New York"
              />
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the property, amenities, and highlights..."
              rows={4}
            />
          </div>
        </div>

        {/* Property Images */}
        <div className="card-premium p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Property Images</h2>
          
          {/* Image Upload */}
          <div className="mb-6">
            <Label htmlFor="images" className="mb-2 block">Upload Images (Max 5MB each)</Label>
            <div className="flex items-center gap-4">
              <label 
                htmlFor="images"
                className="flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {uploadingImages ? 'Uploading...' : 'Choose Images'}
                </span>
              </label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="hidden"
              />
              <span className="text-sm text-gray-500">
                {formData.images.length} image(s) selected
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Upload multiple images. First image will be used as the main property image.
            </p>
          </div>

          {/* Image Preview Grid */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-md font-medium">
                      Main
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {formData.images.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No images uploaded yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "Choose Images" to upload property photos</p>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="card-premium p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="type">Property Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Select value={formData.purpose} onValueChange={(value) => handleChange('purpose', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="pg">PG</SelectItem>
                  <SelectItem value="coliving">Co-living</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <Label htmlFor="bhk">BHK</Label>
              <Select value={formData.bhk} onValueChange={(value) => handleChange('bhk', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BHK_OPTIONS.map((bhk) => (
                    <SelectItem key={bhk} value={bhk}>
                      {bhk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="area">Area (sq ft)</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => handleChange('area', e.target.value)}
                placeholder="e.g., 1500"
              />
            </div>

            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="e.g., 500000"
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="card-premium p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="furnishing">Furnishing</Label>
              <Select value={formData.furnishing} onValueChange={(value) => handleChange('furnishing', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fully_furnished">Fully Furnished</SelectItem>
                  <SelectItem value="semi_furnished">Semi Furnished</SelectItem>
                  <SelectItem value="unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="facing">Facing</Label>
              <Select value={formData.facing} onValueChange={(value) => handleChange('facing', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">North</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                  <SelectItem value="east">East</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                  <SelectItem value="northeast">North-East</SelectItem>
                  <SelectItem value="northwest">North-West</SelectItem>
                  <SelectItem value="southeast">South-East</SelectItem>
                  <SelectItem value="southwest">South-West</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="flooring">Flooring</Label>
              <Input
                id="flooring"
                value={formData.flooring}
                onChange={(e) => handleChange('flooring', e.target.value)}
                placeholder="e.g., ceramic, marble"
              />
            </div>

            <div>
              <Label htmlFor="builder">Builder/Society</Label>
              <Input
                id="builder"
                value={formData.builder}
                onChange={(e) => handleChange('builder', e.target.value)}
                placeholder="e.g., Lodha Group"
              />
            </div>

            <div>
              <Label htmlFor="possession">Possession Status</Label>
              <Input
                id="possession"
                value={formData.possession}
                onChange={(e) => handleChange('possession', e.target.value)}
                placeholder="e.g., Ready to move"
              />
            </div>

            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                placeholder="e.g., Lodha Meridian"
              />
            </div>

            <div>
              <Label htmlFor="tower">Tower/Block</Label>
              <Input
                id="tower"
                value={formData.tower}
                onChange={(e) => handleChange('tower', e.target.value)}
                placeholder="e.g., Tower A"
              />
            </div>

            <div>
              <Label htmlFor="specification">Specification</Label>
              <Input
                id="specification"
                value={formData.specification}
                onChange={(e) => handleChange('specification', e.target.value)}
                placeholder="e.g., 2BHK Premium"
              />
            </div>

            <div>
              <Label htmlFor="carpetArea">Carpet Area</Label>
              <Input
                id="carpetArea"
                value={formData.carpetArea}
                onChange={(e) => handleChange('carpetArea', e.target.value)}
                placeholder="e.g., 850 sq ft"
              />
            </div>

            <div>
              <Label htmlFor="units">Units Available</Label>
              <Input
                id="units"
                type="number"
                value={formData.units || ''}
                onChange={(e) => handleChange('units', parseInt(e.target.value) || 0)}
                placeholder="e.g., 10"
              />
            </div>

            <div>
              <Label htmlFor="salesPerson">Sales Contact</Label>
              <Input
                id="salesPerson"
                value={formData.salesPerson}
                onChange={(e) => handleChange('salesPerson', e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>
          </div>
        </div>

        {/* Amenities & Restrictions */}
        <div className="card-premium p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Amenities & Restrictions</h2>
          
          <div className="space-y-8">
            <div>
              <Label className="text-base font-medium mb-4 block">Select Amenities</Label>
              <AmenitiesSelector 
                selectedAmenities={formData.amenities}
                onChange={(amenities) => handleChange('amenities', amenities)}
              />
            </div>

            <div>
              <Label className="text-base font-medium mb-4 block">Select Restrictions</Label>
              <RestrictionsSelector 
                selectedRestrictions={formData.restrictions}
                onChange={(restrictions) => handleChange('restrictions', restrictions)}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 sticky bottom-0 bg-background/95 p-6 border-t rounded-lg">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="gap-2"
          >
            {loading ? 'Saving...' : property ? 'Update Property' : 'Create Property'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
