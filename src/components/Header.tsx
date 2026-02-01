import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, User, LogOut, LayoutDashboard, Heart, Search, Menu, X, Mail } from 'lucide-react';

export function Header() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-card">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - responsive sizing */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-110">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex flex-col hidden sm:block">
              <span className="text-lg sm:text-2xl font-bold leading-none">
                <span className="gradient-text">Nivvaas</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - hidden on mobile, shown on md+ */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            <Link 
              to="/properties" 
              className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
            >
              <Search className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden lg:inline">Find Properties</span>
            </Link>
            <Link 
              to="/contact" 
              className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
            >
              <Mail className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="hidden lg:inline">Contact</span>
            </Link>
            {role === 'admin' && (
              <Link 
                to="/admin" 
                className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 group"
              >
                <LayoutDashboard className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}
          </nav>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu Toggle - shown on md- */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* User Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:bg-primary/10 transition-colors shadow-card hover:shadow-glow p-0">
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-primary/40 hover:border-primary/60 transition-colors">
                      <AvatarFallback className="bg-gradient-primary text-white font-bold text-xs sm:text-sm">
                        {getInitials(user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 sm:w-56 shadow-elevated border-border/50 bg-card/95 backdrop-blur" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs sm:text-sm font-bold text-foreground leading-none truncate">{user.email}</p>
                      <p className="text-[10px] sm:text-xs leading-none text-primary font-semibold capitalize">
                        {role || 'Customer'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/30" />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer hover:bg-primary/10 text-sm">
                      <User className="mr-2 h-4 w-4 text-primary" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-enquiries" className="cursor-pointer hover:bg-primary/10 text-sm">
                      <Heart className="mr-2 h-4 w-4 text-accent" />
                      <span>Enquiries</span>
                    </Link>
                  </DropdownMenuItem>
                  {role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer hover:bg-primary/10 text-sm">
                        <LayoutDashboard className="mr-2 h-4 w-4 text-secondary" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-border/30" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 text-sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="text-xs sm:text-sm text-muted-foreground hover:text-foreground font-semibold">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="gradient-primary text-white font-bold shadow-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5">
                  <Link to="/signup">Start</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu - shown when mobile menu is open */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border/30 py-3 space-y-2">
            <Link 
              to="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-3"
            >
              <Search className="h-4 w-4" />
              Find Properties
            </Link>
            <Link 
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-3"
            >
              <Mail className="h-4 w-4" />
              Contact
            </Link>
            {role === 'admin' && (
              <Link 
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-accent hover:bg-accent/5 rounded-lg transition-colors flex items-center gap-3"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
