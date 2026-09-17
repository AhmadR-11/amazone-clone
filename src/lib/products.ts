/**
 * Product data layer.
 * Priority 1: Rainforest API (if RAINFOREST_API_KEY is set)
 * Priority 2: Rich seeded mock data (realistic, swappable)
 */

import { cacheGetJSON, cacheSetJSON } from './cache';

export interface Product {
  asin: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  brand: string;
  image: string;
  images: string[];
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isPrime: boolean;
  features: string[];
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  badge?: string; // '#1 Best Seller', 'Amazon's Choice', etc.
}

// ─── Rainforest API Client ──────────────────────────────────────────────

async function rainforestSearch(
  query: string,
  category?: string,
  page = 1
): Promise<Product[]> {
  const key = process.env.RAINFOREST_API_KEY;
  if (!key || key.trim() === '') return [];

  const searchTerm = query.trim() || category || 'bestsellers';
  const cacheKey = `rf:search:${searchTerm}:${category || 'all'}:${page}`;
  const cached = await cacheGetJSON<Product[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  try {
    const params = new URLSearchParams({
      api_key: key.trim(),
      type: 'search',
      amazon_domain: 'amazon.com',
      search_term: searchTerm,
      page: String(page),
    });

    console.log(`[Rainforest API] Fetching live products from Amazon for: "${searchTerm}"...`);
    const res = await fetch(`https://api.rainforestapi.com/request?${params}`);
    
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Rainforest API HTTP Error ${res.status}]:`, errText);
      return [];
    }

    const json = await res.json();
    if (json.request_info && json.request_info.success === false) {
      console.error('[Rainforest API Error]:', json.request_info.message || json.request_info);
      return [];
    }

    const rawResults = json.search_results || [];
    console.log(`[Rainforest API Success] Fetched ${rawResults.length} real products from Amazon.`);

    const products = rawResults.map(mapRainforestProduct).filter((p: Product) => p.asin && p.title);
    if (products.length > 0) {
      await cacheSetJSON(cacheKey, products, 600); // 10 min cache
    }
    return products;
  } catch (err) {
    console.error('[Rainforest API Exception]:', err);
    return [];
  }
}

async function rainforestGetProduct(asin: string): Promise<Product | null> {
  const key = process.env.RAINFOREST_API_KEY;
  if (!key || key.trim() === '') return null;

  const cacheKey = `rf:product:${asin}`;
  const cached = await cacheGetJSON<Product>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      api_key: key.trim(),
      type: 'product',
      amazon_domain: 'amazon.com',
      asin,
    });

    console.log(`[Rainforest API] Fetching product details for ASIN: ${asin}...`);
    const res = await fetch(`https://api.rainforestapi.com/request?${params}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.product) return null;

    const product = mapRainforestProduct(json.product);
    await cacheSetJSON(cacheKey, product, 600);
    return product;
  } catch {
    return null;
  }
}

function mapRainforestProduct(raw: any): Product {
  const priceVal =
    raw.price?.value ||
    raw.buybox_winner?.price?.value ||
    raw.prices?.[0]?.value ||
    (typeof raw.price === 'number' ? raw.price : 0);

  return {
    asin: raw.asin || `rf-${Math.random().toString(36).substr(2, 9)}`,
    title: raw.title || 'Amazon Product',
    description: raw.description || raw.title || '',
    category: raw.categories?.[0]?.name || raw.bestsellers_rank?.[0]?.category || 'General',
    brand: raw.brand || raw.manufacturer || 'Amazon',
    image: raw.image || raw.main_image?.link || '/placeholder.png',
    images: raw.images?.map((i: any) => i.link || i) || [raw.image || raw.main_image?.link || '/placeholder.png'],
    price: priceVal || 29.99,
    originalPrice: raw.price?.was?.value || raw.list_price?.value,
    rating: raw.rating || 4.5,
    reviewCount: raw.ratings_total || raw.reviews_count || 120,
    inStock: raw.availability?.is_in_stock !== false,
    isPrime: raw.is_prime || true,
    features: raw.feature_bullets_flat
      ? raw.feature_bullets_flat.split('\n').filter(Boolean).slice(0, 6)
      : raw.feature_bullets || [],
    badge: raw.badge || (raw.is_best_seller ? '#1 Best Seller' : raw.is_amazons_choice ? "Amazon's Choice" : undefined),
  };
}

