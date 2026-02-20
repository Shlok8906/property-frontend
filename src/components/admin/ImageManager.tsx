import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Trash2, Star, Loader2, AlertTriangle } from 'lucide-react';

interface PropertyImage {
  id: string;
  property_uuid: string;
  image_url: string;
  alt_text?: string;
  is_featured: boolean;
  order_index: number;
  created_at: string;
}

interface ImageManagerProps {
  propertyId?: string;
}

export default function ImageManager({ propertyId }: ImageManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ alt_text: '' });

  const fetchImages = async () => {
    if (!propertyId) {
      setImages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('properties_images')
        .select('*')
        .eq('property_uuid', propertyId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setImages((data as PropertyImage[]) || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: 'Error',
        description: 'Failed to load images',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [propertyId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!propertyId) {
      toast({
        title: 'Select Property',
        description: 'Open image manager from a property to upload images.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload images',
        variant: 'destructive',
      });
      return;
    }

    if (files.length === 0) return;

    setUploading(true);
    const uploadedCount = { success: 0, failed: 0 };
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file',
            description: `${file.name} is not an image file`,
            variant: 'destructive',
          });
          uploadedCount.failed++;
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: `${file.name} exceeds 10MB limit`,
            variant: 'destructive',
          });
          uploadedCount.failed++;
          continue;
        }

        try {
          // Create a unique file name with timestamp
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 8);
          const fileExtension = file.name.split('.').pop();
          const fileName = `${propertyId}/${timestamp}-${randomString}.${fileExtension}`;
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error(uploadError.message);
          }

          if (!uploadData) {
            throw new Error('Upload failed - no data returned');
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(uploadData.path);

          if (!urlData || !urlData.publicUrl) {
            throw new Error('Failed to generate public URL');
          }

          // Save image metadata to database
          const maxOrder = images.length > 0 ? Math.max(...images.map((img) => img.order_index), -1) : -1;
          
          const { error: insertError } = await (supabase as any)
            .from('properties_images')
            .insert({
              property_uuid: propertyId,
              image_url: urlData.publicUrl,
              alt_text: file.name.replace(/\.[^/.]+$/, ''),
              order_index: maxOrder + 1 + i,
              is_featured: images.length === 0 && i === 0, // Make first image featured if no images exist
            });

          if (insertError) {
            console.error('Database insert error:', insertError);
            throw new Error(insertError.message);
          }

          uploadedCount.success++;
          toast({
            title: 'Success',
            description: `${file.name} uploaded successfully`,
          });
        } catch (error: any) {
          console.error('Error uploading file:', error);
          toast({
            title: 'Upload Failed',
            description: `${file.name}: ${error.message}`,
            variant: 'destructive',
          });
          uploadedCount.failed++;
        }
      }

      if (uploadedCount.success > 0) {
        await fetchImages();
      }
    } catch (error: any) {
      console.error('Error during upload process:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const setFeaturedImage = async (imageId: string) => {
    if (!user) return;

    try {
      // Unset previous featured image
      const { error: unsetError } = await (supabase as any)
        .from('properties_images')
        .update({ is_featured: false })
        .eq('property_uuid', propertyId)
        .eq('is_featured', true);

      if (unsetError) throw unsetError;

      // Set new featured image
      const { error: setError } = await (supabase as any)
        .from('properties_images')
        .update({ is_featured: true })
        .eq('id', imageId);

      if (setError) throw setError;

      toast({
        title: 'Success',
        description: 'Featured image updated',
      });

      fetchImages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update featured image',
        variant: 'destructive',
      });
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    if (!user) return;

    try {
      // Delete from storage
      const path = imageUrl.split('/').pop();
      if (path) {
        await supabase.storage.from('property-images').remove([`${propertyId}/${path}`]);
      }

      // Delete metadata
      const { error } = await (supabase as any)
        .from('properties_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      });

      fetchImages();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  const updateImageAlt = async () => {
    if (!selectedImage || !user) return;

    try {
      const { error } = await (supabase as any)
        .from('properties_images')
        .update({ alt_text: editFormData.alt_text })
        .eq('id', selectedImage.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Alt text updated',
      });

      fetchImages();
      setIsEditDialogOpen(false);
      setSelectedImage(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update image',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Property Images ({images.length})</span>
          <Badge variant="outline">Core Feature</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
            dragActive 
              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
              : 'border-border/50 bg-muted/20 hover:border-primary/50 hover:bg-primary/5'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {/* Hidden file input */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={uploading}
            className="hidden"
            id="image-upload-input"
          />
          
          {/* Click area */}
          <label htmlFor="image-upload-input" className="absolute inset-0 cursor-pointer rounded-2xl" />
          
          {/* Content */}
          <div className="relative z-10 pointer-events-none">
            <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <h3 className="font-bold text-lg mb-2 text-foreground">
              {uploading ? 'Uploading Images...' : 'Drop Images or Click to Upload'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Supports JPG, PNG, WebP, GIF • Max 10MB per image
            </p>
            
            {uploading && (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-primary">Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Alert */}
        {!uploading && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                Tip: Upload multiple images at once
              </p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                You can drag multiple images or select them all at once. The first image will automatically be set as featured.
              </p>
            </div>
          </div>
        )}

        {/* Image Gallery */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No images uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-border/50 hover:border-primary/50 transition-all"
              >
                <img
                  src={image.image_url}
                  alt={image.alt_text}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />

                {/* Featured Badge */}
                {image.is_featured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="gap-1 bg-yellow-500/80">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}

                {/* Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {!image.is_featured && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setFeaturedImage(image.id)}
                      title="Set as featured"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedImage(image);
                      setEditFormData({ alt_text: image.alt_text || '' });
                      setIsEditDialogOpen(true);
                    }}
                    title="Edit alt text"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedImage(image);
                      setIsDeleteDialogOpen(true);
                    }}
                    title="Delete image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Alt Text Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>Update image details for better SEO</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedImage && (
              <>
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.alt_text}
                  className="w-full max-h-48 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="space-y-2">
                  <Label htmlFor="alt-text">Alt Text (for accessibility & SEO)</Label>
                  <Input
                    id="alt-text"
                    value={editFormData.alt_text}
                    onChange={(e) => setEditFormData({ alt_text: e.target.value })}
                    placeholder="Describe the image..."
                    className="bg-background border-border/50"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateImageAlt} className="gradient-primary">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Image
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The image will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <img
              src={selectedImage.image_url}
              alt={selectedImage.alt_text}
              className="w-full max-h-48 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedImage && deleteImage(selectedImage.id, selectedImage.image_url)
              }
            >
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
