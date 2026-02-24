import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Search, LayoutGrid, List, Eye, EyeOff, MapPin, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { propertyAPI, Property } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { OptimizedImage } from '@/components/OptimizedImage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type { Property } from '@/lib/api';

export function PropertyManagement() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  
  // Filter states
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBHK, setFilterBHK] = useState<string>('all');
  const [locationSearch, setLocationSearch] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    let filtered = properties.filter(prop => {
      const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prop.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || prop.type === filterType;
      const matchesPurpose = filterPurpose === 'all' || prop.purpose === filterPurpose;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && (prop.status || 'active') === 'active') ||
                           (filterStatus === 'hidden' && (prop.status || 'active') === 'hidden');
      const matchesBHK = filterBHK === 'all' || prop.bhk === filterBHK;
      const matchesLocation = !locationSearch || 
                             prop.location.toLowerCase().includes(locationSearch.toLowerCase());
      
      return matchesSearch && matchesType && matchesPurpose && matchesStatus && matchesBHK && matchesLocation;
    });

    // Apply sorting
    switch (sortBy) {
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'recent':
        filtered.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    setFilteredProperties(filtered);
  }, [searchTerm, properties, filterType, filterPurpose, filterStatus, filterBHK, locationSearch, sortBy]);

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

  const resetFilters = () => {
    setFilterType('all');
    setFilterPurpose('all');
    setFilterStatus('all');
    setFilterBHK('all');
    setLocationSearch('');
    setSearchTerm('');
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      : <Badge variant="secondary">Hidden</Badge>;
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
      <div className="flex gap-6">
        {/* Left Sidebar - Filters */}
        <div className="w-64 flex-shrink-0">
          <Card className="p-4 space-y-6 sticky top-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Filters</h3>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
                  Reset
                </Button>
              </div>
              
              {/* Search */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Property Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="independent_house">Independent House</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Purpose */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Purpose</label>
                <Select value={filterPurpose} onValueChange={setFilterPurpose}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* BHK */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">BHK</label>
                <Select value={filterBHK} onValueChange={setFilterBHK}>
                  <SelectTrigger>
                    <SelectValue placeholder="All BHK" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All BHK</SelectItem>
                    <SelectItem value="1BHK">1 BHK</SelectItem>
                    <SelectItem value="2BHK">2 BHK</SelectItem>
                    <SelectItem value="3BHK">3 BHK</SelectItem>
                    <SelectItem value="4BHK">4 BHK</SelectItem>
                    <SelectItem value="5BHK">5 BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Enter locality..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-base px-4 py-2">
                All Listings: {properties.length}
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                Active: {properties.filter(p => (p.status || 'active') === 'active').length}
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                Hidden: {properties.filter(p => (p.status || 'active') === 'hidden').length}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center gap-2 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredProperties.length} of {properties.length} properties
          </div>

          {/* Grid/List View */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <Card className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">
                {properties.length === 0 
                  ? 'Get started by adding your first property' 
                  : 'Try adjusting your filters'}
              </p>
              {properties.length === 0 && (
                <Button onClick={handleAddNew} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Property
                </Button>
              )}
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property._id || property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Property Image */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <OptimizedImage
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <div className="text-center">
                          <Home className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-xs text-muted-foreground">NO PHOTOS</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(property.status || 'active')}
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-lg line-clamp-1">{property.title}</h3>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{property.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(property.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {property.bhk} • {property.type.replace('_', ' ')}
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {property.purpose}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Switch 
                        checked={(property.status || 'active') === 'active'}
                        onCheckedChange={() => handleToggleStatus(property)}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <span className="text-xs text-muted-foreground flex-1">
                        {(property.status || 'active') === 'active' ? 'Visible' : 'Hidden'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(property)}
                        className="gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(property._id || property.id || '')}
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProperties.map((property) => (
                <Card key={property._id || property.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {property.images && property.images.length > 0 ? (
                        <OptimizedImage
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-1">{property.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground gap-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{property.location}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline">{property.bhk}</Badge>
                            <Badge variant="outline" className="capitalize">{property.type.replace('_', ' ')}</Badge>
                            <Badge variant="outline" className="capitalize">{property.purpose}</Badge>
                            {getStatusBadge(property.status || 'active')}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-2">
                            {formatPrice(property.price)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={(property.status || 'active') === 'active'}
                              onCheckedChange={() => handleToggleStatus(property)}
                              className="data-[state=checked]:bg-green-500"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(property)}
                              className="gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(property._id || property.id || '')}
                              className="gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

