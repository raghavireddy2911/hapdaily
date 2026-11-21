import { NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/supabase-config';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      const supabase = await getAuthenticatedSupabaseClient();
      let query = supabase
        .from('deliveries')
        .select('*, delivery_items(*)')
        .eq('shop_id', id)
        .order('delivery_date', { ascending: false });

      if (from) query = query.gte('delivery_date', from);
      if (to) query = query.lte('delivery_date', to);

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (!error) {
        const formatted = (data || []).map((d) => ({
          ...d,
          items: d.delivery_items || [],
        }));
        return NextResponse.json({
          success: true,
          deliveries: formatted,
          hasMore: formatted.length === limit,
          source: 'supabase',
        });
      }
    }

    return NextResponse.json({ success: true, deliveries: [], source: 'empty' });
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
    const { delivery_date, notes, items } = body;

    if (!delivery_date || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Delivery date and at least one product item are required.' },
        { status: 400 }
      );
    }

    // Compute line totals and grand total securely on server
    const processedItems = items
      .filter((it: any) => Number(it.quantity) > 0)
      .map((it: any) => {
        const qty = parseInt(it.quantity, 10);
        const rate = parseFloat(it.rate);
        const line_total = Math.round(qty * rate * 100) / 100;
        return {
          product_id: it.product_id || null,
          product_name: it.product_name,
          product_unit: it.product_unit || '500ml',
          quantity: qty,
          rate,
          line_total,
        };
      });

    if (processedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product quantities must be greater than zero.' },
        { status: 400 }
      );
    }

    const total_amount = processedItems.reduce((sum, it) => sum + it.line_total, 0);

    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      const supabase = await getAuthenticatedSupabaseClient();

      // 1. Insert into deliveries
      const { data: delivery, error: delErr } = await supabase
        .from('deliveries')
        .insert([
          {
            shop_id,
            delivery_date,
            total_amount,
            notes: notes ? notes.trim() : null,
          },
        ])
        .select()
        .single();

      if (delErr || !delivery) {
        throw new Error(delErr?.message || 'Failed to insert delivery');
      }

      // 2. Insert delivery_items
      const itemsToInsert = processedItems.map((it) => ({
        delivery_id: delivery.id,
        product_id: it.product_id,
        product_name: it.product_name,
        product_unit: it.product_unit,
        quantity: it.quantity,
        rate: it.rate,
        line_total: it.line_total,
      }));

      const { data: insertedItems, error: itemsErr } = await supabase
        .from('delivery_items')
        .insert(itemsToInsert)
        .select();

      if (itemsErr) {
        console.error('Error inserting delivery items:', itemsErr);
      }

      return NextResponse.json({
        success: true,
        delivery: {
          ...delivery,
          items: insertedItems || processedItems,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Supabase is not configured.' },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

