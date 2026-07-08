-- Create migrations for BloomBox – Digital Bouquet & Gift Studio

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PROFILES TABLE (linked to auth.users)
-- ==========================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. LANGUAGES TABLE
-- ==========================================
CREATE TABLE public.languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. ASSETS TABLE
-- ==========================================
CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('flower', 'wrapper', 'ribbon', 'gift', 'sticker', 'background', 'chocolate', 'plush')),
    category VARCHAR(100),
    preview_url TEXT,
    asset_url TEXT,
    properties JSONB DEFAULT '{}'::jsonb NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. TEMPLATES TABLE
-- ==========================================
CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    preview_image TEXT,
    thumbnail TEXT,
    category VARCHAR(100),
    premium BOOLEAN DEFAULT FALSE NOT NULL,
    json_layout JSONB DEFAULT '{}'::jsonb NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. BOUQUETS TABLE
-- ==========================================
CREATE TABLE public.bouquets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    name VARCHAR(255) DEFAULT 'My Bouquet' NOT NULL,
    wrapper_type VARCHAR(100),
    ribbon_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'scheduled', 'archived', 'deleted')),
    share_code VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    language_code VARCHAR(10) DEFAULT 'en',
    theme_id VARCHAR(100),
    view_count INTEGER DEFAULT 0 NOT NULL,
    opened_count INTEGER DEFAULT 0 NOT NULL,
    last_opened_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. BOUQUET ITEMS TABLE
-- ==========================================
CREATE TABLE public.bouquet_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    flower_type VARCHAR(100), -- Legacy / fallback field
    color VARCHAR(50),
    position_x DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    position_y DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    width DOUBLE PRECISION,
    height DOUBLE PRECISION,
    scale DOUBLE PRECISION DEFAULT 1.0 NOT NULL,
    rotation DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    opacity DOUBLE PRECISION DEFAULT 1.0 NOT NULL,
    z_index INTEGER DEFAULT 0 NOT NULL,
    layer VARCHAR(50) DEFAULT 'midground' NOT NULL CHECK (layer IN ('background', 'midground', 'foreground')),
    locked BOOLEAN DEFAULT FALSE NOT NULL,
    animation JSONB DEFAULT '{}'::jsonb NOT NULL,
    asset_type VARCHAR(50),
    asset_category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. LETTERS TABLE
-- ==========================================
CREATE TABLE public.letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bouquet_id UUID UNIQUE NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    sender_name VARCHAR(100),
    recipient_name VARCHAR(100),
    content TEXT,
    font_family VARCHAR(100),
    paper_style VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. PHOTOS TABLE
-- ==========================================
CREATE TABLE public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    order_index INTEGER DEFAULT 0 NOT NULL,
    frame_style VARCHAR(100),
    rotation DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    scale DOUBLE PRECISION DEFAULT 1.0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 9. VOICE MESSAGES TABLE
-- ==========================================
CREATE TABLE public.voice_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    duration DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    waveform JSONB DEFAULT '[]'::jsonb NOT NULL,
    file_size INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 10. MUSIC TABLE
