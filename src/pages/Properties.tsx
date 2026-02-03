import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { propertyAPI, Property } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { 
  Search, 
  MapPin, 
  Building2, 
  Calendar,
  Filter,
  X,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const bhkOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK', 'Villa'];

function PropertyCard({ property }: { property: Property }) {
  const imageUrl = Array.isArray(property.images) && property.images.length > 0 
    ? property.images[0] 
    : property.image_url || null;
  
  // Debug: Log image data
  if (!imageUrl) {
    console.log('No image for property:', property.title, 'images:', property.images, 'image_url:', property.image_url);
  }

  return (
    <Link to={`/properties/${property._id || property.id}`}>
      <Card className="group relative overflow-hidden bg-white/5 border-white/10 rounded-[2rem] transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
        <div className="relative aspect-[4/3] overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <Building2 className="h-12 w-12 text-white/20" />
            </div>
          )}
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1">
              {property.possession || 'Ready'}
            </Badge>
          </div>

          {/* BHK Floating Badges */}
          {property.bhk && (
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
              <Badge className="bg-primary text-white border-none text-[10px] font-black px-2 py-0.5">
                {property.bhk}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors truncate">
                {property.title}
              </h3>
              <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-tighter">
              <MapPin className="h-3 w-3 text-primary" />
              {property.location}
            </div>
          </div>

          <div className="flex items-end justify-between pt-2">
            <div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Starting From</p>
              <p className="text-2xl font-black text-white">
                {formatPrice(property.price)}
              </p>
            </div>
            {property.builder && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase">
                  {property.builder.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FilterSidebar({ searchQuery, setSearchQuery, selectedBhks, setSelectedBhks, priceRange, setPriceRange, onApply }: any) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Search Locality</Label>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Kothrud, Baner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white/5 border-white/10 rounded-2xl text-white focus:border-primary focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">BHK Configuration</Label>
        {/* Responsive BHK grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {bhkOptions.map((bhk) => (
            <div 
              key={bhk} 
              onClick={() => {
                if (selectedBhks.includes(bhk)) {
                  setSelectedBhks(selectedBhks.filter((b: string) => b !== bhk));
                } else {
                  setSelectedBhks([...selectedBhks, bhk]);
                }
              }}
              className={`flex items-center justify-center h-10 sm:h-12 rounded-lg sm:rounded-xl border cursor-pointer transition-all text-xs font-bold ${
                selectedBhks.includes(bhk) 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              {bhk}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end ml-1">
          <Label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Budget Range</Label>
          <span className="text-[10px] font-bold text-primary">{formatPrice(priceRange[1])}</span>
        </div>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(v) => setPriceRange(v as [number, number])}
            max={500000000}
            step={500000}
            className="py-4"
          />
          <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-2">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(500000000)}</span>
          </div>
        </div>
      </div>

      <Button onClick={onApply} className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all active:scale-95">
        Refine Results
      </Button>
    </div>
  );
}

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('location') || '');
  const [selectedBhks, setSelectedBhks] = useState<string[]>(
    searchParams.get('bhk') ? [searchParams.get('bhk')!] : []
  );
  const [selectedType, setSelectedType] = useState<string>(
    searchParams.get('type') || ''
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000000]); // Max ₹50 Cr

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyAPI.getAll();
      console.log('Fetched properties:', data.length, data);
      setProperties(data);
      applyFilters(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: Property[] = properties) => {
    let filtered = [...data];
    console.log('Applying filters to', data.length, 'properties');

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.builder?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Transaction type filter (Buy/Rent/Lease)
    if (selectedType) {
      filtered = filtered.filter(p => p.purpose === selectedType);
    }

    // BHK filter
    if (selectedBhks.length > 0) {
      filtered = filtered.filter(p => p.bhk && selectedBhks.includes(p.bhk));
    }

    // Price filter
    filtered = filtered.filter(p => {
      if (!p.price) return true;
      return p.price >= priceRange[0] && p.price <= priceRange[1];
    });

    console.log('Filtered down to', filtered.length, 'properties');
    setFilteredProperties(filtered);
  };

  useEffect(() => { fetchProperties(); }, []);
  useEffect(() => { 
    console.log('Properties updated, applying filters', properties.length);
    applyFilters(properties); 
  }, [properties, searchQuery, selectedBhks, selectedType, priceRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBhks([]);
    setSelectedType('');
    setPriceRange([0, 500000000]);
    setSearchParams({});
    applyFilters(properties);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#030712] relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="container py-12 relative z-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em] mb-2">
                <TrendingUp className="h-4 w-4" /> Pune Real Estate
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter">
                Discover Your <span className="text-primary">Space.</span>
              </h1>
              <p className="text-gray-500 font-medium">
                {loading ? 'Scanning market...' : `Found ${filteredProperties.length} premium properties matches your criteria`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {(searchQuery || selectedBhks.length > 0) && (
                <Button variant="ghost" onClick={clearFilters} className="text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest">
                  Reset
                </Button>
              )}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden h-12 px-6 rounded-2xl bg-white/5 border-white/10 text-white">
                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#0a0f1d] border-white/10 text-white w-full sm:w-[400px]">
                  <SheetHeader className="mb-8">
                    <SheetTitle className="text-2xl font-black text-white">Filters</SheetTitle>
                  </SheetHeader>
                  <FilterSidebar
                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                    selectedBhks={selectedBhks} setSelectedBhks={setSelectedBhks}
                    priceRange={priceRange} setPriceRange={setPriceRange}
                    onApply={() => applyFilters()}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </header>

          <div className="flex gap-12">
            <aside className="hidden md:block w-80 flex-shrink-0">
              <div className="sticky top-28 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" /> Filter
                </h2>
                <FilterSidebar
                  searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                  selectedBhks={selectedBhks} setSelectedBhks={setSelectedBhks}
                  priceRange={priceRange} setPriceRange={setPriceRange}
                  onApply={() => applyFilters()}
                />
              </div>
            </aside>

            <main className="flex-1">
              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/5] w-full rounded-[2rem] bg-white/5" />
                  ))}
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-white/5">
                  <Building2 className="h-16 w-16 text-gray-700 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-2">No matches found</h3>
                  <p className="text-gray-500 mb-8">Try expanding your search radius or budget.</p>
                  <Button onClick={clearFilters} className="bg-white/10 hover:bg-white/20 text-white">Clear all filters</Button>
                </div>
              ) : (
                // Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop, 4 cols large screens
                <div className="property-grid grid gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property._id || property.id} property={property} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}