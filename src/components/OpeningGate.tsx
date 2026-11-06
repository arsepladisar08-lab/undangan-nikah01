import React from 'react';
import { GununganSvg } from './GununganSvg';
import { MailOpen, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface OpeningGateProps {
  isOpen: boolean;
  onOpen: () => void;
  guestName: string;
}

export const OpeningGate: React.FC<OpeningGateProps> = ({
  isOpen,
  onOpen,
  guestName,
}) => {
  return (
    <div
      id="invitation-gate"
      className={`fixed inset-0 z-50 bg-batik-light flex flex-col items-center justify-between p-5 sm:p-10 text-center overflow-y-auto transition-all duration-1000 ease-in-out ${
        isOpen
          ? '-translate-y-full opacity-0 pointer-events-none invisible'
          : 'translate-y-0 opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-hidden={isOpen}
      aria-label="Wedding Invitation Envelope"
    >
      {/* Soft Radial Sunlight Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_10%,rgba(246,240,228,0.94)_95%)] pointer-events-none" />

      {/* Subtle Background Rotating Celestial Ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[38rem] h-[38rem] rounded-full border border-dashed border-gold-400 animate-spin-slow" />
        <div className="absolute w-[28rem] h-[28rem] rounded-full border border-dotted border-gold-500 animate-spin-reverse-slow" />
      </div>

      {/* Ornamental Corners Top */}
      <div className="w-full max-w-5xl flex justify-between items-start z-10">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-t-2 border-l-2 border-gold-500/60 rounded-tl-xl" />
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-cinzel text-[11px] sm:text-xs tracking-[0.35em] text-gold-700 uppercase pt-2 font-semibold"
        >
          Walimatul 'Ursy • Pawiwahan Agung
        </motion.p>
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-t-2 border-r-2 border-gold-500/60 rounded-tr-xl" />
      </div>

      {/* Center Content */}
      <div className="relative z-10 max-w-xl mx-auto my-auto py-4 flex flex-col items-center">
        {/* Animated Gunungan with gentle floating motion */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-28 h-36 sm:w-36 sm:h-48 mb-3 animate-float"
        >
          <GununganSvg glow />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-serif italic text-gold-700 text-sm sm:text-base mb-1"
        >
          Bismillahirrahmanirrahim
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-stone-600 mb-2 font-medium"
        >
          The Sacred Islamic Wedding Of
        </motion.p>

        {/* Animated Gold Shimmer Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="font-serif text-4xl sm:text-6xl font-bold text-gold-shimmer tracking-wide mb-2"
        >
          Bagaskara &amp; Sekar
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="font-serif italic text-stone-600 text-base sm:text-lg mb-5"
        >
          Saturday, December 12th, 2026 — Yogyakarta
        </motion.p>

        {/* Guest Name Card with Sheen Micro-interaction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7 }}
          whileHover={{ scale: 1.02 }}
          className="w-full max-w-sm card-luxury-light card-sheen rounded-2xl p-5 mb-6 backdrop-blur-md"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Dear Honored Guest</span>
            <Sparkles className="w-3 h-3" />
          </p>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-keraton-900 break-words">
            {guestName || 'Keluarga Besar Bapak K.R.T. H. Suryo Diningrat'}
          </h2>
          <p className="text-[11px] text-stone-500 mt-1 italic">
            We sincerely apologize for any misspelling of names or titles
          </p>
        </motion.div>

        {/* Animated Button with Micro-interactions */}
        <motion.button
          onClick={onOpen}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: '0 15px 35px rgba(143,100,25,0.45)' }}
          whileTap={{ scale: 0.96 }}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-white font-semibold text-xs sm:text-sm tracking-widest uppercase shadow-[0_10px_25px_rgba(143,100,25,0.35)] transition-all duration-300 cursor-pointer"
          aria-label="Open wedding invitation"
        >
          <MailOpen className="w-4 h-4 transition-transform group-hover:-rotate-12 duration-300" />
          <span>Open Invitation</span>
        </motion.button>
      </div>

      {/* Bottom Corners */}
      <div className="w-full max-w-5xl flex justify-between items-end z-10">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-b-2 border-l-2 border-gold-500/60 rounded-bl-xl" />
        <p className="text-[11px] tracking-widest text-gold-700/80 uppercase pb-1 font-medium">
          Yogyakarta • Surakarta
        </p>
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-b-2 border-r-2 border-gold-500/60 rounded-br-xl" />
      </div>
    </div>
  );
};
