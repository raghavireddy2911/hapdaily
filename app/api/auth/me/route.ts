import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-owner-token')?.value;
    const email = cookieStore.get('sb-owner-email')?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false });
    }

    return NextResponse.json({
      loggedIn: true,
      email: email || 'Owner',
    });
  } catch (err: any) {
    return NextResponse.json({ loggedIn: false, error: err.message });
  }
}

