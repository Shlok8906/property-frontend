import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MapPin, 
  Building2, 
  TrendingUp, 
  Shield, 
  Star,
  ArrowRight,
  MousePointer2,
  Phone,
  Mail,
  Home,
  HandshakeIcon,
  KeyRound
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '@/lib/api';

const popularLocations = [
  { name: 'Hinjewadi', count: '2,500+ Properties' },
  { name: 'Baner', count: '1,800+ Properties' },
  { name: 'Wakad', count: '3,200+ Properties' },
  { name: 'Kharadi', count: '4,100+ Properties' },
  { name: 'Pashan', count: '1,500+ Properties' },
  { name: 'Sus', count: '1,200+ Properties' },
];

const transactionTypes = [
  { name: 'Buy', icon: Home, value: 'sell' },
  { name: 'Rent', icon: KeyRound, value: 'rent' },
  { name: 'Lease', icon: HandshakeIcon, value: 'lease' }
];

const stats = [
  { value: '1000+', label: 'Properties Listed' },
  { value: '500+', label: 'Trusted Builders' },
  { value: '2500+', label: 'Happy Customers' },
  { value: '50+', label: 'Pune areas' },
];

const features = [
  {
    icon: Shield,
    title: 'Verified Properties',
    description: 'All listings are verified by our team to ensure authenticity.',
  },
  {
    icon: TrendingUp,
    title: 'Best Prices',
    description: 'Get the best deals directly from builders and developers.',
  },
  {
    icon: Star,
    title: 'Expert Guidance',
    description: 'Our property experts help you find your dream home.',
  },
];

