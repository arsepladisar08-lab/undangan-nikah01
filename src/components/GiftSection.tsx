import React, { useState } from 'react';
import { Copy, Gift, CreditCard, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedHeading } from './AnimatedText';

interface GiftSectionProps {
  onCopyText: (text: string, successMsg: string) => void;
}

export const GiftSection: React.FC<GiftSectionProps> = ({ onCopyText }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string, msg: string) => {
    onCopyText(text, msg);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <section className="relative py-24 md:py-32 px-6 bg-ivory-warm border-t border-gold-300/40 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div>
          <p className="font-cinzel text-xs font-bold uppercase tracking-[0.3em] text-gold-700 mb-2">
            Token of Love
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            <AnimatedHeading
              text="Wedding Gift"
              highlightWord="Gift"
              highlightClassName="text-gold-shimmer"
            />
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto mb-12">
            Your presence and sincere prayers are the greatest blessings for our
            marriage. However, if you wish to honor us with a token of love, you
            may use the digital envelopes below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Bank Card 1 - BSI */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -6 }}
            className="card-luxury-light card-sheen rounded-3xl p-7 text-left relative overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="font-cinzel text-sm font-bold tracking-widest text-gold-700">
                BANK SYARIAH INDONESIA (BSI)
              </span>
              <CreditCard className="w-6 h-6 text-gold-500" />
            </div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-1">
              Account Number
            </p>
            <p
              id="acc-bsi"
              className="font-mono text-2xl font-bold text-keraton-900 tracking-wider mb-3 select-all"
            >
              7148291048
            </p>
            <p className="text-xs text-stone-600 mb-6">
              a.n.{' '}
              <span className="font-bold text-keraton-900">
                Raden Mas Bagaskara Adi Nugraha
              </span>
            </p>
            <motion.button
              onClick={() => handleCopy('bsi', '7148291048', 'BSI Account Number copied to clipboard!')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="w-full py-3 rounded-xl bg-gold-100 hover:bg-gold-600 hover:text-white border border-gold-400/50 text-gold-700 text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
              aria-label="Copy BSI Account Number"
            >
              {copiedKey === 'bsi' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Account Number</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Bank Card 2 - BCA */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            whileHover={{ y: -6 }}
            className="card-luxury-light card-sheen rounded-3xl p-7 text-left relative overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="font-cinzel text-sm font-bold tracking-widest text-gold-700">
                BANK BCA
              </span>
              <CreditCard className="w-6 h-6 text-gold-500" />
            </div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-1">
              Account Number
            </p>
            <p
              id="acc-bca"
              className="font-mono text-2xl font-bold text-keraton-900 tracking-wider mb-3 select-all"
            >
              0374829104
            </p>
            <p className="text-xs text-stone-600 mb-6">
              a.n.{' '}
              <span className="font-bold text-keraton-900">
                Roro Sekar Arum Kusumawardhani
              </span>
            </p>
            <motion.button
              onClick={() => handleCopy('bca', '0374829104', 'BCA Account Number copied to clipboard!')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="w-full py-3 rounded-xl bg-gold-100 hover:bg-gold-600 hover:text-white border border-gold-400/50 text-gold-700 text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
              aria-label="Copy BCA Account Number"
            >
              {copiedKey === 'bca' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Account Number</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Physical Gift Address */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card-luxury-light card-sheen rounded-2xl p-6 text-center"
        >
          <p className="font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-gold-700 mb-2 flex items-center justify-center gap-1.5">
            <Gift className="w-4 h-4" />
            <span>Send Physical Gift</span>
          </p>
          <p className="font-serif text-lg text-keraton-900 font-bold">
            Kediaman Bagaskara &amp; Sekar
          </p>
          <p className="text-sm text-stone-600 mb-4 max-w-lg mx-auto">
            Jl. Patehan Tengah No. 18, Kecamatan Kraton, Kota Yogyakarta, Daerah
            Istimewa Yogyakarta 55133
          </p>
          <motion.button
            onClick={() =>
              handleCopy(
                'addr',
                'Jl. Patehan Tengah No. 18, Kecamatan Kraton, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55133',
                'Physical delivery address copied!'
              )
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold-600 text-white text-xs font-semibold hover:bg-gold-700 transition-colors shadow-sm cursor-pointer"
            aria-label="Copy Delivery Address"
          >
            {copiedKey === 'addr' ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied Address!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Delivery Address</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
