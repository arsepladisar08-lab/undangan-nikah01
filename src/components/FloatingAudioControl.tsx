import React, { useState } from 'react';
import { Disc3, VolumeX, Music, Youtube, Volume2 } from 'lucide-react';
import { AudioSourceMode } from '../types/audio';
import { getAudioControlDisplay } from '../utils/muteController';

interface FloatingAudioControlProps {
  isPlaying: boolean;
  isMuted?: boolean;
  onToggle: () => void;
  visible: boolean;
  trackTitle?: string;
  mode?: AudioSourceMode;
}

export const FloatingAudioControl: React.FC<FloatingAudioControlProps> = ({
  isPlaying,
  isMuted = false,
  onToggle,
  visible,
  trackTitle = 'Gamelan Slendro Ambience',
  mode = 'gamelan',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!visible) return null;

  const display = getAudioControlDisplay(isPlaying, isMuted, trackTitle);

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-500"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Animated Track Pill (Visible when active or on hover) */}
      {(isPlaying || showTooltip) && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-keraton-950/90 backdrop-blur-md border border-gold-400/40 text-gold-200 text-xs shadow-lg animate-in fade-in slide-in-from-right-2 duration-300 max-w-[280px]">
          {mode === 'youtube' ? (
            <Youtube className="w-3.5 h-3.5 text-red-400 shrink-0" />
          ) : (
            <Music className="w-3.5 h-3.5 text-gold-400 shrink-0" />
          )}

          <div className="flex flex-col min-w-0">
            <span className="truncate font-serif text-[11px] font-medium" title={trackTitle}>
              {display.pillText}
            </span>
            {isMuted && isPlaying && (
              <span className="text-[9px] text-gold-400/80 font-sans tracking-wide">
                Volume 0% • Latar Belakang
              </span>
            )}
          </div>

          {isPlaying && !isMuted ? (
            <span className="flex items-end gap-0.5 h-2.5 shrink-0 ml-1">
              <span className="w-0.5 h-2 bg-gold-400 animate-pulse" />
              <span className="w-0.5 h-3 bg-gold-300 animate-pulse delay-75" />
              <span className="w-0.5 h-1.5 bg-gold-400 animate-pulse delay-150" />
            </span>
          ) : isPlaying && isMuted ? (
            <span className="shrink-0 text-[10px] text-stone-400 font-mono ml-1 px-1.5 py-0.2 rounded bg-stone-800 border border-stone-700">
              0%
            </span>
          ) : null}
        </div>
      )}

      {/* Main Circular Mute/Unmute Button */}
      <button
        onClick={onToggle}
        aria-label={display.buttonLabel}
        title={display.buttonTitle}
        className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer group relative ${
          isMuted
            ? 'bg-stone-900/90 border-stone-600 text-stone-300 hover:border-gold-400 hover:text-gold-200'
            : 'bg-white/95 border-gold-400 text-gold-600'
        }`}
      >
        {isPlaying ? (
          isMuted ? (
            <>
              {/* Spinning background track ring to show music continues in background */}
              <div className="absolute inset-0 rounded-full border border-dashed border-stone-600 animate-[spin_10s_linear_infinite] opacity-60" />
              <VolumeX className="w-5 h-5 text-stone-300 group-hover:text-gold-300 transition-colors" />
              <span
                className="absolute -top-1 -right-1 px-1 py-0.2 bg-stone-700 text-stone-200 text-[9px] font-mono rounded-full border border-stone-500 font-bold"
                title="Suara diheningkan (0%)"
              >
                0%
              </span>
            </>
          ) : (
            <>
              <Disc3 className="w-6 h-6 animate-spin text-gold-600" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </>
          )
        ) : (
          <Volume2 className="w-5 h-5 text-stone-500 group-hover:text-gold-700" />
        )}
      </button>
    </div>
  );
};
