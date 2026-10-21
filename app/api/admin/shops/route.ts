import { NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/supabase-config';

// Helper to calculate shop financial balances
function computeShopStats(shops: any[], deliveries: any[], payments: any[]) {
  const todayStr = new Date().toISOString().split('T')[0];

  const enrichedShops = shops.map((shop) => {
    const shopDeliveries = deliveries.filter((d) => d.shop_id === shop.id);
    const shopPayments = payments.filter((p) => p.shop_id === shop.id);

    const total_billed = shopDeliveries.reduce((sum, d) => sum + Number(d.total_amount || 0), 0);
    const total_paid = shopPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const balance = Math.round((total_billed - total_paid) * 100) / 100;

    const today_delivered = shopDeliveries
      .filter((d) => (d.delivery_date || '').startsWith(todayStr))
      .reduce((sum, d) => sum + Number(d.total_amount || 0), 0);

    return {
      ...shop,
      total_billed,
      total_paid,
      balance,
      today_delivered,
    };
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

  return {
    shops: enrichedShops,
    summary: {
      total_unpaid_all,
      pending_shops_count,
      today_total_deliveries,
      total_shops_count: enrichedShops.length,
    },
  };
}

export async function GET(request: Request) {
  try {
    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      try {
        const supabase = await getAuthenticatedSupabaseClient();
        const { data: shops, error: shopsErr } = await supabase
          .from('shops')
          .select('*')
          .order('name', { ascending: true });

        if (!shopsErr && shops) {
          const { data: deliveries } = await supabase.from('deliveries').select('shop_id, total_amount, delivery_date');
          const { data: payments } = await supabase.from('payments').select('shop_id, amount, payment_date');

          const result = computeShopStats(shops, deliveries || [], payments || []);
          return NextResponse.json({ success: true, ...result, source: 'supabase' });
        }
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
