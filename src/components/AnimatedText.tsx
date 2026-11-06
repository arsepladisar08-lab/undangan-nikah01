import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  highlightWord?: string;
  highlightClassName?: string;
  delay?: number;
}

export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  text,
  className = '',
  highlightWord,
  highlightClassName = 'text-gold-shimmer',
  delay = 0,
}) => {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay * i },
    }),
  };

  const child = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 14,
        stiffness: 90,
      },
    },
  };

  return (
    <motion.span
      className={`inline-block flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {words.map((word, index) => {
        const isHighlight = highlightWord && word.includes(highlightWord);
        return (
          <motion.span
            variants={child}
            key={index}
            className={`inline-block mr-[0.25em] ${
              isHighlight ? highlightClassName : ''
            }`}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.span>
  );
};

interface RotatingWordProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

export const RotatingWord: React.FC<RotatingWordProps> = ({
  words,
  intervalMs = 2800,
  className = '',
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [words, intervalMs]);

  return (
    <span className={`inline-block relative overflow-hidden h-[1.3em] align-middle ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -22, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

interface AnimatedNumberProps {
  value: string | number;
  label: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  label,
  className = '',
}) => {
  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={String(value)}
          initial={{ y: 12, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -12, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="block font-serif text-4xl sm:text-5xl font-bold text-gold-600 tabular-nums"
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 mt-1 block">
        {label}
      </span>
    </div>
  );
};
