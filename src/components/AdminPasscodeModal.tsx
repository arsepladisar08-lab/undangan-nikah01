import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldCheck } from 'lucide-react';
import { verifyAdminPin, setAdminAuthenticated, DEFAULT_ADMIN_PIN } from '../utils/appsScriptClient';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (message: string) => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pin)) {
      setAdminAuthenticated(true, true);
      setError(false);
      setPin('');
      onShowToast('Akses Admin berhasil dibuka! Selamat datang.');
      onSuccess();
    } else {
      setError(true);
      onShowToast('PIN Admin salah. Silakan coba lagi.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Verifikasi Akses Admin"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-keraton-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-md bg-[#fcfaf6] rounded-3xl shadow-2xl border border-gold-400/70 p-6 sm:p-8 text-[#2c1e14]">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup Verifikasi Admin"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Emblem */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 text-white flex items-center justify-center shadow-lg shadow-gold-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-keraton-950">
            Akses Panel Admin
          </h3>
          <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
            Hanya untuk pemilik acara / mempelai. Masukkan PIN keamanan untuk mengelola daftar tamu, tautan khusus, dan foto.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 font-cinzel">
              PIN Keamanan Admin:
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                autoFocus
                maxLength={12}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(false);
                }}
                placeholder={`PIN bawaan: ${DEFAULT_ADMIN_PIN}`}
                className={`w-full px-4 py-3 rounded-2xl text-center text-lg tracking-[0.25em] font-mono border focus:outline-none transition-all ${
                  error
                    ? 'border-red-400 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-400'
                    : 'border-gold-300 focus:border-gold-500 bg-white focus:ring-2 focus:ring-gold-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-1.5 text-center font-medium">
                PIN tidak sesuai. PIN bawaan: <strong>{DEFAULT_ADMIN_PIN}</strong>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white font-cinzel font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Buka Panel Admin</span>
          </button>
        </form>

        {/* Helpful Tip */}
        <div className="mt-6 pt-4 border-t border-gold-200/60 text-center">
          <p className="text-[11px] text-stone-500">
            💡 <strong>Petunjuk:</strong> PIN bawaan adalah <strong>{DEFAULT_ADMIN_PIN}</strong> (sesuai tanggal pernikahan 12.12.2026). Anda dapat mengubah PIN di dalam panel admin.
          </p>
        </div>
      </div>
    </div>
  );
};
