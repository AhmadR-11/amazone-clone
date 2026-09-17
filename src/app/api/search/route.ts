import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, getAllCategories, SEED_PRODUCTS } from '@/lib/products';
import { cacheGetJSON, cacheSetJSON } from '@/lib/cache';

// GET /api/search?q=headphones&category=Electronics&limit=5
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const category = searchParams.get('category') || undefined;
    const limit = Math.min(10, parseInt(searchParams.get('limit') || '5'));

    if (!q || q.length < 1) {
      // Return popular searches
      const popular = SEED_PRODUCTS
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 8)
        .map((p) => ({ asin: p.asin, title: p.title, category: p.category, image: p.image }));
      return NextResponse.json({ suggestions: popular, categories: getAllCategories() });
    }

    const cacheKey = `search:${q}:${category}:${limit}`;
    const cached = await cacheGetJSON<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    const products = await searchProducts(q, category, 1);
    const suggestions = products.slice(0, limit).map((p) => ({
      asin: p.asin,
      title: p.title,
      category: p.category,
      image: p.image,
      price: p.price,
    }));

    const payload = { suggestions, categories: getAllCategories(), query: q };
    await cacheSetJSON(cacheKey, payload, 300); // 5min

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
