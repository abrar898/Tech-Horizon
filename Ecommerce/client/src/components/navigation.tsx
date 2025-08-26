import { useState } from 'react';
import { Link } from 'wouter';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-context';
import { ShoppingCartDrawer } from '@/components/shopping-cart';

interface NavigationProps {
  onSearch: (query: string) => void;
}

export function Navigation({ onSearch }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" data-testid="link-home">
                <div className="text-2xl font-bold text-primary">ModernStore</div>
              </Link>
            </div>
            
            {/* Search - Desktop */}
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4"
                  data-testid="input-search"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </form>
            </div>
            
            {/* Navigation Items - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/admin" data-testid="link-admin">
                <Button variant="ghost" className="text-gray-600 hover:text-primary">
                  Admin
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="relative text-gray-600 hover:text-primary"
                onClick={() => setIsCartOpen(true)}
                data-testid="button-cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="text-cart-count">
                    {itemCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <form onSubmit={handleSearch} className="relative mb-4">
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4"
                  data-testid="input-search-mobile"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </form>
              <div className="flex items-center justify-between">
                <Link href="/admin" data-testid="link-admin-mobile">
                  <Button variant="ghost" className="text-gray-600 hover:text-primary">
                    Admin
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="relative text-gray-600 hover:text-primary"
                  onClick={() => setIsCartOpen(true)}
                  data-testid="button-cart-mobile"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="text-cart-count-mobile">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <ShoppingCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
