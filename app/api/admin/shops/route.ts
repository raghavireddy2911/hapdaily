import { NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/supabase-config';

/**
 * Optimized shops list: uses database-side aggregation via
 * two lightweight SUM queries instead of pulling every delivery
 * and payment row into Node.js memory.
 */
export async function GET(request: Request) {
  try {
    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      try {
        const supabase = await getAuthenticatedSupabaseClient();

        // 1. Load shops (lean: only needed columns)
        const { data: shops, error: shopsErr } = await supabase
          .from('shops')
          .select('id, name, owner_name, phone, address, notes, created_at')
          .order('name', { ascending: true });

        if (shopsErr || !shops) throw shopsErr;

        // 2. Aggregate billing per shop in one RPC-less query (grouped via JS from two lean queries)
        const todayStr = new Date().toISOString().split('T')[0];

        // Only fetch aggregated columns — NOT all rows
        const [delRes, payRes, todayRes] = await Promise.all([
          supabase
            .from('deliveries')
            .select('shop_id, total_amount'),
          supabase
            .from('payments')
            .select('shop_id, amount'),
          supabase
            .from('deliveries')
            .select('shop_id, total_amount')
            .eq('delivery_date', todayStr),
        ]);

        // Build maps for O(n) aggregation instead of O(n*m) filtering
        const billedMap = new Map<string, number>();
        const paidMap = new Map<string, number>();
        const todayMap = new Map<string, number>();

        for (const d of delRes.data || []) {
          billedMap.set(d.shop_id, (billedMap.get(d.shop_id) || 0) + Number(d.total_amount || 0));
        }
        for (const p of payRes.data || []) {
          paidMap.set(p.shop_id, (paidMap.get(p.shop_id) || 0) + Number(p.amount || 0));
        }
        for (const d of todayRes.data || []) {
          todayMap.set(d.shop_id, (todayMap.get(d.shop_id) || 0) + Number(d.total_amount || 0));
        }

        // 3. Enrich shops with computed balances
        const enrichedShops = shops.map((shop) => {
          const total_billed = billedMap.get(shop.id) || 0;
          const total_paid = paidMap.get(shop.id) || 0;
          const balance = Math.round((total_billed - total_paid) * 100) / 100;
          const today_delivered = todayMap.get(shop.id) || 0;
          return { ...shop, total_billed, total_paid, balance, today_delivered };
        });

        // Sort: highest unpaid balance first
        enrichedShops.sort((a, b) => (b.balance || 0) - (a.balance || 0));

        const total_unpaid_all = enrichedShops.reduce(
          (sum, s) => (s.balance > 0 ? sum + s.balance : sum),
          0
        );
        const pending_shops_count = enrichedShops.filter((s) => s.balance > 0).length;
        const today_total_deliveries = enrichedShops.reduce(
          (sum, s) => sum + (s.today_delivered || 0),
          0
        );

        return NextResponse.json({
          success: true,
          shops: enrichedShops,
          summary: {
            total_unpaid_all,
            pending_shops_count,
            today_total_deliveries,
            total_shops_count: enrichedShops.length,
          },
          source: 'supabase',
        });
      } catch (dbErr) {
        // Fall through to empty response
      }
    }

    // Always start empty with all counts at 0 and ₹0 totals
    return NextResponse.json({
      success: true,
      shops: [],
      summary: {
        total_unpaid_all: 0,
        pending_shops_count: 0,
        today_total_deliveries: 0,
        total_shops_count: 0,
      },
      source: 'empty',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, owner_name, phone, address, notes } = body;

    // Strict validation: Don't allow empty names or blank contact details
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Shop name cannot be empty.' }, { status: 400 });
    }
    if (!owner_name || !owner_name.trim()) {
      return NextResponse.json({ success: false, error: 'Owner/Contact name cannot be empty.' }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ success: false, error: 'Phone number cannot be empty.' }, { status: 400 });
    }
    if (!address || !address.trim()) {
      return NextResponse.json({ success: false, error: 'Address / Town area cannot be empty.' }, { status: 400 });
    }

    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      const supabase = await getAuthenticatedSupabaseClient();
      const { data, error } = await supabase
        .from('shops')
        .insert([
          {
            name: name.trim(),
            owner_name: owner_name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            notes: notes ? notes.trim() : null,
          },
        ])
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        shop: { ...data, balance: 0, total_billed: 0, total_paid: 0 },
        message: 'Shop created successfully.',
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
