
import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase-config';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const all = searchParams.get('all') === 'true';

    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      try {
        const supabase = await getAuthenticatedSupabaseClient();

        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!all) {
          query = query.eq('available', true);
        }

        if (category && category !== 'All') {
          query = query.eq('category', category);
        }

        if (brand && brand !== 'All') {
          query = query.eq('brand', brand);
        }

        if (search) {
          query = query.or(
            `name.ilike.%${search}%,description.ilike.%${search}%`
          );
        }

        const { data, error } = await query;

        if (!error && data) {
          return NextResponse.json({
            success: true,
            products: data,
            source: 'supabase',
          });
        }
      } catch {
        // Return an empty list below if the database query fails.
      }
    }

    return NextResponse.json({
      success: true,
      products: [],
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to fetch products.';

    return NextResponse.json(
      {
        success: false,
        error: message,
        products: [],
      },
      { status: 500 }
    );
  }
}

// POST endpoint for adding a product.
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      brand,
      description,
      price,
      image_url,
      category,
      unit,
      available,
      stock_quantity,
      price_per_litre,
    } = body;

    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product name cannot be empty.',
        },
        { status: 400 }
      );
    }

    const numPrice = Number(price);

    if (
      price === '' ||
      price === null ||
      price === undefined ||
      !Number.isFinite(numPrice) ||
      numPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product price must be a valid non-negative number.',
        },
        { status: 400 }
      );
    }

    let parsedLitrePrice: number | null = null;

    if (
      price_per_litre !== undefined &&
      price_per_litre !== null &&
      price_per_litre !== ''
    ) {
      parsedLitrePrice = Number(price_per_litre);

      if (
        !Number.isFinite(parsedLitrePrice) ||
        parsedLitrePrice < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Litre price must be a valid non-negative number.',
          },
          { status: 400 }
        );
      }
    }

    let parsedStock = 100;

    if (
      stock_quantity !== undefined &&
      stock_quantity !== null &&
      stock_quantity !== ''
    ) {
      parsedStock = Number.parseInt(String(stock_quantity), 10);

      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Stock quantity cannot be negative.',
          },
          { status: 400 }
        );
      }
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase is not configured. Please check your credentials.',
        },
        { status: 503 }
      );
    }

    const supabase = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: name.trim(),
          brand: brand || 'Arogya',
          description:
            typeof description === 'string' ? description.trim() : '',
          price: numPrice,
          price_per_litre: parsedLitrePrice,
          image_url:
            typeof image_url === 'string' && image_url.trim()
              ? image_url.trim()
              : 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80',
          category: category || 'Milk',
          unit: unit || '500ml',
          available: available !== undefined ? available : true,
          stock_quantity: parsedStock,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to create product.';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
