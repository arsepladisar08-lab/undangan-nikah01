import React from 'react';
import { GalleryItem } from '../types/wedding';
import { Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedHeading } from './AnimatedText';

interface GallerySectionProps {
  onOpenLightbox: (src: string, caption: string) => void;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    chapter: 'Chapter I',
    title: 'Royal Heritage',
    src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
    caption: 'Royal Heritage Portrait — Kraton Yogyakarta',
    speed: 0.06,
  },
  {
    id: '2',
    chapter: 'Chapter II',
    title: 'Sacred Promise',
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    caption: 'Sacred Promise — Pendopo Ambarrukmo',
    speed: -0.05,
  },
  {
    id: '3',
    chapter: 'Chapter III',
    title: 'Golden Hour Blessings',
    src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
    caption: 'Golden Hour Blessings — Taman Sari',
    speed: 0.06,
  },
  {
    id: '4',
    chapter: 'Chapter IV',
    title: 'Timeless Devotion',
    src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
    caption: 'Timeless Devotion — Laweyan Surakarta',
    speed: -0.05,
  },
  {
    id: '5',
    chapter: 'Chapter V',
    title: 'The Khitbah Rings',
    src: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85',
    caption: 'The Khitbah Rings — Surakarta',
    speed: 0.06,
  },
  {
    id: '6',
    chapter: 'Chapter VI',
    title: 'Toward Forever',
    src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=85',
    caption: 'Walking Toward Forever — Yogyakarta',
    speed: -0.05,
  },
];

export const GallerySection: React.FC<GallerySectionProps> = ({ onOpenLightbox }) => {
  return (
    <section id="gallery-section" className="relative py-24 md:py-32 px-6 bg-ivory-warm border-t border-gold-300/40 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <p className="font-cinzel text-xs font-bold uppercase tracking-[0.3em] text-gold-700 mb-2">
            Captured Moments
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-3">
            <AnimatedHeading
              text="Portrait of Us"
              highlightWord="Portrait"
              highlightClassName="text-gold-shimmer"
            />
          </h2>
          <p className="text-stone-600 text-sm">
            Every frame tells a story of gratitude, patience, and blessings leading
            up to our sacred day.
          </p>
        </div>

        {/* Responsive Grid with Staggered Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 items-stretch">
          {GALLERY_ITEMS.map((item, idx) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: idx * 0.08 }}
              whileHover={{ y: -7, scale: 1.015 }}
              onClick={() => onOpenLightbox(item.src, item.caption)}
              className="card-luxury-light card-sheen rounded-3xl p-3 flex flex-col justify-between group cursor-pointer shadow-md transition-shadow"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenLightbox(item.src, item.caption);
                }
              }}
              aria-label={`View photo: ${item.caption}`}
            >
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-ivory">
                <img
                  src={item.src}
                  alt={item.caption}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-keraton-950/65 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[10px] font-cinzel tracking-widest uppercase text-gold-200 block">
                      {item.chapter}
                    </span>
                    <h3 className="font-serif text-xl font-semibold">
                      {item.title}
                    </h3>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs group-hover:bg-gold-500 group-hover:text-white transition-colors">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
