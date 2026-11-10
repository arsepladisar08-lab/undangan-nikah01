import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Search,
  Copy,
  Download,
  Calendar,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Share2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { WishItem } from '../types/wedding';
import {
  fetchRsvpFromAppsScript,
  RSVP_STORAGE_KEY,
} from '../utils/appsScriptClient';
import {
  calculateRsvpStats,
  formatRsvpSummaryText,
  parseHeadcount,
} from '../utils/rsvpCalculations';

interface RsvpSummaryTabProps {
  appsScriptUrl: string;
  onShowToast: (message: string) => void;
}

const FALLBACK_INITIAL_WISHES: WishItem[] = [
  {
    id: 'w1',
    name: 'K.R.T. H. Wicaksono Hadiningrat',
    attendance: 'InshaAllah Attending',
    guestCount: '2 Persons',
    message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair. May Allah bless your household with eternal Sakinah, Mawaddah, wa Rahmah.",
    timestamp: 'Kemarin, 14:20 WIB',
  },
  {
    id: 'w2',
    name: 'dr. Hj. Maharani Puspitasari, Sp.A',
    attendance: 'InshaAllah Attending',
    guestCount: '2 Persons',
    message: 'Alhamdulillah, so happy to witness both of you uniting in marriage! Wishing you righteous offspring and endless blessings.',
    timestamp: '2 hari lalu',
  },
  {
    id: 'w3',
    name: 'H. Dimas Prasetyo Nugroho, S.T.',
    attendance: 'Regretfully Unable',
    guestCount: '1 Person',
    message: 'Warmest congratulations to Mas Bagas and Mbak Sekar! Sending our best prayers from Surabaya.',
    timestamp: '3 hari lalu',
  },
];

