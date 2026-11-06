import React, { useState, useEffect } from 'react';
import { calculateTimeRemaining, formatTwoDigits } from '../utils/countdown';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';
import { CalendarCheck, Download, ExternalLink } from 'lucide-react';
import { AnimatedNumber, AnimatedHeading } from './AnimatedText';
import { motion, AnimatePresence } from 'motion/react';

interface CountdownSectionProps {
  onShowToast: (msg: string) => void;
}

// Saturday, December 12th, 2026 at 08:00 AM WIB (UTC+7)
const WEDDING_TIMESTAMP = new Date('2026-12-12T08:00:00+07:00').getTime();

export const CountdownSection: React.FC<CountdownSectionProps> = ({ onShowToast }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeRemaining(WEDDING_TIMESTAMP));
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(WEDDING_TIMESTAMP));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleCalendar = () => {
    window.open(createGoogleCalendarUrl(), '_blank', 'noopener,noreferrer');
    onShowToast('Opening Google Calendar event...');
  };

  const handleDownloadIcs = () => {
    downloadIcsFile();
    onShowToast('Wedding calendar invite (.ics) downloaded!');
  };

  return (
    <section
      className="relative py-28 px-6 bg-fixed bg-center bg-cover border-y border-gold-300/50"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80')`,
      }}
    >
      <div className="absolute inset-0 bg-[#fdfbf7]/90 backdrop-blur-[3px]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <p className="font-cinzel text-xs font-bold uppercase tracking-[0.35em] text-gold-700 mb-3">
          InshaAllah • Counting Down To Forever
        </p>

        {/* Animated Heading */}
        <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-10">
          <AnimatedHeading
            text="Save The Sacred Date"
            highlightWord="Sacred"
            highlightClassName="text-gold-shimmer"
          />
        </h2>

        {/* Live Animated Countdown Grid with Spring Ticking Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto mb-10">
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card-luxury-light card-sheen rounded-2xl p-5 shadow-sm"
          >
            <AnimatedNumber value={formatTwoDigits(timeLeft.days)} label="Days" />
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card-luxury-light card-sheen rounded-2xl p-5 shadow-sm"
          >
            <AnimatedNumber value={formatTwoDigits(timeLeft.hours)} label="Hours" />
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card-luxury-light card-sheen rounded-2xl p-5 shadow-sm"
          >
            <AnimatedNumber value={formatTwoDigits(timeLeft.minutes)} label="Minutes" />
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card-luxury-light card-sheen rounded-2xl p-5 shadow-sm"
          >
            <AnimatedNumber value={formatTwoDigits(timeLeft.seconds)} label="Seconds" />
          </motion.div>
        </div>

        {/* Calendar Action Buttons with Micro-interactions */}
        <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.button
            onClick={() => setShowOptions(!showOptions)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs uppercase tracking-widest transition-all shadow-lg cursor-pointer"
            aria-label="Add wedding reminder to calendar"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Add Reminder to Calendar</span>
          </motion.button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 mt-2 sm:mt-0"
              >
                <motion.button
                  onClick={handleGoogleCalendar}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-gold-400 text-gold-700 hover:bg-gold-50 text-xs font-medium shadow-sm transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Calendar</span>
                </motion.button>
                <motion.button
                  onClick={handleDownloadIcs}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-gold-400 text-gold-700 hover:bg-gold-50 text-xs font-medium shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>iCal (.ics)</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
