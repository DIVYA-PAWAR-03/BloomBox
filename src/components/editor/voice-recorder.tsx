"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useGiftStore } from '@/store/useGiftStore';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, RotateCcw, Upload, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function VoiceRecorder() {
  const voiceUrl = useGiftStore((s) => s.voiceUrl);
  const setVoiceUrl = useGiftStore((s) => s.setVoiceUrl);
  const setVoiceDuration = useGiftStore((s) => s.setVoiceDuration);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playVolume, setPlayVolume] = useState(0.8);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Real-time canvas waveform visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Track recording duration timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Canvas visualizer animation loop
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#f43f5e'; // Rose pink wave
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };

  // Start recording
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 1. Setup AudioContext for visualization
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // 2. Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setVoiceUrl(audioUrl);
        setVoiceDuration(recordTime);
        
        // Clean up visualizer stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordTime(0);
      toast.success('Recording started...');

      // Start visualizer loop
      setTimeout(drawWaveform, 100);
    } catch (err) {
      console.error('Error starting voice recorder:', err);
      toast.error('Permission to use microphone was denied');
    }
  };

  // Pause / Resume recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        toast('Recording resumed');
        // Restart visualizer loop
        drawWaveform();
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        toast('Recording paused');
        // Cancel visualizer loop
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      toast.success('Recording saved!');
    }
  };

  // Play / Pause playback
  const togglePlay = () => {
    if (!voiceUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(voiceUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Mute / Unmute playback
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Volume slider changer
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setPlayVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // Discard recording
  const discardRecording = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = null;
    setVoiceUrl(null);
    setVoiceDuration(0);
    setIsPlaying(false);
    setRecordTime(0);
    toast('Voice message cleared');
  };

  // Handle local audio file upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    if (fileType.includes('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.m4a')) {
      const url = URL.createObjectURL(file);
      setVoiceUrl(url);
      
      // Attempt to read audio duration
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        setVoiceDuration(Math.round(audio.duration));
      };

      toast.success('Audio file uploaded!');
    } else {
      toast.error('Unsupported audio file format');
    }
  };

  // Clean up hooks on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Format recording durations into readable MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-3 border border-zinc-900 bg-zinc-950/60 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-0.5">Voice Attachment</span>
        {voiceUrl && (
          <Button
            onClick={discardRecording}
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {!voiceUrl ? (
        <div className="space-y-3">
          {/* Recorder Interface */}
          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-800 bg-zinc-900/10 rounded-lg space-y-3">
            
            {/* Visualizer canvas */}
            {isRecording ? (
              <canvas 
                ref={canvasRef} 
                width={200} 
                height={40} 
                className="w-full max-w-[200px] h-10 rounded bg-zinc-950 border border-zinc-900"
              />
            ) : (
              <Mic className="h-8 w-8 text-zinc-500 animate-pulse" />
            )}

            <div className="text-sm font-mono font-bold text-zinc-300">
              {formatTime(recordTime)}
            </div>

            <div className="flex items-center gap-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  <Mic className="h-3.5 w-3.5" />
                  Record
                </Button>
              ) : (
                <>
                  <Button
                    onClick={pauseRecording}
                    variant="outline"
                    className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-850 hover:text-white text-xs px-2.5 h-8 rounded-lg cursor-pointer"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    onClick={stopRecording}
                    className="bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs gap-1.5 px-3 py-1.5 h-8 rounded-lg cursor-pointer"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Upload fallback interface */}
          <div className="flex justify-center">
            <label className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all select-none">
              <Upload className="h-3.5 w-3.5" />
              Upload Audio (MP3/WAV)
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a"
                onChange={handleAudioUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        /* Player Interface */
        <div className="p-3 border border-zinc-900 bg-zinc-900/20 rounded-lg space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Button
              onClick={togglePlay}
              size="icon"
              className="h-8 w-8 bg-rose-600 hover:bg-rose-500 text-white rounded-full shrink-0 cursor-pointer"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current pl-0.5" />}
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-zinc-200">Voice Note Attached</div>
              <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">Duration: {formatTime(recordTime || 3)}</div>
            </div>

            {/* Mute button */}
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-white cursor-pointer"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2 pt-1">
            <Volume2 className="h-3 w-3 text-zinc-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={playVolume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
export default VoiceRecorder;
