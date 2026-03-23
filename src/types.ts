export interface Product {
  id: string;
  name: string;
  category: 'gaming' | 'casual' | 'budget' | 'low-cost' | 'brand-new' | 'accessory';
  price: number;
  description: string;
  image: string;
  specs?: string[];
  rating: number;
  reviews: number;
  isNew?: boolean;
}

export interface PurchaseRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

export const PRODUCTS: Product[] = [
  // Gaming
  {
    id: 'g1',
    name: 'Nebula RTX 4090 Gaming Beast',
    category: 'gaming',
    price: 2499,
    description: 'Ultimate performance for pro gamers and creators.',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop',
    specs: ['RTX 4090', '64GB RAM', '2TB SSD', '360Hz Display'],
    rating: 4.9,
    reviews: 128,
    isNew: true
  },
  {
    id: 'g2',
    name: 'Titan Pro 17"',
    category: 'gaming',
    price: 1899,
    description: 'Immersive 17-inch display with mechanical keyboard.',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800&auto=format&fit=crop',
    specs: ['RTX 4070', '32GB RAM', '1TB SSD'],
    rating: 4.7,
    reviews: 85
  },
  // Casual
  {
    id: 'c1',
    name: 'ZenBook Air 14',
    category: 'casual',
    price: 999,
    description: 'Sleek, lightweight, and perfect for everyday productivity.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
    specs: ['i7 13th Gen', '16GB RAM', '512GB SSD', 'OLED Screen'],
    rating: 4.8,
    reviews: 210,
    isNew: true
  },
  {
    id: 'c2',
    name: 'Surface Flow 2',
    category: 'casual',
    price: 1199,
    description: 'The most versatile 2-in-1 for modern professionals.',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop',
    specs: ['Touchscreen', 'Stylus Support', '12hr Battery'],
    rating: 4.6,
    reviews: 145
  },
  // Budget
  {
    id: 'b1',
    name: 'Swift 3 Eco',
    category: 'budget',
    price: 599,
    description: 'Great value without compromising on build quality.',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&auto=format&fit=crop',
    specs: ['Ryzen 5', '8GB RAM', '256GB SSD'],
    rating: 4.5,
    reviews: 320
  },
  // Low Cost
  {
    id: 'lc1',
    name: 'EduBook 11',
    category: 'low-cost',
    price: 299,
    description: 'Perfect for students and basic web browsing.',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop',
    specs: ['Intel Celeron', '4GB RAM', 'ChromeOS'],
    rating: 4.2,
    reviews: 89
  },
  // Accessories
  {
    id: 'a1',
    name: 'Pro Wireless Mouse',
    category: 'accessory',
    price: 79,
    description: 'Lag-free performance with ergonomic design.',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    reviews: 540
  },
  {
    id: 'a2',
    name: 'Mechanical RGB Keyboard',
    category: 'accessory',
    price: 129,
    description: 'Clicky switches with customizable lighting.',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviews: 312
  }
];
