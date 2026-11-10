import React from 'react';
import { Feather, Heart, CircleDot } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedHeading } from './AnimatedText';

interface StoryTimelineProps {
  storyPhotos?: {
    story1?: string;
    story2?: string;
    story3?: string;
  };
}

export const StoryTimeline: React.FC<StoryTimelineProps> = ({ storyPhotos }) => {
  return (
    <section className="relative py-24 md:py-32 px-6 bg-ivory-warm overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="font-cinzel text-xs font-bold uppercase tracking-[0.3em] text-gold-700 mb-2">
            Witing Tresna Jalaran Saka Kulina
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-3">
            <AnimatedHeading
              text="Our Love Story"
              highlightWord="Love"
              highlightClassName="text-gold-shimmer"
            />
          </h2>
          <p className="text-stone-600 text-sm">
            How Allah guided our paths from a modest introduction to a sacred promise.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative before:absolute before:top-0 before:bottom-0 before:left-4 md:before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:bg-gradient-to-b before:from-gold-400/30 before:via-gold-500 before:to-gold-400/30 space-y-12">
          {/* Milestone 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col md:flex-row items-start md:items-center justify-between"
          >
            <div className="md:w-5/12 pl-12 md:pl-0 md:text-right">
              <span className="inline-block px-3.5 py-1 rounded-full bg-gold-100 border border-gold-400/40 text-gold-700 text-xs font-cinzel font-semibold mb-2">
                September 2022
              </span>
              <h3 className="font-serif text-2xl font-bold text-keraton-900 mb-2">
                First Encounter at Sekaten
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                By the grace of Allah, our paths first crossed during an Islamic
                architectural heritage exhibition near Masjid Gedhe Kauman,
                Yogyakarta. A respectful conversation sparked an unforgettable bond.
              </p>
            </div>
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border-2 border-gold-500 flex items-center justify-center text-gold-600 shadow-md">
              <Feather className="w-3.5 h-3.5" />
            </div>
            <div className="md:w-5/12 pl-12 md:pl-0 mt-4 md:mt-0 w-full">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-2xl overflow-hidden border border-gold-400/40 h-48 shadow-md bg-white p-1.5"
              >
                <img
                  src={storyPhotos?.story1 || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80"}
                  alt="First Encounter at Sekaten"
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Milestone 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col md:flex-row-reverse items-start md:items-center justify-between"
          >
            <div className="md:w-5/12 pl-12 md:pl-0 md:text-left">
              <span className="inline-block px-3.5 py-1 rounded-full bg-gold-100 border border-gold-400/40 text-gold-700 text-xs font-cinzel font-semibold mb-2">
                August 2024
              </span>
              <h3 className="font-serif text-2xl font-bold text-keraton-900 mb-2">
                Prayers Across Two Cities
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Between Yogyakarta and Surakarta, we grew together in faith and
                mutual respect, seeking guidance through *Istikharah* prayers to
                ensure our intentions were aligned for marriage.
              </p>
            </div>
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border-2 border-gold-500 flex items-center justify-center text-gold-600 shadow-md">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <div className="md:w-5/12 pl-12 md:pl-0 mt-4 md:mt-0 w-full">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-2xl overflow-hidden border border-gold-400/40 h-48 shadow-md bg-white p-1.5"
              >
                <img
                  src={storyPhotos?.story2 || "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=80"}
                  alt="Growing Together"
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Milestone 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col md:flex-row items-start md:items-center justify-between"
          >
            <div className="md:w-5/12 pl-12 md:pl-0 md:text-right">
              <span className="inline-block px-3.5 py-1 rounded-full bg-gold-100 border border-gold-400/40 text-gold-700 text-xs font-cinzel font-semibold mb-2">
                July 2026
              </span>
              <h3 className="font-serif text-2xl font-bold text-keraton-900 mb-2">
                Khitbah &amp; Peningsetan
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Accompanied by both extended families in Laweyan, Surakarta,
                Bagaskara fulfilled the Islamic *Khitbah* and Javanese
                *Peningsetan* ceremony to ask for Sekar’s hand in marriage.
              </p>
            </div>
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border-2 border-gold-500 flex items-center justify-center text-gold-600 shadow-md">
              <CircleDot className="w-3.5 h-3.5" />
            </div>
            <div className="md:w-5/12 pl-12 md:pl-0 mt-4 md:mt-0 w-full">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="rounded-2xl overflow-hidden border border-gold-400/40 h-48 shadow-md bg-white p-1.5"
              >
                <img
                  src={storyPhotos?.story3 || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=700&q=80"}
                  alt="Engagement"
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
