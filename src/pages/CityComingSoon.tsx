import { Building2 } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';

export default function CityComingSoon() {
  const { city } = useParams();
  const cityName = city ? decodeURIComponent(city) : 'City';

  return (
    <Layout>
      <section className="min-h-[70vh] bg-[#f9f9f9] flex items-center">
        <div className="container text-center">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Building2 className="h-9 w-9 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-black text-gray-900">{cityName}</h1>
          <p className="mt-3 text-lg text-gray-600">Coming Soon</p>
          <div className="mt-8">
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
