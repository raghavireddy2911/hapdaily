import { NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/supabase-config';

export async function GET() {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      try {
        const supabase = await getAuthenticatedSupabaseClient();
        const { data: deliveries, error } = await supabase
          .from('deliveries')
          .select('*, shops(name, owner_name, phone, address), delivery_items(*)')
          .eq('delivery_date', todayStr)
          .order('created_at', { ascending: false });

        if (!error && deliveries) {
          const formatted = deliveries.map((d: any) => ({
            id: d.id,
            shop_id: d.shop_id,
            shop_name: d.shops?.name || 'Shop',
            owner_name: d.shops?.owner_name || '',
            phone: d.shops?.phone || '',
            address: d.shops?.address || '',
            delivery_date: d.delivery_date,
            total_amount: Number(d.total_amount || 0),
            notes: d.notes,
            items: d.delivery_items || [],
          }));

          const total_amount_today = formatted.reduce((sum, d) => sum + d.total_amount, 0);
          const total_packets_today = formatted.reduce(
            (sum, d) => sum + d.items.reduce((pSum: number, it: any) => pSum + (it.quantity || 0), 0),
            0
          );

          return NextResponse.json({
            success: true,
            date: todayStr,
            total_deliveries: formatted.length,
            total_amount_today,
            total_packets_today,
            deliveries: formatted,
            source: 'supabase',
          });
        }
      } catch (dbErr) {
        // Fall through to empty return
      }
    }

    return NextResponse.json({
      success: true,
      date: todayStr,
      total_deliveries: 0,
      total_amount_today: 0,
      total_packets_today: 0,
      deliveries: [],
      source: 'empty',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
