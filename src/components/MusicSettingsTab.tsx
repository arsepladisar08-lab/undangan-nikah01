import React, { useState } from 'react';
import {
  Music,
  Youtube,
  Play,
  Pause,
  Check,
  AlertCircle,
  ExternalLink,
  Volume2,
  Sparkles,
  Info,
  Clock,
  Repeat,
} from 'lucide-react';
import {
  WeddingAudioConfig,
  AudioSourceMode,
  PRESET_YOUTUBE_TRACKS,
} from '../types/audio';
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  buildYouTubeEmbedUrl,
} from '../utils/audioConfig';

interface MusicSettingsTabProps {
  currentConfig: WeddingAudioConfig;
  onSaveConfig: (newConfig: WeddingAudioConfig) => void;
  onShowToast: (message: string) => void;
}

export const MusicSettingsTab: React.FC<MusicSettingsTabProps> = ({
  currentConfig,
  onSaveConfig,
  onShowToast,
}) => {
  const [mode, setMode] = useState<AudioSourceMode>(currentConfig.mode);
  const [youtubeUrl, setYoutubeUrl] = useState(currentConfig.youtubeUrl);
  const [youtubeId, setYoutubeId] = useState(currentConfig.youtubeId);
  const [title, setTitle] = useState(currentConfig.title);
  const [volume, setVolume] = useState(currentConfig.volume ?? 75);
  const [startSeconds, setStartSeconds] = useState(currentConfig.startSeconds ?? 0);
  const [loop, setLoop] = useState(currentConfig.loop ?? true);

  const [inputUrl, setInputUrl] = useState(currentConfig.youtubeUrl);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Validate and apply a YouTube URL or Video ID
  const handleApplyUrl = (rawUrl: string) => {
    setUrlError(null);
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      setUrlError('Masukkan tautan atau Video ID YouTube.');
      return;
    }

    const extractedId = extractYouTubeId(trimmed);
    if (!extractedId) {
      setUrlError('Tautan YouTube tidak valid. Gunakan format https://www.youtube.com/watch?v=... atau https://youtu.be/...');
      return;
    }

    setYoutubeId(extractedId);
    setYoutubeUrl(trimmed.startsWith('http') ? trimmed : `https://www.youtube.com/watch?v=${extractedId}`);
    setInputUrl(trimmed);

    // Auto update title suggestion if it's currently a default
    if (!title || title.includes('Slendro') || title === 'Musik YouTube Pernikahan') {
      setTitle('Lagu Pengiring Pernikahan (YouTube)');
    }

    setIsPreviewing(false);
    onShowToast(`Tautan YouTube berhasil diterapkan! ID: ${extractedId}`);
  };

  // Select a preset song
  const handleSelectPreset = (preset: typeof PRESET_YOUTUBE_TRACKS[0]) => {
    setMode('youtube');
    setYoutubeId(preset.youtubeId);
    setYoutubeUrl(preset.youtubeUrl);
    setInputUrl(preset.youtubeUrl);
    setTitle(preset.title);
    setUrlError(null);
    setIsPreviewing(false);
    onShowToast(`Memilih lagu preset: "${preset.title}"`);
  };

  // Save all settings
  const handleSave = () => {
    let finalId = youtubeId;
    if (mode === 'youtube') {
      if (!finalId && inputUrl) {
        const id = extractYouTubeId(inputUrl);
        if (id) {
          finalId = id;
        } else {
          setUrlError('Tautan YouTube belum valid. Periksa kembali tautan yang dimasukkan.');
          return;
        }
      }
    }

    const updated: WeddingAudioConfig = {
      mode,
      youtubeUrl,
      youtubeId: finalId,
      title: title.trim() || (mode === 'youtube' ? 'Musik YouTube Pernikahan' : 'Gamelan Slendro Ambience'),
      volume,
      startSeconds: Math.max(0, Number(startSeconds) || 0),
      loop,
    };

    onSaveConfig(updated);
    setIsPreviewing(false);
    onShowToast('Pengaturan pengiring musik pernikahan berhasil disimpan!');
  };

  const thumbnail = getYouTubeThumbnail(youtubeId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gold-50/80 border border-gold-300/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-200/70 flex items-center justify-center text-gold-800 shrink-0 mt-0.5">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-keraton-900 text-sm sm:text-base">
              Pengaturan Pengiring Suara &amp; Musik Latar Undangan
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Tamu akan mendengar alunan musik ini setelah menekan tombol <strong>"Buka Undangan"</strong> di halaman pembuka. Anda dapat memilih nada Gamelan tradisional atau memasukkan lagu YouTube pilihan Anda.
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-cinzel font-bold shadow-md transition-all shrink-0 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Simpan Pengaturan</span>
        </button>
      </div>

      {/* Mode Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode Option 1: Native Gamelan Web Audio */}
        <div
          onClick={() => setMode('gamelan')}
          className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
            mode === 'gamelan'
              ? 'border-gold-600 bg-white shadow-md ring-2 ring-gold-400/20'
              : 'border-stone-200 bg-stone-50/60 hover:bg-white hover:border-gold-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                mode === 'gamelan' ? 'bg-gold-500 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  Gamelan Jawa Slendro (Sintesis Bawaan)
                </h4>
                <span className="text-[11px] text-stone-500 font-sans block">
                  Web Audio API murni • Tanpa kuota video
                </span>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              mode === 'gamelan' ? 'border-gold-600 bg-gold-600' : 'border-stone-300'
            }`}>
              {mode === 'gamelan' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Menghasilkan alunan bunyi genta &amp; bonang pentatonik Slendro khas keraton secara alami dan lembut. Sangat ringan, tidak memakan kuota, dan langsung berbunyi di segala perangkat.
          </p>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] text-gold-800 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Rekomendasi untuk nuansa meditatif &amp; sakral</span>
          </div>
        </div>

        {/* Mode Option 2: YouTube Audio */}
        <div
          onClick={() => setMode('youtube')}
          className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
            mode === 'youtube'
              ? 'border-red-500 bg-white shadow-md ring-2 ring-red-400/20'
              : 'border-stone-200 bg-stone-50/60 hover:bg-white hover:border-red-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                mode === 'youtube' ? 'bg-red-600 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  Musik YouTube Kustom (Tautan Bebas)
                </h4>
                <span className="text-[11px] text-stone-500 font-sans block">
                  Iringan lagu asli dari YouTube
                </span>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              mode === 'youtube' ? 'border-red-600 bg-red-600' : 'border-stone-300'
            }`}>
              {mode === 'youtube' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Putar lagu pernikahan favorit Anda, gending Kebo Giro Keraton, Ladrang Wilujeng, atau instrumen romantis langsung dari tautan YouTube apa pun.
          </p>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] text-red-700 font-medium">
            <Check className="w-3.5 h-3.5 text-red-600" />
            <span>Mendukung tautan YouTube biasa, youtu.be, &amp; YouTube Shorts</span>
          </div>
        </div>
      </div>

      {/* YouTube Specific Settings Panel */}
      {mode === 'youtube' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-600" />
              <h4 className="font-serif font-bold text-base text-stone-900">
                Tentukan Tautan Musik YouTube
              </h4>
            </div>
            {youtubeId && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 font-mono text-stone-600 border border-stone-200">
                ID Video: <strong>{youtubeId}</strong>
              </span>
            )}
          </div>

          {/* Input Link YouTube */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700">
              Tempel Tautan YouTube (Video / Shorts / Share Link):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setUrlError(null);
                }}
                placeholder="Contoh: https://www.youtube.com/watch?v=W1YmH3_lJpA atau https://youtu.be/..."
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono bg-stone-50/50"
              />
              <button
                type="button"
                onClick={() => handleApplyUrl(inputUrl)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-cinzel font-bold transition-colors whitespace-nowrap shadow-sm"
              >
                Terapkan Link
              </button>
            </div>
            {urlError && (
              <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{urlError}</span>
              </p>
            )}
            <p className="text-[11px] text-stone-500">
              Tips: Pastikan video YouTube yang dipilih dapat diputar publik (bukan video berstatus pribadi / embedding dinonaktifkan).
            </p>
          </div>

          {/* YouTube Preview Card & Player */}
          {youtubeId && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:w-56 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-stone-300 shadow-sm group">
                <img
                  src={thumbnail}
                  alt="YouTube Thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setIsPreviewing(!isPreviewing)}
                    className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    title={isPreviewing ? 'Hentikan Pratinjau' : 'Putar Pratinjau Musik'}
                  >
                    {isPreviewing ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-cinzel font-bold text-red-600 uppercase tracking-wider block">
                      Video YouTube Terpilih
                    </span>
                    <h5 className="font-serif font-bold text-stone-900 text-sm">
                      {title || 'Musik Pengiring Pengantin'}
                    </h5>
                  </div>
                  <a
                    href={youtubeUrl.startsWith('http') ? youtubeUrl : `https://www.youtube.com/watch?v=${youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-sans text-blue-600 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Buka di YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPreviewing(!isPreviewing)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isPreviewing
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {isPreviewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPreviewing ? 'Sedang Memutar Pratinjau' : 'Uji Putar Musik'}</span>
                  </button>

                  <span className="text-[11px] text-stone-500">
                    Mulai detik ke-<strong>{startSeconds}s</strong> • Volume <strong>{volume}%</strong>
                  </span>
                </div>

                {/* Live Preview Embed when user clicks test */}
                {isPreviewing && (
                  <div className="pt-2 animate-in fade-in duration-300">
                    <iframe
                      src={buildYouTubeEmbedUrl(youtubeId, {
                        autoplay: true,
                        loop,
                        startSeconds,
                      })}
                      title="Pratinjau Musik YouTube"
                      className="w-full h-24 rounded-xl border border-red-300 shadow-inner"
                      allow="autoplay; encrypted-media"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Curated Javanese Presets (1-Click Selection) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <label className="text-xs font-serif font-bold text-stone-800">
                Pilihan Lagu Gamelan Jawa Rekomendasi (Siap Pakai 1-Klik):
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_YOUTUBE_TRACKS.map((preset) => {
                const isSelected = youtubeId === preset.youtubeId;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-gold-50/70 border-gold-500 shadow-sm ring-1 ring-gold-400'
                        : 'bg-white border-stone-200 hover:border-gold-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0 relative">
                      <img
                        src={getYouTubeThumbnail(preset.youtubeId)}
                        alt={preset.title}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-gold-600/60 flex items-center justify-center text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h6 className="font-serif font-bold text-xs text-stone-900 truncate">
                          {preset.title}
                        </h6>
                        {isSelected && (
                          <span className="text-[10px] font-cinzel font-bold text-gold-700 shrink-0">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Audio Settings: Title, Volume, Start Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
            {/* Title / Label */}
            <div className="sm:col-span-1 space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Judul Lagu (Tampil di Tamu):
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Gamelan Jawa Kebo Giro"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-gold-500 bg-stone-50/50"
              />
            </div>

            {/* Volume Control */}
            <div className="sm:col-span-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Volume Default:</span>
                </label>
                <span className="text-xs font-mono font-bold text-stone-900">{volume}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-gold-600 cursor-pointer"
              />
            </div>

            {/* Start Seconds & Loop */}
            <div className="sm:col-span-1 space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>Mulai dari Detik:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="3600"
                  value={startSeconds}
                  onChange={(e) => setStartSeconds(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-gold-500 text-center font-mono"
                />
                <label className="text-xs text-stone-600 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    className="accent-gold-600 rounded"
                  />
                  <Repeat className="w-3.5 h-3.5 text-stone-500" />
                  <span>Looping</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gamelan Mode Settings Panel */}
      {mode === 'gamelan' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Music className="w-5 h-5 text-gold-600" />
            <h4 className="font-serif font-bold text-base text-stone-900">
              Konfigurasi Gamelan Jawa Slendro
            </h4>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Tangga nada Slendro menggunakan frekuensi pentatonik alami <code>[261.63Hz, 293.66Hz, 349.23Hz, 392.00Hz, 440.00Hz, 523.25Hz, 587.33Hz]</code> yang beresonansi secara berkala setiap 1.9 detik saat undangan dibuka.
          </p>
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-gold-600 shrink-0" />
            <span>Mode ini tidak membutuhkan koneksi YouTube dan diputar langsung oleh browser tamu secara instan.</span>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 rounded-2xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-cinzel font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Simpan &amp; Terapkan Pengiring Suara</span>
        </button>
      </div>
    </div>
  );
};
