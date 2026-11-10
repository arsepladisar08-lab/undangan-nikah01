import React, { useState, useEffect } from 'react';
import { WishItem } from '../types/wedding';
import { Send, CheckCircle2, MessageSquareHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedHeading } from './AnimatedText';
import {
  getAppsScriptUrl,
  saveRsvpToAppsScript,
  fetchRsvpFromAppsScript,
} from '../utils/appsScriptClient';

interface RsvpWishesSectionProps {
  onShowToast: (msg: string) => void;
}

const INITIAL_WISHES: WishItem[] = [
  {
    id: 'w1',
    name: 'K.R.T. H. Wicaksono Hadiningrat',
    attendance: 'InshaAllah Attending',
    guestCount: '2 Persons',
    message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair. May Allah bless your household with eternal Sakinah, Mawaddah, wa Rahmah.",
    timestamp: 'Yesterday',
  },
  {
    id: 'w2',
    name: 'dr. Hj. Maharani Puspitasari, Sp.A',
    attendance: 'InshaAllah Attending',
    guestCount: '2 Persons',
    message: 'Alhamdulillah, so happy to witness both of you uniting in marriage! Wishing you righteous offspring and endless blessings.',
    timestamp: '2 days ago',
  },
  {
    id: 'w3',
    name: 'H. Dimas Prasetyo Nugroho, S.T.',
    attendance: 'Regretfully Unable',
    guestCount: '1 Person',
    message: 'Warmest congratulations to Mas Bagas and Mbak Sekar! Sending our best prayers from Surabaya.',
    timestamp: '3 days ago',
  },
];

export const RsvpWishesSection: React.FC<RsvpWishesSectionProps> = ({ onShowToast }) => {
  const [wishes, setWishes] = useState<WishItem[]>(() => {
    try {
      const saved = localStorage.getItem('bagaskara_sekar_wishes');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_WISHES;
  });

  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState<'InshaAllah Attending' | 'Regretfully Unable'>('InshaAllah Attending');
  const [guestCount, setGuestCount] = useState('2 Persons');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('bagaskara_sekar_wishes', JSON.stringify(wishes));
    } catch {
      // ignore
    }
  }, [wishes]);

  // Load shared public RSVP feed using the build-time backend URL.
  useEffect(() => {
    const backendUrl = getAppsScriptUrl();
    if (!backendUrl) return;
    void fetchRsvpFromAppsScript(backendUrl).then((remoteWishes) => {
      setWishes(remoteWishes);
      localStorage.setItem('bagaskara_sekar_wishes', JSON.stringify(remoteWishes));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) return;

    const backendUrl = getAppsScriptUrl();
    if (!backendUrl) {
      onShowToast('RSVP belum dapat dikirim karena backend belum dikonfigurasi. Silakan coba kembali nanti.');
      return;
    }

    setIsSubmitting(true);
    const newWish: WishItem = {
      id: 'pending_' + Date.now(),
      name: name.trim(),
      attendance,
      guestCount,
      message: message.trim(),
      timestamp: 'Baru saja',
    };

    try {
      const saved = await saveRsvpToAppsScript(backendUrl, newWish);
      if (!saved) {
        onShowToast('RSVP belum berhasil tersimpan. Periksa koneksi internet lalu coba kembali.');
        return;
      }
      setWishes((current) => [newWish, ...current]);
      setName('');
      setMessage('');
      onShowToast("Terima kasih! RSVP dan doa Anda berhasil dikirim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp-section" className="relative py-24 md:py-32 px-6 bg-batik-light text-keraton-900 border-t border-gold-300/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-cinzel text-xs font-bold uppercase tracking-[0.3em] text-gold-700 mb-2">
            Attendance &amp; Du'a
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            <AnimatedHeading
              text="RSVP & Wedding Wishes"
              highlightWord="RSVP"
              highlightClassName="text-gold-shimmer"
            />
          </h2>
          <p className="text-stone-600 text-sm sm:text-base italic font-serif mb-2">
            "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair"
          </p>
          <p className="text-stone-500 text-xs sm:text-sm">
            (May Allah bless both of you, shower His blessings upon you, and unite you both in goodness.)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* RSVP Form */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 card-luxury-light card-sheen rounded-3xl p-8"
          >
            <h3 className="font-serif text-2xl font-bold text-keraton-900 mb-6">
              Confirm Your Attendance
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="guest-name-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                >
                  Your Full Name
                </label>
                <input
                  id="guest-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Hj. Siti Nurhaliza Kusuma"
                  className="w-full px-4 py-3 rounded-xl border border-gold-300 focus:border-gold-600 focus:ring-2 focus:ring-gold-400/20 focus:outline-none text-sm bg-ivory text-keraton-900 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="guest-attendance-select"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Will You Attend?
                  </label>
                  <select
                    id="guest-attendance-select"
                    value={attendance}
                    onChange={(e) =>
                      setAttendance(e.target.value as 'InshaAllah Attending' | 'Regretfully Unable')
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gold-300 focus:border-gold-600 focus:ring-2 focus:ring-gold-400/20 focus:outline-none text-sm bg-ivory text-keraton-900 cursor-pointer transition-all"
                  >
                    <option value="InshaAllah Attending">InshaAllah Attending</option>
                    <option value="Regretfully Unable">Regretfully Unable</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="guest-count-select"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Number of Guests
                  </label>
                  <select
                    id="guest-count-select"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gold-300 focus:border-gold-600 focus:ring-2 focus:ring-gold-400/20 focus:outline-none text-sm bg-ivory text-keraton-900 cursor-pointer transition-all"
                  >
                    <option value="1 Person">1 Person</option>
                    <option value="2 Persons">2 Persons</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="guest-message-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                >
                  Your Du'a &amp; Wishes
                </label>
                <textarea
                  id="guest-message-input"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your heartfelt prayers for Bagaskara & Sekar..."
                  className="w-full px-4 py-3 rounded-xl border border-gold-300 focus:border-gold-600 focus:ring-2 focus:ring-gold-400/20 focus:outline-none text-sm bg-ivory text-keraton-900 resize-none transition-all"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(143,100,25,0.25)' }}
                whileTap={{ scale: 0.96 }}
                className="w-full py-4 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                aria-label="Send Confirmation and Dua"
              >
                <Send className="w-4 h-4" />
                <span>Send Confirmation &amp; Du'a</span>
              </motion.button>
            </form>
          </motion.div>

          {/* Live Wishes Feed */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 card-luxury-light card-sheen rounded-3xl p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageSquareHeart className="w-5 h-5 text-gold-600" />
                <h3 className="font-serif text-2xl font-bold text-keraton-900">
                  Prayers from Loved Ones
                </h3>
              </div>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={wishes.length}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="px-3.5 py-1 rounded-full bg-gold-100 text-gold-700 text-xs font-semibold"
                >
                  {wishes.length} Wishes
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
              <AnimatePresence initial={false}>
                {wishes.map((item) => {
                  const isAttending = item.attendance.includes('Attending');
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -14, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35 }}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 rounded-2xl bg-ivory border border-gold-300/60 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <h4 className="font-serif font-bold text-base sm:text-lg text-keraton-900 truncate">
                          {item.name}
                        </h4>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1 ${
                            isAttending
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isAttending && <CheckCircle2 className="w-3 h-3" />}
                          <span>{item.attendance}</span>
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 leading-relaxed italic">
                        "{item.message}"
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                        <span>{item.guestCount}</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
