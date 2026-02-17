import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { propertyAPI, Property } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { OptimizedImage } from '@/components/OptimizedImage';
import { 
  Search,
  MapPin, 
  Building2,
  Filter,
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

const INITIAL_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DATA_SAVER_LIMIT = 8;

const PropertyCard = memo(function PropertyCard({ property, priority = false }: { property: Property; priority?: boolean }) {
  const imageUrl = Array.isArray(property.images) && property.images.length > 0 
    ? property.images[0] 
    : property.image_url || null;

  return (
    <Link to={`/properties/${property._id || property.id}`} target="_blank" rel="noopener noreferrer">
      <Card className="group relative overflow-hidden bg-card border-border rounded-[2rem] transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
        <div className="relative aspect-[4/3] overflow-hidden">
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt={property.title}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'low'}
              className="transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <Building2 className="h-12 w-12 text-foreground/20" />
            </div>
          )}
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-foreground/80 backdrop-blur-md border-border text-background font-bold text-[10px] uppercase tracking-widest px-3 py-1">
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
              <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors truncate">
                {property.title}
              </h3>
              <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-tighter">
              <MapPin className="h-3 w-3 text-primary" />
              {property.location}
            </div>
          </div>

          <div className="flex items-end justify-between pt-2">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Starting From</p>
              <p className="text-2xl font-black text-foreground">
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
});

interface FilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedBhks: string[];
  setSelectedBhks: (value: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  onApply: () => void;
}

function FilterSidebar({ searchQuery, setSearchQuery, selectedBhks, setSelectedBhks, priceRange, setPriceRange, onApply }: FilterSidebarProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Search Locality</Label>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Kothrud, Baner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-background border-border rounded-2xl text-foreground focus:border-primary focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">BHK Configuration</Label>
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
                : 'bg-card border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {bhk}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end ml-1">
          <Label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Budget Range</Label>
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
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalProperties, setTotalProperties] = useState(0);
  const [page, setPage] = useState(INITIAL_PAGE);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('location') || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams.get('location') || '');
  const [selectedBhks, setSelectedBhks] = useState<string[]>(
    searchParams.get('bhk')
      ? searchParams.get('bhk')!.split(',').map((value) => value.trim()).filter(Boolean)
      : []
  );
  const [selectedType, setSelectedType] = useState<string>(
    searchParams.get('type') || ''
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000000]);

  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const pageLimit = useMemo(() => {
    // Performance: reduce payload size on slow connections or data-saver mode.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    return connection?.saveData ? DATA_SAVER_LIMIT : DEFAULT_LIMIT;
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const activeFilters = useMemo(() => ({
    search: debouncedSearchQuery,
    bhks: selectedBhks,
    type: selectedType,
    minPrice: priceRange[0],
    maxPrice: priceRange[1]
  }), [debouncedSearchQuery, selectedBhks, selectedType, priceRange]);

  const syncSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    if (activeFilters.search) params.set('location', activeFilters.search);
    if (activeFilters.bhks.length > 0) params.set('bhk', activeFilters.bhks.join(','));
    if (activeFilters.type) params.set('type', activeFilters.type);
    setSearchParams(params, { replace: true });
  }, [activeFilters, setSearchParams]);

  const fetchPage = useCallback(async (pageToFetch: number, append: boolean, signal?: AbortSignal) => {
    const response = await propertyAPI.list({
      page: pageToFetch,
      limit: pageLimit,
      fields: 'card',
      search: activeFilters.search || undefined,
      bhk: activeFilters.bhks.length > 0 ? activeFilters.bhks.join(',') : undefined,
      type: activeFilters.type || undefined,
      minPrice: activeFilters.minPrice,
      maxPrice: activeFilters.maxPrice
    }, signal);

    // Performance: append incremental pages instead of re-rendering a full replaced list each time.
    setProperties((current) => (append ? [...current, ...response.items] : response.items));
    setTotalProperties(response.total);
    setHasMore(response.hasMore);
  }, [activeFilters, pageLimit]);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;

    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      await fetchPage(nextPage, true);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more properties:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore, loading, page]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchPage(INITIAL_PAGE, false, controller.signal)
      .then(() => {
        setPage(INITIAL_PAGE);
      })
      .catch((error) => {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error fetching properties:', error);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    syncSearchParams();
    return () => {
      controller.abort();
    };
  }, [fetchPage, syncSearchParams]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px 0px' }
    );

    if (loadMoreTriggerRef.current) {
      observerRef.current.observe(loadMoreTriggerRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [fetchNextPage]);

  const applyFilters = () => {
    syncSearchParams();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedBhks([]);
    setSelectedType('');
    setPriceRange([0, 500000000]);
    setSearchParams({});
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="container py-12 relative z-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em] mb-2">
                <TrendingUp className="h-4 w-4" /> Pune Real Estate
              </div>
              <h1 className="text-5xl font-black text-foreground tracking-tighter">
                Discover Your <span className="text-primary">Space.</span>
              </h1>
              <p className="text-muted-foreground font-medium">
                {loading ? 'Scanning market...' : `Found ${totalProperties} premium properties matching your criteria`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {(searchQuery || selectedBhks.length > 0) && (
                <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground font-bold text-xs uppercase tracking-widest">
                  Reset
                </Button>
              )}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden h-12 px-6 rounded-2xl bg-card border-border text-foreground">
                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-border text-foreground w-full sm:w-[400px]">
                  <SheetHeader className="mb-8">
                    <SheetTitle className="text-2xl font-black text-foreground">Filters</SheetTitle>
                  </SheetHeader>
                  <FilterSidebar
                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                    selectedBhks={selectedBhks} setSelectedBhks={setSelectedBhks}
                    priceRange={priceRange} setPriceRange={setPriceRange}
                    onApply={applyFilters}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </header>

          <div className="flex gap-12">
            <aside className="hidden md:block w-80 flex-shrink-0">
              <div className="sticky top-28 bg-card border border-border rounded-[2.5rem] p-8">
                <h2 className="text-xl font-black text-foreground mb-8 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" /> Filter
                </h2>
                <FilterSidebar
                  searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                  selectedBhks={selectedBhks} setSelectedBhks={setSelectedBhks}
                  priceRange={priceRange} setPriceRange={setPriceRange}
                  onApply={applyFilters}
                />
              </div>
            </aside>

            <main className="flex-1">
              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/5] w-full rounded-[2rem] bg-muted" />
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-24 bg-card rounded-[3rem] border border-border">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">No matches found</h3>
                  <p className="text-muted-foreground mb-8">Try expanding your search radius or budget.</p>
                  <Button onClick={clearFilters} className="bg-primary hover:bg-primary/90 text-white">Clear all filters</Button>
                </div>
              ) : (
                // Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop, 4 cols large screens
                <div className="property-grid grid gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                  {properties.map((property, index) => (
                    <PropertyCard key={property._id || property.id} property={property} priority={index === 0} />
                  ))}
                </div>
              )}

              {!loading && properties.length > 0 && (
                <div ref={loadMoreTriggerRef} className="py-8 text-center text-sm text-muted-foreground">
                  {loadingMore ? 'Loading more properties…' : hasMore ? 'Scroll for more' : 'You reached the end'}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}