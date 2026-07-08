"use client";

import React, { useState } from 'react';
import { useGiftStore, JourneyMemory, TimelineStyle } from '@/store/useGiftStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Milestone, Calendar, MapPin, Smile } from 'lucide-react';
import { toast } from 'sonner';

const MEMORY_TYPES = [
  'First Meeting',
  'First Coffee',
  'Birthday',
  'Anniversary',
  'Trip',
  'Proposal',
  'Graduation',
  'Achievement',
  'Festival',
  'Random Happy Memory',
  'Custom'
];

const STYLES: { id: TimelineStyle; label: string }[] = [
  { id: 'love', label: '❤️ Love Story' },
  { id: 'friendship', label: '🤝 Friendship Memoir' },
  { id: 'minimal', label: '🔳 Minimal Modern' },
  { id: 'luxury', label: '👑 Golden Luxury' },
  { id: 'scrapbook', label: '✂️ Scrapbook Collage' },
  { id: 'vintage', label: '📜 Antique Vintage' },
  { id: 'floral', label: '🌸 Elegant Floral' }
];

export function TimelineBuilder() {
  const timelineStyle = useGiftStore((s) => s.timelineStyle);
  const setTimelineStyle = useGiftStore((s) => s.setTimelineStyle);
  const memories = useGiftStore((s) => s.journeyMemories);
  const addMemory = useGiftStore((s) => s.addJourneyMemory);
  const removeMemory = useGiftStore((s) => s.removeJourneyMemory);

  // Form states
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('First Meeting');
  const [photoUrl, setPhotoUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [location, setLocation] = useState('');

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !description.trim()) {
      toast.error('Date, Title, and Description are required!');
      return;
    }

    addMemory({
      date,
      title: title.trim(),
      description: description.trim(),
      type,
      photoUrl: photoUrl.trim() || undefined,
      voiceUrl: voiceUrl.trim() || undefined,
      emoji: emoji.trim() || undefined,
      location: location.trim() || undefined
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setPhotoUrl('');
    setVoiceUrl('');
    setEmoji('✨');
    setLocation('');
    toast.success('Memory added to journey!');
  };

  return (
    <div className="space-y-4.5 text-zinc-300 pb-10">
      
      {/* Description info */}
      <div className="p-3 border border-zinc-900 bg-zinc-950/40 rounded-xl space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 uppercase tracking-wider">
          <Milestone className="h-4 w-4" />
          <span>Our Journey Timeline</span>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
          Create an animated memory story page that recipients unbox after opening the letter. This is optional: if left empty, nothing displays.
        </p>
      </div>

      {/* Style selector */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Timeline Theme Style</Label>
        <select
          value={timelineStyle}
          onChange={(e) => setTimelineStyle(e.target.value as TimelineStyle)}
          className="w-full h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none cursor-pointer"
        >
          {STYLES.map(st => (
            <option key={st.id} value={st.id} className="bg-zinc-950 text-zinc-200">
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {/* Add Memory Form */}
      <form onSubmit={handleAddMemory} className="p-3.5 border border-zinc-900 bg-zinc-900/10 rounded-xl space-y-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Add Memory Event</span>

        <div className="grid grid-cols-2 gap-2">
          {/* Event Type */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Event Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-8 px-2 bg-zinc-900 border border-zinc-850 rounded-md text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              {MEMORY_TYPES.map(t => (
                <option key={t} value={t} className="bg-zinc-950 text-zinc-200">{t}</option>
              ))}
            </select>
          </div>

          {/* Event Date */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-8 px-2 bg-zinc-900 border border-zinc-850 rounded-md text-xs text-zinc-200 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Emoji */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Emoji</label>
            <Input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="✨"
              className="h-8 text-center text-xs border-zinc-850 bg-zinc-900 text-zinc-200"
            />
          </div>

          {/* Location */}
          <div className="space-y-1 col-span-2">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Paris Café"
              className="h-8 text-xs border-zinc-850 bg-zinc-900 text-zinc-200"
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-zinc-500 uppercase">Memory Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Day We Sparked"
            className="h-8 text-xs border-zinc-850 bg-zinc-900 text-zinc-200"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-zinc-500 uppercase">Memory Story Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write details of this memory..."
            className="w-full h-16 p-2 text-xs border border-zinc-850 bg-zinc-900 text-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none font-medium leading-relaxed"
          />
        </div>

        {/* Photo URL */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-zinc-500 uppercase">Photo Image URL (Optional)</label>
          <Input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="Image URL (e.g. Unsplash)"
            className="h-8 text-xs border-zinc-850 bg-zinc-900 text-zinc-200"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-8 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-1.5 rounded-lg cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Memory Card
        </Button>
      </form>

      {/* List of existing memories */}
      <div className="space-y-2 border-t border-zinc-900/80 pt-3.5">
        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block pl-0.5">Journey Timeline Cards ({memories.length})</Label>

        {memories.length === 0 ? (
          <p className="text-center text-[10px] text-zinc-600 font-bold py-6">Your timeline is empty. Add a memory above!</p>
        ) : (
          <div className="space-y-2">
            {memories.map((m) => (
              <div 
                key={m.id}
                className="p-3 border border-zinc-900 bg-zinc-900/20 rounded-xl flex items-center justify-between gap-3"
              >
                <span className="text-2xl shrink-0 select-none">{m.emoji || '✨'}</span>
                <div className="flex-1 min-w-0 text-left">
                  <h6 className="text-xs font-bold text-zinc-200 truncate">{m.title}</h6>
                  <p className="text-[9px] font-bold text-zinc-500 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-2.5 w-2.5" />
                    <span>{m.date}</span>
                    {m.location && (
                      <>
                        <MapPin className="h-2.5 w-2.5 ml-1" />
                        <span className="truncate max-w-[90px]">{m.location}</span>
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => removeMemory(m.id)}
                  className="text-zinc-500 hover:text-rose-400 cursor-pointer p-1 rounded hover:bg-rose-950/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
export default TimelineBuilder;
