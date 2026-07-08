-- BloomBox Gifts table for the new emotional bouquet gifting experience
-- This table stores complete gift data keyed by share_code

CREATE TABLE IF NOT EXISTS public.bloombox_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_code VARCHAR(16) UNIQUE NOT NULL,
    
    -- Bouquet data
    bouquet_style VARCHAR(50) DEFAULT 'classic' NOT NULL,
    flowers JSONB DEFAULT '[]'::jsonb NOT NULL,
    fillers JSONB DEFAULT '["baby_breath","green_leaves"]'::jsonb NOT NULL,
    wrapping VARCHAR(50) DEFAULT 'white' NOT NULL,
    ribbon VARCHAR(50) DEFAULT 'pink' NOT NULL,
    extras JSONB DEFAULT '[]'::jsonb NOT NULL,
    
    -- Letter data
    letter_template VARCHAR(50) DEFAULT 'classic' NOT NULL,
    recipient_name VARCHAR(255) DEFAULT '' NOT NULL,
    message TEXT DEFAULT '' NOT NULL,
    sender_name VARCHAR(255) DEFAULT '' NOT NULL,
    
    -- Envelope
    envelope VARCHAR(50) DEFAULT 'classic' NOT NULL,
    
    -- Metadata
    view_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '365 days')
);

-- Index for fast share_code lookup
CREATE INDEX IF NOT EXISTS idx_bloombox_gifts_share_code ON public.bloombox_gifts(share_code);

-- Allow anyone to read gifts (public share links)
ALTER TABLE public.bloombox_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bloombox gifts" ON public.bloombox_gifts
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert bloombox gifts" ON public.bloombox_gifts
    FOR INSERT WITH CHECK (true);

-- Increment view count function
CREATE OR REPLACE FUNCTION increment_gift_views(code VARCHAR)
RETURNS void AS $$
BEGIN
    UPDATE public.bloombox_gifts
    SET view_count = view_count + 1
    WHERE share_code = code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
