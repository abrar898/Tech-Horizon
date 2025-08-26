import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductDetailsModal } from "@/components/product-details-modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", searchQuery, selectedCategory],
    enabled: true,
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  const handleViewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailsOpen(true);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      case "newest":
        return (
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onSearch={handleSearch} />

      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-6xl font-bold mb-6"
            data-testid="text-hero-title"
          >
            Discover Amazing Products
          </h1>
          <p
            className="text-xl mb-8 text-gray-300"
            data-testid="text-hero-description"
          >
            Shop the latest trends with fast shipping and secure payments
          </p>
          <Button
            className="bg-white text-primary px-8 py-3 text-lg font-semibold hover:bg-gray-100 transition-colors"
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            data-testid="button-shop-now"
          >
            Shop Now
          </Button>
        </div>
      </section>

      {/* Filters and Category Bar */}
      <section className="bg-white border-b border-gray-200" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Categories:</span>

              {/* All button */}
              <Button
                variant={selectedCategory === "" ? "default" : "ghost"}
                onClick={() => setSelectedCategory("")}
                className="text-sm"
                data-testid="button-category-all"
              >
                All
              </Button>

              {/* Category buttons */}
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  onClick={() => setSelectedCategory(category)}
                  className="text-sm"
                  data-testid={`button-category-${category.toLowerCase()}`}
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Sort by: Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Best Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="text-center py-12" data-testid="loading-products">
            <div className="text-lg text-gray-600">Loading products...</div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-products">
            <div className="text-lg text-gray-600">No products found</div>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              data-testid="grid-products"
            >
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewProductDetails}
                />
              ))}
            </div>

            {products.length > 8 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  className="px-8 py-3"
                  data-testid="button-load-more"
                >
                  Load More Products
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div
                className="text-2xl font-bold mb-4"
                data-testid="text-footer-logo"
              >
                ModernStore
              </div>
              <p className="text-gray-300 text-sm">
                Your trusted partner for premium electronics and lifestyle
                products.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Shipping Info
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-sm">
                {categories.slice(0, 4).map((category) => (
                  <li key={category}>
                    <button
                      onClick={() => handleCategoryFilter(category)}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/order/track"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Track Your Order
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Returns
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">
              &copy; 2024 ModernStore. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isProductDetailsOpen}
        onClose={() => setIsProductDetailsOpen(false)}
      />
    </div>
  );
}
