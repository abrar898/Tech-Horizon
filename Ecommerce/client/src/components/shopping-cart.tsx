import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import { useLocation } from 'wouter';

interface ShoppingCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShoppingCartDrawer({ isOpen, onClose }: ShoppingCartDrawerProps) {
  const { items, removeFromCart, updateQuantity, subtotal, total } = useCart();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    onClose();
    setLocation('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" data-testid="cart-overlay">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl" data-testid="cart-drawer">
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900" data-testid="text-cart-title">
              Shopping Cart
            </h2>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              data-testid="button-close-cart"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 mt-8" data-testid="text-empty-cart">
                Your cart is empty
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4" data-testid={`cart-item-${item.productId}`}>
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      data-testid={`img-cart-item-${item.productId}`}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900" data-testid={`text-cart-item-name-${item.productId}`}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600" data-testid={`text-cart-item-price-${item.productId}`}>
                        ${item.price}
                      </p>
                      <div className="flex items-center mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="text-gray-400 hover:text-gray-600"
                          data-testid={`button-decrease-quantity-${item.productId}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-3 text-gray-900" data-testid={`text-cart-item-quantity-${item.productId}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="text-gray-400 hover:text-gray-600"
                          data-testid={`button-increase-quantity-${item.productId}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-800"
                      data-testid={`button-remove-from-cart-${item.productId}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900" data-testid="text-cart-subtotal">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">$15.99</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900" data-testid="text-cart-total">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full bg-accent text-white hover:bg-blue-600 transition-colors"
                onClick={handleCheckout}
                data-testid="button-checkout"
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
