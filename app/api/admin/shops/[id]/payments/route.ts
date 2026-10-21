import { NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/supabase-config';
import { mockPayments } from '@/lib/shops-mock';

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
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('shop_id', id)
          .order('payment_date', { ascending: false });

        if (!error && data) {
          return NextResponse.json({ success: true, payments: data, source: 'supabase' });
        }
      } catch (dbErr) {
        // Fallback
      }
    }

    const list = mockPayments.filter((p) => p.shop_id === id);
    return NextResponse.json({ success: true, payments: list, source: 'mock' });
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
      try {
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
      } catch (dbErr) {
        // Fallback
      }
    }

    const newPayment = {
      id: `pay_${Date.now()}`,
      shop_id,
      amount: numAmount,
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      payment_method: (payment_method as any) || 'cash',
      notes: notes || '',
      created_at: new Date().toISOString(),
    };
    mockPayments.unshift(newPayment);

    return NextResponse.json({ success: true, payment: newPayment });
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
      try {
        const supabase = await getAuthenticatedSupabaseClient();
        const { error } = await supabase
          .from('payments')
          .delete()
          .eq('id', paymentId)
          .eq('shop_id', shop_id);

        if (!error) {
          return NextResponse.json({ success: true });
        }
      } catch (dbErr) {
        // Fallback
      }
    }

    const idx = mockPayments.findIndex((p) => p.id === paymentId && p.shop_id === shop_id);
    if (idx !== -1) {
      mockPayments.splice(idx, 1);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