const partners = [
  { name: 'Pyramids Properties', image: '/partners/pyramids.jpg' },
  { name: 'Majestique Landmarks', image: '/partners/majestique.jpg' },
  { name: 'Mantra Properties', image: '/partners/mantra.jpg' },
  { name: 'Rohan', image: '/partners/rohan.jpg' },
  { name: 'AP Corp', image: '/partners/apcorp.jpg' },
  { name: 'Vilas Javdekar', image: '/partners/vilas.jpg' },
  { name: 'Hiranandani', image: '/partners/hiranandani.jpg' },
  { name: 'Godrej Properties', image: '/partners/godrej.jpg' },
  { name: 'VTP Realty', image: '/partners/vtp.jpg' },
  { name: 'Krisala Developers', image: '/partners/krisala.jpg' },
  { name: 'Pristine Properties', image: '/partners/pristine.jpg' },
  { name: 'Saheel', image: '/partners/saheel.jpg' },
  { name: 'Kohinoor', image: '/partners/kohinoor.jpg' },
  { name: 'Austin Realty', image: '/partners/austin.jpg' },
];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyCount, setPropertyCount] = useState(0);
  const navigate = useNavigate();

  // Fetch real property count from MongoDB
  useEffect(() => {
    const fetchPropertyCount = async () => {
      try {
        const properties = await propertyAPI.getAll();
        setPropertyCount(properties.length);
      } catch (error) {
        console.error('Error fetching property count:', error);
      }
    };
    fetchPropertyCount();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('location', searchQuery);
    navigate(`/properties?${params.toString()}`);
  };

  const handleTransactionClick = (transactionValue: string) => {
    navigate(`/properties?type=${transactionValue}`);
  };

  return (
    <Layout>
      {/* Hero Section - Upgraded with Depth and Grain */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#030712]">
        {/* Abstract Background Orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/15 rounded-full blur-[120px] animate-pulse" />
          {/* Subtle Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        <div className="container relative z-10 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 lg:space-y-10 px-4 sm:px-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Badge - responsive sizing */}
              <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-primary text-xs sm:text-sm font-bold tracking-wider uppercase animate-fadeIn">
                Premium Real Estate in Pune
              </span>
              
              {/* Main Heading - mobile-first typography */}
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-white leading-tight sm:leading-none break-words">
                Your Future <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary animate-gradient-x">
                  Starts at Home
                </span>
              </h1>
              
              {/* Subtitle - responsive text */}
              <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
                Skip the endless search. Discover curated luxury and verified comfort across Pune's finest neighborhoods.
              </p>
            </div>
          </div>

          {/* Glassmorphism Search Box - Mobile Responsive */}
          <div className="relative max-w-4xl mx-auto group px-4 sm:px-0 mt-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-secondary/40 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <form onSubmit={handleSearch} className="relative bg-black/40 backdrop-blur-2xl border border-white/10 p-3 sm:p-4 rounded-2xl sm:rounded-[2.2rem] shadow-2xl">
              {/* Mobile: Stack vertically, Desktop: Side by side */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1 sm:flex-[2] relative group/input order-2 sm:order-1">
                  <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    type="text"
                    placeholder="Enter locality..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border-white/5 h-12 sm:h-16 pl-10 sm:pl-12 text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl focus:ring-primary/50 text-white placeholder:text-gray-500 transition-all w-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="h-12 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm sm:text-base lg:text-lg shadow-lg shadow-primary/20 transition-transform active:scale-95 order-1 sm:order-2"
                >
                  <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Search</span>
                  <span className="sm:hidden">Find</span>
                </Button>
              </div>

              {/* BHK Selection Chips */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start md:px-2">
                {transactionTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTransactionClick(type.value)}
                    className="group px-6 py-3 rounded-2xl text-sm font-bold transition-all border bg-white/5 border-white/10 text-gray-300 hover:bg-primary hover:border-primary hover:text-white hover:shadow-[0_0_20px_rgba(var(--primary),0.5)] flex items-center gap-2"
                  >
                    <type.icon className="h-5 w-5" />
                    {type.name}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Floating Stats Section */}
      <section className="relative z-20 -mt-12 container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-[#0a0f1d]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-3xl">
          <div className="text-center group border-r border-white/5">
            <div className="text-3xl md:text-4xl font-black text-white group-hover:text-primary transition-colors">
              {propertyCount > 0 ? `${propertyCount}+` : '1000+'}
            </div>
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mt-2">
              Properties Listed
            </div>
          </div>
          <div className="text-center group border-r border-white/5">
            <div className="text-3xl md:text-4xl font-black text-white group-hover:text-primary transition-colors">
              500+
            </div>
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mt-2">
              Trusted Builders
            </div>
          </div>
          <div className="text-center group border-r border-white/5">
            <div className="text-3xl md:text-4xl font-black text-white group-hover:text-primary transition-colors">
              2500+
            </div>
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mt-2">
              Happy Customers
            </div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl font-black text-white group-hover:text-primary transition-colors">
              50+
            </div>
            <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mt-2">
              Pune areas
            </div>
          </div>
        </div>
      </section>

      {/* Popular Locations - Bento Grid Style */}
      <section className="py-24 bg-[#030712]">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tight">Prime <span className="text-primary">Localities</span></h2>
              <p className="text-gray-500 font-medium">Find your spot in Pune's fastest growing hubs.</p>
            </div>
            <Link to="/properties" className="group flex items-center gap-2 text-primary font-bold hover:underline">
              View All Areas <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularLocations.map((location, index) => (
              <Link
                key={index}
                to={`/properties?location=${encodeURIComponent(location.name)}`}
                className="group relative h-40 bg-white/5 rounded-3xl border border-white/10 p-8 overflow-hidden hover:bg-white/10 transition-all hover:-translate-y-2"
              >
                <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-primary/10 transition-colors">
                  <MapPin size={120} />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <h3 className="text-2xl font-black text-white">{location.name}</h3>
                  <div className="flex items-center gap-2 text-primary text-sm font-bold">
                    {location.count} <MousePointer2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Neumorphic Dark Style */}
      <section className="py-24 bg-[#050a18] border-y border-white/5">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Carousel - Modern Scroll */}
      <section className="py-24 bg-[#030712] overflow-hidden">
        <div className="container mb-12 text-center">
            <h2 className="text-3xl font-black text-white">The Builders We <span className="text-primary">Trust</span></h2>
        </div>
        
        <div className="flex gap-8 animate-scroll hover:[animation-play-state:paused]">
          <style>{`
            @keyframes scroll {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 30s linear infinite;
              display: flex;
              width: max-content;
            }
          `}</style>
          
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-48 h-24 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center p-6 grayscale hover:grayscale-0 hover:bg-white/10 transition-all cursor-pointer"
            >
              <img
                src={partner.image}
                alt={partner.name}
                className="max-h-full object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <span className="text-gray-500 font-bold text-xs text-center">{partner.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer - Minimalist Dark */}
      <footer className="pt-24 pb-12 bg-[#020610] border-t border-white/5">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-white">Nivvaas</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Elevating the real estate experience in Pune. Verified, Transparent, Simplified.
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h4 className="text-white font-bold mb-6">Contact Us</h4>
              <div className="space-y-4">
                <a href="tel:+919168596655" className="flex items-center gap-3 text-gray-500 hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm">+91 916 859 6655</span>
                </a>
                <a href="mailto:contact@nexprime.in" className="flex items-center gap-3 text-gray-500 hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm">contact@nexprime.in</span>
                </a>
                <div className="flex items-start gap-3 text-gray-500">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm leading-relaxed">
                    Office no 204, Magnolia Business Center,<br />
                    Baner Pashan Link road, Pune 411021
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-white font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link to="/properties" className="hover:text-primary transition-colors">Browse Properties</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-600 text-[10px] uppercase font-bold tracking-widest">
            <p>© 2024 Nivvaas. Handcrafted for Pune.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
}