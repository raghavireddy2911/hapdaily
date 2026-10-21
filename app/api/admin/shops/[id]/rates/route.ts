import { NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/supabase-config';
import { mockShopRates } from '@/lib/shops-mock';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      try {
        const supabase = await getAuthenticatedSupabaseClient();
        const { data: rates, error } = await supabase
          .from('shop_rates')
          .select('*')
          .eq('shop_id', id);

        if (!error && rates) {
          return NextResponse.json({ success: true, rates, source: 'supabase' });
        }
      } catch (dbErr) {
        // Fallback
      }
    }

    const rates = mockShopRates.filter((r) => r.shop_id === id);
    return NextResponse.json({ success: true, rates, source: 'mock' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shop_id } = await params;
    const body = await request.json();
    const { rates } = body; // Array of { product_id: string, rate: number | null }

    if (!Array.isArray(rates)) {
      return NextResponse.json({ success: false, error: 'Rates array is required.' }, { status: 400 });
    }

    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      try {
        const supabase = await getAuthenticatedSupabaseClient();

        for (const item of rates) {
          const numRate = parseFloat(item.rate);
          if (isNaN(numRate) || numRate <= 0) {
            // Delete custom rate so it falls back to standard catalog price
            await supabase
              .from('shop_rates')
              .delete()
              .eq('shop_id', shop_id)
              .eq('product_id', item.product_id);
          } else {
            // Upsert rate
            await supabase.from('shop_rates').upsert(
              {
                shop_id,
                product_id: item.product_id,
                rate: numRate,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'shop_id,product_id' }
            );
          }
        }

        const { data: updatedRates } = await supabase
          .from('shop_rates')
          .select('*')
          .eq('shop_id', shop_id);

        return NextResponse.json({ success: true, rates: updatedRates || [] });
      } catch (dbErr) {
        // Fallback
      }
    }

    // In-memory mock
    for (const item of rates) {
      const numRate = parseFloat(item.rate);
      const idx = mockShopRates.findIndex(
        (r) => r.shop_id === shop_id && r.product_id === item.product_id
      );

      if (isNaN(numRate) || numRate <= 0) {
        if (idx !== -1) mockShopRates.splice(idx, 1);
      } else {
        if (idx !== -1) {
          mockShopRates[idx].rate = numRate;
        } else {
          mockShopRates.push({ shop_id, product_id: item.product_id, rate: numRate });
        }
      }
    }

    const currentRates = mockShopRates.filter((r) => r.shop_id === shop_id);
    return NextResponse.json({ success: true, rates: currentRates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

