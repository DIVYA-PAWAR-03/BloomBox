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

    if (!supabase) {
      console.log('Supabase not configured, saving to local JSON database.');
      writeLocalGift(shareCode, giftData);
      return NextResponse.json({ shareCode });
    }

    const { data, error } = await supabase
      .from('bloombox_gifts')
      .insert([giftData])
      .select('share_code')
      .single();

    if (error) {
      console.error('Supabase error, falling back to local JSON database:', error);
      writeLocalGift(shareCode, giftData);
      return NextResponse.json({ shareCode });
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

