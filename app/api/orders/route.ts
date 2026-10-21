import { NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/supabase-config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      customer_name,
      customer_phone,
      customer_address,
      notes,
      payment_method,
      status,
      payment_status,
      subtotal: manualSubtotal,
      total: manualTotal,
    } = body;

    // Validation: Don't allow empty names or negative prices and quantities
    if (!customer_name || !customer_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required and cannot be empty.' },
        { status: 400 }
      );
    }

    if (!customer_phone || !customer_phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer phone number is required.' },
        { status: 400 }
      );
    }

    if (!customer_address || !customer_address.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer address is required.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one order item is required.' }, { status: 400 });
    }

    // Process and validate items
    let calculatedSubtotal = 0;
    const verifiedItems = items.map((cartItem: any) => {
      const unitPrice = parseFloat(cartItem.price || cartItem.product?.price || 0);
      const qty = parseInt(cartItem.quantity || 1, 10);

      if (isNaN(qty) || qty <= 0) {
        throw new Error(`Quantity for item "${cartItem.name || 'product'}" must be greater than zero.`);
      }

      if (isNaN(unitPrice) || unitPrice < 0) {
        throw new Error(`Price for item "${cartItem.name || 'product'}" cannot be negative.`);
      }

      const itemTotal = Math.round(unitPrice * qty * 100) / 100;
      calculatedSubtotal += itemTotal;

      return {
        product_id: cartItem.product_id || cartItem.product?.id || null,
        name: cartItem.name || cartItem.product?.name || 'Dairy Item',
        brand: cartItem.brand || cartItem.product?.brand || 'Hapdaily',
        price: unitPrice,
        quantity: qty,
        unit: cartItem.unit || cartItem.product?.unit || '500ml',
        image_url: cartItem.image_url || cartItem.product?.image_url,
        item_total: itemTotal,
      };
    });

    const deliveryFee = 0.0;
    const total = manualTotal !== undefined && manualTotal !== null ? parseFloat(manualTotal) : calculatedSubtotal + deliveryFee;
    const subtotal = manualSubtotal !== undefined && manualSubtotal !== null ? parseFloat(manualSubtotal) : calculatedSubtotal;
    const orderNumber = `HD-${Date.now().toString().slice(-6)}`;

    const orderPayload = {
      order_number: orderNumber,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_address: customer_address.trim(),
      notes: notes ? notes.trim() : null,
      items: verifiedItems,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      status: status || 'pending',
      payment_status: payment_status || 'unverified',
      payment_method: payment_method || 'upi',
    };

    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      const supabase = await getAuthenticatedSupabaseClient();
      const { data, error } = await supabase.from('orders').insert([orderPayload]).select().single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        order: data,
        message: 'Order created successfully.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Supabase is not configured.' },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      const supabase = await getAuthenticatedSupabaseClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json({ success: true, orders: data, source: 'supabase' });
      }
    }

    // Always start empty with zero counts when no orders exist in Supabase
    return NextResponse.json({ success: true, orders: [], source: 'empty' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, orders: [] }, { status: 500 });
  }
}
