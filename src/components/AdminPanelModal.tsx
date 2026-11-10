import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Copy,
  Check,
  ExternalLink,
  Users,
  Image as ImageIcon,
  Settings,
  Send,
  RefreshCw,
  Plus,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  FolderSync,
  Globe,
  Lock,
  Key,
  LogOut,
  ShieldCheck,
  Music,
  HeartHandshake,
} from 'lucide-react';
import {
  PhotoSlotKey,
  PhotoMap,
  PHOTO_SLOT_CONFIGS,
  DEFAULT_PHOTOS,
  GuestItem,
} from '../types/photos';
import { WeddingAudioConfig } from '../types/audio';
import { MusicSettingsTab } from './MusicSettingsTab';
import { RsvpSummaryTab } from './RsvpSummaryTab';
import {
  APPS_SCRIPT_URL_STORAGE_KEY,
  CUSTOM_PHOTOS_STORAGE_KEY,
  GUESTS_STORAGE_KEY,
  PUBLIC_DOMAIN_STORAGE_KEY,
  getAppsScriptUrl,
  getEffectiveBaseUrl,
  generatePersonalizedUrl,
  generateWhatsAppShareUrl,
  uploadPhotoToAppsScript,
  fetchPhotosFromAppsScript,
  saveGuestsToAppsScript,
  fetchGuestsFromAppsScript,
  pingAppsScript,
  changeAdminPinOnAppsScript,
  deleteGuestFromAppsScript,

} from '../utils/appsScriptClient';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoMap;
  onUpdatePhoto: (slotKey: PhotoSlotKey, url: string) => void;
  onUpdateAllPhotos: (photos: PhotoMap) => void;
  onSelectGuestPreview?: (guestName: string) => void;
  onShowToast: (message: string) => void;
  onLogoutAdmin?: () => void;
  audioConfig: WeddingAudioConfig;
  onUpdateAudioConfig: (config: WeddingAudioConfig) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  photos,
  onUpdatePhoto,
  onUpdateAllPhotos,
  onSelectGuestPreview,
  onShowToast,
  onLogoutAdmin,
  audioConfig,
  onUpdateAudioConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'guests' | 'rsvp' | 'photos' | 'music' | 'settings'>('guests');

  // Public domain configuration (e.g. https://bagaskara-sekar.vercel.app or netlify.app)
  const [publicDomain, setPublicDomain] = useState('');
  const [inputPublicDomain, setInputPublicDomain] = useState('');

  // PIN is never stored or displayed in the browser.
  const [newPinInput, setNewPinInput] = useState('');

  // Apps Script configuration
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState('');

  // Guests state
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestNotes, setNewGuestNotes] = useState('');
  const [batchNamesInput, setBatchNamesInput] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [isSyncingGuests, setIsSyncingGuests] = useState(false);
  const [lastGuestsSyncedAt, setLastGuestsSyncedAt] = useState<Date | null>(null);
  const [isAutoSyncingGuests, setIsAutoSyncingGuests] = useState(false);

  // Photos state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({});
  const [isSyncingPhotos, setIsSyncingPhotos] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Code.gs snippet copy state
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // File input refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Calculate effective base URL (prefers custom public domain like Vercel/Netlify if set)
  const baseUrl = getEffectiveBaseUrl(publicDomain);

  // Auto-sync guests & links to Google Spreadsheet
  const triggerAutoSaveGuests = async (updatedGuests: GuestItem[], successMsg?: string) => {
    const url = appsScriptUrl.trim();
    if (!url || !url.startsWith('http')) return;

    setIsAutoSyncingGuests(true);
    try {
      await saveGuestsToAppsScript(url, updatedGuests);
      setLastGuestsSyncedAt(new Date());
      if (successMsg) {
        onShowToast(successMsg);
      }
    } catch (err: unknown) {
      console.warn('Auto-save guests error:', err);
    } finally {
      setIsAutoSyncingGuests(false);
    }
  };

  // Load saved state on mount
  useEffect(() => {
    try {
      const savedDomain = localStorage.getItem(PUBLIC_DOMAIN_STORAGE_KEY) || '';
      if (savedDomain) {
        setPublicDomain(savedDomain);
        setInputPublicDomain(savedDomain);
      }

      const savedUrl = localStorage.getItem(APPS_SCRIPT_URL_STORAGE_KEY) || getAppsScriptUrl();
      if (savedUrl) {
        setAppsScriptUrl(savedUrl);
        // Automatically fetch guests from Google Spreadsheet if available
        void fetchGuestsFromAppsScript(savedUrl).then((remoteGuests) => {
          if (remoteGuests && remoteGuests.length > 0) {
            setGuests(remoteGuests);
            localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(remoteGuests));
            setLastGuestsSyncedAt(new Date());
          }
        }).catch(() => {
          // ignore
        });
      }

      const savedGuests = localStorage.getItem(GUESTS_STORAGE_KEY);
      if (savedGuests) {
        const parsed = JSON.parse(savedGuests);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGuests(parsed);
        } else {
          initDefaultGuests(savedDomain);
        }
      } else {
        initDefaultGuests(savedDomain);
      }
    } catch {
      initDefaultGuests();
    }
  }, []);

  const initDefaultGuests = (currentDomain?: string) => {
    const activeBase = getEffectiveBaseUrl(currentDomain);
    const defaults: GuestItem[] = [
      {
        id: 'g_1',
        name: 'Keluarga Besar Bapak K.R.T. H. Suryo Diningrat',
        phone: '081234567890',
        customUrl: generatePersonalizedUrl(activeBase, 'Keluarga Besar Bapak K.R.T. H. Suryo Diningrat'),
        notes: 'VIP Keluarga Keraton Surakarta',
      },
      {
        id: 'g_2',
        name: 'Bapak Ir. H. Joko Pramono & Ibu',
        phone: '081398765432',
        customUrl: generatePersonalizedUrl(activeBase, 'Bapak Ir. H. Joko Pramono & Ibu'),
        notes: 'Sahabat Orang Tua Mempelai Pria',
      },
      {
        id: 'g_3',
        name: 'Dr. Sekar Widuri, Sp.A & Suami',
        phone: '',
        customUrl: generatePersonalizedUrl(activeBase, 'Dr. Sekar Widuri, Sp.A & Suami'),
        notes: 'Teman Kuliah Mempelai Wanita',
      },
    ];
    setGuests(defaults);
    localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(defaults));
  };

  // Save / Update Public Domain (Netlify / Vercel)
  const handleSavePublicDomain = (domainToSave: string) => {
    const cleanDomain = domainToSave.trim();
    if (cleanDomain) {
      const normalized = getEffectiveBaseUrl(cleanDomain);
      setPublicDomain(cleanDomain);
      setInputPublicDomain(cleanDomain);
      localStorage.setItem(PUBLIC_DOMAIN_STORAGE_KEY, cleanDomain);

      // Recalculate all guests' custom URLs with the new public domain
      const updated = guests.map((g) => ({
        ...g,
        customUrl: generatePersonalizedUrl(normalized, g.name),
      }));
      setGuests(updated);
      localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(updated));
      onShowToast(`Domain publik berhasil disetel ke ${normalized}!`);
      void triggerAutoSaveGuests(updated, 'Tautan khusus tamu otomatis diperbarui di Google Spreadsheet!');
    } else {
      // Reset to browser origin
      setPublicDomain('');
      setInputPublicDomain('');
      localStorage.removeItem(PUBLIC_DOMAIN_STORAGE_KEY);
      const browserBase = getEffectiveBaseUrl('');
      const updated = guests.map((g) => ({
        ...g,
        customUrl: generatePersonalizedUrl(browserBase, g.name),
      }));
      setGuests(updated);
      localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(updated));
      onShowToast('Domain publik direset ke domain browser.');
      void triggerAutoSaveGuests(updated);
    }
  };

  // Change Admin PIN on the server; current session is revoked after rotation.
  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = newPinInput.trim();
    if (pin.length < 10 || pin.length > 128) {
      onShowToast('PIN/passphrase baru harus terdiri dari 10–128 karakter.');
      return;
    }
    try {
      await changeAdminPinOnAppsScript(appsScriptUrl.trim(), pin);
      setNewPinInput('');
      onShowToast('PIN berhasil diperbarui di server. Silakan login kembali.');
      onLogoutAdmin?.();
      onClose();
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Gagal memperbarui PIN admin.');
    }
  };

  // Lock and Logout from Admin Mode
  const handleLogout = () => {
    onLogoutAdmin?.();
    onClose();
    onShowToast('Sesi admin dikunci.');
  };

  // Test connection to Apps Script
  const handleTestConnection = async () => {
    if (!appsScriptUrl.trim()) {
      setConnectionStatus('error');
      setConnectionError('Masukkan URL Web App Google Apps Script terlebih dahulu.');
      return;
    }

    setConnectionStatus('testing');
    setConnectionError('');
    try {
      const ok = await pingAppsScript(appsScriptUrl.trim());
      if (ok) {
        setConnectionStatus('connected');
        localStorage.setItem(APPS_SCRIPT_URL_STORAGE_KEY, appsScriptUrl.trim());
        onShowToast('Berhasil terhubung ke Google Apps Script!');
      } else {
        setConnectionStatus('error');
        setConnectionError('Tidak ada respons sukses dari Apps Script. Pastikan akses diatur ke "Anyone" (Siapa saja).');
      }
    } catch (err: unknown) {
      setConnectionStatus('error');
      setConnectionError(err instanceof Error ? err.message : 'Gagal menghubungi server Apps Script.');
    }
  };

  // Save Apps Script URL
  const handleSaveSettings = () => {
    localStorage.setItem(APPS_SCRIPT_URL_STORAGE_KEY, appsScriptUrl.trim());
    onShowToast('Pengaturan Google Apps Script tersimpan.');
    if (appsScriptUrl.trim()) {
      void handleTestConnection();
    }
  };

  // Add individual guest
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newGuestName.trim();
    if (!name) return;

    const customUrl = generatePersonalizedUrl(baseUrl, name);
    const newGuest: GuestItem = {
      id: `g_${Date.now()}`,
      name,
      phone: newGuestPhone.trim(),
      customUrl,
      notes: newGuestNotes.trim(),
    };

    const updated = [newGuest, ...guests];
    setGuests(updated);
    localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(updated));

    setNewGuestName('');
    setNewGuestPhone('');
    setNewGuestNotes('');
    onShowToast(`Tamu "${name}" berhasil ditambahkan!`);
    void triggerAutoSaveGuests(updated, `Tamu "${name}" otomatis tersimpan ke Spreadsheet!`);
  };

  // Add batch guests from newline-separated text
  const handleBatchAddGuests = () => {
    const lines = batchNamesInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      onShowToast('Masukkan minimal satu nama tamu.');
      return;
    }

    const newItems: GuestItem[] = lines.map((name, idx) => ({
      id: `g_${Date.now()}_${idx}`,
      name,
      phone: '',
      customUrl: generatePersonalizedUrl(baseUrl, name),
      notes: '',
    }));

    const updated = [...newItems, ...guests];
    setGuests(updated);
    localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(updated));
    setBatchNamesInput('');
    setShowBatchModal(false);
    onShowToast(`${lines.length} tamu berhasil ditambahkan sekaligus!`);
    void triggerAutoSaveGuests(updated, `${lines.length} tamu otomatis tersimpan ke Spreadsheet!`);
  };

  // Delete guest by ID remotely; never replace the entire remote sheet on deletion.
  const handleDeleteGuest = (id: string, name: string) => {
    const updated = guests.filter((g) => g.id !== id);
    setGuests(updated);
    localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(updated));
    if (appsScriptUrl.trim()) {
      void deleteGuestFromAppsScript(appsScriptUrl.trim(), id).then(() => {
        onShowToast(`Tamu "${name}" dihapus dari perangkat dan server.`);
      }).catch((err: unknown) => {
        onShowToast(err instanceof Error ? `Gagal menghapus dari server: ${err.message}` : 'Gagal menghapus tamu dari server.');
      });
    } else {
      onShowToast(`Tamu "${name}" dihapus dari perangkat ini. Backend belum dikonfigurasi.`);
    }
  };

  // Copy text helper
  const handleCopy = async (text: string, key: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
      onShowToast(`${label} disalin ke clipboard!`);
    } catch {
      onShowToast(`Gagal menyalin ${label}.`);
    }
  };

  // Sync guests to Google Sheets
  const handleSyncGuestsToSheets = async () => {
    if (!appsScriptUrl.trim()) {
      onShowToast('Harap atur URL Google Apps Script di tab Pengaturan terlebih dahulu.');
      setActiveTab('settings');
      return;
    }

    setIsSyncingGuests(true);
    try {
      const count = await saveGuestsToAppsScript(appsScriptUrl.trim(), guests);
      onShowToast(`Sukses mencatat ${count} tamu ke Google Spreadsheet!`);
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Gagal sinkronisasi ke Spreadsheet.');
    } finally {
      setIsSyncingGuests(false);
    }
  };

  // Fetch guests from Google Sheets
  const handleFetchGuestsFromSheets = async () => {
    if (!appsScriptUrl.trim()) {
      onShowToast('Harap atur URL Google Apps Script di tab Pengaturan terlebih dahulu.');
      setActiveTab('settings');
      return;
    }

    setIsSyncingGuests(true);
    try {
      const remoteGuests = await fetchGuestsFromAppsScript(appsScriptUrl.trim());
      if (remoteGuests.length > 0) {
        setGuests(remoteGuests);
        localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(remoteGuests));
        onShowToast(`Sukses mengambil ${remoteGuests.length} tamu dari Google Spreadsheet!`);
      } else {
        onShowToast('Belum ada data tamu di Google Spreadsheet.');
      }
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Gagal mengambil data dari Spreadsheet.');
    } finally {
      setIsSyncingGuests(false);
    }
  };

  // Handle photo file selection and upload
  const handleFileChange = async (
    slotKey: PhotoSlotKey,
    slotLabel: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Match backend allowlist and server-side size limit.
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      onShowToast('Format foto harus JPG, PNG, atau WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Ukuran foto maksimal 5 MB.');
      return;
    }

    // Immediately create local preview object so user sees change instantly
    const localPreviewUrl = URL.createObjectURL(file);
    onUpdatePhoto(slotKey, localPreviewUrl);

    // Save to local storage for persistence
    const currentCustom: PhotoMap = { ...photos, [slotKey]: localPreviewUrl };
    localStorage.setItem(CUSTOM_PHOTOS_STORAGE_KEY, JSON.stringify(currentCustom));

    // If Apps Script URL is configured, upload to Google Drive and log to Sheets!
    if (appsScriptUrl.trim()) {
      setUploadingSlots((prev) => ({ ...prev, [slotKey]: true }));
      try {
        onShowToast(`Mengunggah "${slotLabel}" ke Google Drive...`);
        const uploadResult = await uploadPhotoToAppsScript(
          appsScriptUrl.trim(),
          slotKey,
          slotLabel,
          file
        );

        // Update with permanent Google Drive link
        onUpdatePhoto(slotKey, uploadResult.url);
        const updatedCustom = { ...currentCustom, [slotKey]: uploadResult.url };
        localStorage.setItem(CUSTOM_PHOTOS_STORAGE_KEY, JSON.stringify(updatedCustom));
        onShowToast(`Foto "${slotLabel}" tersimpan di Google Drive & dicatat di Google Sheets!`);
      } catch (err: unknown) {
        onShowToast(
          err instanceof Error
            ? `Drive error: ${err.message}. Foto tetap aktif di browser.`
            : 'Gagal mengunggah ke Google Drive. Foto tetap aktif secara lokal.'
        );
      } finally {
        setUploadingSlots((prev) => ({ ...prev, [slotKey]: false }));
      }
    } else {
      onShowToast(`Foto "${slotLabel}" diperbarui di browser! (Hubungkan Google Apps Script untuk menyimpan ke Drive & Spreadsheet)`);
    }
  };

  // Reset single photo to default
  const handleResetPhoto = (slotKey: PhotoSlotKey) => {
    const defaultUrl = DEFAULT_PHOTOS[slotKey];
    onUpdatePhoto(slotKey, defaultUrl);

    const currentCustom: PhotoMap = { ...photos, [slotKey]: defaultUrl };
    localStorage.setItem(CUSTOM_PHOTOS_STORAGE_KEY, JSON.stringify(currentCustom));
    onShowToast('Foto dikembalikan ke bawaan.');
  };

  // Sync photos from Google Sheets
  const handleFetchPhotosFromSheets = async () => {
    if (!appsScriptUrl.trim()) {
      onShowToast('Harap atur URL Google Apps Script di tab Pengaturan terlebih dahulu.');
      setActiveTab('settings');
      return;
    }

    setIsSyncingPhotos(true);
    try {
      const remotePhotos = await fetchPhotosFromAppsScript(appsScriptUrl.trim());
      if (Object.keys(remotePhotos).length > 0) {
        const merged: PhotoMap = { ...photos, ...remotePhotos };
        onUpdateAllPhotos(merged);
        localStorage.setItem(CUSTOM_PHOTOS_STORAGE_KEY, JSON.stringify(merged));
        onShowToast(`Berhasil menyinkronkan foto dari Google Spreadsheet!`);
      } else {
        onShowToast('Belum ada foto yang tercatat di Google Spreadsheet.');
      }
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Gagal mengambil foto dari Spreadsheet.');
    } finally {
      setIsSyncingPhotos(false);
    }
  };

  // Copy the canonical Apps Script source from this repository.
  const handleCopyCodeGs = async () => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/arsepladisar08-lab/undangan-nikah01/main/google-apps-script/Code.gs');
      if (!response.ok) throw new Error('Gagal mengambil Code.gs dari repository.');
      const codeGs = await response.text();
      await navigator.clipboard.writeText(codeGs);
      setHasCopiedCode(true);
      window.setTimeout(() => setHasCopiedCode(false), 2500);
      onShowToast('Kode Apps Script terbaru berhasil disalin.');
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Gagal menyalin Code.gs. Buka file di GitHub dan salin secara manual.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Panel Kelola Undangan & Foto"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-keraton-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-[#fcfaf6] rounded-3xl shadow-2xl border border-gold-400/50 flex flex-col overflow-hidden text-[#2c1e14]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold-300/40 bg-gradient-to-r from-keraton-950 via-keraton-900 to-keraton-950 text-gold-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-300">
              <FolderSync className="w-5 h-5 text-gold-300" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-gold-100 flex items-center gap-2">
                Panel Undangan, Tamu & Google Drive
              </h2>
              <p className="text-xs text-gold-300/80 font-sans">
                Mode Admin Khusus Pemilik Acara • Netlify / Vercel Ready
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              title="Kunci / Keluar dari Mode Admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white text-xs font-cinzel font-semibold transition-colors shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kunci Admin</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Tutup Panel Admin"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gold-200 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gold-300/40 bg-ivory px-6 pt-2 gap-2 sm:gap-4 overflow-x-auto text-sm font-cinzel font-semibold">
          <button
            onClick={() => setActiveTab('guests')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'guests'
                ? 'border-gold-600 text-gold-800 font-bold bg-gold-100/40 rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4 text-gold-600" />
            <span>Buku Tamu & Link Khusus ({guests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('rsvp')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rsvp'
                ? 'border-gold-600 text-gold-800 font-bold bg-gold-100/40 rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-gold-600" />
            <span>Ringkasan RSVP (Google Sheet)</span>
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'photos'
                ? 'border-gold-600 text-gold-800 font-bold bg-gold-100/40 rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-gold-600" />
            <span>Kelola & Ganti Foto ({PHOTO_SLOT_CONFIGS.length} Slot)</span>
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'music'
                ? 'border-gold-600 text-gold-800 font-bold bg-gold-100/40 rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Music className="w-4 h-4 text-gold-600" />
            <span>Pengiring Suara (YouTube)</span>
            {audioConfig.mode === 'youtube' && (
              <span className="w-2 h-2 rounded-full bg-red-500" title="Mode Musik YouTube Aktif" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-gold-600 text-gold-800 font-bold bg-gold-100/40 rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Settings className="w-4 h-4 text-gold-600" />
            <span>Pengaturan &amp; Panduan Deploy</span>
            {appsScriptUrl ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Apps Script terkonfigurasi" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="Apps Script belum terhubung" />
            )}
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: GUESTS & PERSONALIZED LINKS */}
          {activeTab === 'guests' && (
            <div className="space-y-6">
              {/* Public Domain Configuration for Netlify / Vercel */}
              <div className="p-4 rounded-2xl bg-white border border-gold-300/80 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gold-600 shrink-0" />
                    <span className="font-serif font-bold text-sm text-keraton-900">
                      Domain Publik Undangan (Netlify / Vercel)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-stone-500 font-sans">Domain Aktif:</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-medium max-w-[280px] truncate" title={baseUrl}>
                      {baseUrl}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Agar link undangan yang Anda salin &amp; kirimkan ke WhatsApp <strong>merupakan link publik Netlify / Vercel</strong> (bukan preview AI Studio), masukkan alamat website Anda di bawah ini:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={inputPublicDomain}
                    onChange={(e) => setInputPublicDomain(e.target.value)}
                    placeholder="Contoh: https://bagaskara-sekar.vercel.app atau https://undangan.netlify.app"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 font-mono bg-stone-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => handleSavePublicDomain(inputPublicDomain)}
                    className="px-4 py-2 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-cinzel font-bold shadow-sm transition-colors whitespace-nowrap"
                  >
                    Terapkan Domain
                  </button>
                  {publicDomain && (
                    <button
                      type="button"
                      onClick={() => handleSavePublicDomain('')}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs transition-colors whitespace-nowrap"
                    >
                      Gunakan Domain Browser
                    </button>
                  )}
                </div>
              </div>

              {/* Google Spreadsheet Auto-Sync Status Badge for Guests */}
              <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                appsScriptUrl
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-300 text-amber-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isAutoSyncingGuests ? 'bg-blue-500 animate-ping' : (appsScriptUrl ? 'bg-emerald-500' : 'bg-amber-500')
                  }`} />
                  <div>
                    {appsScriptUrl ? (
                      <p>
                        <strong>Auto-Sync Spreadsheet Aktif:</strong> Buku tamu &amp; link khusus undangan (?to=...) <strong>otomatis tersimpan ke sheet "Guests" Google Spreadsheet</strong> setiap kali Anda menambah, mengedit, atau menghapus tamu.
                        {lastGuestsSyncedAt && (
                          <span className="ml-1 text-[11px] text-emerald-700 font-medium">
                            (Terakhir disinkronkan: {lastGuestsSyncedAt.toLocaleTimeString()})
                          </span>
                        )}
                      </p>
                    ) : (
                      <p>
                        <strong>Penyimpanan Lokal Aktif:</strong> Sambungkan URL Google Apps Script di tab <strong>Pengaturan</strong> agar buku tamu &amp; link khusus otomatis tersimpan di Google Spreadsheet.
                      </p>
                    )}
                  </div>
                </div>
                {isAutoSyncingGuests && (
                  <span className="text-[11px] font-mono text-blue-700 animate-pulse whitespace-nowrap">
                    Menyimpan otomatis...
                  </span>
                )}
              </div>

              {/* Top Banner explaining personalized links */}
              <div className="p-4 rounded-2xl bg-gold-50/80 border border-gold-300/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold-200/60 flex items-center justify-center text-gold-700 shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-keraton-900 text-sm sm:text-base">
                      Setiap tamu menerima undangan dengan namanya sendiri di halaman pembuka
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Nama tamu akan tercantum secara otomatis pada gerbang pembuka (Opening Gate) sebelum membuka undangan.
                      Anda dapat menyalin tautan unik atau langsung mengirimkannya via WhatsApp dengan ucapan sopan Jawa/Indonesia.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => setShowBatchModal(true)}
                    className="flex-1 md:flex-none text-xs font-cinzel font-bold px-3 py-2 rounded-xl bg-white border border-gold-400 text-gold-800 hover:bg-gold-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Massal</span>
                  </button>
                  <button
                    onClick={handleSyncGuestsToSheets}
                    disabled={isSyncingGuests}
                    className="flex-1 md:flex-none text-xs font-cinzel font-bold px-3.5 py-2 rounded-xl bg-gold-600 text-white hover:bg-gold-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{isSyncingGuests ? 'Menyimpan...' : 'Simpan ke Google Sheet'}</span>
                  </button>
                  {appsScriptUrl && (
                    <button
                      onClick={handleFetchGuestsFromSheets}
                      disabled={isSyncingGuests}
                      title="Ambil data tamu dari Google Sheet"
                      className="p-2 rounded-xl bg-white border border-stone-300 text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGuests ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Add Single Guest Form */}
              <form
                onSubmit={handleAddGuest}
                className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              >
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nama Tamu / Keluarga <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="Contoh: Bapak Ir. H. Sutrisno & Ibu"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 bg-stone-50/50"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    No. WhatsApp (Opsional)
                  </label>
                  <input
                    type="tel"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 bg-stone-50/50"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newGuestNotes}
                    onChange={(e) => setNewGuestNotes(e.target.value)}
                    placeholder="Contoh: Teman Kantor / VIP"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 bg-stone-50/50"
                  />
                </div>
                <div className="sm:col-span-1">
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-sm flex items-center justify-center transition-colors shadow-sm"
                    title="Tambah Tamu"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Guest Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-xs font-cinzel font-bold text-stone-600">
                        <th className="py-3 px-4">No</th>
                        <th className="py-3 px-4">Nama Tamu</th>
                        <th className="py-3 px-4">Tautan Personal (?to=...)</th>
                        <th className="py-3 px-4">Catatan</th>
                        <th className="py-3 px-4 text-center">Aksi / Kirim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {guests.map((guest, idx) => {
                        const guestUrl = generatePersonalizedUrl(baseUrl, guest.name);
                        const waShareUrl = generateWhatsAppShareUrl(guest.name, guestUrl, guest.phone);

                        return (
                          <tr key={guest.id} className="hover:bg-gold-50/30 transition-colors">
                            <td className="py-3 px-4 text-xs font-mono text-stone-400">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 font-serif font-bold text-stone-900">
                              <div>{guest.name}</div>
                              {guest.phone && (
                                <span className="text-[11px] font-sans text-stone-500 block">
                                  {guest.phone}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 max-w-xs">
                                <span className="text-xs font-mono text-gold-700 truncate bg-gold-50 px-2 py-1 rounded border border-gold-200 select-all">
                                  {guestUrl}
                                </span>
                                <button
                                  onClick={() => handleCopy(guestUrl, guest.id, 'Tautan Undangan')}
                                  title="Salin Tautan"
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-gold-100 text-stone-600 hover:text-gold-800 transition-colors shrink-0"
                                >
                                  {copiedKey === guest.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                {onSelectGuestPreview && (
                                  <button
                                    onClick={() => {
                                      onSelectGuestPreview(guest.name);
                                      onClose();
                                    }}
                                    title="Pratinjau Halaman Pembuka dengan nama ini"
                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-blue-100 text-stone-600 hover:text-blue-700 transition-colors shrink-0"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-stone-500">
                              {guest.notes || '-'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <a
                                  href={waShareUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-sm"
                                  title="Kirim Undangan via WhatsApp"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                                <button
                                  onClick={() => handleDeleteGuest(guest.id, guest.name)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Hapus Tamu"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RSVP SUMMARY (GOOGLE SHEET) */}
          {activeTab === 'rsvp' && (
            <RsvpSummaryTab
              appsScriptUrl={appsScriptUrl}
              onShowToast={onShowToast}
            />
          )}

          {/* TAB 2: PHOTO MANAGEMENT & GOOGLE DRIVE */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              {/* Photo Sync & Drive Info Banner */}
              <div className="p-4 rounded-2xl bg-gold-50/80 border border-gold-300/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold-200/60 flex items-center justify-center text-gold-700 shrink-0 mt-0.5">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-keraton-900 text-sm sm:text-base">
                      Ganti Semua 12 Foto Undangan ke Google Drive & Google Sheets
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Pilih foto dari komputer atau HP Anda. Foto akan langsung tampil di undangan dan otomatis diunggah ke Google Drive di folder khusus serta dicatat tautannya di spreadsheet.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {appsScriptUrl && (
                    <button
                      onClick={handleFetchPhotosFromSheets}
                      disabled={isSyncingPhotos}
                      className="text-xs font-cinzel font-bold px-3 py-2 rounded-xl bg-white border border-gold-400 text-gold-800 hover:bg-gold-50 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPhotos ? 'animate-spin' : ''}`} />
                      <span>{isSyncingPhotos ? 'Mengambil...' : 'Muat dari Google Sheets'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-stone-500 mr-2">Kategori:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-cinzel font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-gold-600 text-white shadow-sm'
                        : 'bg-white border border-stone-200 text-stone-600 hover:border-gold-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 12 Photo Slots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredConfigs.map((cfg) => {
                  const currentUrl = photos[cfg.key] || cfg.defaultUrl;
                  const isDefault = currentUrl === cfg.defaultUrl;
                  const isDrive = currentUrl.includes('googleusercontent.com') || currentUrl.includes('drive.google.com');
                  const isUploading = uploadingSlots[cfg.key];

                  return (
                    <div
                      key={cfg.key}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col hover:border-gold-400/80 transition-all group"
                    >
                      {/* Image Thumbnail Container */}
                      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                        <img
                          src={currentUrl}
                          alt={cfg.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className="bg-keraton-950/80 backdrop-blur-sm text-gold-300 text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-full border border-gold-400/30">
                            {cfg.section}
                          </span>
                          {isDrive ? (
                            <span className="bg-emerald-700/90 text-white text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full">
                              Google Drive
                            </span>
                          ) : isDefault ? (
                            <span className="bg-stone-700/80 text-stone-200 text-[10px] font-sans px-2 py-0.5 rounded-full">
                              Bawaan
                            </span>
                          ) : (
                            <span className="bg-blue-700/90 text-white text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full">
                              Lokal / Aktif
                            </span>
                          )}
                        </div>

                        {/* Uploading Overlay */}
                        {isUploading && (
                          <div className="absolute inset-0 bg-keraton-950/70 flex flex-col items-center justify-center text-white text-xs gap-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-gold-400" />
                            <span>Menyimpan ke Google Drive...</span>
                          </div>
                        )}
                      </div>

                      {/* Card Content & Actions */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif font-bold text-stone-900 text-sm mb-1 line-clamp-1">
                            {cfg.label}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                            {cfg.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                          {/* Hidden File Input */}
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => {
                              fileInputRefs.current[cfg.key] = el;
                            }}
                            onChange={(e) => handleFileChange(cfg.key, cfg.label, e)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[cfg.key]?.click()}
                            disabled={isUploading}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-cinzel font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Ganti Foto</span>
                          </button>

                          {!isDefault && (
                            <button
                              type="button"
                              onClick={() => handleResetPhoto(cfg.key)}
                              title="Kembalikan ke foto bawaan"
                              className="py-1.5 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-sans transition-colors"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO / YOUTUBE MUSIC SETTINGS */}
          {activeTab === 'music' && (
            <MusicSettingsTab
              currentConfig={audioConfig}
              onSaveConfig={onUpdateAudioConfig}
              onShowToast={onShowToast}
              isAppsScriptConnected={connectionStatus === 'connected' || !!appsScriptUrl}
              appsScriptUrl={appsScriptUrl}
            />
          )}

          {/* TAB 4: GOOGLE APPS SCRIPT SETTINGS & CODE */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Web App URL Form */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                  <div className="w-10 h-10 rounded-2xl bg-gold-100 flex items-center justify-center text-gold-700">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      Konfigurasi Web App Google Apps Script
                    </h3>
                    <p className="text-xs text-stone-500">
                      Hubungkan Spreadsheet & Drive Anda untuk penyimpanan foto dan daftar tamu tanpa batas
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Google Apps Script Web App URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={appsScriptUrl}
                      onChange={(e) => setAppsScriptUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-colors"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={connectionStatus === 'testing'}
                      className="px-4 py-2 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-cinzel font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {connectionStatus === 'testing' ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Uji Koneksi</span>
                    </button>
                  </div>

                  {/* Status Indicator */}
                  {connectionStatus === 'connected' && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Koneksi berhasil! Foto akan diunggah ke Google Drive dan tautan otomatis tersalin ke Google Sheets.</span>
                    </div>
                  )}
                  {connectionStatus === 'error' && (
                    <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{connectionError || 'Gagal terhubung. Pastikan Web App disetel dengan akses "Anyone" (Siapa saja).'}</span>
                    </div>
                  )}
                </div>

                {/* 1-Click Copy Code.gs */}
                <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl">
                  <div>
                    <h4 className="font-serif font-bold text-xs text-stone-900">
                      Kode Google Apps Script (Code.gs)
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Belum memasang script di Google Sheets? Salin kode berikut dan pasang di menu Ekstensi &gt; Apps Script.
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCodeGs}
                    className="px-4 py-2 rounded-xl bg-white border border-gold-400 text-gold-800 hover:bg-gold-50 text-xs font-cinzel font-bold transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    {hasCopiedCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{hasCopiedCode ? 'Tersalin!' : 'Salin Kode Apps Script'}</span>
                  </button>
                </div>
              </div>

              {/* Admin Security PIN & Access Control */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-base">
                        Keamanan Akses &amp; PIN Admin
                      </h3>
                      <p className="text-xs text-stone-500">
                        Panel ini rahasia dan tidak akan tampil untuk tamu publik
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-cinzel font-bold transition-colors border border-red-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Kunci Admin (Logout)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                    <span className="text-[11px] font-semibold text-emerald-800 block uppercase font-cinzel">
                      Status kredensial
                    </span>
                    <span className="text-xs text-emerald-900 block mt-1">
                      PIN disimpan sebagai hash di Google Apps Script. Tidak ada PIN bawaan atau PIN yang disimpan di browser.
                    </span>
                  </div>
                  <form onSubmit={handleUpdatePin} className="flex gap-2">
                    <input
                      type="password"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="PIN/passphrase baru (min. 10 karakter)"
                      maxLength={128}
                      autoComplete="new-password"
                      className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-stone-300 focus:outline-none focus:border-gold-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-cinzel font-bold transition-colors whitespace-nowrap shadow-sm"
                    >
                      Ubah PIN
                    </button>
                  </form>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Cara Pemilik Acara Membuka Panel Admin di Netlify / Vercel:</span>
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-stone-700">
                    <li>
                      Tambahkan <code>?admin=1</code> di akhir tautan website untuk membuka layar login. PIN tetap diverifikasi oleh backend.
                    </li>
                    <li>
                      Siapkan kredensial pertama melalui fungsi <code>setupAdminPin()</code> di editor Google Apps Script.
                    </li>
                    <li>
                      <strong>Cara 2 (Gerakan Rahasia):</strong> Klik <strong>3 kali</strong> pada tulisan hak cipta (copyright) atau logo Gunungan di paling bawah halaman footer.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Netlify & Vercel Deployment Guide */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4 text-xs text-stone-700">
                <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      Panduan Deploy ke Netlify / Vercel
                    </h3>
                    <p className="text-xs text-stone-500">
                      File konfigurasi SPA (<code>public/_redirects</code> &amp; <code>vercel.json</code>) telah disiapkan
                    </p>
                  </div>
                </div>

                <div className="space-y-3 leading-relaxed">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <p className="font-bold text-stone-900 mb-1">1. Deploy ke Vercel atau Netlify:</p>
                    <p className="text-[11px] text-stone-600">
                      Tinggal push project ke GitHub dan impor di <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Vercel</a> atau <a href="https://netlify.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-semibold">Netlify</a>. Konfigurasi build: <code>npm run build</code>, output directory: <code>dist</code>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <p className="font-bold text-stone-900 mb-1">2. Pasang Domain Publik di Panel Admin:</p>
                    <p className="text-[11px] text-stone-600">
                      Buka tab <strong>Buku Tamu &amp; Link Khusus</strong>, lalu masukkan domain website Anda (misal <code>https://bagaskara-sekar.vercel.app</code>). Semua link yang disalin atau dibagikan ke WhatsApp akan otomatis menggunakan domain publik tersebut.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <p className="font-bold text-stone-900 mb-1">3. Tampilan Tamu Bebas dari Tombol Admin:</p>
                    <p className="text-[11px] text-stone-600">
                      Tamu undangan umum yang membuka website <strong>tidak akan melihat tombol admin apapun</strong>. Undangan tampil 100% eksklusif dan bersih.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by step guide Google Apps Script */}
              <div className="p-6 rounded-3xl bg-ivory border border-gold-300/60 shadow-sm space-y-4 text-xs text-stone-700">
                <h4 className="font-serif font-bold text-sm text-keraton-900">
                  Langkah Memasang Backend Google Sheets &amp; Drive (Opsional):
                </h4>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>
                    Buka <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-gold-700 underline font-semibold">sheets.new</a> untuk membuat Google Spreadsheet baru.
                  </li>
                  <li>
                    Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                  </li>
                  <li>
                    Hapus kode bawaan, lalu tempel kode dari tombol <strong>"Salin Kode Apps Script"</strong> di atas.
                  </li>
                  <li>
                    Klik <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan baru (New deployment)</strong> &gt; pilih jenis <strong>Aplikasi web (Web app)</strong>.
                  </li>
                  <li>
                    Atur <em>Jalankan sebagai</em>: <strong>Saya</strong> dan <em>Yang memiliki akses</em>: <strong>Siapa saja (Anyone)</strong>.
                  </li>
                  <li>
                    Klik <strong>Terapkan</strong>, berikan izin Google, lalu salin <strong>URL Aplikasi Web</strong> dan tempel pada kolom di atas!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gold-300/40 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Raden Mas Bagaskara &amp; Roro Sekar Arum Wedding Portal</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-keraton-950 hover:bg-keraton-900 text-gold-200 hover:text-white font-cinzel font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Batch Names Input Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gold-300 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Tambah Nama Tamu Sekaligus (Massal)
              </h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-600">
              Ketik atau tempel nama tamu di bawah ini, <strong>satu nama per baris</strong>. Sistem akan otomatis membuatkan tautan personal dan tombol kirim WhatsApp untuk masing-masing tamu.
            </p>
            <textarea
              rows={6}
              value={batchNamesInput}
              onChange={(e) => setBatchNamesInput(e.target.value)}
              placeholder={`Bapak Dr. H. Soedibyo & Keluarga\nIbu Hj. Siti Nurhaliza\nRaden Danang Kusumo & Istri\nKeluarga Besar Alumni Arsitektur UGM`}
              className="w-full p-3 text-xs font-mono rounded-xl border border-stone-300 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBatchAddGuests}
                className="px-5 py-2 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-cinzel font-bold shadow-sm"
              >
                Tambahkan Tamu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
