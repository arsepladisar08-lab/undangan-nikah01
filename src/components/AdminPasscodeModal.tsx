import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldCheck, LoaderCircle } from 'lucide-react';
import { loginAdminToAppsScript } from '../utils/appsScriptClient';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (message: string) => void;
  webAppUrl: string;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
  webAppUrl,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webAppUrl) {
      setError('Backend belum dikonfigurasi. Atur VITE_APPS_SCRIPT_URL pada environment deployment.');
      return;
    }
    if (!pin.trim()) {
      setError('Masukkan PIN/passphrase admin.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await loginAdminToAppsScript(webAppUrl, pin);
      setPin('');
      onShowToast('Autentikasi admin berhasil. Sesi berlaku hingga 6 jam.');
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Autentikasi gagal. Periksa koneksi backend.');
    } finally {
      setIsSubmitting(false);
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
        <button
          onClick={onClose}
          aria-label="Tutup Verifikasi Admin"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 text-white flex items-center justify-center shadow-lg shadow-gold-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-keraton-950">Akses Panel Admin</h3>
          <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
            Autentikasi diverifikasi oleh server. Masukkan PIN/passphrase yang sebelumnya disiapkan di Google Apps Script.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5 font-cinzel">
              PIN / Passphrase Admin
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                autoFocus
                maxLength={128}
                autoComplete="current-password"
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Masukkan kredensial admin"
                className="w-full px-4 py-3 rounded-2xl text-center text-lg tracking-[0.15em] font-mono border border-gold-300 focus:border-gold-500 bg-white focus:ring-2 focus:ring-gold-300 focus:outline-none"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? 'Sembunyikan kredensial' : 'Tampilkan kredensial'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p role="alert" className="text-xs text-red-700 mt-2 text-center font-medium">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !webAppUrl}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-cinzel font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{isSubmitting ? 'Memverifikasi...' : 'Buka Panel Admin'}</span>
          </button>
          {!webAppUrl && (
            <p className="text-[11px] text-amber-800 text-center">
              URL backend belum tersedia pada build ini.
            </p>
          )}
        </form>

        <div className="mt-6 pt-4 border-t border-gold-200/60 text-center">
          <p className="text-[11px] text-stone-500">
            PIN tidak disimpan di browser atau ditanam dalam JavaScript. Server hanya menyimpan hash PIN.
          </p>
        </div>
      </div>
    </div>
  );
};
