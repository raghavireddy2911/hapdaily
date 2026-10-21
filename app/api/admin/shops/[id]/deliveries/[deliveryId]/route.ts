import { NextResponse } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase-server';
import { isSupabaseConfigured } from '@/lib/supabase-config';
import { mockDeliveries } from '@/lib/shops-mock';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; deliveryId: string }> }
) {
  try {
    const { id: shop_id, deliveryId } = await params;
    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase) {
      try {
        const supabase = await getAuthenticatedSupabaseClient();
        const { error } = await supabase
          .from('deliveries')
          .delete()
          .eq('id', deliveryId)
          .eq('shop_id', shop_id);

        if (!error) {
          return NextResponse.json({ success: true });
        }
      } catch (dbErr) {
        // Fallback
      }
    }

    const idx = mockDeliveries.findIndex((d) => d.id === deliveryId && d.shop_id === shop_id);
    if (idx !== -1) {
      mockDeliveries.splice(idx, 1);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

