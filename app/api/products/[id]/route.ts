import { NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/supabase-config';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    // Validation: Don't allow empty names or negative prices and quantities
    if (updates.name !== undefined && (!updates.name || !updates.name.trim())) {
      return NextResponse.json(
        { success: false, error: 'Product name cannot be empty.' },
        { status: 400 }
      );
    }

    if (updates.price !== undefined) {
      const numPrice = parseFloat(updates.price);
      if (isNaN(numPrice) || numPrice < 0) {
        return NextResponse.json(
          { success: false, error: 'Product price must be a valid non-negative number (₹0 or greater).' },
          { status: 400 }
        );
      }
      updates.price = numPrice;
    }
     if (updates.price_per_litre !== undefined) {
  if (updates.price_per_litre === null || updates.price_per_litre === '') {
    updates.price_per_litre = null;
  } else {
    const numPerLitre = parseFloat(updates.price_per_litre);
    if (isNaN(numPerLitre) || numPerLitre < 0) {
      return NextResponse.json(
        { success: false, error: 'Price per litre must be a valid non-negative number.' },
        { status: 400 }
      );
    }
    updates.price_per_litre = numPerLitre;
  }
}
    if (updates.stock_quantity !== undefined && updates.stock_quantity !== null) {
      const numStock = parseInt(updates.stock_quantity, 10);
      if (isNaN(numStock) || numStock < 0) {
        return NextResponse.json(
          { success: false, error: 'Stock quantity cannot be negative.' },
          { status: 400 }
        );
      }
      updates.stock_quantity = numStock;
    }

    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      const supabase = await getAuthenticatedSupabaseClient();
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, product: data });
    }

    return NextResponse.json(
      { success: false, error: 'Supabase is not configured.' },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, deletedId: id });
    }

    return NextResponse.json(
      { success: false, error: 'Supabase is not configured.' },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