-- ==========================================
CREATE TABLE public.music (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bouquet_id UUID UNIQUE NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    music_type VARCHAR(50) NOT NULL CHECK (music_type IN ('Spotify', 'YouTube', 'Upload')),
    url TEXT NOT NULL,
    title VARCHAR(255),
    artist VARCHAR(255),
    autoplay BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 11. GIFT ITEMS TABLE
-- ==========================================
CREATE TABLE public.gift_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 12. COMMENTS TABLE
-- ==========================================
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 13. REACTIONS TABLE
-- ==========================================
CREATE TABLE public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reaction_type VARCHAR(50) NOT NULL CHECK (reaction_type IN ('like', 'love', 'flower')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 14. FAVORITES TABLE
-- ==========================================
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bouquet_id UUID REFERENCES public.bouquets(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT favorites_either_bouquet_or_template CHECK (
        (bouquet_id IS NOT NULL AND template_id IS NULL) OR
        (bouquet_id IS NULL AND template_id IS NOT NULL)
    ),
    UNIQUE (user_id, bouquet_id),
    UNIQUE (user_id, template_id)
);

-- ==========================================
-- 15. BOUQUET VERSIONS TABLE
-- ==========================================
CREATE TABLE public.bouquet_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    json_snapshot JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (bouquet_id, version_number)
);

-- ==========================================
-- 16. SHARE LINKS TABLE
-- ==========================================
CREATE TABLE public.share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bouquet_id UUID NOT NULL REFERENCES public.bouquets(id) ON DELETE CASCADE,
    share_code VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    max_views INTEGER,
    current_views INTEGER DEFAULT 0 NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- DATABASE TRIGGERS
-- ==========================================

-- Trigger function to update the updated_at column automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bouquets_updated_at BEFORE UPDATE ON public.bouquets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger function to handle public.profiles creation on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach profile creation trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX idx_assets_type_active ON public.assets(type, is_active, is_deleted);
CREATE INDEX idx_templates_category_active ON public.templates(category, is_active, is_deleted);
CREATE INDEX idx_bouquets_user_id ON public.bouquets(user_id);
CREATE INDEX idx_bouquets_status_deleted ON public.bouquets(status, is_deleted);
CREATE INDEX idx_bouquets_share_code ON public.bouquets(share_code);
CREATE INDEX idx_bouquet_items_bouquet_id ON public.bouquet_items(bouquet_id);
CREATE INDEX idx_bouquet_items_asset_id ON public.bouquet_items(asset_id);
CREATE INDEX idx_letters_bouquet_id ON public.letters(bouquet_id);
CREATE INDEX idx_photos_bouquet_id ON public.photos(bouquet_id);
CREATE INDEX idx_voice_messages_bouquet_id ON public.voice_messages(bouquet_id);
CREATE INDEX idx_music_bouquet_id ON public.music(bouquet_id);
CREATE INDEX idx_gift_items_bouquet_id ON public.gift_items(bouquet_id);
CREATE INDEX idx_comments_bouquet_id ON public.comments(bouquet_id);
CREATE INDEX idx_reactions_bouquet_id ON public.reactions(bouquet_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_bouquet_id ON public.favorites(bouquet_id);
CREATE INDEX idx_favorites_template_id ON public.favorites(template_id);
CREATE INDEX idx_bouquet_versions_bouquet_id_version ON public.bouquet_versions(bouquet_id, version_number);
CREATE INDEX idx_share_links_bouquet_id ON public.share_links(bouquet_id);
CREATE INDEX idx_share_links_share_code ON public.share_links(share_code);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bouquets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bouquet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bouquet_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- 1. Profiles
CREATE POLICY "Profiles are readable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Languages
CREATE POLICY "Languages are readable by everyone" ON public.languages
    FOR SELECT USING (true);

-- 3. Assets
CREATE POLICY "Assets are readable by everyone" ON public.assets
    FOR SELECT USING (is_active = true AND is_deleted = false);

-- 4. Templates
CREATE POLICY "Templates are readable by everyone" ON public.templates
    FOR SELECT USING (is_active = true AND is_deleted = false);

-- 5. Bouquets
CREATE POLICY "Bouquets read access policy" ON public.bouquets
    FOR SELECT USING (
        user_id = auth.uid()
        OR (status = 'published' AND is_deleted = false AND (scheduled_at IS NULL OR scheduled_at <= NOW()) AND (expires_at IS NULL OR expires_at > NOW()))
        OR EXISTS (
            SELECT 1 FROM public.share_links 
            WHERE share_links.bouquet_id = bouquets.id 
              AND (share_links.expires_at IS NULL OR share_links.expires_at > now())
              AND (share_links.max_views IS NULL OR share_links.current_views < share_links.max_views)
        )
    );

CREATE POLICY "Anyone can create bouquets" ON public.bouquets
    FOR INSERT WITH CHECK (
        (auth.uid() IS NULL AND user_id IS NULL)
        OR (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
    );

CREATE POLICY "Owners or guests can update their bouquets" ON public.bouquets
    FOR UPDATE USING (
        user_id = auth.uid()
        OR user_id IS NULL
    ) WITH CHECK (
        user_id = auth.uid()
        OR user_id IS NULL
    );

CREATE POLICY "Owners can delete their bouquets" ON public.bouquets
    FOR DELETE USING (user_id = auth.uid());

-- 6. Share Links
CREATE POLICY "Share links are public" ON public.share_links
    FOR SELECT USING (true);

CREATE POLICY "Bouquet owners can manage share links" ON public.share_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = share_links.bouquet_id
              AND bouquets.user_id = auth.uid()
        )
    );

-- 7. Bouquet Items
CREATE POLICY "Select bouquet items based on parent bouquet" ON public.bouquet_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = bouquet_items.bouquet_id
        )
    );

