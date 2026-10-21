import { NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/supabase-config';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      const supabase = await getAuthenticatedSupabaseClient();
      const { data: shop, error: shopErr } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .single();

      if (!shopErr && shop) {
        const { data: rates } = await supabase.from('shop_rates').select('*').eq('shop_id', id);
        const { data: deliveries } = await supabase
          .from('deliveries')
          .select('*, delivery_items(*)')
          .eq('shop_id', id)
          .order('delivery_date', { ascending: false });
        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .eq('shop_id', id)
          .order('payment_date', { ascending: false });

        const total_billed = (deliveries || []).reduce((sum, d) => sum + Number(d.total_amount || 0), 0);
        const total_paid = (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const balance = Math.round((total_billed - total_paid) * 100) / 100;

        const formattedDeliveries = (deliveries || []).map((d) => ({
          ...d,
          items: d.delivery_items || [],
        }));

        return NextResponse.json({
          success: true,
          shop: {
            ...shop,
            total_billed,
            total_paid,
            balance,
          },
          rates: rates || [],
          deliveries: formattedDeliveries,
          payments: payments || [],
          source: 'supabase',
        });
      }
    }

    return NextResponse.json({ success: false, error: 'Shop not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, owner_name, phone, address, notes } = body;

    // Strict validation
    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ success: false, error: 'Shop name cannot be empty.' }, { status: 400 });
    }
    if (owner_name !== undefined && !owner_name.trim()) {
      return NextResponse.json({ success: false, error: 'Owner name cannot be empty.' }, { status: 400 });
    }
    if (phone !== undefined && !phone.trim()) {
      return NextResponse.json({ success: false, error: 'Phone number cannot be empty.' }, { status: 400 });
    }
    if (address !== undefined && !address.trim()) {
      return NextResponse.json({ success: false, error: 'Address cannot be empty.' }, { status: 400 });
    }

    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      const supabase = await getAuthenticatedSupabaseClient();
      const { data, error } = await supabase
        .from('shops')
        .update({
          ...(name && { name: name.trim() }),
          ...(owner_name && { owner_name: owner_name.trim() }),
          ...(phone && { phone: phone.trim() }),
          ...(address && { address: address.trim() }),
          ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, shop: data, message: 'Shop updated successfully.' });
    }

    return NextResponse.json({ success: false, error: 'Supabase is not configured.' }, { status: 503 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      const supabase = await getAuthenticatedSupabaseClient();
      const { error } = await supabase.from('shops').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Shop deleted successfully.' });
    }

    return NextResponse.json({ success: false, error: 'Supabase is not configured.' }, { status: 503 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
