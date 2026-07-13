import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Local JSON database helper utilities
const dbPath = path.join(process.cwd(), 'data', 'gifts.json');

function ensureDb() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}));
  }
}

function readLocalGift(shareCode: string) {
  try {
    ensureDb();
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(fileContent);
    return db[shareCode] || null;
  } catch (e) {
    console.error('Error reading local gift database:', e);
    return null;
  }
}

function writeLocalGift(shareCode: string, giftData: any) {
  try {
    ensureDb();
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(fileContent);
    db[shareCode] = giftData;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Error writing to local gift database:', e);
  }
}

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

    // Compact fallback data helper for read-only environments (Vercel serverless)
    const getFallbackCode = () => {
      const compactData: any = {};
      if (body.bouquet_style && body.bouquet_style !== 'classic') {
        compactData.sty = body.bouquet_style;
      }
      
      const flData = (body.flowers || []).map((f: any) => [
        f.type,
        Math.round(f.x),
        Math.round(f.y),
        Math.round(f.rotation),
        parseFloat(f.scale.toFixed(2)),
      ]);
      if (flData.length > 0) {
        compactData.fl = flData;
      }

      // Default fillers are baby_breath, green_leaves, eucalyptus
      const defaultFillers = ['baby_breath', 'green_leaves', 'eucalyptus'];
      const hasCustomFillers = !body.fillers || 
        body.fillers.length !== 3 || 
        !body.fillers.includes('baby_breath') || 
        !body.fillers.includes('green_leaves') || 
        !body.fillers.includes('eucalyptus');
      if (hasCustomFillers && body.fillers) {
        compactData.fi = body.fillers;
      }

      if (body.wrapping && body.wrapping !== 'white') compactData.wr = body.wrapping;
      if (body.ribbon && body.ribbon !== 'pink') compactData.ri = body.ribbon;
      if (body.extras && body.extras.length > 0) compactData.ex = body.extras;
      if (body.letter_template && body.letter_template !== 'love') compactData.lt = body.letter_template;
      if (body.recipient_name) compactData.rec = body.recipient_name;
      if (body.message) compactData.msg = body.message;
      if (body.sender_name) compactData.sen = body.sender_name;
      if (body.envelope && body.envelope !== 'classic') compactData.ev = body.envelope;

      return 'u_' + Buffer.from(JSON.stringify(compactData)).toString('base64url');
    };

    if (!supabase) {
      console.log('Supabase not configured. Using compressed URL-encoded fallback.');
      const fallbackCode = getFallbackCode();
      return NextResponse.json({ shareCode: fallbackCode });
    }

    const { data, error } = await supabase
      .from('bloombox_gifts')
      .insert([giftData])
      .select('share_code')
      .single();

    if (error) {
      console.error('Supabase error, falling back to URL-encoded fallback:', error);
      const fallbackCode = getFallbackCode();
      return NextResponse.json({ shareCode: fallbackCode });
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

  // Handle URL-encoded fallback share codes (starting with 'u_')
  if (shareCode.startsWith('u_')) {
    try {
      const base64Str = shareCode.slice(2);
      const jsonStr = Buffer.from(base64Str, 'base64url').toString('utf-8');
      const data = JSON.parse(jsonStr);
      const gift = {
        share_code: shareCode,
        bouquet_style: data.sty || 'classic',
        flowers: (data.fl || []).map((arr: any, i: number) => ({
          id: `${arr[0]}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          type: arr[0],
          x: arr[1],
          y: arr[2],
          rotation: arr[3],
          scale: arr[4],
          zIndex: 20 + i,
        })),
        fillers: data.fi || ['baby_breath', 'green_leaves', 'eucalyptus'],
        wrapping: data.wr || 'white',
        ribbon: data.ri || 'pink',
        extras: data.ex || [],
        letter_template: data.lt || 'love',
        recipient_name: data.rec || '',
        message: data.msg || '',
        sender_name: data.sen || '',
        envelope: data.ev || 'classic',
      };
      return NextResponse.json({ gift });
    } catch (e) {
      console.error('Error decoding URL share code:', e);
      return NextResponse.json({ error: 'Invalid share code format' }, { status: 400 });
    }
  }

  if (!supabase) {
    const localGift = readLocalGift(shareCode);
    if (!localGift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }
    return NextResponse.json({ gift: localGift });
  }

  const { data, error } = await supabase
    .from('bloombox_gifts')
    .select('*')
    .eq('share_code', shareCode)
    .single();

  if (error || !data) {
    // If not found in Supabase, check local fallback
    const localGift = readLocalGift(shareCode);
    if (localGift) {
      return NextResponse.json({ gift: localGift });
    }
    return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
  }

  return NextResponse.json({ gift: data });
}

