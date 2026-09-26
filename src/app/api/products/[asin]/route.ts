export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getProduct, getRelatedProducts } from '@/lib/products';
import { getUserSessionFromCookies } from '@/lib/auth';
import { cacheGetJSON, cacheSetJSON } from '@/lib/cache';

// GET /api/products/[asin]
export async function GET(
  request: NextRequest,
  { params }: { params: { asin: string } }
) {
  try {
    const { asin } = params;

    const cacheKey = `product:${asin}`;
    const cached = await cacheGetJSON<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    const product = await getProduct(asin);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const related = await getRelatedProducts(asin, product.category);

    const payload = { product, related };
    await cacheSetJSON(cacheKey, payload, 600); // 10min cache

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Product detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
