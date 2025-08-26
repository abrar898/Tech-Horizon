import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Edit, Trash2, Plus, ArrowLeft, Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductForm } from '@/components/product-form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Product, Order } from '@shared/schema';

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['/api/categories'],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/products', {
        ...data,
        price: data.price.toString(),
        stock: parseInt(data.stock),
        rating: data.rating || '0',
        reviewCount: parseInt(data.reviewCount) || 0,
        isActive: parseInt(data.isActive) || 1,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsProductFormOpen(false);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest('DELETE', `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // Calculate stats
  const totalProducts = products.length;
  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.createdAt!);
    return orderDate.toDateString() === today.toDateString();
  }).length;
  
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const activeUsers = orders.length > 0 ? new Set(orders.map(order => order.customerEmail)).size : 0;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="text-admin-title">
            Admin Dashboard
          </h1>
          <Link href="/" data-testid="link-back-to-store">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-stats-products">{totalProducts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-stats-orders">{todayOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-stats-revenue">
                ${totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-stats-users">{activeUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Product Management</CardTitle>
                  <Button 
                    onClick={() => setIsProductFormOpen(true)}
                    className="flex items-center gap-2"
                    data-testid="button-add-product"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Product Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-products"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48" data-testid="select-filter-category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                  {isLoadingProducts ? (
                    <div className="text-center py-8" data-testid="loading-products">
                      Loading products...
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8" data-testid="empty-products">
                      No products found
                    </div>
                  ) : (
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Stock</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="border-b border-gray-100" data-testid={`row-product-${product.id}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="h-10 w-10 rounded-lg mr-3 object-cover"
                                />
                                <div>
                                  <p className="font-medium text-gray-900" data-testid={`text-product-name-${product.id}`}>
                                    {product.name}
                                  </p>
                                  <p className="text-sm text-gray-500">ID: {product.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-900" data-testid={`text-product-category-${product.id}`}>
                              {product.category}
                            </td>
                            <td className="py-3 px-4 text-gray-900" data-testid={`text-product-price-${product.id}`}>
                              ${product.price}
                            </td>
                            <td className="py-3 px-4 text-gray-900" data-testid={`text-product-stock-${product.id}`}>
                              {product.stock}
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant={product.isActive ? "default" : "secondary"}
                                data-testid={`badge-product-status-${product.id}`}
                              >
                                {product.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-accent hover:text-blue-600"
                                  data-testid={`button-edit-product-${product.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  data-testid={`button-delete-product-${product.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {isLoadingOrders ? (
                    <div className="text-center py-8" data-testid="loading-orders">
                      Loading orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8" data-testid="empty-orders">
                      No orders found
                    </div>
                  ) : (
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Order ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-100" data-testid={`row-order-${order.id}`}>
                            <td className="py-3 px-4 font-medium text-gray-900" data-testid={`text-order-id-${order.id}`}>
                              #{order.id.slice(0, 8)}
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900" data-testid={`text-order-customer-${order.id}`}>
                                  {order.customerName}
                                </p>
                                <p className="text-sm text-gray-500">{order.customerEmail}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-900" data-testid={`text-order-date-${order.id}`}>
                              {new Date(order.createdAt!).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-gray-900" data-testid={`text-order-total-${order.id}`}>
                              ${order.total}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={getStatusBadgeVariant(order.status)} data-testid={`badge-order-status-${order.id}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Link href={`/order/${order.id}`}>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-accent hover:text-blue-600"
                                    data-testid={`button-view-order-${order.id}`}
                                  >
                                    View
                                  </Button>
                                </Link>
                                <Select 
                                  value={order.status} 
                                  onValueChange={(status) => handleUpdateOrderStatus(order.id, status)}
                                >
                                  <SelectTrigger className="w-32 h-8" data-testid={`select-order-status-${order.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProductForm
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        onSubmit={(data) => createProductMutation.mutate(data)}
        isLoading={createProductMutation.isPending}
      />
    </div>
  );
}
