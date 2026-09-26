export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, getAllCategories } from '@/lib/products';
import { cacheGetJSON, cacheSetJSON } from '@/lib/cache';

// GET /api/products?page=1&limit=20&category=Electronics&sort=rating&minPrice=0&maxPrice=1000&minRating=4&q=headphones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(40, parseInt(searchParams.get('limit') || '20'));
    const category = searchParams.get('category') || undefined;
    const sort = searchParams.get('sort') || 'featured';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;

    const cacheKey = `products:${page}:${limit}:${category}:${sort}:${minPrice}:${maxPrice}:${minRating}`;
    const cached = await cacheGetJSON<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    const result = await getAllProducts(page, limit, { category, sort, minPrice, maxPrice, minRating });
    const categories = getAllCategories();

    const payload = { ...result, categories, page, limit };
    await cacheSetJSON(cacheKey, payload, 300); // 5min cache

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
