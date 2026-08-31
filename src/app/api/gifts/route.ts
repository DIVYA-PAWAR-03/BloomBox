import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

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
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Enums for ultra-compact URL encoding fallback
const FLOWER_TYPES = [
  'rose', 'rose_pink', 'rose_white', 'rose_yellow',
  'tulip_red', 'tulip_pink', 'tulip_yellow', 'tulip_purple',
  'sunflower', 'lily_white', 'lily_pink', 'orchid_purple',
  'daisy_white', 'carnation_pink', 'hydrangea_blue', 'lavender',
  'peony_pink', 'dahlia_red'
];

const WRAPPINGS = ['white', 'pink', 'kraft', 'black', 'lavender', 'sage', 'blue_pastel'];
const RIBBONS = ['pink', 'red', 'gold', 'white', 'sage', 'burgundy'];
const LETTERS = ['classic', 'love', 'birthday', 'thankyou', 'apology', 'friendship'];
const ENVELOPES = ['classic', 'heart_seal', 'wax_stamp', 'ribbon_bow', 'vintage_lace'];
const FILLERS = ['baby_breath', 'green_leaves', 'eucalyptus', 'statice', 'fern'];
const EXTRAS = ['teddy', 'chocolates', 'heart_balloon', 'fairy_lights', 'gift_box'];

function encodeCompactGift(gift: any): string {
  try {
    const compact = {
      s: gift.bouquet_style,
      w: WRAPPINGS.indexOf(gift.wrapping) !== -1 ? WRAPPINGS.indexOf(gift.wrapping) : gift.wrapping,
      r: RIBBONS.indexOf(gift.ribbon) !== -1 ? RIBBONS.indexOf(gift.ribbon) : gift.ribbon,
      l: LETTERS.indexOf(gift.letter_template) !== -1 ? LETTERS.indexOf(gift.letter_template) : gift.letter_template,
      e: ENVELOPES.indexOf(gift.envelope) !== -1 ? ENVELOPES.indexOf(gift.envelope) : gift.envelope,
      f: (gift.flowers || []).map((fl: any) => [
        typeof fl.type === 'string' && FLOWER_TYPES.indexOf(fl.type) !== -1 ? FLOWER_TYPES.indexOf(fl.type) : fl.type,
        Math.round(fl.x),
        Math.round(fl.y),
        Math.round(fl.rotation),
        Math.round((fl.scale || 1) * 100)
      ]),
      fl: (gift.fillers || []).map((fi: any) => FILLERS.indexOf(fi) !== -1 ? FILLERS.indexOf(fi) : fi),
      ex: (gift.extras || []).map((ex: any) => EXTRAS.indexOf(ex) !== -1 ? EXTRAS.indexOf(ex) : ex),
      t: [gift.recipient_name || '', gift.message || '', gift.sender_name || '']
    };

    const jsonStr = JSON.stringify(compact);
    const deflated = zlib.deflateRawSync(Buffer.from(jsonStr));
    return 'c_' + deflated.toString('base64url');
  } catch (e) {
    console.error('Error compacting gift data:', e);
    return gift.share_code;
  }
}

function decodeCompactGift(shareCode: string): any {
  const base64Str = shareCode.slice(2);
  const buf = Buffer.from(base64Str, 'base64url');
  const inflated = zlib.inflateRawSync(buf);
  const data = JSON.parse(inflated.toString('utf-8'));

  return {
    share_code: shareCode,
    bouquet_style: typeof data.s === 'number' ? 'classic' : (data.s || 'classic'),
    flowers: (data.f || []).map((arr: any, i: number) => {
      const typeName = typeof arr[0] === 'number' ? (FLOWER_TYPES[arr[0]] || 'rose') : arr[0];
      return {
        id: `${typeName}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        type: typeName,
        x: arr[1],
        y: arr[2],
        rotation: arr[3],
        scale: (arr[4] || 100) / 100,
        zIndex: 20 + i,
      };
    }),
    fillers: (data.fl || []).map((idx: any) => typeof idx === 'number' ? (FILLERS[idx] || idx) : idx),
    wrapping: typeof data.w === 'number' ? (WRAPPINGS[data.w] || 'white') : (data.w || 'white'),
    ribbon: typeof data.r === 'number' ? (RIBBONS[data.r] || 'pink') : (data.r || 'pink'),
    extras: (data.ex || []).map((idx: any) => typeof idx === 'number' ? (EXTRAS[idx] || idx) : idx),
    letter_template: typeof data.l === 'number' ? (LETTERS[data.l] || 'love') : (data.l || 'love'),
    envelope: typeof data.e === 'number' ? (ENVELOPES[data.e] || 'classic') : (data.e || 'classic'),
    recipient_name: data.t ? data.t[0] : '',
    message: data.t ? data.t[1] : '',
    sender_name: data.t ? data.t[2] : '',
  };
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

    // Always save to local database
    writeLocalGift(shareCode, giftData);

    let supabaseSaved = false;

    // Save to Supabase if configured
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bloombox_gifts')
          .insert([giftData])
          .select('share_code')
          .single();

        if (!error && data?.share_code) {
          supabaseSaved = true;
        } else {
          console.error('Supabase insert/select error while saving gift:', error);
        }
      } catch (err) {
        console.error('Supabase insert exception:', err);
      }
    }

    if (supabaseSaved) {
      return NextResponse.json({ shareCode });
    }

    // If Supabase is not available or fails (e.g. serverless without Supabase DB),
    // return ultra-compact binary deflated fallback code (starting with 'c_')
    const compressedCode = encodeCompactGift(giftData);
    return NextResponse.json({ shareCode: compressedCode });
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

  // Handle ultra-compact compressed share codes (starting with 'c_')
  if (shareCode.startsWith('c_')) {
    try {
      const gift = decodeCompactGift(shareCode);
      return NextResponse.json({ gift });
    } catch (e) {
      console.error('Error decoding compressed share code:', e);
      return NextResponse.json({ error: 'Invalid share code format' }, { status: 400 });
    }
  }

  // Handle legacy URL-encoded fallback share codes (starting with 'u_')
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

