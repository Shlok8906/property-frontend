import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import ImageManager from '@/components/admin/ImageManager';

interface Project {
  id: string;
  project_name: string;
  builder: string;
  location: string;
  amenities: string | null;
  possession: string | null;
  launch_date: string | null;
  status: string;
  description: string | null;
  updated_at: string;
  updated_by_user?: { email: string };
}

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeletDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isHardDelete, setIsHardDelete] = useState(false);
  const [hasLeads, setHasLeads] = useState(false);

  const [formData, setFormData] = useState({
    project_name: '',
    builder: '',
    location: '',
    amenities: '',
    possession: '',
    launch_date: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*, updated_by_user:auth.users(email)')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;

        setProject(projectData);
        setFormData({
          project_name: projectData.project_name,
          builder: projectData.builder,
          location: projectData.location,
          amenities: projectData.amenities || '',
          possession: projectData.possession || '',
          launch_date: projectData.launch_date || '',
          description: projectData.description || '',
          status: projectData.status || 'active',
        });

        // Check for leads
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('id')
          .eq('property_id', id)
          .limit(1);

        if (!leadsError && leadsData && leadsData.length > 0) {
          setHasLeads(true);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load property',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleSave = async () => {
    if (!id || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          project_name: formData.project_name,
          builder: formData.builder,
          location: formData.location,
          amenities: formData.amenities || null,
          possession: formData.possession || null,
          launch_date: formData.launch_date || null,
          description: formData.description || null,
          status: formData.status,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Log to audit trail
      await supabase.from('properties_audit_log').insert({
        property_uuid: id,
        action: 'UPDATE',
        changed_by: user.id,
        changes: formData,
      });

      toast({
        title: 'Success',
        description: 'Property updated successfully!',
      });

      // Refresh project data
      const { data: updatedProject } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (updatedProject) {
        setProject(updatedProject);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save property',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !user) return;

    if (isHardDelete && hasLeads) {
      toast({
        title: 'Cannot Hard Delete',
        description: 'This property has leads. Perform a soft delete instead.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (isHardDelete) {
        // Hard delete - remove everything
        await supabase.from('projects').delete().eq('id', id);
        await supabase.from('properties_images').delete().eq('property_uuid', id);
        await supabase.from('units').delete().eq('project_uuid', id);

        toast({
          title: 'Success',
          description: 'Property permanently deleted',
        });
      } else {
        // Soft delete - mark as inactive
        const { error } = await supabase
          .from('projects')
          .update({
            status: 'inactive',
            soft_deleted_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq('id', id);

        if (error) throw error;

        await supabase.from('properties_audit_log').insert({
          property_uuid: id,
          action: 'SOFT_DELETE',
          changed_by: user.id,
          reason: deleteConfirmText,
        });

        toast({
          title: 'Success',
          description: 'Property marked as inactive',
        });
      }

      setIsDeleteDialogOpen(false);
      navigate('/admin/projects');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete property',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Property" subtitle="Update property details">
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout title="Edit Property">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">Property not found</h2>
          <Button onClick={() => navigate('/admin/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Edit Property"
      subtitle={`${project.project_name} • Last updated ${format(new Date(project.updated_at), 'dd MMM yyyy')}`}
    >
      <div className="grid gap-6">
        {/* Main Edit Form */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_name">Property Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="bg-background border-border/50"
                  placeholder="e.g., Pyramids Properties"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="builder">Builder / Developer *</Label>
                <Input
                  id="builder"
                  value={formData.builder}
                  onChange={(e) => setFormData({ ...formData, builder: e.target.value })}
                  className="bg-background border-border/50"
                  placeholder="Builder name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-background border-border/50"
                  placeholder="e.g., Baner, Pune"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="launch_date">Launch Date</Label>
                <Input
                  id="launch_date"
                  type="date"
                  value={formData.launch_date}
                  onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
                  className="bg-background border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="possession">Possession Date</Label>
                <Input
                  id="possession"
                  type="date"
                  value={formData.possession}
                  onChange={(e) => setFormData({ ...formData, possession: e.target.value })}
                  className="bg-background border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Textarea
                id="amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                className="bg-background border-border/50"
                placeholder="e.g., Gym, Pool, Garden, Parking, Security"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background border-border/50"
                placeholder="Detailed description of the property..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/30">
              <Button onClick={handleSave} disabled={saving} className="gradient-primary">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/projects')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Manager */}
        {id && <ImageManager propertyId={id} />}

        {/* Danger Zone */}
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {hasLeads
                ? 'This property has leads. Only soft delete is available.'
                : 'You can permanently delete this property.'}
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Property
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeletDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Choose delete type carefully.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {hasLeads ? (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  ⚠️ This property has leads. Hard delete is not available.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-border/50 rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="radio"
                    checked={!isHardDelete}
                    onChange={() => setIsHardDelete(false)}
                  />
                  <div>
                    <p className="font-medium">Soft Delete (Recommended)</p>
                    <p className="text-xs text-muted-foreground">Mark as inactive, keep leads & history</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-red-500/30 rounded-lg cursor-pointer hover:bg-red-500/5">
                  <input
                    type="radio"
                    checked={isHardDelete}
                    onChange={() => setIsHardDelete(true)}
                  />
                  <div>
                    <p className="font-medium text-red-600">Hard Delete (Advanced)</p>
                    <p className="text-xs text-muted-foreground">Permanently remove everything</p>
                  </div>
                </label>
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason for deletion</Label>
              <Textarea
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Why are you deleting this property?"
                rows={2}
                className="bg-background border-border/50"
              />
            </div>

            {isHardDelete && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-600">
                  ⚠️ Hard delete is permanent and cannot be reversed.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isHardDelete ? 'Hard Delete' : 'Soft Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
