import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;


// Generate a short unique share code
function generateShareCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const shareCode = generateShareCode();

    const giftData = {
      share_code: shareCode,
      bouquet_style: body.bouquet_style || 'classic',
      flowers: body.flowers || [],
      fillers: body.fillers || ['baby_breath', 'green_leaves'],
      wrapping: body.wrapping || 'white',
      ribbon: body.ribbon || 'pink',
      extras: body.extras || [],
      letter_template: body.letter_template || 'classic',
      recipient_name: body.recipient_name || '',
      message: body.message || '',
      sender_name: body.sender_name || '',
      envelope: body.envelope || 'classic',
      created_at: new Date().toISOString(),
    };

    if (!supabase) {
      console.log('Supabase not configured, falling back to URL-encoding.');
      const encoded = Buffer.from(JSON.stringify(giftData)).toString('base64url');
      return NextResponse.json({ shareCode: encoded, fallback: true });
    }

    const { data, error } = await supabase
      .from('bloombox_gifts')
      .insert([giftData])
      .select('share_code')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      // Fallback: encode data in URL if DB fails
      const encoded = Buffer.from(JSON.stringify(giftData)).toString('base64url');
      return NextResponse.json({ shareCode: encoded, fallback: true });
    }

    return NextResponse.json({ shareCode: data.share_code });
  } catch (e) {
    console.error('API error:', e);
    return NextResponse.json({ error: 'Failed to save gift' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const shareCode = req.nextUrl.searchParams.get('code');
  if (!shareCode) {
    return NextResponse.json({ error: 'No share code provided' }, { status: 400 });
  }

  if (!supabase) {
    // If not configured, we can't query by code from database, but client will decode from base64Url itself
    return NextResponse.json({ error: 'Database not configured' }, { status: 501 });
  }

  const { data, error } = await supabase
    .from('bloombox_gifts')
    .select('*')
    .eq('share_code', shareCode)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
  }

  return NextResponse.json({ gift: data });
}

