import { useState, useEffect, useRef } from 'react';
import { OpeningGate } from './components/OpeningGate';
import { HeroSection } from './components/HeroSection';
import { PhilosophySection } from './components/PhilosophySection';
import { CoupleSection } from './components/CoupleSection';
import { CountdownSection } from './components/CountdownSection';
import { StoryTimeline } from './components/StoryTimeline';
import { EventsSection } from './components/EventsSection';
import { GallerySection } from './components/GallerySection';
import { RsvpWishesSection } from './components/RsvpWishesSection';
import { GiftSection } from './components/GiftSection';
import { Footer } from './components/Footer';
import { MapModal, LightboxModal } from './components/Modals';
import { FloatingAudioControl } from './components/FloatingAudioControl';
import { Toast } from './components/Toast';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { BackgroundAudioPlayer, BackgroundAudioPlayerRef } from './components/BackgroundAudioPlayer';
import { VenueDetail } from './types/wedding';
import { PhotoMap, PhotoSlotKey, DEFAULT_PHOTOS } from './types/photos';
import { WeddingAudioConfig } from './types/audio';
import { loadAudioConfig, saveAudioConfig } from './utils/audioConfig';
import {
  CUSTOM_PHOTOS_STORAGE_KEY,
  fetchPhotosFromAppsScript,
  saveAudioToAppsScript,
  fetchAudioFromAppsScript,
  isCurrentlyAdminAuthenticated,
  getAppsScriptUrl,
  getAdminToken,
  clearAdminToken,
  logoutAdminFromAppsScript,
} from './utils/appsScriptClient';

