import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface BouquetMetadata {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'archived' | 'scheduled' | 'deleted';
  share_code: string;
  theme_id?: string | null;
  wrapper_type?: string | null;
  ribbon_type?: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface BouquetVersion {
  id: string;
  bouquet_id: string;
  version_number: number;
  json_snapshot: string; // JSON String
  created_at: string;
}

class PersistenceService {
  // Renders public share URL
  public getShareUrl(shareCode: string): string {
    if (typeof window === 'undefined') return `/gift/${shareCode}`;
    return `${window.location.origin}/gift/${shareCode}`;
  }

  // Generate short share codes (e.g. BB-XYZ789)
  private generateShareCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'BB-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // ----------------------------------------------------
  // BOUQUETS & DRAFTS LIFECYCLE
  // ----------------------------------------------------

  public async getDrafts(): Promise<BouquetMetadata[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bouquets')
          .select('*')
          .eq('is_deleted', false)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as BouquetMetadata[];
      } catch (err) {
        console.error('Supabase getDrafts failed, falling back to local storage:', err);
      }
    }

    // LocalStorage Fallback
    return this.getLocalBouquets().filter(b => !b.is_deleted);
  }

  public async createDraft(name: string = 'My Floral Gift'): Promise<string> {
    const id = crypto.randomUUID();
    const shareCode = this.generateShareCode();
    const nowStr = new Date().toISOString();

    const newBouquet: BouquetMetadata = {
      id,
      name,
      status: 'draft',
      share_code: shareCode,
      theme_id: 'light',
      wrapper_type: null,
      ribbon_type: null,
      created_at: nowStr,
      updated_at: nowStr,
      is_deleted: false
    };

    if (isSupabaseConfigured()) {
      try {
        // Attempt to get active user profile id
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id || null;

        const { error } = await supabase
          .from('bouquets')
          .insert({
            id,
            name,
            share_code: shareCode,
            status: 'draft',
            theme_id: 'light',
            user_id: userId
          });

        if (!error) return id;
        console.error('Supabase createDraft insert error:', error);
      } catch (err) {
        console.error('Supabase createDraft failed, using local storage:', err);
      }
    }

    // LocalStorage Fallback
    const local = this.getLocalBouquets();
    local.push(newBouquet);
    this.saveLocalBouquets(local);

    return id;
  }

  public async renameDraft(id: string, newName: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('bouquets')
          .update({ name: newName, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) return;
        console.error('Supabase renameDraft error:', error);
      } catch (err) {
        console.error('Supabase renameDraft failed, using local storage:', err);
      }
    }

    // LocalStorage Fallback
    const local = this.getLocalBouquets();
    const target = local.find(b => b.id === id);
    if (target) {
      target.name = newName;
      target.updated_at = new Date().toISOString();
      this.saveLocalBouquets(local);
    }
  }

  public async duplicateDraft(id: string): Promise<string> {
    const newId = crypto.randomUUID();
    const newShareCode = this.generateShareCode();
    const nowStr = new Date().toISOString();

    // Load original source
    let sourceMeta: BouquetMetadata | null = null;
    let canvasJson = '{}';

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bouquets')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          sourceMeta = data as BouquetMetadata;
          
          // Get latest version snapshot to copy canvas JSON
          const { data: verData } = await supabase
            .from('bouquet_versions')
            .select('json_snapshot')
            .eq('bouquet_id', id)
            .order('version_number', { ascending: false })
            .limit(1);

          if (verData && verData.length > 0) {
            canvasJson = typeof verData[0].json_snapshot === 'string'
              ? verData[0].json_snapshot
              : JSON.stringify(verData[0].json_snapshot);
          }
        }
      } catch (err) {
        console.error('Supabase loading for duplication failed:', err);
      }
    }

    // Local fallback for reading source if database fails/is offline
    if (!sourceMeta) {
      const local = this.getLocalBouquets();
      const target = local.find(b => b.id === id);
      if (target) {
        sourceMeta = target;
        canvasJson = localStorage.getItem(`bloombox_canvas_${id}`) || '{}';
      }
    }

    if (!sourceMeta) throw new Error('Source bouquet not found');

    const duplicateMeta: BouquetMetadata = {
      ...sourceMeta,
      id: newId,
      name: `${sourceMeta.name} (Copy)`,
      share_code: newShareCode,
      created_at: nowStr,
      updated_at: nowStr,
      is_deleted: false
    };

    if (isSupabaseConfigured()) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id || null;

        // 1. Insert duplicated bouquet metadata
        const { error: metaErr } = await supabase
          .from('bouquets')
          .insert({
            id: newId,
            name: duplicateMeta.name,
            share_code: newShareCode,
            status: sourceMeta.status,
            theme_id: sourceMeta.theme_id,
            user_id: userId
          });

        if (!metaErr) {
          // 2. Insert initial version snapshot
          if (canvasJson && canvasJson !== '{}') {
            await supabase
              .from('bouquet_versions')
              .insert({
                bouquet_id: newId,
                version_number: 1,
                json_snapshot: JSON.parse(canvasJson)
              });
          }
          return newId;
        }
        console.error('Supabase duplicate insert error:', metaErr);
      } catch (err) {
        console.error('Supabase duplicate failed, using local storage:', err);
      }
    }

    // LocalStorage Fallback
    const local = this.getLocalBouquets();
    local.push(duplicateMeta);
    this.saveLocalBouquets(local);

    // Copy Canvas JSON store
    localStorage.setItem(`bloombox_canvas_${newId}`, canvasJson);

    // Copy Versions history mock
    const versions = this.getLocalVersions(id);
    if (versions.length > 0) {
      const copiedVersions = versions.map(v => ({
        ...v,
        id: crypto.randomUUID(),
        bouquet_id: newId,
        created_at: nowStr
      }));
      this.saveLocalVersions(newId, copiedVersions);
    } else if (canvasJson !== '{}') {
      this.saveLocalVersions(newId, [{
        id: crypto.randomUUID(),
        bouquet_id: newId,
        version_number: 1,
        json_snapshot: canvasJson,
        created_at: nowStr
      }]);
    }

    return newId;
  }

  public async deleteDraft(id: string): Promise<void> {
    const nowStr = new Date().toISOString();
    
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('bouquets')
          .update({ is_deleted: true, deleted_at: nowStr, updated_at: nowStr })
          .eq('id', id);

        if (!error) return;
        console.error('Supabase soft delete error:', error);
      } catch (err) {
        console.error('Supabase deleteDraft failed, using local storage:', err);
      }
    }

    // LocalStorage Fallback (Soft Delete!)
    const local = this.getLocalBouquets();
    const target = local.find(b => b.id === id);
    if (target) {
      target.is_deleted = true;
      target.updated_at = nowStr;
      this.saveLocalBouquets(local);
    }
  }

  public async restoreDraft(id: string): Promise<void> {
    const nowStr = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('bouquets')
          .update({ is_deleted: false, deleted_at: null, updated_at: nowStr })
          .eq('id', id);

        if (!error) return;
        console.error('Supabase restore error:', error);
      } catch (err) {
        console.error('Supabase restoreDraft failed, using local storage:', err);
      }
    }

    // LocalStorage Fallback
    const local = this.getLocalBouquets();
    const target = local.find(b => b.id === id);
    if (target) {
      target.is_deleted = false;
      target.updated_at = nowStr;
      this.saveLocalBouquets(local);
    }
  }

  // ----------------------------------------------------
  // AUTO-SAVE & MANUAL PERSISTENCE
  // ----------------------------------------------------

  public async saveBouquet(
    id: string, 
    name: string, 
    status: 'draft' | 'published' | 'archived' | 'scheduled' | 'deleted',
    canvasJson: string,
    objectsList: any[],
    isManual: boolean = false
  ): Promise<void> {
    const nowStr = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        // 1. Update main bouquet metadata
        const { error: metaErr } = await supabase
          .from('bouquets')
          .update({
            name,
            status,
            updated_at: nowStr
          })
          .eq('id', id);

        if (!metaErr) {
          // 2. Relational mappings: Clear existing items and insert new ones
          await supabase
            .from('bouquet_items')
            .delete()
            .eq('bouquet_id', id);

          if (objectsList.length > 0) {
            const itemsToInsert = objectsList.map((obj, index) => {
              // Extract scale (takes scaleX or average)
              const scale = obj.scaleX || 1.0;
              return {
                bouquet_id: id,
                asset_id: obj.assetId && obj.assetId.startsWith('ast-') ? obj.assetId : null,
                flower_type: obj.assetName || obj.type || 'flower',
                color: obj.metadata?.properties?.color || null,
                position_x: obj.left || 0.0,
                position_y: obj.top || 0.0,
                scale,
                rotation: obj.angle || 0.0,
                opacity: obj.opacity !== undefined ? obj.opacity : 1.0,
                z_index: index,
                layer: obj.layer === 'background' || obj.layer === 'foreground' ? obj.layer : 'midground',
                locked: obj.isLockedFlag || false,
                asset_type: obj.category || 'flower',
                asset_category: obj.subcategory || ''
              };
            });

            await supabase
              .from('bouquet_items')
              .insert(itemsToInsert);
          }

          // 3. For Manual Save -> commit version snapshot
          if (isManual) {
            await this.createSupabaseVersion(id, canvasJson);
          }
          return;
        }
        console.error('Supabase saveBouquet error:', metaErr);
      } catch (err) {
        console.error('Supabase saveBouquet failed, writing locally:', err);
      }
    }

    // LocalStorage Fallback
    const local = this.getLocalBouquets();
    let target = local.find(b => b.id === id);
    if (!target) {
      target = {
        id,
        name,
        status,
        share_code: this.generateShareCode(),
        created_at: nowStr,
        updated_at: nowStr,
        is_deleted: false
      };
      local.push(target);
    } else {
      target.name = name;
      target.status = status;
      target.updated_at = nowStr;
    }
    this.saveLocalBouquets(local);

    // Store raw canvas snapshot
    localStorage.setItem(`bloombox_canvas_${id}`, canvasJson);

    // For manual local save, add to versions history
    if (isManual) {
      this.createLocalVersion(id, canvasJson);
    }
  }

  // ----------------------------------------------------
  // VERSION HISTORY MANAGER
  // ----------------------------------------------------

  public async getVersions(bouquetId: string): Promise<BouquetVersion[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bouquet_versions')
          .select('*')
          .eq('bouquet_id', bouquetId)
          .order('version_number', { ascending: false });

        if (!error && data) {
          return data.map(v => ({
            ...v,
            json_snapshot: typeof v.json_snapshot === 'string' 
              ? v.json_snapshot 
              : JSON.stringify(v.json_snapshot)
          })) as BouquetVersion[];
        }
        console.error('Supabase getVersions error:', error);
      } catch (err) {
        console.error('Supabase getVersions failed, loading local versions:', err);
      }
    }

    // LocalStorage Fallback
    return this.getLocalVersions(bouquetId);
  }

  public async restoreVersion(bouquetId: string, versionNumber: number): Promise<string> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bouquet_versions')
          .select('json_snapshot')
          .eq('bouquet_id', bouquetId)
          .eq('version_number', versionNumber)
          .single();

        if (!error && data) {
          const snapshot = typeof data.json_snapshot === 'string'
            ? data.json_snapshot
            : JSON.stringify(data.json_snapshot);
          return snapshot;
        }
        console.error('Supabase restoreVersion single read error:', error);
      } catch (err) {
        console.error('Supabase restoreVersion failed, falling back:', err);
      }
    }

    // LocalStorage Fallback
    const versions = this.getLocalVersions(bouquetId);
    const target = versions.find(v => v.version_number === versionNumber);
    if (target) return target.json_snapshot;
    throw new Error('Version snapshot not found');
  }

  public async deleteVersion(bouquetId: string, versionNumber: number): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('bouquet_versions')
          .delete()
          .eq('bouquet_id', bouquetId)
          .eq('version_number', versionNumber);

        if (!error) return;
        console.error('Supabase deleteVersion error:', error);
      } catch (err) {
        console.error('Supabase deleteVersion failed, using local storage:', err);
      }
    }

    // LocalStorage Fallback
    const versions = this.getLocalVersions(bouquetId);
    const filtered = versions.filter(v => v.version_number !== versionNumber);
    this.saveLocalVersions(bouquetId, filtered);
  }

  private async createSupabaseVersion(bouquetId: string, canvasJson: string) {
    try {
      // Find latest version number
      const { data } = await supabase
        .from('bouquet_versions')
        .select('version_number')
        .eq('bouquet_id', bouquetId)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVer = data && data.length > 0 ? data[0].version_number + 1 : 1;

      await supabase
        .from('bouquet_versions')
        .insert({
          bouquet_id: bouquetId,
          version_number: nextVer,
          json_snapshot: JSON.parse(canvasJson)
        });
    } catch (err) {
      console.error('Failed to insert version on Supabase:', err);
    }
  }

  private createLocalVersion(bouquetId: string, canvasJson: string) {
    const versions = this.getLocalVersions(bouquetId);
    const nextVer = versions.length > 0 
      ? Math.max(...versions.map(v => v.version_number)) + 1 
      : 1;

    const newVersion: BouquetVersion = {
      id: crypto.randomUUID(),
      bouquet_id: bouquetId,
      version_number: nextVer,
      json_snapshot: canvasJson,
      created_at: new Date().toISOString()
    };

    versions.unshift(newVersion); // Put at front
    this.saveLocalVersions(bouquetId, versions);
  }

  // ----------------------------------------------------
  // PUBLISHING
  // ----------------------------------------------------

  public async publishGift(
    id: string, 
    canvasJson: string, 
    giftConfig: any
  ): Promise<{ shareCode: string; publicUrl: string }> {
    let shareCode = '';
    
    // Save version snapshot first
    if (isSupabaseConfigured()) {
      try {
        await this.createSupabaseVersion(id, canvasJson);
      } catch (err) {
        console.error('Failed to create version snapshot on Supabase:', err);
      }
    } else {
      this.createLocalVersion(id, canvasJson);
    }
    
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('bouquets')
          .select('share_code')
          .eq('id', id)
          .single();

        shareCode = data?.share_code || this.generateShareCode();

        const { error } = await supabase
          .from('bouquets')
          .update({
            status: 'published',
            share_code: shareCode,
            gift_config: giftConfig,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (!error) {
          return {
            shareCode,
            publicUrl: this.getShareUrl(shareCode)
          };
        }
      } catch (err) {
        console.error('Supabase gift publish failed, falling back locally:', err);
      }
    }

    // Fallback: LocalStorage
    const local = this.getLocalBouquets();
    const target = local.find(b => b.id === id);
    if (target) {
      target.status = 'published';
      (target as any).gift_config = giftConfig;
      target.updated_at = new Date().toISOString();
      shareCode = target.share_code;
      this.saveLocalBouquets(local);
    } else {
      shareCode = this.generateShareCode();
    }

    return {
      shareCode,
      publicUrl: this.getShareUrl(shareCode)
    };
  }

  public async loadGiftByShareCode(shareCode: string): Promise<{ bouquet: any; canvasJson: string; giftConfig: any } | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: bouquet, error: bError } = await supabase
          .from('bouquets')
          .select('*')
          .eq('share_code', shareCode)
          .single();

        if (!bError && bouquet) {
          // Fetch latest version snapshot
          const { data: version } = await supabase
            .from('bouquet_versions')
            .select('json_snapshot')
            .eq('bouquet_id', bouquet.id)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();

          const canvasJson = version ? JSON.stringify(version.json_snapshot) : '';
          return {
            bouquet,
            canvasJson,
            giftConfig: bouquet.gift_config
          };
        }
      } catch (err) {
        console.error('Supabase loadGiftByShareCode failed:', err);
      }
    }

    // Fallback: LocalStorage
    const local = this.getLocalBouquets();
    const target = local.find(b => b.share_code === shareCode);
    if (target) {
      const versions = this.getLocalVersions(target.id);
      const canvasJson = versions.length > 0 ? versions[0].json_snapshot : '';
      return {
        bouquet: target,
        canvasJson,
        giftConfig: (target as any).gift_config
      };
    }

    return null;
  }

  public async trackView(bouquetId: string, isUnique: boolean): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('bouquet_analytics')
          .insert({
            bouquet_id: bouquetId,
            event_type: 'view',
            is_unique: isUnique,
            created_at: new Date().toISOString()
          });
      } catch {}
    }
    
    // Fallback: LocalStorage
    const key = `bloombox_analytics_${bouquetId}`;
    const stats = this.getLocalAnalytics(bouquetId);
    stats.views = (stats.views || 0) + 1;
    if (isUnique) stats.uniqueVisitors = (stats.uniqueVisitors || 0) + 1;
    localStorage.setItem(key, JSON.stringify(stats));
  }

  public async trackOpenTime(bouquetId: string, seconds: number): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('bouquet_analytics')
          .insert({
            bouquet_id: bouquetId,
            event_type: 'open_time',
            duration_seconds: seconds,
            created_at: new Date().toISOString()
          });
      } catch {}
    }
    
    // Fallback: LocalStorage
    const key = `bloombox_analytics_${bouquetId}`;
    const stats = this.getLocalAnalytics(bouquetId);
    stats.totalOpenTime = (stats.totalOpenTime || 0) + seconds;
    localStorage.setItem(key, JSON.stringify(stats));
  }

  private getLocalAnalytics(bouquetId: string): any {
    if (typeof window === 'undefined') return { views: 0, uniqueVisitors: 0, totalOpenTime: 0 };
    try {
      const data = localStorage.getItem(`bloombox_analytics_${bouquetId}`);
      return data ? JSON.parse(data) : { views: 0, uniqueVisitors: 0, totalOpenTime: 0 };
    } catch {
      return { views: 0, uniqueVisitors: 0, totalOpenTime: 0 };
    }
  }

  // ----------------------------------------------------
  // RECIPIENT INTERACTIONS: REACTIONS & COMMENTS (PHASE 6)
  // ----------------------------------------------------
  
  public async addReaction(bouquetId: string, emoji: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('bouquet_reactions')
          .insert({
            bouquet_id: bouquetId,
            reaction_emoji: emoji,
            created_at: new Date().toISOString()
          });
        if (!error) return true;
      } catch (err) {
        console.error('Supabase addReaction failed, saving locally:', err);
      }
    }
    
    // Fallback: LocalStorage
    const key = `bloombox_reactions_${bouquetId}`;
    const list = this.getLocalReactions(bouquetId);
    list.push(emoji);
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  }

  public getLocalReactions(bouquetId: string): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(`bloombox_reactions_${bouquetId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public async getReactionsCount(bouquetId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = { '❤️': 0, '😍': 0, '🥹': 0, '🎉': 0, '🌸': 0 };
    
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bouquet_reactions')
          .select('reaction_emoji')
          .eq('bouquet_id', bouquetId);
        if (!error && data) {
          data.forEach((r: any) => {
            const emo = r.reaction_emoji;
            if (counts[emo] !== undefined) counts[emo]++;
          });
          return counts;
        }
      } catch (err) {
        console.error('Supabase getReactions failed:', err);
      }
    }
    
    const list = this.getLocalReactions(bouquetId);
    list.forEach(emo => {
      if (counts[emo] !== undefined) counts[emo]++;
    });
    return counts;
  }

  public async addComment(bouquetId: string, name: string, emoji: string, comment: string): Promise<any> {
    const newComment = {
      id: crypto.randomUUID(),
      bouquet_id: bouquetId,
      name: name || 'Anonymous Recipient',
      emoji: emoji || '🌸',
      comment: comment,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bouquet_comments')
          .insert(newComment)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase addComment failed, saving locally:', err);
      }
    }

    // Fallback: LocalStorage
    const key = `bloombox_comments_${bouquetId}`;
    const list = this.getLocalComments(bouquetId);
    list.unshift(newComment);
    localStorage.setItem(key, JSON.stringify(list));
    return newComment;
  }

  public getLocalComments(bouquetId: string): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(`bloombox_comments_${bouquetId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public async getCommentsList(bouquetId: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('bouquet_comments')
          .select('*')
          .eq('bouquet_id', bouquetId)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase getCommentsList failed:', err);
      }
    }
    return this.getLocalComments(bouquetId);
  }

  // ----------------------------------------------------
  // LOCALSTORAGE STORAGE LAYERS (MOCK DATABASE)
  // ----------------------------------------------------

  private getLocalBouquets(): BouquetMetadata[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('bloombox_bouquets');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalBouquets(list: BouquetMetadata[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('bloombox_bouquets', JSON.stringify(list));
  }

  private getLocalVersions(bouquetId: string): BouquetVersion[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(`bloombox_versions_${bouquetId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalVersions(bouquetId: string, list: BouquetVersion[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`bloombox_versions_${bouquetId}`, JSON.stringify(list));
  }
}

export const persistenceService = new PersistenceService();