// ─── Public API ─────────────────────────────────────────────────────────

export async function searchProducts(
  query: string,
  category?: string,
  page = 1
): Promise<Product[]> {
  const rfResults = await rainforestSearch(query, category, page);
  if (rfResults.length > 0) return rfResults;
  return seedSearch(query, category, page);
}

export async function getProduct(asin: string): Promise<Product | null> {
  const rfProduct = await rainforestGetProduct(asin);
  if (rfProduct) return rfProduct;
  return seedGetProduct(asin);
}

export async function getProductsByCategory(
  category: string,
  limit = 20,
  page = 1
): Promise<Product[]> {
  if (process.env.RAINFOREST_API_KEY) {
    const results = await rainforestSearch('', category, page);
    if (results.length > 0) return results.slice(0, limit);
  }
  return seedByCategory(category, limit, page);
}

export async function getRelatedProducts(
  asin: string,
  category: string
): Promise<Product[]> {
  if (process.env.RAINFOREST_API_KEY) {
    const rf = await rainforestSearch(category, category, 1);
    if (rf.length > 0) return rf.filter((p) => p.asin !== asin).slice(0, 8);
  }
  const items = seedByCategory(category, 8, 1);
  return items.filter((p: Product) => p.asin !== asin);
}

export async function getAllProducts(
  page = 1,
  limit = 20,
  filters?: { category?: string; minPrice?: number; maxPrice?: number; minRating?: number; sort?: string }
): Promise<{ products: Product[]; total: number; totalPages: number }> {
  let all: Product[] = [];

  if (process.env.RAINFOREST_API_KEY && process.env.RAINFOREST_API_KEY.trim() !== '') {
    const rfProducts = await rainforestSearch(
      filters?.category || 'bestsellers',
      filters?.category,
      page
    );
    if (rfProducts.length > 0) {
      all = rfProducts;
    }
  }

  // Fallback to seed products if Rainforest API not set or returns 0 items
  if (all.length === 0) {
    all = [...SEED_PRODUCTS];
    if (filters?.category) {
      all = all.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
    }
  }

  if (filters?.minPrice !== undefined) {
    all = all.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    all = all.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters?.minRating !== undefined) {
    all = all.filter((p) => p.rating >= filters.minRating!);
  }

  if (filters?.sort === 'price_asc') all.sort((a, b) => a.price - b.price);
  else if (filters?.sort === 'price_desc') all.sort((a, b) => b.price - a.price);
  else if (filters?.sort === 'rating') all.sort((a, b) => b.rating - a.rating);
  else if (filters?.sort === 'reviews') all.sort((a, b) => b.reviewCount - a.reviewCount);

  const total = all.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const products = all.slice(start, start + limit);
  return { products, total, totalPages };
}

// ─── Seed Data Helpers ──────────────────────────────────────────────────