export const RsvpSummaryTab: React.FC<RsvpSummaryTabProps> = ({
  appsScriptUrl,
  onShowToast,
}) => {
  const [rsvpList, setRsvpList] = useState<WishItem[]>(() => {
    try {
      const saved = localStorage.getItem(RSVP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return FALLBACK_INITIAL_WISHES;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attending' | 'unable'>('all');
  const [isCopied, setIsCopied] = useState(false);

  // Fetch from Google Sheet or fallback
  const handleFetchRsvp = async (showToastNotice = true) => {
    const url = appsScriptUrl.trim();
    if (!url || !url.startsWith('http')) {
      if (showToastNotice) {
        onShowToast('Menampilkan data RSVP lokal. Hubungkan Google Apps Script di Tab Pengaturan untuk data langsung dari Google Sheet.');
      }
      return;
    }

    setIsLoading(true);
    try {
      const remoteData = await fetchRsvpFromAppsScript(url);
      if (remoteData && remoteData.length > 0) {
        setRsvpList(remoteData);
        localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(remoteData));
        setLastFetchedAt(new Date());
        if (showToastNotice) {
          onShowToast(`Berhasil memuat ${remoteData.length} data RSVP dari Google Spreadsheet!`);
        }
      } else {
        if (showToastNotice) {
          onShowToast('Belum ada data RSVP baru di Google Spreadsheet.');
        }
      }
    } catch (err: unknown) {
      if (showToastNotice) {
        onShowToast(err instanceof Error ? err.message : 'Gagal mengambil RSVP dari Google Sheet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      void handleFetchRsvp(false);
    }
  }, [appsScriptUrl]);

  // Compute Statistics
  const stats = useMemo(() => calculateRsvpStats(rsvpList), [rsvpList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return rsvpList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchQuery.toLowerCase());

      const isAttending =
        item.attendance === 'InshaAllah Attending' ||
        item.attendance?.toLowerCase().includes('attend') ||
        item.attendance?.toLowerCase().includes('hadir');

      if (!matchesSearch) return false;
      if (statusFilter === 'attending') return isAttending;
      if (statusFilter === 'unable') return !isAttending;
      return true;
    });
  }, [rsvpList, searchQuery, statusFilter]);

  // Copy Summary text to Clipboard
  const handleCopySummary = async () => {
    try {
      const text = formatRsvpSummaryText(rsvpList);
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
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      onShowToast('Ringkasan RSVP disalin! Siap dibagikan ke WhatsApp / Panitia.');
    } catch {
      onShowToast('Gagal menyalin ringkasan RSVP.');
    }
  };

  // Export Attendees to CSV
  const handleExportCsv = () => {
    if (rsvpList.length === 0) {
      onShowToast('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = ['No', 'Nama Tamu', 'Konfirmasi Kehadiran', 'Jumlah Porsi/Pax', 'Doa & Ucapan', 'Waktu'];
    const rows = rsvpList.map((item, idx) => [
      idx + 1,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.attendance}"`,
      parseHeadcount(item.guestCount),
      `"${(item.message || '').replace(/"/g, '""')}"`,
      `"${item.timestamp || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RSVP_Undangan_Bagaskara_Sekar_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('File CSV berhasil diunduh!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Banner & Quick Actions */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-keraton-950 via-keraton-900 to-keraton-950 text-gold-200 border border-gold-400/40 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-400/60 flex items-center justify-center text-gold-300 shrink-0 mt-0.5">
            <HeartHandshake className="w-5 h-5 text-gold-300" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base sm:text-lg flex items-center gap-2">
              <span>Ringkasan RSVP &amp; Kehadiran Tamu (Google Sheet)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/30 text-gold-300 border border-gold-400/50 font-sans uppercase tracking-wider font-semibold">
                Khusus Admin
              </span>
            </h3>
            <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
              Pantau rekapitulasi konfirmasi kehadiran, estimasi jumlah porsi/pax, dan doa restu dari para tamu yang tercatat di Google Spreadsheet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => handleFetchRsvp(true)}
            disabled={isLoading}
            title="Segarkan data dari Google Spreadsheet"
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-keraton-800 hover:bg-keraton-700 text-gold-300 hover:text-white border border-gold-400/40 text-xs font-cinzel font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Memuat...' : 'Segarkan Data'}</span>
          </button>

          <button
            onClick={handleCopySummary}
            title="Salin teks ringkasan untuk WhatsApp"
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-white text-xs font-cinzel font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isCopied ? 'Tersalin!' : 'Bagikan Ringkasan'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            title="Unduh data dalam format CSV / Excel"
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-600 text-xs transition-colors flex items-center justify-center cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Spreadsheet Connection Indicator */}
      <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
        appsScriptUrl
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
          : 'bg-amber-50/80 border-amber-300 text-amber-900'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            appsScriptUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`} />
          <p>
            {appsScriptUrl ? (
              <>
                <strong>Terhubung ke Google Spreadsheet:</strong> Data disinkronkan langsung dari sheet <code>"RSVP"</code>.
                {lastFetchedAt && (
                  <span className="ml-1 text-[11px] text-emerald-700 font-medium">
                    (Pembaruan: {lastFetchedAt.toLocaleTimeString()})
                  </span>
                )}
              </>
            ) : (
              <>
                <strong>Mode Pratinjau Lokal:</strong> Data ditampilkan dari penyimpanan peramban. Masukkan URL Web App di tab <strong>Pengaturan</strong> untuk sinkronisasi otomatis dari Google Spreadsheet.
              </>
            )}
          </p>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-white/70 border border-stone-200">
          {stats.totalResponses} Total Respon
        </span>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Total Confirmed Attending */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between hover:border-gold-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500">Konfirmasi Hadir</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {stats.attendingCount}
              </span>
              <span className="text-xs text-stone-500">keluarga</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>{stats.attendingRate}% tingkat kehadiran</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Total Estimated Headcount (Pax) */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between hover:border-gold-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500">Estimasi Porsi / Pax</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-700">
                {stats.totalHeadcount}
              </span>
              <span className="text-xs text-stone-500">orang hadir</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Akumulasi jumlah tamu konfirmasi
            </p>
          </div>
        </div>

        {/* Stat 3: Total Unable to Attend */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between hover:border-gold-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500">Berhalangan Hadir</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {stats.unableCount}
              </span>
              <span className="text-xs text-stone-500">tamu</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-rose-600">
              <XCircle className="w-3 h-3" />
              <span>Kirim doa restu jarak jauh</span>
            </div>
          </div>
        </div>

        {/* Stat 4: Total Responses */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between hover:border-gold-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500">Total Respon Masuk</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {stats.totalResponses}
              </span>
              <span className="text-xs text-stone-500">jawaban</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Tercatat di Google Spreadsheet
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama tamu atau doa ucapan..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs font-cinzel font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-keraton-900 text-gold-300 font-bold shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Semua ({stats.totalResponses})
          </button>
          <button
            onClick={() => setStatusFilter('attending')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'attending'
                ? 'bg-emerald-700 text-white font-bold shadow-sm'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Hadir ({stats.attendingCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('unable')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'unable'
                ? 'bg-rose-700 text-white font-bold shadow-sm'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <UserX className="w-3 h-3" />
            <span>Berhalangan ({stats.unableCount})</span>
          </button>
        </div>
      </div>

      {/* Attendees List Table / Card View */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
              Daftar Tamu &amp; Doa Restu Masuk
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono font-medium">
              {filteredList.length} dari {stats.totalResponses}
            </span>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-stone-400 space-y-2">
            <HeartHandshake className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-sm font-medium text-stone-600">Tidak ada data RSVP yang sesuai.</p>
            <p className="text-xs text-stone-400">
              {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada tamu yang mengirimkan konfirmasi kehadiran.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredList.map((item, idx) => {
              const isAttending =
                item.attendance === 'InshaAllah Attending' ||
                item.attendance?.toLowerCase().includes('attend') ||
                item.attendance?.toLowerCase().includes('hadir');

              const pax = parseHeadcount(item.guestCount);

              return (
                <div
                  key={item.id || `rsvp_${idx}`}
                  className="p-4 sm:p-5 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-mono font-bold text-stone-600 shrink-0 text-[11px] mt-0.5">
                      {idx + 1}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif font-bold text-stone-900 text-sm">
                          {item.name}
                        </span>

                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-cinzel font-bold ${
                          isAttending
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {isAttending ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>InshaAllah Hadir</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-700" />
                              <span>Berhalangan</span>
                            </>
                          )}
                        </span>

                        {/* Headcount Badge */}
                        {isAttending && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono font-medium text-[10px]">
                            {pax} Orang
                          </span>
                        )}
                      </div>

                      {/* Heartfelt Message Quote */}
                      {item.message && (
                        <blockquote className="text-stone-600 italic bg-stone-50/80 p-2.5 rounded-xl border-l-2 border-gold-400 text-[11px] leading-relaxed">
                          "{item.message}"
                        </blockquote>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-stone-400">
                        <Clock className="w-3 h-3" />
                        <span>{item.timestamp || 'Baru saja'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
