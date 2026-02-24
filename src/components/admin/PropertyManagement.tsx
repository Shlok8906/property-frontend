import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { propertyAPI, Property } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type { Property } from '@/lib/api';

export function PropertyManagement() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    const filtered = properties.filter(prop =>
      prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProperties(filtered);
  }, [searchTerm, properties]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      // Admin should see all properties, including hidden ones
      const data = await propertyAPI.getAll(true);
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load properties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      await propertyAPI.delete(id);
      setProperties(properties.filter(p => (p._id || p.id) !== id));
      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete property',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (property: Property) => {
    navigate(`/admin/add-property/${property._id || property.id}`);
  };

  const handleAddNew = () => {
    navigate('/admin/add-property');
  };

  const handleToggleStatus = async (property: Property) => {
    const currentStatus = property.status || 'active';
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    
    try {
      await propertyAPI.update(property._id || property.id || '', { status: newStatus });
      
      // Update local state
      const updatedProperties = properties.map(p => 
        (p._id || p.id) === (property._id || property.id) 
          ? { ...p, status: newStatus } 
          : p
      );
      setProperties(updatedProperties);
      setFilteredProperties(updatedProperties.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      
      toast({
        title: 'Status Updated',
        description: `Property is now ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update property status',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout
      title="Property Management"
      subtitle="Create, edit, and manage all properties"
      actions={
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Property
        </Button>
      }
    >
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden card-premium">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>BHK</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading properties...
                </TableCell>
              </TableRow>
            ) : filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {properties.length === 0 ? 'No properties yet' : 'No properties match your search'}
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map((property) => (
                <TableRow key={property._id || property.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell className="capitalize">{property.type.replace('_', ' ')}</TableCell>
                  <TableCell>{property.bhk}</TableCell>
                  <TableCell>{formatPrice(property.price)}</TableCell>
                  <TableCell className="capitalize">{property.purpose}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={(property.status || 'active') === 'active'}
                        onCheckedChange={() => handleToggleStatus(property)}
                      />
                      <Badge variant={(property.status || 'active') === 'active' ? 'default' : 'secondary'}>
                        {(property.status || 'active') === 'active' ? 'Active' : 'Hidden'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(property)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(property._id || property.id || '')}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}