function seedSearch(query: string, category?: string, page = 1): Product[] {
  let results = SEED_PRODUCTS;
  const q = query.toLowerCase();
  if (q) {
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  const limit = 20;
  const start = (page - 1) * limit;
  return results.slice(start, start + limit);
}

function seedGetProduct(asin: string): Product | null {
  return SEED_PRODUCTS.find((p) => p.asin === asin) || null;
}

function seedByCategory(category: string, limit: number, page: number): Product[] {
  const matching = SEED_PRODUCTS.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
  const start = (page - 1) * limit;
  return matching.slice(start, start + limit);
}

export function getAllCategories(): string[] {
  return [...new Set(SEED_PRODUCTS.map((p) => p.category))];
}

// ─── 50+ Rich Seed Products ─────────────────────────────────────────────

export const SEED_PRODUCTS: Product[] = [
  // ── Electronics ──
  {
    asin: 'B08N5WRWNW',
    title: 'Echo Dot (4th Gen) | Smart speaker with Alexa | Charcoal',
    description: 'Meet the all-new Echo Dot - Our most popular smart speaker with a fabric design. It is our most compact smart speaker that fits perfectly into small spaces.',
    category: 'Electronics',
    subcategory: 'Smart Speakers',
    brand: 'Amazon',
    image: 'https://images.unsplash.com/photo-1558203728-00f45181dd84?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1558203728-00f45181dd84?w=500&q=80',
      'https://images.unsplash.com/photo-1558203728-00f45181dd84?w=800&q=80',
    ],
    price: 49.99,
    originalPrice: 59.99,
    rating: 4.7,
    reviewCount: 847261,
    inStock: true,
    isPrime: true,
    badge: "Amazon's Choice",
    features: [
      'Compact design with improved audio quality',
      'Control your smart home with your voice',
      'Ask Alexa to play music, set timers, check the weather',
      'Connect with others hands-free',
      'Supports Zigbee, Matter, Ring devices',
    ],
    colors: [
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Glacier White', hex: '#F5F5F0' },
      { name: 'Deep Sea Blue', hex: '#1A5276' },
    ],
  },
  {
    asin: 'B09B8YWXDF',
    title: 'Apple AirPods Pro (2nd Generation) Wireless Earbuds',
    description: 'AirPods Pro feature up to 2x more Active Noise Cancellation than the previous generation, plus Adaptive Transparency.',
    category: 'Electronics',
    subcategory: 'Headphones',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&q=80',
      'https://images.unsplash.com/photo-1625823908248-9b18b27b3e3a?w=500&q=80',
    ],
    price: 199.99,
    originalPrice: 249.00,
    rating: 4.8,
    reviewCount: 312487,
    inStock: true,
    isPrime: true,
    badge: '#1 Best Seller',
    features: [
      'Active Noise Cancellation 2x more powerful',
      'Adaptive Transparency lets in real-world sounds',
      'Personalized Spatial Audio with head tracking',
      'Up to 30 hours total listening time with case',
      'Touch control for volume, skipping tracks, calls',
      'Sweat and water resistant (IPX4)',
    ],
  },
  {
    asin: 'B07XJ8C8F5',
    title: 'Samsung 55" Class QLED 4K Smart TV',
    description: 'Quantum HDR 12x. QLED Color. The Samsung Q70A QLED 4K TV brings brilliant color with Quantum Dot technology.',
    category: 'Electronics',
    subcategory: 'Television',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=500&q=80'],
    price: 849.99,
    originalPrice: 1199.99,
    rating: 4.6,
    reviewCount: 42381,
    inStock: true,
    isPrime: true,
    features: [
      'Quantum HDR 12x - more brightness, wider color range',
      '100% Color Volume with Quantum Dot technology',
      'Alexa & Google Assistant built-in',
      'Motion Rate 240 for smooth motion',
      '4 HDMI, 2 USB ports',
    ],
  },
  {
    asin: 'B0BDJ279YP',
    title: 'Logitech MX Master 3S Wireless Mouse - Quiet Clicks',
    description: 'The MX Master 3S is the master of mice. Track on glass with the Darkfield high-precision sensor. 8K DPI.',
    category: 'Electronics',
    subcategory: 'Computer Accessories',
    brand: 'Logitech',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80'],
    price: 99.99,
    originalPrice: 119.99,
    rating: 4.7,
    reviewCount: 28761,
    inStock: true,
    isPrime: true,
    badge: "Amazon's Choice",
    features: [
      'Quiet 90% less click noise vs. previous version',
      'Tracks on glass with Darkfield sensor 8K DPI',
      'Magspeed electromagnetic scrolling',
      'Multi-device connectivity (up to 3 computers)',
      'USB-C quick charge',
    ],
    colors: [
      { name: 'Graphite', hex: '#3D3D3D' },
      { name: 'Pale Gray', hex: '#D4D4D4' },
    ],
  },
  {
    asin: 'B09G9FPHY6',
    title: 'iPad (9th Generation) 10.2-inch, Wi-Fi, 64GB - Space Gray',
    description: 'The most popular iPad. Now even faster with the A13 Bionic chip. For work, play, and everything in between.',
    category: 'Electronics',
    subcategory: 'Tablets',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80'],
    price: 329.99,
    originalPrice: 379.00,
    rating: 4.8,
    reviewCount: 143278,
    inStock: true,
    isPrime: true,
    features: [
      'A13 Bionic chip for fast performance',
      '10.2-inch Retina display with True Tone',
      'All-day 10-hour battery life',
      'Compatible with Apple Pencil (1st gen)',
      'Center Stage for video calls',
    ],
    colors: [
      { name: 'Space Gray', hex: '#555555' },
      { name: 'Silver', hex: '#C0C0C0' },
    ],
  },
  {
    asin: 'B08L8RYJML',
    title: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
    description: 'Industry-leading noise cancellation with Dual Noise Sensor technology. Up to 30-hour battery life.',
    category: 'Electronics',
    subcategory: 'Headphones',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'],
    price: 278.00,
    originalPrice: 348.00,
    rating: 4.7,
    reviewCount: 98421,
    inStock: true,
    isPrime: true,
    features: [
      'Industry-leading noise cancellation',
      '30-hour battery life with quick charge',
      'Speak-to-chat pauses music automatically',
      'Multipoint connection - two devices at once',
      'Exceptional call quality with precise voice pickup',
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Silver', hex: '#C0C0C0' },
    ],
  },
  {
    asin: 'B0C6BTB32P',
    title: 'Kindle Paperwhite (16 GB) – Now with a 6.8" display',
    description: 'The thinnest, lightest Kindle Paperwhite ever—with a flush-front design and 300 ppi glare-free display.',
    category: 'Electronics',
    subcategory: 'E-readers',
    brand: 'Amazon',
    image: 'https://images.unsplash.com/photo-1592533934736-5d3aed82c3c1?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1592533934736-5d3aed82c3c1?w=500&q=80'],
    price: 139.99,
    originalPrice: 159.99,
    rating: 4.7,
    reviewCount: 74813,
    inStock: true,
    isPrime: true,
    badge: "Amazon's Choice",
    features: [
      '6.8" display with adjustable warm light',
      '10 weeks of battery life',
      'Waterproof (IPX8)',
      'Faster page turns',
      '16 GB storage for thousands of books',
    ],
    colors: [
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Denim', hex: '#6A8EAE' },
      { name: 'Agave Green', hex: '#5D8A6F' },
      { name: 'Rose', hex: '#D4867C' },
    ],
  },
  {
    asin: 'B09JQKBQSB',
    title: 'ASUS ROG Zephyrus G14 Gaming Laptop AMD Ryzen 9',
    description: 'The ROG Zephyrus G14 packs AMD Ryzen 9 and NVIDIA GeForce RTX 3060 in a super-compact 14" chassis.',
    category: 'Electronics',
    subcategory: 'Laptops',
    brand: 'ASUS',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&q=80'],
    price: 1299.99,
    originalPrice: 1499.99,
    rating: 4.6,
    reviewCount: 18421,
    inStock: true,
    isPrime: true,
    features: [
      'AMD Ryzen 9 5900HS processor',
      'NVIDIA GeForce RTX 3060 6GB GDDR6',
      '14" WQHD 120Hz display',
      '16GB DDR4, 1TB PCIe SSD',
      'Up to 10 hours battery life',
    ],
  },

  // ── Books ──
  {
    asin: '0593517369',
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits by James Clear',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day.',
    category: 'Books',
    subcategory: 'Self-Help',
    brand: 'Avery',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80'],
    price: 14.99,
    originalPrice: 27.00,
    rating: 4.8,
    reviewCount: 134782,
    inStock: true,
    isPrime: true,
    badge: '#1 Best Seller',
    features: [
      'Over 15 million copies sold worldwide',
      'NY Times bestseller for 170+ weeks',
      'Proven framework to break bad habits',
      'Small changes with remarkable results',
    ],
  },
  {
    asin: '0525559477',
    title: 'The 48 Laws of Power by Robert Greene',
    description: 'A brilliant examination of the 48 Laws of Power throughout history.',
    category: 'Books',
    subcategory: 'Business',
    brand: 'Penguin Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80'],
    price: 19.99,
    originalPrice: 30.00,
    rating: 4.7,
    reviewCount: 87324,
    inStock: true,
    isPrime: true,
    features: [
      'Over 1.2 million copies sold',
      '28 years in print',
      'Amoral, cunning, ruthless, and instructive',
    ],
  },
  {
    asin: '1250301696',
    title: 'The Psychology of Money: Timeless Lessons on Wealth by Morgan Housel',
    description: 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave.',
    category: 'Books',
    subcategory: 'Finance',
    brand: 'Harriman House',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80'],
    price: 13.99,
    originalPrice: 19.99,
    rating: 4.7,
    reviewCount: 64831,
    inStock: true,
    isPrime: true,
    badge: "Amazon's Choice",
    features: [
      '19 short stories on wealth, greed, and happiness',
      'International bestseller',
      'Timeless financial wisdom',
    ],
  },

  // ── Kitchen ──
  {
    asin: 'B00FLYWNYQ',
    title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Qt',
    description: 'The Instant Pot Duo is the #1 best-selling Instant Pot model. A pressure cooker, slow cooker, rice cooker and more.',
    category: 'Kitchen',
    subcategory: 'Appliances',
    brand: 'Instant Pot',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&q=80'],
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.7,
    reviewCount: 184371,
    inStock: true,
    isPrime: true,
    badge: '#1 Best Seller',
    features: [
      '7-in-1 multi-use: pressure cooker, slow cooker, rice cooker',
      'Cooks up to 70% faster than traditional methods',
      '6-quart capacity serves 4-6 people',
      '14 smart programs',
      'UL certified with 10 proven safety mechanisms',
    ],
  },
  {
    asin: 'B01IRAFGS4',
    title: 'Ninja BL610 Professional 72 Oz Countertop Blender',
    description: 'The Ninja Professional Blender 1000 has Total Crushing Technology that pulverizes ice, whole fruits, and vegetables in seconds.',
    category: 'Kitchen',
    subcategory: 'Appliances',
    brand: 'Ninja',
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&q=80'],
    price: 69.99,
    originalPrice: 89.99,
    rating: 4.6,
    reviewCount: 47829,
    inStock: true,
    isPrime: true,
    features: [
      '1000-watt motor base',
      '72-oz Total Crushing Pitcher',
      'Dishwasher-safe parts',
      'Crush ice in seconds',
    ],
  },
  {
    asin: 'B0832KXZFQ',
    title: 'Cuisinart 11-Cup Food Processor, Elemental Series',
    description: 'The Cuisinart Elemental food processor has an updated sleek design. Slice, shred, chop and puree with ease.',
    category: 'Kitchen',
    subcategory: 'Appliances',
    brand: 'Cuisinart',
    image: 'https://images.unsplash.com/photo-1617380797004-a11ea3e0ad5b?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1617380797004-a11ea3e0ad5b?w=500&q=80'],
    price: 149.95,
    originalPrice: 199.95,
    rating: 4.5,
    reviewCount: 23847,
    inStock: true,
    isPrime: true,
    features: [
      '11-cup work bowl',
      'Reversible slicing/shredding disc',
      'Dishwasher-safe parts',
      'SealTight advantage system',
    ],
    colors: [
      { name: 'Stainless Steel', hex: '#C0C0C0' },
      { name: 'Black', hex: '#111111' },
    ],
  },
  {
    asin: 'B073K14QMC',
    title: 'COSORI Air Fryer 5.8QT Large Capacity',
    description: 'The COSORI air fryer can make your favorite food 85% less oil than deep frying with its 360° rapid air circulation.',
    category: 'Kitchen',
    subcategory: 'Appliances',
    brand: 'COSORI',
    image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=500&q=80'],
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.7,
    reviewCount: 71243,
    inStock: true,
    isPrime: true,
    badge: "Amazon's Choice",
    features: [
      '5.8-quart capacity feeds 2-5 people',
      '13 one-touch cooking functions',
      'Dishwasher-safe square basket',
      'Includes 30 recipes',
      'Auto-shutoff and shake reminder',
    ],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'White', hex: '#FFFFFF' },
    ],
  },
  {
    asin: 'B00NHQE0VO',
    title: 'Lodge 12 Inch Cast Iron Skillet. Pre-Seasoned',
    description: 'Lodge cast iron cookware is cast in sand molds, sprayed with a soy-based vegetable oil, and seasoned in a large commercial oven.',
    category: 'Kitchen',
    subcategory: 'Cookware',
    brand: 'Lodge',
    image: 'https://images.unsplash.com/photo-1620236378264-a7a09c5ca54f?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1620236378264-a7a09c5ca54f?w=500&q=80'],
    price: 29.90,
    originalPrice: 42.00,
    rating: 4.8,
    reviewCount: 245831,
    inStock: true,
    isPrime: true,
    badge: '#1 Best Seller',
    features: [
      'Pre-seasoned with natural vegetable oil',
      'Use on all cooking surfaces, grills and campfires',
      'Oven safe to 500°F',
      'Unparalleled heat retention and even heating',
      'Made in the USA',
    ],
  },

  // ── Fashion ──
  {
    asin: 'B07NRLHB6T',
    title: "Levi's Men's 511 Slim Fit Jeans",
    description: 'The 511 slim fit jeans sit below the waist and are slim through the thigh and leg.',
    category: 'Fashion',
    subcategory: 'Mens',
    brand: "Levi's",
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80'],
    price: 59.50,
    originalPrice: 69.50,
    rating: 4.5,
    reviewCount: 54182,
    inStock: true,
    isPrime: true,
    features: [
      'Slim fit sits below the waist',
      '99% Cotton, 1% Elastane',
      'Machine wash cold',
      'Original riveted, classic 5 pocket styling',
    ],
    colors: [
      { name: 'Dark Blue', hex: '#003087' },
      { name: 'Black', hex: '#000000' },
      { name: 'Light Blue', hex: '#4FC3F7' },
    ],
    sizes: ['28x30', '30x30', '30x32', '32x30', '32x32', '34x30', '34x32', '36x30'],
  },
  {
    asin: 'B08GWRCFGT',
    title: "Nike Men's Air Force 1 '07 Shoes",
    description: 'The radiance lives on in the Nike Air Force 1 \'07, a modern take on the icon that blends classic style with the comfort of Nike Air.',
    category: 'Fashion',
    subcategory: 'Shoes',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'],
    price: 110.00,
    rating: 4.7,
    reviewCount: 31274,
    inStock: true,
    isPrime: true,
    badge: '#1 Best Seller',
    features: [
      'Nike Air cushioning for all-day comfort',
      'Low-cut design for a sleek look',
      'Non-marking rubber sole',
      'Perforated toe box',
    ],
    colors: [
      { name: 'White/White', hex: '#FFFFFF' },
      { name: 'Black/Black', hex: '#000000' },
      { name: 'White/Red', hex: '#FF0000' },
    ],
    sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  },
  {
    asin: 'B085DPVPQH',
    title: "Columbia Women's Benton Springs Full Zip Fleece Jacket",
    description: 'The Columbia Benton Springs Full Zip is a classic fleece jacket for women. Made with a plush anti-pilling fleece fabric.',
    category: 'Fashion',
    subcategory: 'Womens',
    brand: 'Columbia',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&q=80'],
    price: 49.99,
    originalPrice: 65.00,
    rating: 4.6,
    reviewCount: 37841,
    inStock: true,
    isPrime: true,
    features: [
      '100% Polyester fleece',
      'Cadet collar with full zipper closure',
      'Two zippered hand pockets',
      'Classic relaxed fit',
    ],
    colors: [
      { name: 'Dark Nocturnal', hex: '#1A1F36' },
      { name: 'Dusty Green', hex: '#8FA485' },
      { name: 'Berry Pink', hex: '#C8556A' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },

  // ── Toys ──
  {
    asin: 'B07P3QXVMB',
    title: 'LEGO Technic Bugatti Chiron 42083 Building Kit',
    description: 'Discover your inner engineer and challenge yourself with the advanced LEGO Technic Bugatti Chiron building set.',
    category: 'Toys',
    subcategory: 'LEGO',
    brand: 'LEGO',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80'],
    price: 369.99,
    originalPrice: 449.99,
    rating: 4.9,
    reviewCount: 24721,
    inStock: true,
    isPrime: true,
    badge: "Amazon's Choice",
    features: [
      '3,599 pieces for advanced builders',
      '1:8 scale iconic blue-black design',
      'Authentic W16 engine with moving pistons',
      'Openable doors, hood and trunk',
      'Rubber tires and detailed interior',
    ],
  },
  {
    asin: 'B09PKTVQ5S',
    title: 'Hot Wheels 20-Car Gift Pack',
    description: '20 Hot Wheels cars in a single gift pack. Styles may vary. Perfect for ages 3+.',
    category: 'Toys',
    subcategory: 'Cars',
    brand: 'Hot Wheels',
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500&q=80'],
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.8,
    reviewCount: 47823,
    inStock: true,
    isPrime: true,
    badge: '#1 Best Seller',
    features: [
      '20 die-cast Hot Wheels cars',
      '1:64 scale vehicles',
      'Great for kids ages 3 and up',
      'Styles and colors may vary',
    ],
  },
  {
    asin: 'B07RHXBN9B',
    title: 'Monopoly Game: Classic Edition Board Game',
    description: 'Here\'s the Monopoly game with a modern take on the classic Monopoly gameplay. Buy, sell and trade properties.',
    category: 'Toys',
    subcategory: 'Board Games',
    brand: 'Hasbro',
    image: 'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=500&q=80'],
    price: 19.99,
    originalPrice: 29.99,
    rating: 4.7,
    reviewCount: 83741,
    inStock: true,
    isPrime: true,
    features: [
      'Classic Monopoly gameplay for 2-6 players',
      'Includes gameboard, 8 tokens, property cards',
      'Ages 8 and up',
      '60-180 minute play time',
    ],
  },

  // ── Sports ──
  {
    asin: 'B00NHKWP0A',
    title: 'Manduka PRO Yoga Mat 71" 6mm Premium',
    description: 'The Manduka PRO yoga mat is the highest quality yoga mat on the market - built for a lifetime of practice.',
    category: 'Sports',
    subcategory: 'Yoga',
    brand: 'Manduka',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80'],
    price: 88.00,
    originalPrice: 120.00,
    rating: 4.7,
    reviewCount: 28451,
    inStock: true,
    isPrime: true,
    badge: "Amazon's Choice",
    features: [
      '6mm dense cushioning protects joints',
      'Closed-cell surface prevents moisture absorption',
      'Lifetime guarantee',
      '71" long, 24" wide, 6mm thick',
      'Eco-friendly materials',
    ],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Midnight Blue', hex: '#191970' },
      { name: 'Sage Green', hex: '#5F9EA0' },
    ],
  },
  {
    asin: 'B07X19CNCR',
    title: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair)',
    description: 'Adjust from 5 to 52.5 lbs in 2.5 lb increments up to the first 25 lbs! Replaces 15 sets of weights.',
    category: 'Sports',
    subcategory: 'Weights',
    brand: 'Bowflex',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&q=80'],
    price: 429.00,
    originalPrice: 549.00,
    rating: 4.8,
    reviewCount: 39872,
    inStock: true,
    isPrime: true,
    badge: '#1 Best Seller',
    features: [
      'Replaces 15 sets of weights (5-52.5 lbs)',
      'Dial system for quick weight changes',
      'Space-saving design',
      'Includes 2 adjustable dumbbells',
    ],
  },
  {
    asin: 'B01LZ0USNO',
    title: 'Resistance Bands Set - 5 Levels Heavy Duty Exercise Bands',
    description: 'This set of 5 resistance bands has a wide range of resistance levels for different exercises.',
    category: 'Sports',
    subcategory: 'Fitness',
    brand: 'Fit Simplify',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80'],
    price: 16.98,
    originalPrice: 25.99,
    rating: 4.6,
    reviewCount: 87234,
    inStock: true,
    isPrime: true,
    badge: "Amazon's Choice",
    features: [
      'Set of 5 bands: extra light to extra heavy',
      '100% natural latex',
      'Great for stretching, strength training',
      'Includes carry bag and guide',
    ],
  },

  // ── Home & Garden ──
  {
    asin: 'B07ZCMHKB5',
    title: 'AmazonBasics Microfiber Cleaning Cloth - 24-Pack',
    description: 'Non-scratching, lint-free microfiber cloths for cleaning glass, auto, home and more.',
    category: 'Home',
    subcategory: 'Cleaning',
    brand: 'Amazon Basics',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80'],
    price: 16.59,
    originalPrice: 22.99,
    rating: 4.6,
    reviewCount: 124731,
    inStock: true,
    isPrime: true,
    badge: "Amazon's Choice",
    features: [
      '24-pack of assorted microfiber cloths',
      'Ultra-soft, lint-free',
      'Machine washable up to 100 times',
      'Multiple sizes included',
    ],
  },
  {
    asin: 'B00L7BNICG',
    title: 'Philips Hue White and Color Ambiance A19 LED Bulb 4-Pack',
    description: 'The Philips Hue White and Color Ambiance A19 Starter Kit includes 4 color LED bulbs and smart bridge.',
    category: 'Home',
    subcategory: 'Smart Home',
    brand: 'Philips Hue',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80'],
    price: 179.99,
    originalPrice: 199.99,
    rating: 4.6,
    reviewCount: 43871,
    inStock: true,
    isPrime: true,
    features: [
      '16 million colors and shades of white light',
      'Works with Alexa, Google Assistant, Apple HomeKit',
      'Automate your lights with schedules and routines',
      '25,000 hours lifespan',
    ],
  },
  {
    asin: 'B07YLPH4GZ',
    title: 'LEVOIT Air Purifier for Home Bedroom, H13 HEPA Filter',
    description: 'The LEVOIT Core 300 true HEPA air purifier captures 99.97% of airborne particles 0.3 microns in size.',
    category: 'Home',
    subcategory: 'Air Quality',
    brand: 'LEVOIT',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&q=80'],
    price: 99.99,
    originalPrice: 129.99,
    rating: 4.7,
    reviewCount: 96241,
    inStock: true,
    isPrime: true,
    badge: "Amazon's Choice",
    features: [
      'H13 True HEPA filter removes 99.97% of particles',
      'Ultra-quiet at 24dB, night mode',
      'Covers 219 sq ft in 12 minutes',
      '3 fan speeds',
      'Auto mode with PM2.5 sensor',
    ],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#111111' },
    ],
  },
  {
    asin: 'B08C1W5N87',
    title: 'Casper Sleep Element Mattress, Queen',
    description: 'The Casper Element is designed for quality sleep. Supportive foam layers and breathable cover.',
    category: 'Home',
    subcategory: 'Bedding',
    brand: 'Casper Sleep',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80'],
    price: 695.00,
    originalPrice: 895.00,
    rating: 4.5,
    reviewCount: 18341,
    inStock: true,
    isPrime: true,
    features: [
      'AirScape® perforated foam layer for cooling',
      'Supportive base foam layer',
      'Breathable, durable cover',
      '100-night free trial',
      '10-year limited warranty',
    ],
    sizes: ['Twin', 'Full', 'Queen', 'King', 'California King'],
  },
];
