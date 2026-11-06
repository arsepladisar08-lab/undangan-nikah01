import React from 'react';
import { GununganSvg } from './GununganSvg';
import { MapPin, Instagram } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedHeading } from './AnimatedText';

export const CoupleSection: React.FC = () => {
  return (
    <section id="couple-section" className="relative py-24 md:py-32 px-6 bg-batik-light overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-1/3 left-0 right-0 text-center pointer-events-none select-none opacity-[0.04]">
        <span className="font-cinzel text-[5rem] sm:text-[9rem] md:text-[13rem] font-bold tracking-widest uppercase text-gold-700">
          WALIMATUL URSY
        </span>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-serif italic text-xl sm:text-2xl text-gold-700 font-semibold mb-2">
            Assalamu’alaikum Warahmatullahi Wabarakatuh
          </p>
          <p className="font-cinzel text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 mb-3">
            Peace, Mercy, and Blessings of Allah Be Upon You
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            <AnimatedHeading
              text="The Bride & The Groom"
              highlightWord="Bride"
              highlightClassName="text-gold-shimmer"
            />
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            With complete gratitude to Allah Subhanahu Wa Ta'ala, we cordially
            invite you to witness and bless the sacred Islamic marriage of our
            beloved children:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-11 gap-10 lg:gap-8 items-center">
          {/* THE GROOM */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="card-luxury-light card-sheen rounded-3xl p-8 sm:p-10 text-center backdrop-blur-md relative overflow-hidden group shadow-md"
            >
              <div className="w-44 h-56 mx-auto mb-6 rounded-t-full rounded-b-2xl p-2 border-2 border-gold-400/60 bg-ivory relative shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80"
                  alt="Raden Mas Bagaskara"
                  className="w-full h-full object-cover rounded-t-full rounded-b-xl group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gold-600 text-white font-cinzel font-bold text-[10px] tracking-widest uppercase px-4 py-1 rounded-full shadow">
                  The Groom
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gold-100 text-gold-700 text-[11px] font-semibold mb-2">
                <span>Muslim</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-keraton-900 mb-2">
                Raden Mas Bagaskara Adi Nugraha, S.Ars., M.T.
              </h3>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 mb-4">
                First Son Of
              </p>
              <div className="bg-ivory-warm border border-gold-300/60 rounded-2xl p-4 mb-6 text-stone-800">
                <p className="font-serif text-base sm:text-lg text-keraton-900 font-bold">
                  Bapak K.R.T. H. Hendrawan Adi Kusumo
                </p>
                <p className="text-xs text-gold-600 font-semibold my-1">&amp;</p>
                <p className="font-serif text-base sm:text-lg text-keraton-900 font-bold">
                  Ibu R.Ay. Hj. Sri Sulastri Ningrum
                </p>
                <p className="text-xs text-stone-600 mt-2 flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-600 inline" />
                  <span>Kraton, Daerah Istimewa Yogyakarta</span>
                </p>
              </div>

              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gold-700 hover:text-white hover:bg-gold-600 border border-gold-400/60 px-5 py-2.5 rounded-full transition-colors cursor-pointer"
                aria-label="Instagram profile of Raden Mas Bagaskara"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@bagaskara.adinugraha</span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* CENTER GUNUNGAN DIVIDER WITH BREATHE ANIMATION */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="w-20 h-28"
            >
              <GununganSvg glow />
            </motion.div>
            <span className="font-serif italic text-4xl text-gold-600 font-bold my-1">
              &amp;
            </span>
          </div>

          {/* THE BRIDE */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="card-luxury-light card-sheen rounded-3xl p-8 sm:p-10 text-center backdrop-blur-md relative overflow-hidden group shadow-md"
            >
              <div className="w-44 h-56 mx-auto mb-6 rounded-t-full rounded-b-2xl p-2 border-2 border-gold-400/60 bg-ivory relative shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80"
                  alt="Roro Sekar Arum"
                  className="w-full h-full object-cover rounded-t-full rounded-b-xl group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gold-600 text-white font-cinzel font-bold text-[10px] tracking-widest uppercase px-4 py-1 rounded-full shadow">
                  The Bride
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gold-100 text-gold-700 text-[11px] font-semibold mb-2">
                <span>Muslimah</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-keraton-900 mb-2">
                Roro Sekar Arum Kusumawardhani, S.Psi.
              </h3>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 mb-4">
                Youngest Daughter Of
              </p>
              <div className="bg-ivory-warm border border-gold-300/60 rounded-2xl p-4 mb-6 text-stone-800">
                <p className="font-serif text-base sm:text-lg text-keraton-900 font-bold">
                  Bapak Drs. H. Bambang Suryo Baskoro, M.Hum.
                </p>
                <p className="text-xs text-gold-600 font-semibold my-1">&amp;</p>
                <p className="font-serif text-base sm:text-lg text-keraton-900 font-bold">
                  Ibu Dra. Hj. Endang Retno Palupi
                </p>
                <p className="text-xs text-stone-600 mt-2 flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-600 inline" />
                  <span>Laweyan, Kota Surakarta (Solo)</span>
                </p>
              </div>

              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gold-700 hover:text-white hover:bg-gold-600 border border-gold-400/60 px-5 py-2.5 rounded-full transition-colors cursor-pointer"
                aria-label="Instagram profile of Roro Sekar"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@sekar.kusumawardhani</span>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
