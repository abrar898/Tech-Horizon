import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeft, CheckCircle, Clock, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order } from '@shared/schema';

interface OrderTrackingProps {
  params: { orderId: string };
}

const trackingSteps = [
  {
    id: 'placed',
    title: 'Order Placed',
    description: 'Your order has been successfully placed',
    icon: CheckCircle,
  },
  {
    id: 'confirmed',
    title: 'Payment Confirmed',
    description: 'Payment has been processed successfully',
    icon: CheckCircle,
  },
  {
    id: 'processing',
    title: 'Processing',
    description: 'Your order is being prepared for shipment',
    icon: Package,
  },
  {
    id: 'shipped',
    title: 'Shipped',
    description: 'Your order is on its way',
    icon: Truck,
  },
  {
    id: 'delivered',
    title: 'Delivered',
    description: 'Your order has been delivered',
    icon: CheckCircle,
  },
];

export default function OrderTracking({ params }: OrderTrackingProps) {
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['/api/orders', params.orderId],
    enabled: !!params.orderId,
  });

  const getStepStatus = (stepId: string, orderStatus: string) => {
    const statusOrder = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(orderStatus === 'pending' ? 'processing' : orderStatus);
    const stepIndex = statusOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600" data-testid="loading-order">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-order-not-found">
              Order Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/">
              <Button data-testid="button-back-to-store">Back to Store</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl" data-testid="text-order-tracking-title">
                Track Your Order
              </CardTitle>
              <Link href="/" data-testid="link-back-to-store">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Store
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="font-semibold text-gray-900" data-testid="text-order-number">
                    #{order.id.slice(0, 8)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900" data-testid="text-order-date">
                    {new Date(order.createdAt!).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                  <p className="font-semibold text-gray-900" data-testid="text-estimated-delivery">
                    {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer</p>
                  <p className="font-semibold text-gray-900" data-testid="text-customer-name">
                    {order.customerName}
                  </p>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Status</p>
                  <Badge 
                    variant={order.status === 'delivered' ? 'default' : 'secondary'}
                    className="text-sm"
                    data-testid="badge-order-status"
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tracking Steps */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Order Progress</h3>
              <div className="space-y-6">
                {trackingSteps.map((step, index) => {
                  const status = getStepStatus(step.id, order.status);
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.id} className="flex items-start space-x-4" data-testid={`tracking-step-${step.id}`}>
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          status === 'completed' 
                            ? 'bg-success text-white' 
                            : status === 'current'
                            ? 'bg-accent text-white'
                            : 'bg-gray-300 text-gray-500'
                        }`}>
                          {status === 'completed' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : status === 'current' ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          status === 'pending' ? 'text-gray-500' : 'text-gray-900'
                        }`} data-testid={`text-step-title-${step.id}`}>
                          {step.title}
                        </p>
                        <p className={`text-sm ${
                          status === 'pending' ? 'text-gray-400' : 'text-gray-600'
                        }`} data-testid={`text-step-description-${step.id}`}>
                          {step.description}
                        </p>
                        {status === 'current' && (
                          <p className="text-xs text-accent mt-1">In progress...</p>
                        )}
                        {status === 'completed' && index < 2 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt!).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              <div className="space-y-4">
                {(order.items as any[]).map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0" data-testid={`order-item-${index}`}>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900" data-testid={`text-item-name-${index}`}>
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900" data-testid={`text-item-total-${index}`}>
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span data-testid="text-order-total">${order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
