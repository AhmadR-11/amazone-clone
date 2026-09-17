import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/lib/models/Product';

export const dynamic = 'force-dynamic';

const seedProductsData = [
  {
    title: 'Bezente Assorted Latex Rainbow Balloons 100 Pack 12 inch',
    category: 'Toys & Games',
    subcategory: 'Party Supplies > Decorations > Balloons',
    pricePKR: 1937.45,
    originalPricePKR: 2491.80,
    priceUSD: 8.59,
    rating: 4.6,
    reviewsCount: 14367,
    badge: "Amazon's Choice",
    isChoice: true,
    sustainabilityFeature: '1 sustainability feature',
    boughtInPastMonth: '10K+ bought in past month',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=300&q=80'
    ],
    colors: [
      { name: '01-assorted-g01', code: '#ff4081', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=300&q=80', pricePKR: 1937.45 },
      { name: 'Pastel Dreams', code: '#b388ff', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80', pricePKR: 2214.63 },
      { name: 'Metallic Chrome', code: '#ffd700', image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=300&q=80', pricePKR: 2491.80 }
    ],
    sizes: ['5inch (Small)', '12inch (Normal)', '18inch (Large)', '36inch (Giant)'],
    details: {
      'Occasion': 'Birthday, Baby Shower, Wedding Party',
      'Color': '01-assorted-g01',
      'Included Components': 'Curling Ribbon',
      'Material': 'Natural Latex Rubber',
      'Unit Count': '100 Count'
    },
    aboutBulletPoints: [
      '【Rainbow Themed Party】 - Assorted balloons can be used in rainbow themed party or mix with any color to create a vibrant party atmosphere.',
      '【Premium Quality Latex】 - Made of 100% eco-friendly natural latex, 3.2g weight per balloon, durable and 20% thicker than ordinary latex balloons.',
      '【Easy to Inflate】 - Supports both air and helium inflation. Long lasting seal prevents leakage during celebrations.',
      '【Safe & Non-Toxic】 - Passed rigorous CPSIA and ASTM safety standards, child-friendly for indoor and outdoor decorations.'
    ],
    seller: 'Bezente Direct',
    shipsFrom: 'Amazon',
    description: 'Bright Color Balloons for Birthday Bridal Shower Wedding Party Decorations'
  },
  {
    title: 'Bicycle Standard Playing Cards 2-Deck Pack (Red & Blue)',
    category: 'Toys & Games',
    subcategory: 'Games & Puzzles > Card Games',
    pricePKR: 1450.00,
    priceUSD: 5.99,
    rating: 4.8,
    reviewsCount: 38920,
    badge: 'Best Seller',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=300&q=80'
    ],
    details: {
      'Brand': 'Bicycle',
      'Material': 'Paper Cardstock',
      'Number of Players': '2+'
    },
    aboutBulletPoints: [
      'Classic Air Cushion Finish for ease of shuffling and optimum performance.',
      'Made in USA with 100% recyclable paper.'
    ],
    seller: 'Bicycle Official Store',
    shipsFrom: 'Amazon',
    description: 'World renowned playing cards featuring iconic Rider Back design.'
  },
  {
    title: 'Owala FreeSip Insulated Stainless Steel Water Bottle 24 oz',
    category: 'Kitchen',
    subcategory: 'Dining > Drinkware > Water Bottles',
    pricePKR: 8500.00,
    priceUSD: 32.99,
    rating: 4.9,
    reviewsCount: 52100,
    badge: 'Top Pick',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=300&q=80'
    ],
    details: {
      'Capacity': '24 Fluid Ounces',
      'Color': 'Shy Marshmallow',
      'Material': 'Stainless Steel'
    },
    aboutBulletPoints: [
      'Patented FreeSip spout designed for sipping upright through built-in straw or tilting back to swig.',
      'Triple-layer vacuum insulated keeps drinks cold for up to 24 hours.'
    ],
    seller: 'Owala Official',
    shipsFrom: 'Amazon',
    description: 'Innovative dual-drinking insulated bottle for active lifestyles.'
  },
  {
    title: 'Lenovo IdeaTab 11" 2.5K Tablet + Folio Case & Pen Bundle',
    category: 'Electronics',
    subcategory: 'Computers & Tablets',
    pricePKR: 68500.00,
    priceUSD: 249.00,
    rating: 4.7,
    reviewsCount: 8430,
    badge: 'Deal of the Day',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=300&q=80'
    ],
    details: {
      'Screen Size': '11 Inches 2.5K',
      'RAM': '8 GB',
      'Storage': '128 GB SSD'
    },
    aboutBulletPoints: [
      'Vibrant 2.5K IPS Display with Dolby Atmos quad speakers.',
      'Includes Lenovo Precision Pen for drawing and note taking.'
    ],
    seller: 'Lenovo Store',
    shipsFrom: 'Amazon',
    description: 'Powerful Android tablet bundled with active stylus pen and magnetic stand case.'
  }
];

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let count = await Product.countDocuments();
    if (count === 0) {
      console.log('Seeding initial Amazon product database...');
      await Product.insertMany(seedProductsData);
    }

    let filter: any = {};
    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(category, 'i') };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: error.message || 'Error fetching products' }, { status: 500 });
  }
}
