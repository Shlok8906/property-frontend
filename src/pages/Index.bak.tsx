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
  MousePointer2
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const popularLocations = [
  { name: 'Hinjewadi', count: '2,500+ Properties' },
  { name: 'Baner', count: '1,800+ Properties' },
  { name: 'Wakad', count: '3,200+ Properties' },
  { name: 'Kharadi', count: '4,100+ Properties' },
  { name: 'Pashan', count: '1,500+ Properties' },
  { name: 'Sus', count: '1,200+ Properties' },
];

const bhkTypes = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Villa'];

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
  // backup of the original homepage
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-white">Index backup</h1>
      </div>
    </Layout>
  );
}
