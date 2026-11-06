import React, { useEffect } from 'react';
import { VenueDetail } from '../types/wedding';
import { X, MapPin, ExternalLink } from 'lucide-react';

interface MapModalProps {
  venue: VenueDetail | null;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({ venue, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (venue) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [venue, onClose]);

  if (!venue) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-keraton-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Location Map Details"
    >
      <div
        className="bg-white border border-gold-400 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center relative shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-ivory-warm text-keraton-900 hover:bg-gold-600 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Close location map modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-100 border border-gold-400/50 flex items-center justify-center text-gold-700">
          <MapPin className="w-6 h-6" />
        </div>

        <h3 className="font-serif text-2xl font-bold text-keraton-900 mb-2">
          {venue.title}
        </h3>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          {venue.address}
        </p>

        <div className="rounded-2xl overflow-hidden border border-gold-300 mb-6 bg-ivory-warm p-6 text-center">
          <MapPin className="w-10 h-10 text-gold-600 mx-auto mb-2" />
          <p className="text-xs text-stone-600 font-medium">
            Coordinates: {venue.coordinates} (Sleman, Yogyakarta)
          </p>
          <p className="text-xs text-gold-700 mt-1 font-semibold">
            {venue.type} • {venue.time}
          </p>
        </div>

        <a
          href={venue.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs uppercase tracking-widest transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

interface LightboxModalProps {
  src: string | null;
  caption: string;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  src,
  caption,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (src) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-keraton-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Photo Preview"
    >
      <div
        className="relative max-w-3xl w-full bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border border-gold-400 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-10 h-10 rounded-full bg-gold-600 text-white shadow-lg flex items-center justify-center hover:bg-gold-700 transition-colors cursor-pointer z-10"
          aria-label="Close photo preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full max-h-[75vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center">
          <img
            src={src}
            alt={caption}
            className="w-full h-full max-h-[75vh] object-contain rounded-2xl"
          />
        </div>

        <p className="font-serif text-lg sm:text-xl font-bold text-keraton-900 text-center mt-3 mb-1">
          {caption}
        </p>
      </div>
    </div>
  );
};
