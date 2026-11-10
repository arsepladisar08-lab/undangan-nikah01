import React, { useState } from 'react';
import { Disc3, VolumeX, Music, Youtube } from 'lucide-react';
import { AudioSourceMode } from '../types/audio';

interface FloatingAudioControlProps {
  isPlaying: boolean;
  onToggle: () => void;
  visible: boolean;
  trackTitle?: string;
  mode?: AudioSourceMode;
}

export const FloatingAudioControl: React.FC<FloatingAudioControlProps> = ({
  isPlaying,
  onToggle,
  visible,
  trackTitle = 'Gamelan Slendro Ambience',
  mode = 'gamelan',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-500"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Animated Track Pill (Visible when playing or on hover) */}
      {(isPlaying || showTooltip) && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-keraton-950/85 backdrop-blur-md border border-gold-400/40 text-gold-200 text-xs shadow-lg animate-in fade-in slide-in-from-right-2 duration-300 max-w-[240px]">
          {mode === 'youtube' ? (
            <Youtube className="w-3.5 h-3.5 text-red-400 shrink-0" />
          ) : (
            <Music className="w-3.5 h-3.5 text-gold-400 shrink-0" />
          )}
          <span className="truncate font-serif text-[11px]" title={trackTitle}>
            {isPlaying ? trackTitle : 'Audio Dijeda'}
          </span>
          {isPlaying && (
            <span className="flex items-end gap-0.5 h-2.5 shrink-0 ml-1">
              <span className="w-0.5 h-2 bg-gold-400 animate-pulse" />
              <span className="w-0.5 h-3 bg-gold-300 animate-pulse delay-75" />
              <span className="w-0.5 h-1.5 bg-gold-400 animate-pulse delay-150" />
            </span>
          )}
        </div>
      )}

      {/* Main Circular Toggle Button */}
      <button
        onClick={onToggle}
        aria-label={isPlaying ? 'Jeda Pengiring Musik' : 'Putar Pengiring Musik'}
        title={isPlaying ? `Jeda Musik (${trackTitle})` : `Putar Musik (${trackTitle})`}
        className="w-12 h-12 rounded-full bg-white/95 border border-gold-400 text-gold-600 flex items-center justify-center shadow-xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer group relative"
      >
        {isPlaying ? (
          <>
            <Disc3 className="w-6 h-6 animate-spin text-gold-600" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </>
        ) : (
          <VolumeX className="w-5 h-5 text-stone-500 group-hover:text-gold-700" />
        )}
      </button>
    </div>
  );
};