export default function App() {
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [guestName, setGuestName] = useState('Keluarga Besar Bapak K.R.T. H. Suryo Diningrat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeMapVenue, setActiveMapVenue] = useState<VenueDetail | null>(null);
  const [lightboxData, setLightboxData] = useState<{ src: string; caption: string } | null>(null);

  // Admin Security and Auth State:
  // Strictly hidden from public/guests by default.
  // If the URL has ?to=... and no ?admin=..., isAdmin is guaranteed FALSE.
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('to') && !params.has('admin')) return false;
      return isCurrentlyAdminAuthenticated();
    } catch {
      return false;
    }
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);

  const [photos, setPhotos] = useState<PhotoMap>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_PHOTOS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PHOTOS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PHOTOS;
  });

  const [audioConfig, setAudioConfig] = useState<WeddingAudioConfig>(() => loadAudioConfig());
  const audioPlayerRef = useRef<BackgroundAudioPlayerRef | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Parse query params for guest name and testability autostart / admin
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to');
    const adminParam = params.get('admin');

    if (toParam) {
      setGuestName(toParam);
    }

    const autostart = params.get('autostart');
    if (autostart === '1' || autostart === 'true') {
      setIsGateOpen(true);
    }

    // Personalized guest links never expose the admin interface.
    if (toParam && !adminParam) {
      setIsAdmin(false);
      setIsAdminOpen(false);
      setIsPasscodeOpen(false);
      clearAdminToken();
    } else if (isCurrentlyAdminAuthenticated()) {
      setIsAdmin(true);
      if (adminParam) setIsAdminOpen(true);
    } else if (adminParam) {
      // ?admin=1 is only an entry point; authentication is always server-verified.
      setIsAdmin(false);
      setIsPasscodeOpen(true);
    }

    // Public backend URL is injected at build time so guest devices can load the same data.
    const savedAppsScriptUrl = getAppsScriptUrl();
    if (savedAppsScriptUrl) {
      void fetchPhotosFromAppsScript(savedAppsScriptUrl).then((remote) => {
        if (remote && Object.keys(remote).length > 0) setPhotos((prev) => ({ ...prev, ...remote }));
      }).catch(() => {
        // Keep the invitation usable with bundled photos if the backend is unavailable.
      });
      void fetchAudioFromAppsScript(savedAppsScriptUrl).then((remoteAudio) => {
        if (remoteAudio) {
          setAudioConfig(remoteAudio);
          saveAudioConfig(remoteAudio);
        }
      }).catch(() => {
        // Keep local audio configuration as fallback.
      });
    }

    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleOpenInvitation = () => {
    setIsGateOpen(true);
    // Start ambient music (YouTube or Gamelan Slendro) on user gesture
    if (audioPlayerRef.current) {
      void audioPlayerRef.current.play();
    }
  };

  const handleToggleAudio = () => {
    if (audioPlayerRef.current) {
      if (!isPlayingMusic) {
        void audioPlayerRef.current.play();
      } else {
        const nextMuted = audioPlayerRef.current.toggleMute();
        setIsAudioMuted(nextMuted);
      }
    }
  };

  const handleUpdateAudioConfig = async (newConfig: WeddingAudioConfig) => {
    setAudioConfig(newConfig);
    saveAudioConfig(newConfig);

    const savedAppsScriptUrl = getAppsScriptUrl();
    if (savedAppsScriptUrl) {
      try {
        await saveAudioToAppsScript(savedAppsScriptUrl, newConfig, getAdminToken());
        handleShowToast('Pengaturan musik berhasil disimpan ke server.');
        return;
      } catch (err: unknown) {
        console.warn('Audio sync failed:', err);
        handleShowToast(err instanceof Error ? err.message : 'Gagal menyimpan musik ke server. Perubahan hanya tersimpan di perangkat ini.');
        return;
      }
    }
    handleShowToast('URL backend belum dikonfigurasi. Perubahan musik hanya tersimpan di perangkat ini.');
  };

  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleCopyText = async (text: string, successMsg: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      handleShowToast(successMsg);
    } catch {
      handleShowToast(successMsg);
    }
  };

  const handleScrollToExplore = () => {
    const el = document.getElementById('philosophy-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUpdatePhoto = (slotKey: PhotoSlotKey, url: string) => {
    setPhotos((prev) => ({ ...prev, [slotKey]: url }));
  };

  const handleUpdateAllPhotos = (newPhotos: PhotoMap) => {
    setPhotos(newPhotos);
  };

  const handleSecretAdminTrigger = () => {
    if (isAdmin) {
      setIsAdminOpen(true);
    } else {
      setIsPasscodeOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fdfbf7] text-[#2c1e14] font-sans antialiased selection:bg-[#e2c37d] selection:text-[#1f1610]">
      {/* Opening Gate Overlay */}
      <OpeningGate
        isOpen={isGateOpen}
        onOpen={handleOpenInvitation}
        guestName={guestName}
      />

      {/* Main Wedding Invitation Content */}
      <main className="w-full overflow-x-hidden">
        <HeroSection
          onScrollToExplore={handleScrollToExplore}
          photoUrl={photos.heroArch}
        />
        <PhilosophySection />
        <CoupleSection
          groomPhotoUrl={photos.groomPhoto}
          bridePhotoUrl={photos.bridePhoto}
        />
        <CountdownSection onShowToast={handleShowToast} />
        <StoryTimeline
          storyPhotos={{
            story1: photos.story1,
            story2: photos.story2,
            story3: photos.story3,
          }}
        />
        <EventsSection onOpenMapModal={(venue) => setActiveMapVenue(venue)} />
        <GallerySection
          onOpenLightbox={(src, caption) => setLightboxData({ src, caption })}
          galleryPhotos={photos}
        />
        <RsvpWishesSection onShowToast={handleShowToast} />
        <GiftSection onCopyText={handleCopyText} />
        <Footer
          onSecretAdminTrigger={handleSecretAdminTrigger}
        />
      </main>

      {/* Background Audio Player Engine (YouTube Audio & Slendro Gamelan Synthesizer) */}
      <BackgroundAudioPlayer
        ref={audioPlayerRef}
        config={audioConfig}
        onStateChange={setIsPlayingMusic}
        onMuteChange={setIsAudioMuted}
        onAudioError={(err) => handleShowToast(err)}
      />

      {/* Floating Audio Ambience Toggle */}
      <FloatingAudioControl
        isPlaying={isPlayingMusic}
        isMuted={isAudioMuted}
        onToggle={handleToggleAudio}
        visible={isGateOpen}
        trackTitle={audioConfig.mode === 'youtube' ? audioConfig.title : 'Gamelan Slendro Ambience'}
        mode={audioConfig.mode}
      />

      {/* Venue Map Modal */}
      <MapModal
        venue={activeMapVenue}
        onClose={() => setActiveMapVenue(null)}
      />

      {/* Photo Lightbox Modal */}
      <LightboxModal
        src={lightboxData?.src || null}
        caption={lightboxData?.caption || ''}
        onClose={() => setLightboxData(null)}
      />

      {/* Admin Passcode Authentication Modal */}
      <AdminPasscodeModal
        webAppUrl={getAppsScriptUrl()}
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          setIsPasscodeOpen(false);
          setIsAdminOpen(true);
        }}
        onShowToast={handleShowToast}
      />

      {/* Admin, Guest List, Music & Photo Manager Modal (Google Drive & Sheets) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        photos={photos}
        onUpdatePhoto={handleUpdatePhoto}
        onUpdateAllPhotos={handleUpdateAllPhotos}
        onSelectGuestPreview={(name) => {
          setGuestName(name);
          setIsGateOpen(false);
          handleShowToast(`Melihat halaman pembuka untuk: ${name}`);
        }}
        onLogoutAdmin={() => {
          void logoutAdminFromAppsScript(getAppsScriptUrl());
          setIsAdmin(false);
          setIsAdminOpen(false);
        }}
        onShowToast={handleShowToast}
        audioConfig={audioConfig}
        onUpdateAudioConfig={handleUpdateAudioConfig}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
