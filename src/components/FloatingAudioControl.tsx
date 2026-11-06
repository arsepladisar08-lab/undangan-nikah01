import React from 'react';
import { Disc3, VolumeX } from 'lucide-react';

interface FloatingAudioControlProps {
  isPlaying: boolean;
  onToggle: () => void;
  visible: boolean;
}

export const FloatingAudioControl: React.FC<FloatingAudioControlProps> = ({
  isPlaying,
  onToggle,
  visible,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onToggle}
        aria-label={isPlaying ? 'Pause Gamelan Ambience' : 'Play Gamelan Ambience'}
        className="w-12 h-12 rounded-full bg-white/95 border border-gold-400 text-gold-600 flex items-center justify-center shadow-xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer group"
      >
        {isPlaying ? (
          <Disc3 className="w-6 h-6 animate-spin text-gold-600" />
        ) : (
          <VolumeX className="w-5 h-5 text-stone-500" />
        )}
      </button>
    </div>
  );
};
