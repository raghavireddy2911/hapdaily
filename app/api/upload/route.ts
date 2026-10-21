import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isSupabaseConfigured } from '@/lib/supabase-config';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided.' }, { status: 400 });
    }

    const hasSupabase = isSupabaseConfigured();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
    const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    if (hasSupabase) {
      const { data, error } = await supabaseAdmin.storage
        .from('products')
        .upload(fileName, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.warn('Supabase storage upload error:', error.message);
        // Fallback: data URL so father can continue smoothly without breaking
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type || 'image/jpeg'};base64,${base64}`;
        return NextResponse.json({
          success: true,
          url: dataUrl,
          warning: 'Uploaded as inline base64 because Supabase bucket "products" needs to be created.',
        });
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('products')
        .getPublicUrl(fileName);

      return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
    }

    // When in local/preview mode: return base64 Data URL so it is fully previewable and savable
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type || 'image/jpeg'};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      mode: 'inline-preview',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

