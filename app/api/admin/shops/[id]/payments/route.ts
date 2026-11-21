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
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('shop_id', id)
        .order('payment_date', { ascending: false });

      if (!error) {
        return NextResponse.json({ success: true, payments: data || [], source: 'supabase' });
      }
    }

    return NextResponse.json({ success: true, payments: [], source: 'empty' });
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
    const { amount, payment_date, payment_method, notes } = body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, error: 'A valid payment amount is required.' }, { status: 400 });
    }

    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      const supabase = await getAuthenticatedSupabaseClient();
      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            shop_id,
            amount: numAmount,
            payment_date: payment_date || new Date().toISOString().split('T')[0],
            payment_method: payment_method || 'cash',
            notes: notes ? notes.trim() : null,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, payment: data });
      }
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Supabase is not configured.' },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shop_id } = await params;
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'Payment ID is required.' }, { status: 400 });
    }

    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      const supabase = await getAuthenticatedSupabaseClient();
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId)
        .eq('shop_id', shop_id);

      if (!error) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: false, error: 'Supabase is not configured.' },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
