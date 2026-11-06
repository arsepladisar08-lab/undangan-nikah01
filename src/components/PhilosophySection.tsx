import React from 'react';
import { BookOpen, Diamond } from 'lucide-react';
import { AnimatedLoopingMandala } from './AnimatedLoopingMandala';
import { AnimatedHeading } from './AnimatedText';
import { motion } from 'motion/react';

export const PhilosophySection: React.FC = () => {
  return (
    <section
      id="philosophy-section"
      className="relative py-24 md:py-32 px-6 overflow-hidden bg-ivory-warm border-y border-gold-300/40"
    >
      {/* Decorative Parallax Ornaments */}
      <div className="absolute top-10 left-8 w-28 h-28 rounded-full border border-gold-500/20 pointer-events-none" />
      <div className="absolute bottom-10 right-8 w-40 h-40 rounded-full border border-gold-500/15 pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Quran Icon Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-white border border-gold-400/50 text-gold-600 shadow-sm"
        >
          <BookOpen className="w-6 h-6" />
        </motion.div>

        <p className="font-cinzel text-xs font-bold uppercase tracking-[0.3em] text-gold-700 mb-3">
          Divine Blessing • Surah Ar-Rum Verse 21
        </p>

        <blockquote className="font-serif italic text-xl sm:text-2xl md:text-3xl text-keraton-900 font-semibold mb-8 leading-relaxed max-w-3xl">
          “And of His signs is that He created for you from yourselves mates that
          you may find tranquility in them; and He placed between you affection
          and mercy. Indeed in that are signs for a people who give thought.”
        </blockquote>

        {/* Featured Sacred Looping Object: Cakra Asthabrata Mandala */}
        <div className="my-10">
          <AnimatedLoopingMandala size={260} interactive={true} />
        </div>

        <div className="my-6 flex items-center justify-center gap-4 text-gold-500">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500" />
          <Diamond className="w-3 h-3 fill-gold-500" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500" />
        </div>

        <h3 className="font-serif italic text-xl sm:text-2xl text-gold-700 font-semibold mb-3">
          <AnimatedHeading
            text="“Memayu Hayuning Keluarga, Nggayuh Ridhaning Gusti Allah”"
            highlightWord="Memayu"
            highlightClassName="text-gold-shimmer"
          />
        </h3>

        <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Rooted in Islamic faith and noble Javanese heritage, our marriage is a
          sacred prayer to build a peaceful sanctuary blessed with *Sakinah,
          Mawaddah, wa Rahmah* under the grace of Allah Subhanahu Wa Ta'ala.
        </p>
      </div>
    </section>
  );
};
