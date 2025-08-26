import { type User, type InsertUser, type Product, type InsertProduct, type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize with diverse sample products across categories
    const sampleProducts: InsertProduct[] = [
      // Electronics
      {
        name: "Premium Wireless Headphones",
        description: "High-quality audio with noise cancellation",
        price: "299.99",
        category: "Electronics",
        stock: 24,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.8",
        reviewCount: 128,
        isActive: 1
      },
      {
        name: "MacBook Pro 16\"",
        description: "Professional laptop with M2 chip",
        price: "2499.99",
        category: "Electronics",
        stock: 8,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.9",
        reviewCount: 89,
        isActive: 1
      },
      {
        name: "Apple Watch Series 9",
        description: "Advanced health monitoring",
        price: "399.99",
        category: "Electronics",
        stock: 15,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.7",
        reviewCount: 201,
        isActive: 1
      },
      {
        name: "Wireless Gaming Mouse",
        description: "High precision gaming mouse with RGB lighting",
        price: "79.99",
        category: "Electronics",
        stock: 45,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.6",
        reviewCount: 156,
        isActive: 1
      },

      // Clothing - Men's
      {
        name: "Classic White Dress Shirt",
        description: "Premium cotton dress shirt, perfect for business",
        price: "89.99",
        category: "Clothing",
        stock: 32,
        imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.5",
        reviewCount: 94,
        isActive: 1
      },
      {
        name: "Slim Fit Jeans",
        description: "Comfortable dark wash denim jeans",
        price: "79.99",
        category: "Clothing",
        stock: 28,
        imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.3",
        reviewCount: 187,
        isActive: 1
      },
      {
        name: "Casual Cotton T-Shirt",
        description: "Soft organic cotton t-shirt in various colors",
        price: "24.99",
        category: "Clothing",
        stock: 67,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.4",
        reviewCount: 203,
        isActive: 1
      },
      {
        name: "Leather Bomber Jacket",
        description: "Genuine leather jacket with premium finish",
        price: "299.99",
        category: "Clothing",
        stock: 12,
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.8",
        reviewCount: 76,
        isActive: 1
      },

      // Shoes
      {
        name: "Running Sneakers",
        description: "Lightweight athletic shoes with cushioned sole",
        price: "129.99",
        category: "Shoes",
        stock: 38,
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.6",
        reviewCount: 142,
        isActive: 1
      },
      {
        name: "Classic Oxford Shoes",
        description: "Formal leather oxford shoes for business wear",
        price: "179.99",
        category: "Shoes",
        stock: 22,
        imageUrl: "https://images.unsplash.com/photo-1529810313688-44ea1c2d81d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.7",
        reviewCount: 89,
        isActive: 1
      },
      {
        name: "Casual Canvas Sneakers",
        description: "Comfortable everyday canvas sneakers",
        price: "59.99",
        category: "Shoes",
        stock: 54,
        imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.3",
        reviewCount: 167,
        isActive: 1
      },

      // Home & Garden
      {
        name: "Modern Table Lamp",
        description: "Minimalist LED table lamp with touch control",
        price: "89.99",
        category: "Home",
        stock: 29,
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.5",
        reviewCount: 93,
        isActive: 1
      },
      {
        name: "Throw Pillow Set",
        description: "Set of 2 decorative throw pillows with covers",
        price: "39.99",
        category: "Home",
        stock: 41,
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.4",
        reviewCount: 124,
        isActive: 1
      },
      {
        name: "Indoor Plant Collection",
        description: "Set of 3 easy-care houseplants with pots",
        price: "79.99",
        category: "Home",
        stock: 18,
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.6",
        reviewCount: 78,
        isActive: 1
      },

      // Sports & Fitness
      {
        name: "Yoga Mat Premium",
        description: "Non-slip eco-friendly yoga mat with carrying strap",
        price: "49.99",
        category: "Sports",
        stock: 36,
        imageUrl: "https://images.unsplash.com/photo-1506629905607-84970bc8c9e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.5",
        reviewCount: 156,
        isActive: 1
      },
      {
        name: "Adjustable Dumbbells",
        description: "Space-saving adjustable dumbbells 5-50 lbs",
        price: "299.99",
        category: "Sports",
        stock: 14,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.7",
        reviewCount: 89,
        isActive: 1
      },
      {
        name: "Resistance Band Set",
        description: "Complete set of resistance bands with handles",
        price: "29.99",
        category: "Sports",
        stock: 58,
        imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.3",
        reviewCount: 134,
        isActive: 1
      },

      // Books
      {
        name: "The Science of Well-Being",
        description: "Bestselling guide to happiness and mental wellness",
        price: "19.99",
        category: "Books",
        stock: 45,
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.6",
        reviewCount: 267,
        isActive: 1
      },
      {
        name: "Programming Fundamentals",
        description: "Complete guide to modern software development",
        price: "39.99",
        category: "Books",
        stock: 23,
        imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.8",
        reviewCount: 156,
        isActive: 1
      },
      {
        name: "Cooking Mastery",
        description: "Professional techniques for home chefs",
        price: "29.99",
        category: "Books",
        stock: 34,
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.5",
        reviewCount: 89,
        isActive: 1
      },

      // Beauty
      {
        name: "Skincare Routine Kit",
        description: "Complete 5-step skincare routine for all skin types",
        price: "89.99",
        category: "Beauty",
        stock: 27,
        imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.7",
        reviewCount: 178,
        isActive: 1
      },
      {
        name: "Professional Makeup Brushes",
        description: "Set of 12 professional makeup brushes with case",
        price: "69.99",
        category: "Beauty",
        stock: 31,
        imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.6",
        reviewCount: 145,
        isActive: 1
      },

      // Food & Beverages
      {
        name: "Premium Coffee Beans",
        description: "Single-origin arabica coffee beans, freshly roasted",
        price: "24.99",
        category: "Food",
        stock: 76,
        imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.8",
        reviewCount: 203,
        isActive: 1
      },
      {
        name: "Organic Green Tea",
        description: "Premium organic green tea leaves, 100 tea bags",
        price: "19.99",
        category: "Food",
        stock: 52,
        imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.5",
        reviewCount: 167,
        isActive: 1
      },

      // Toys
      {
        name: "Educational Building Blocks",
        description: "STEM learning toy set with 200+ colorful blocks",
        price: "49.99",
        category: "Toys",
        stock: 38,
        imageUrl: "https://images.unsplash.com/photo-1558877385-6b8a1ff2ad38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.7",
        reviewCount: 234,
        isActive: 1
      },
      {
        name: "Remote Control Drone",
        description: "Beginner-friendly drone with HD camera",
        price: "199.99",
        category: "Toys",
        stock: 19,
        imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.4",
        reviewCount: 98,
        isActive: 1
      }
    ];

    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive === 1);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: new Date(),
      stock: insertProduct.stock || 0,
      rating: insertProduct.rating || '0',
      reviewCount: insertProduct.reviewCount || 0,
      isActive: insertProduct.isActive || 1
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated: Product = { ...existing, ...productUpdate };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p => 
      p.isActive === 1 && (
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      )
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => 
      p.isActive === 1 && p.category === category
    );
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
    
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date(),
      estimatedDelivery,
      status: insertOrder.status || 'pending'
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    
    const updated: Order = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
