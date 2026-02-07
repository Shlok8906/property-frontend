import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, Map } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden p-6">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] opacity-50" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Radar Scan Animation */}
      <div className="absolute w-[500px] h-[500px] border border-border rounded-full animate-ping opacity-20" />
      <div className="absolute w-[300px] h-[300px] border border-border rounded-full animate-pulse opacity-20" />

      <div className="relative z-10 max-w-2xl text-center space-y-8">
        {/* Error Code with Glitch Effect */}
        <div className="relative inline-block">
          <h1 className="text-[10rem] md:text-[15rem] font-black leading-none tracking-tighter text-foreground/10 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tight animate-bounce">
              Lost in <span className="text-primary">Pune?</span>
            </h2>
          </div>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <p className="text-muted-foreground text-lg font-medium">
            The property or page you're looking for has moved or no longer exists. Even the best navigators get lost sometimes.
          </p>
        </div>

        {/* Action Grid */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Return Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-14 px-8 rounded-2xl border-border bg-card text-foreground hover:bg-muted transition-all"
          >
            <Link to="/properties">
              <Search className="mr-2 h-5 w-5" />
              Search Properties
            </Link>
          </Button>
        </div>

        {/* Breadcrumb Context */}
        <div className="pt-12 text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground flex items-center justify-center gap-3">
          <Map className="h-3 w-3" />
          <span>Location Unknown: {location.pathname}</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;