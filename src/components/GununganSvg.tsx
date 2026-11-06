import React, { useId } from 'react';

interface GununganSvgProps {
  className?: string;
  glow?: boolean;
  strokeWidthScale?: number;
}

export const GununganSvg: React.FC<GununganSvgProps> = ({
  className = 'w-full h-full',
  glow = false,
  strokeWidthScale = 1,
}) => {
  const gradId = useId();

  return (
    <svg
      viewBox="0 0 200 270"
      className={`${className} ${glow ? 'gunungan-glow' : ''}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d8ad54" />
          <stop offset="50%" stopColor="#9e7019" />
          <stop offset="100%" stopColor="#61420c" />
        </linearGradient>
      </defs>
      <g>
        <path
          d="M100 5 C115 45, 165 95, 175 155 C182 195, 155 235, 145 265 L55 265 C45 235, 18 195, 25 155 C35 95, 85 45, 100 5 Z"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={2.2 * strokeWidthScale}
        />
        <path
          d="M100 18 C112 52, 155 98, 164 152 C170 188, 146 225, 138 255 L62 255 C54 225, 30 188, 36 152 C45 98, 88 52, 100 18 Z"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1.1 * strokeWidthScale}
          strokeDasharray="3 3"
        />
        {/* Tree of Life (Kalpataru) inside Gunungan */}
        <line
          x1="100"
          y1="35"
          x2="100"
          y2="255"
          stroke={`url(#${gradId})`}
          strokeWidth={2 * strokeWidthScale}
        />
        <path
          d="M100 200 C70 190, 50 165, 65 145 C80 125, 95 155, 100 165"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1.6 * strokeWidthScale}
        />
        <path
          d="M100 200 C130 190, 150 165, 135 145 C120 125, 105 155, 100 165"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1.6 * strokeWidthScale}
        />
        <path
          d="M100 150 C65 135, 55 105, 75 90 C90 80, 95 110, 100 120"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1.6 * strokeWidthScale}
        />
        <path
          d="M100 150 C135 135, 145 105, 125 90 C110 80, 105 110, 100 120"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1.6 * strokeWidthScale}
        />
        <path
          d="M100 100 C80 85, 78 65, 90 55 C98 50, 98 70, 100 78"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1.3 * strokeWidthScale}
        />
        <path
          d="M100 100 C120 85, 122 65, 110 55 C102 50, 102 70, 100 78"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1.3 * strokeWidthScale}
        />
        {/* Gate Base (Candi Bentar) */}
        <path
          d="M70 255 L70 225 L88 215 L112 215 L130 225 L130 255 Z"
          fill={`url(#${gradId})`}
          fillOpacity="0.18"
          stroke={`url(#${gradId})`}
          strokeWidth={1.5 * strokeWidthScale}
        />
        <circle cx="100" cy="40" r="5" fill={`url(#${gradId})`} />
        <circle
          cx="100"
          cy="185"
          r="7"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1.5 * strokeWidthScale}
        />
      </g>
    </svg>
  );
};
