import React from 'react';
import { GununganSvg } from './GununganSvg';
import { motion } from 'motion/react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-16 px-6 bg-batik-light border-t border-gold-300/60 text-center relative overflow-hidden">
      {/* Background Subtle Rotating Asthabrata Ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <div className="w-[30rem] h-[30rem] rounded-full border border-dashed border-gold-500 animate-spin-slow" />
      </div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="w-20 h-28 mx-auto mb-4 relative z-10"
      >
        <GununganSvg glow />
      </motion.div>

      <p className="font-serif italic text-lg text-gold-700 font-semibold mb-1 relative z-10">
        Wassalamu’alaikum Warahmatullahi Wabarakatuh
      </p>
      <p className="text-xs uppercase tracking-[0.3em] text-stone-500 mb-3 relative z-10">
        With Our Deepest Gratitude
      </p>
      <h2 className="font-serif text-4xl font-bold text-gold-shimmer mb-4 relative z-10">
        Bagaskara &amp; Sekar
      </h2>
      <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed font-medium relative z-10">
        Keluarga Besar Bapak K.R.T. H. Hendrawan Adi Kusumo &amp; Keluarga Besar
        Bapak Drs. H. Bambang Suryo Baskoro
      </p>
      <div className="mt-8 pt-6 border-t border-gold-200/50 text-[11px] text-stone-400 relative z-10">
        © 2026 Bagaskara &amp; Sekar Wedding. All rights reserved.
      </div>
    </footer>
  );
};
