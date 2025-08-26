import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@shared/schema';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < fullStars ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
        />
      );
    }
    return stars;
  };

  return (
    <Card className="overflow-hidden card-hover cursor-pointer" data-testid={`card-product-${product.id}`} onClick={() => onViewDetails?.(product)}>
      <img 
        src={product.imageUrl} 
        alt={product.name}
        className="w-full h-48 object-cover"
        data-testid={`img-product-${product.id}`}
      />
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3" data-testid={`text-product-description-${product.id}`}>
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
            ${product.price}
          </span>
          <div className="flex items-center">
            <div className="flex">
              {renderStars(parseFloat(product.rating || "0"))}
            </div>
            <span className="text-sm text-gray-500 ml-1" data-testid={`text-product-reviews-${product.id}`}>
              ({product.reviewCount})
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-accent text-white hover:bg-blue-600 transition-colors" 
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            Add to Cart
          </Button>
          <Button 
            variant="outline" 
            className="px-3"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(product);
            }}
            data-testid={`button-view-details-${product.id}`}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