CREATE POLICY "Manage bouquet items based on parent bouquet" ON public.bouquet_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = bouquet_items.bouquet_id
              AND (bouquets.user_id = auth.uid() OR bouquets.user_id IS NULL)
        )
    );

-- 8. Letters
CREATE POLICY "Select letters based on parent bouquet" ON public.letters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = letters.bouquet_id
        )
    );

CREATE POLICY "Manage letters based on parent bouquet" ON public.letters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = letters.bouquet_id
              AND (bouquets.user_id = auth.uid() OR bouquets.user_id IS NULL)
        )
    );

-- 9. Photos
CREATE POLICY "Select photos based on parent bouquet" ON public.photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = photos.bouquet_id
        )
    );

CREATE POLICY "Manage photos based on parent bouquet" ON public.photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = photos.bouquet_id
              AND (bouquets.user_id = auth.uid() OR bouquets.user_id IS NULL)
        )
    );

-- 10. Voice Messages
CREATE POLICY "Select voice messages based on parent" ON public.voice_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = voice_messages.bouquet_id
        )
    );

CREATE POLICY "Manage voice messages based on parent" ON public.voice_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = voice_messages.bouquet_id
              AND (bouquets.user_id = auth.uid() OR bouquets.user_id IS NULL)
        )
    );

-- 11. Music
CREATE POLICY "Select music based on parent" ON public.music
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = music.bouquet_id
        )
    );

CREATE POLICY "Manage music based on parent" ON public.music
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = music.bouquet_id
              AND (bouquets.user_id = auth.uid() OR bouquets.user_id IS NULL)
        )
    );

-- 12. Gift Items
CREATE POLICY "Select gift items based on parent" ON public.gift_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = gift_items.bouquet_id
        )
    );

CREATE POLICY "Manage gift items based on parent" ON public.gift_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = gift_items.bouquet_id
              AND (bouquets.user_id = auth.uid() OR bouquets.user_id IS NULL)
        )
    );

-- 13. Comments
CREATE POLICY "Select comments based on parent" ON public.comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = comments.bouquet_id
        )
    );

CREATE POLICY "Insert comments based on parent" ON public.comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = comments.bouquet_id
              AND (bouquets.status = 'published' OR bouquets.user_id = auth.uid() OR bouquets.user_id IS NULL)
        )
    );

CREATE POLICY "Manage own comments or bouquet owners" ON public.comments
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = comments.bouquet_id
              AND bouquets.user_id = auth.uid()
        )
    );

-- 14. Reactions
CREATE POLICY "Select reactions based on parent" ON public.reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = reactions.bouquet_id
        )
    );

CREATE POLICY "Insert reactions based on parent" ON public.reactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = reactions.bouquet_id
              AND (bouquets.status = 'published' OR bouquets.user_id = auth.uid() OR bouquets.user_id IS NULL)
        )
    );

CREATE POLICY "Delete own reactions" ON public.reactions
    FOR DELETE USING (
        user_id = auth.uid()
        OR user_id IS NULL
    );

-- 15. Favorites
CREATE POLICY "Manage own favorites" ON public.favorites
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 16. Bouquet Versions
CREATE POLICY "Select versions based on parent ownership" ON public.bouquet_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = bouquet_versions.bouquet_id
              AND bouquets.user_id = auth.uid()
        )
    );

CREATE POLICY "Manage versions based on parent ownership" ON public.bouquet_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bouquets
            WHERE bouquets.id = bouquet_versions.bouquet_id
              AND bouquets.user_id = auth.uid()
        )
    );
