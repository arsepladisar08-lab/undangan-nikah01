import React, { useEffect, useRef } from 'react';
import { GununganSvg } from './GununganSvg';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedHeading, RotatingWord } from './AnimatedText';

interface HeroSectionProps {
  onScrollToExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToExplore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      r: number;
      vy: number;
      vx: number;
      alpha: number;
    }> = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = window.innerWidth < 768 ? 24 : 45;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2.2 + 0.8,
          vy: -(Math.random() * 0.35 + 0.12),
          vx: (Math.random() - 0.5) * 0.25,
          alpha: Math.random() * 0.45 + 0.15,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(181, 132, 40, ${p.alpha})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <header
      id="hero-section"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-batik-light pt-16 pb-24"
    >
      {/* Interactive Golden Sunbeams & Petals Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Soft Warm Ambient Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[26rem] h-[26rem] md:w-[44rem] md:h-[44rem] rounded-full bg-gold-300/25 blur-[100px] animate-breathe" />
      </div>

      {/* Left Gunungan Motif with gentle sway */}
      <div className="hidden sm:block absolute left-2 lg:left-10 bottom-12 w-48 sm:w-64 md:w-72 opacity-25 pointer-events-none z-10 -rotate-6 animate-float-gentle">
        <GununganSvg />
      </div>

      {/* Right Gunungan Motif with counter sway */}
      <div className="hidden sm:block absolute right-2 lg:right-10 bottom-12 w-48 sm:w-64 md:w-72 opacity-25 pointer-events-none z-10 rotate-6 scale-x-[-1] animate-float-gentle">
        <GununganSvg />
      </div>

      {/* Main Centerpiece Arch */}
      <div className="relative z-20 max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-gold-400/50 bg-white/80 text-gold-700 text-xs uppercase tracking-[0.22em] font-semibold mb-6 shadow-sm backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
          <span>The Sacred Islamic Union</span>
          <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
        </motion.div>

        {/* Royal Arch Frame with Spring Micro-interaction */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.025, rotate: 0.5 }}
          className="relative w-60 h-76 sm:w-72 sm:h-96 rounded-t-full p-2.5 border-2 border-gold-400/70 bg-white shadow-[0_20px_50px_rgba(143,100,25,0.18)] mb-8 group cursor-pointer"
        >
          <div className="w-full h-full rounded-t-full overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80"
              alt="The Wedding of Bagaskara and Sekar"
              className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-1000"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-keraton-950/40 via-transparent to-transparent" />
          </div>

          {/* Floating Badge at Arch Base with Pulsing Shimmer */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gold-400 px-6 py-1.5 rounded-full shadow-md whitespace-nowrap">
            <span className="font-cinzel text-xs font-bold tracking-[0.25em] text-gold-700">
              12 . 12 . 2026
            </span>
          </div>
        </motion.div>

        {/* Animated Word-by-Word Staggered Headline */}
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold leading-none mb-4">
          <AnimatedHeading
            text="Bagaskara & Sekar"
            highlightWord="Bagaskara"
            highlightClassName="text-gold-shimmer"
          />
        </h1>

        {/* Rotating Words Blessing Banner */}
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100/70 border border-gold-300 text-gold-800 text-xs sm:text-sm font-serif italic">
          <span>In A Sacred Covenant of:</span>
          <RotatingWord
            words={[
              'Sakinah Mawaddah wa Rahmah',
              'Luhuring Budi & Guyub Rukun',
              'Nawaitu Suci Lilahi Ta\'ala',
              'Tresna Sejati Tumeka Ing Pati',
            ]}
            className="font-bold text-gold-700 underline decoration-gold-400"
          />
        </div>

        <p className="max-w-xl mx-auto font-serif italic text-lg sm:text-xl text-stone-700 leading-relaxed mb-10">
          "In the Name of Allah, the Most Gracious, the Most Merciful. Two souls
          united in faith, stepping into a lifelong covenant under the grace of Allah SWT."
        </p>

        {/* Scroll Down Indicator with Spring Bounce */}
        <motion.button
          onClick={onScrollToExplore}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex flex-col items-center gap-2 text-gold-700 hover:text-gold-500 transition-colors cursor-pointer"
          aria-label="Scroll down to explore wedding details"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">
            Scroll to Explore
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-gold-500/60 flex justify-center p-1 bg-white/60 shadow-sm">
            <div className="w-1.5 h-2.5 bg-gold-600 rounded-full animate-bounce" />
          </div>
        </motion.button>
      </div>

      {/* Bottom Gradient Transition */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-ivory-warm to-transparent z-20 pointer-events-none" />
    </header>
  );
};
