import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Sparkles, Compass } from 'lucide-react';

interface AnimatedLoopingMandalaProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

export const AnimatedLoopingMandala: React.FC<AnimatedLoopingMandalaProps> = ({
  className = '',
  size = 280,
  interactive = true,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [showTooltip, setShowTooltip] = useState(false);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const cycleSpeed = () => {
    if (speedMultiplier === 1) setSpeedMultiplier(2);
    else if (speedMultiplier === 2) setSpeedMultiplier(0.5);
    else setSpeedMultiplier(1);
  };

  const outerDuration = (36 / speedMultiplier);
  const innerDuration = (24 / speedMultiplier);

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Glow Aura */}
      <div
        className="absolute rounded-full bg-gradient-to-tr from-gold-300/20 via-gold-400/25 to-gold-200/10 blur-2xl pointer-events-none animate-breathe"
        style={{ width: size * 1.15, height: size * 1.15 }}
      />

      {/* SVG Sacred Looping Mandala Container */}
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Layer 1: Outer Clockwise Rotating Ring (Asthabrata 8 Sunrays & Petals) */}
        <motion.svg
          viewBox="0 0 300 300"
          className="absolute inset-0 w-full h-full pointer-events-none"
          animate={{ rotate: isPaused ? undefined : 360 }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: outerDuration,
          }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mandalaGoldOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d8ad54" />
              <stop offset="50%" stopColor="#b58428" />
              <stop offset="100%" stopColor="#6e4b12" />
            </linearGradient>
          </defs>
          {/* Outer circle perimeter */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="url(#mandalaGoldOuter)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <circle
            cx="150"
            cy="150"
            r="132"
            fill="none"
            stroke="url(#mandalaGoldOuter)"
            strokeWidth="0.8"
          />

          {/* 8 Sunray Petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <g key={i} transform={`rotate(${angle} 150 150)`}>
              <path
                d="M150 10 C158 45, 172 70, 178 100 C165 96, 150 95, 150 95 C150 95, 135 96, 122 100 C128 70, 142 45, 150 10 Z"
                fill="url(#mandalaGoldOuter)"
                fillOpacity="0.16"
                stroke="url(#mandalaGoldOuter)"
                strokeWidth="1.4"
              />
              <circle cx="150" cy="22" r="3" fill="url(#mandalaGoldOuter)" />
              <circle cx="150" cy="120" r="2" fill="url(#mandalaGoldOuter)" />
            </g>
          ))}
        </motion.svg>

        {/* Layer 2: Middle Counter-Clockwise Rotating Ring (Sacred Geometric Diamonds) */}
        <motion.svg
          viewBox="0 0 300 300"
          className="absolute inset-0 w-full h-full pointer-events-none"
          animate={{ rotate: isPaused ? undefined : -360 }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: innerDuration,
          }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mandalaGoldMid" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2c37d" />
              <stop offset="50%" stopColor="#9c6f19" />
              <stop offset="100%" stopColor="#5c4010" />
            </linearGradient>
          </defs>
          <circle
            cx="150"
            cy="150"
            r="94"
            fill="none"
            stroke="url(#mandalaGoldMid)"
            strokeWidth="1.2"
          />
          <circle
            cx="150"
            cy="150"
            r="82"
            fill="none"
            stroke="url(#mandalaGoldMid)"
            strokeWidth="0.8"
            strokeDasharray="2 4"
          />

          {/* 16 Diamonds on perimeter */}
          {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map(
            (deg, idx) => (
              <g key={idx} transform={`rotate(${deg} 150 150)`}>
                <polygon
                  points="150,60 154,68 150,76 146,68"
                  fill="url(#mandalaGoldMid)"
                  fillOpacity="0.3"
                  stroke="url(#mandalaGoldMid)"
                  strokeWidth="0.9"
                />
              </g>
            )
          )}
        </motion.svg>

        {/* Layer 3: Central Core Breathing Lotus Medallion */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{
            scale: isPaused ? 1 : [1, 1.07, 1],
            opacity: [0.92, 1, 0.92],
          }}
          transition={{
            repeat: Infinity,
            ease: 'easeInOut',
            duration: 4.2,
          }}
        >
          <svg viewBox="0 0 160 160" className="w-[52%] h-[52%]">
            <defs>
              <radialGradient id="lotusCoreGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fdfaf2" />
                <stop offset="40%" stopColor="#eed89b" />
                <stop offset="85%" stopColor="#b58428" />
                <stop offset="100%" stopColor="#6e4b12" />
              </radialGradient>
            </defs>
            <circle
              cx="80"
              cy="80"
              r="40"
              fill="url(#lotusCoreGrad)"
              fillOpacity="0.22"
              stroke="#b58428"
              strokeWidth="1.5"
            />
            {/* 8-Petal Central Lotus Flower */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, k) => (
              <g key={k} transform={`rotate(${angle} 80 80)`}>
                <path
                  d="M80 50 C88 62, 88 72, 80 78 C72 72, 72 62, 80 50 Z"
                  fill="#cfa349"
                  fillOpacity="0.45"
                  stroke="#8f6419"
                  strokeWidth="0.9"
                />
              </g>
            ))}
            <circle cx="80" cy="80" r="12" fill="#b58428" />
            <circle cx="80" cy="80" r="5" fill="#fdfaf2" />
          </svg>
        </motion.div>

        {/* Layer 4: Orbiting Celestial Star Particle */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ rotate: isPaused ? undefined : 360 }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 12 / speedMultiplier,
          }}
        >
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gold-400 shadow-[0_0_12px_#cfa349] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </motion.div>
      </div>

      {/* Interactive Micro-Interaction Controls */}
      {interactive && (
        <div className="mt-4 flex items-center gap-2 z-20">
          <button
            onClick={togglePause}
            aria-label={isPaused ? 'Resume Mandala Rotation' : 'Pause Mandala Rotation'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-gold-300 text-gold-700 hover:bg-gold-50 text-[11px] font-semibold tracking-wider uppercase shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 fill-gold-600" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 fill-gold-600" />
                <span>Pause</span>
              </>
            )}
          </button>

          <button
            onClick={cycleSpeed}
            aria-label={`Cycle rotation speed, currently ${speedMultiplier}x`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-gold-300 text-gold-700 hover:bg-gold-50 text-[11px] font-semibold tracking-wider uppercase shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Compass className="w-3 h-3" />
            <span>{speedMultiplier}x Flow</span>
          </button>
        </div>
      )}

      {/* Tooltip Description */}
      {interactive && (
        <div
          className={`mt-2 transition-opacity duration-300 text-center ${
            showTooltip ? 'opacity-100' : 'opacity-80'
          }`}
        >
          <p className="text-[11px] font-cinzel uppercase tracking-[0.2em] text-gold-700 font-semibold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-gold-500" />
            <span>Cakra Asthabrata • Eternal Celestial Loop</span>
            <Sparkles className="w-3 h-3 text-gold-500" />
          </p>
          <p className="text-[10px] text-stone-500 italic max-w-xs mx-auto">
            Symbolizing continuous divine protection, eternal blessings, and cosmic balance in Javanese royal heritage.
          </p>
        </div>
      )}
    </div>
  );
};
