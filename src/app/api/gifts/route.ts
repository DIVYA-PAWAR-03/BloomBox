import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import clientPromise from '@/lib/mongodb';

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
const BOUQUET_STYLES = ['classic', 'modern', 'romantic', 'wild', 'minimal'];

// Binary packing helper for ultra-short ~100 char fallback URL
function packBinaryGift(gift: any): string {
  try {
    const bytes: number[] = [];
    
    const styleIdx = Math.max(0, BOUQUET_STYLES.indexOf(gift.bouquet_style));
    const wrapIdx = Math.max(0, WRAPPINGS.indexOf(gift.wrapping));
    bytes.push((styleIdx << 4) | (wrapIdx & 0x0F));

    const ribIdx = Math.max(0, RIBBONS.indexOf(gift.ribbon));
    const letIdx = Math.max(0, LETTERS.indexOf(gift.letter_template));
    bytes.push((ribIdx << 4) | (letIdx & 0x0F));

    const envIdx = Math.max(0, ENVELOPES.indexOf(gift.envelope));
    bytes.push((envIdx << 4));

    let fillerMask = 0;
    (gift.fillers || []).forEach((f: string) => {
      const idx = FILLERS.indexOf(f);
      if (idx !== -1) fillerMask |= (1 << idx);
    });
    bytes.push(fillerMask);

    let extraMask = 0;
    (gift.extras || []).forEach((e: string) => {
      const idx = EXTRAS.indexOf(e);
      if (idx !== -1) extraMask |= (1 << idx);
    });
    bytes.push(extraMask);

    const flowers = gift.flowers || [];
    bytes.push(flowers.length);

    flowers.forEach((fl: any) => {
      const typeIdx = Math.max(0, FLOWER_TYPES.indexOf(fl.type));
      const x = Math.min(255, Math.max(0, Math.round(fl.x)));
      const y = Math.min(255, Math.max(0, Math.round(fl.y)));
      const rot = Math.round(((fl.rotation % 360 + 360) % 360) * 255 / 360);
      bytes.push(typeIdx, x, y, rot);
    });

    const textStr = `${gift.recipient_name || ''}\0${gift.sender_name || ''}\0${gift.message || ''}`;
    const textBuf = Buffer.from(textStr, 'utf-8');
    const headerBuf = Buffer.from(bytes);
    const totalBuf = Buffer.concat([headerBuf, textBuf]);

    const compressed = zlib.deflateRawSync(totalBuf);
    return 'b_' + compressed.toString('base64url');
  } catch (e) {
    console.error('Error in packBinaryGift:', e);
    return encodeCompactGift(gift);
  }
}

function unpackBinaryGift(shareCode: string): any {
  const base64Str = shareCode.slice(2);
  const buf = Buffer.from(base64Str, 'base64url');
  const decompressed = zlib.inflateRawSync(buf);

  const styleIdx = (decompressed[0] >> 4) & 0x0F;
  const wrapIdx = decompressed[0] & 0x0F;
  const ribIdx = (decompressed[1] >> 4) & 0x0F;
  const letIdx = decompressed[1] & 0x0F;
  const envIdx = (decompressed[2] >> 4) & 0x0F;

  const fillerMask = decompressed[3];
  const extraMask = decompressed[4];
  const flowerCount = decompressed[5];

  const fillers: string[] = [];
  FILLERS.forEach((f, i) => {
    if (fillerMask & (1 << i)) fillers.push(f);
  });

  const extras: string[] = [];
  EXTRAS.forEach((e, i) => {
    if (extraMask & (1 << i)) extras.push(e);
  });

  let offset = 6;
  const flowers: any[] = [];
  for (let i = 0; i < flowerCount; i++) {
    const typeIdx = decompressed[offset];
    const x = decompressed[offset + 1];
    const y = decompressed[offset + 2];
    const rotByte = decompressed[offset + 3];
    const rotation = Math.round(rotByte * 360 / 255);
    offset += 4;

    const typeName = FLOWER_TYPES[typeIdx] || 'rose';
    flowers.push({
      id: `${typeName}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      type: typeName,
      x,
      y,
      rotation,
      scale: 1,
      zIndex: 20 + i,
    });
  }

  const textBuf = decompressed.slice(offset);
  const textParts = textBuf.toString('utf-8').split('\0');

  return {
    share_code: shareCode,
    bouquet_style: BOUQUET_STYLES[styleIdx] || 'classic',
    wrapping: WRAPPINGS[wrapIdx] || 'white',
    ribbon: RIBBONS[ribIdx] || 'pink',
    letter_template: LETTERS[letIdx] || 'love',
    envelope: ENVELOPES[envIdx] || 'classic',
    fillers,
    extras,
    flowers,
    recipient_name: textParts[0] || '',
    sender_name: textParts[1] || '',
    message: textParts[2] || '',
  };
}

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

    let mongoSaved = false;

    // Save to MongoDB if MONGODB_URI is configured
    if (clientPromise) {
      try {
        const client = await clientPromise;
        const db = client.db('bloombox');
        await db.collection('gifts').insertOne(giftData);
        mongoSaved = true;
      } catch (err) {
        console.error('MongoDB insert error while saving gift:', err);
      }
    }

    if (mongoSaved) {
      return NextResponse.json({ shareCode });
    }

    // If MongoDB is not available or fails (e.g. serverless without MONGODB_URI),
    // return ultra-compact binary deflated fallback code (starting with 'b_')
    const compressedCode = packBinaryGift(giftData);
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

  // Handle ultra-compact binary packed share codes (starting with 'b_')
  if (shareCode.startsWith('b_')) {
    try {
      const gift = unpackBinaryGift(shareCode);
      return NextResponse.json({ gift });
    } catch (e) {
      console.error('Error unpacking binary share code:', e);
      return NextResponse.json({ error: 'Invalid share code format' }, { status: 400 });
    }
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

  if (clientPromise) {
    try {
      const client = await clientPromise;
      const db = client.db('bloombox');
      const gift = await db.collection('gifts').findOne({ share_code: shareCode });
      if (gift) {
        return NextResponse.json({ gift });
      }
    } catch (err) {
      console.error('MongoDB findOne error:', err);
    }
  }

  // Fallback to local JSON storage if MongoDB client is not configured
  const localGift = readLocalGift(shareCode);
  if (localGift) {
    return NextResponse.json({ gift: localGift });
  }

  return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
}

