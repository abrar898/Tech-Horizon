import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Product } from '@shared/schema';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (!product) return null;

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
    onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl" data-testid="dialog-product-details">
        <DialogHeader>
          <DialogTitle data-testid="text-product-details-title">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
              data-testid="img-product-details"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <Badge variant="secondary" data-testid="badge-product-category">
                {product.category}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-primary" data-testid="text-product-details-price">
                ${product.price}
              </span>
              <div className="flex items-center">
                <div className="flex">
                  {renderStars(parseFloat(product.rating || "0"))}
                </div>
                <span className="text-sm text-gray-500 ml-1" data-testid="text-product-details-reviews">
                  ({product.reviewCount}) reviews
                </span>
              </div>
            </div>

            <p className="text-gray-600" data-testid="text-product-details-description">
              {product.description}
            </p>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600">Stock: </span>
                <span className={`text-sm font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`} data-testid="text-product-details-stock">
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-accent text-white hover:bg-blue-600 transition-colors" 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                data-testid="button-add-to-cart-details"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                data-testid="button-close-details"
              >
                Close
              </Button>
            </div>

            {/* Additional Product Information */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-semibold text-gray-900">Product Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>✓ Fast and secure checkout</p>
                <p>✓ Free shipping on orders over $50</p>
                <p>✓ 30-day return policy</p>
                <p>✓ 24/7 customer support</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}