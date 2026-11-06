import React from 'react';
import { VenueDetail } from '../types/wedding';
import { Landmark, Crown, Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedHeading } from './AnimatedText';

interface EventsSectionProps {
  onOpenMapModal: (venue: VenueDetail) => void;
}

export const VENUE_AKAD: VenueDetail = {
  title: 'Pendopo Agung Kedhaton Ambarrukmo',
  type: 'Sacred Islamic Vows (Ijab Qabul)',
  date: 'Saturday, December 12th, 2026',
  time: '08:00 AM — 10:30 AM WIB',
  placeName: 'Pendopo Agung Kedhaton Ambarrukmo',
  address: 'Jl. Laksda Adisucipto No. 81, Ambarukmo, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281',
  coordinates: '-7.7828° S, 110.4026° E',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pendopo+Agung+Kedhaton+Ambarrukmo+Yogyakarta',
};

export const VENUE_RECEPTION: VenueDetail = {
  title: 'Kasultanan Ballroom — Royal Ambarrukmo Yogyakarta',
  type: 'Royal Reception Banquet',
  date: 'Saturday, December 12th, 2026',
  time: '06:30 PM — 09:30 PM WIB',
  placeName: 'Kasultanan Ballroom — Royal Ambarrukmo Yogyakarta',
  address: 'Jl. Laksda Adisucipto No. 81, Ambarukmo, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281',
  coordinates: '-7.7828° S, 110.4026° E',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Royal+Ambarrukmo+Yogyakarta+Kasultanan+Ballroom',
};

export const EventsSection: React.FC<EventsSectionProps> = ({ onOpenMapModal }) => {
  return (
    <section id="event-section" className="relative py-24 md:py-32 px-6 bg-batik-light overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-cinzel text-xs font-bold uppercase tracking-[0.3em] text-gold-700 mb-2">
            InshaAllah • Sacred Procession
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            <AnimatedHeading
              text="Wedding Events"
              highlightWord="Events"
              highlightClassName="text-gold-shimmer"
            />
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            By seeking the grace and pleasure of Allah SWT, we warmly welcome your
            presence and prayers at our marriage ceremonies:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AKAD NIKAH CARD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -6 }}
            className="card-luxury-light card-sheen rounded-3xl p-8 sm:p-10 text-center backdrop-blur-md flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gold-100 border border-gold-400/50 flex items-center justify-center text-gold-700">
                <Landmark className="w-6 h-6" />
              </div>
              <p className="font-cinzel text-xs font-bold uppercase tracking-[0.25em] text-gold-600 mb-1">
                Sacred Islamic Vows (Ijab Qabul)
              </p>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-keraton-900 mb-6">
                Akad Nikah &amp; Upacara Panggih
              </h3>

              <div className="space-y-3 py-5 border-y border-gold-300/60 mb-6 bg-ivory-warm/60 rounded-2xl">
                <p className="font-serif text-xl text-keraton-900 font-bold flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-gold-600" />
                  <span>Saturday, December 12th, 2026</span>
                </p>
                <p className="text-sm text-gold-700 font-semibold flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-gold-600" />
                  <span>08:00 AM — 10:30 AM WIB</span>
                </p>
              </div>

              <h4 className="font-serif text-xl font-bold text-keraton-900 mb-1">
                Pendopo Agung Kedhaton Ambarrukmo
              </h4>
              <p className="text-sm text-stone-600 leading-relaxed mb-8">
                Jl. Laksda Adisucipto No. 81, Ambarukmo, Caturtunggal, Kec. Depok,
                Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281
              </p>
            </div>

            <motion.button
              onClick={() => onOpenMapModal(VENUE_AKAD)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="w-full py-3.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              aria-label="View Akad Nikah Location Map"
            >
              <MapPin className="w-4 h-4" />
              <span>View Location Map</span>
            </motion.button>
          </motion.div>

          {/* WALIMATUL URSY / RECEPTION CARD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            whileHover={{ y: -6 }}
            className="card-luxury-light card-sheen rounded-3xl p-8 sm:p-10 text-center backdrop-blur-md flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gold-100 border border-gold-400/50 flex items-center justify-center text-gold-700">
                <Crown className="w-6 h-6" />
              </div>
              <p className="font-cinzel text-xs font-bold uppercase tracking-[0.25em] text-gold-600 mb-1">
                Royal Reception Banquet
              </p>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-keraton-900 mb-6">
                Walimatul 'Ursy &amp; Pahargyan Agung
              </h3>

              <div className="space-y-3 py-5 border-y border-gold-300/60 mb-6 bg-ivory-warm/60 rounded-2xl">
                <p className="font-serif text-xl text-keraton-900 font-bold flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-gold-600" />
                  <span>Saturday, December 12th, 2026</span>
                </p>
                <p className="text-sm text-gold-700 font-semibold flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-gold-600" />
                  <span>06:30 PM — 09:30 PM WIB</span>
                </p>
              </div>

              <h4 className="font-serif text-xl font-bold text-keraton-900 mb-1">
                Kasultanan Ballroom — Royal Ambarrukmo Yogyakarta
              </h4>
              <p className="text-sm text-stone-600 leading-relaxed mb-8">
                Jl. Laksda Adisucipto No. 81, Ambarukmo, Caturtunggal, Kec. Depok,
                Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281
              </p>
            </div>

            <motion.button
              onClick={() => onOpenMapModal(VENUE_RECEPTION)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="w-full py-3.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              aria-label="View Reception Location Map"
            >
              <MapPin className="w-4 h-4" />
              <span>View Location Map</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Modest & Traditional Dresscode Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 card-luxury-light card-sheen rounded-2xl p-6 text-center max-w-3xl mx-auto"
        >
          <p className="font-cinzel text-xs font-bold uppercase tracking-[0.25em] text-gold-700 mb-2">
            Modest &amp; Traditional Attire Guide
          </p>
          <p className="text-sm text-stone-600">
            We warmly encourage our honored guests to wear{' '}
            <span className="text-keraton-900 font-semibold">
              Modest Traditional Javanese Attire (Kebaya Muslimah / Beskap / Batik
              Nusantara)
            </span>{' '}
            or{' '}
            <span className="text-keraton-900 font-semibold">
              Modest Formal Wear
            </span>{' '}
            in Ivory, Warm Earth, or Champagne Gold tones.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
