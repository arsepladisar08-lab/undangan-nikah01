import { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
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
import { GamelanAudioEngine } from './utils/audio';
import { VenueDetail } from './types/wedding';
import { PhotoMap, PhotoSlotKey, DEFAULT_PHOTOS } from './types/photos';
import {
  CUSTOM_PHOTOS_STORAGE_KEY,
  APPS_SCRIPT_URL_STORAGE_KEY,
  fetchPhotosFromAppsScript,
  isCurrentlyAdminAuthenticated,
  setAdminAuthenticated,
  verifyAdminPin,
} from './utils/appsScriptClient';

export default function App() {
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [guestName, setGuestName] = useState('Keluarga Besar Bapak K.R.T. H. Suryo Diningrat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeMapVenue, setActiveMapVenue] = useState<VenueDetail | null>(null);
  const [lightboxData, setLightboxData] = useState<{ src: string; caption: string } | null>(null);

  // Admin Security and Auth State (Hidden from public by default)
  const [isAdmin, setIsAdmin] = useState(() => isCurrentlyAdminAuthenticated());
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

  const audioRef = useRef<GamelanAudioEngine | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Parse query params for guest name and testability autostart / admin
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to');
    if (toParam) {
      setGuestName(toParam);
    }

    const autostart = params.get('autostart');
    if (autostart === '1' || autostart === 'true') {
      setIsGateOpen(true);
    }

    // Check for admin trigger in URL (e.g. ?admin=1212 or ?admin=1)
    const adminParam = params.get('admin');
    if (adminParam) {
      if (verifyAdminPin(adminParam)) {
        setAdminAuthenticated(true, true);
        setIsAdmin(true);
        setIsAdminOpen(true);
      } else if (isCurrentlyAdminAuthenticated()) {
        setIsAdmin(true);
        setIsAdminOpen(true);
      } else {
        // Show passcode modal for admin verification
        setIsPasscodeOpen(true);
      }
    }

    // Auto-fetch latest photos from Google Apps Script if URL is saved
    try {
      const savedAppsScriptUrl = localStorage.getItem(APPS_SCRIPT_URL_STORAGE_KEY);
      if (savedAppsScriptUrl) {
        void fetchPhotosFromAppsScript(savedAppsScriptUrl).then((remote) => {
          if (remote && Object.keys(remote).length > 0) {
            setPhotos((prev) => ({ ...prev, ...remote }));
          }
        }).catch(() => {
          // Silent fallback to local photos
        });
      }
    } catch {
      // ignore
    }

    // Initialize Gamelan Audio Engine
    audioRef.current = new GamelanAudioEngine((playing) => {
      setIsPlayingMusic(playing);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.destroy();
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleOpenInvitation = () => {
    setIsGateOpen(true);
    // Start ambient gamelan music on user gesture
    if (audioRef.current) {
      void audioRef.current.start();
    }
  };

  const handleToggleAudio = () => {
    if (audioRef.current) {
      audioRef.current.toggle();
    }
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
      {/* Quick Host / Admin Trigger (Floating) - ONLY rendered when Admin is Authenticated */}
      {isAdmin && (
        <div className="fixed top-4 right-4 z-40 animate-fadeIn">
          <button
            onClick={() => setIsAdminOpen(true)}
            aria-label="Buka Panel Kelola Undangan & Foto"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-keraton-950/90 hover:bg-keraton-900 text-gold-300 border border-gold-400/80 shadow-lg backdrop-blur-md transition-all hover:scale-105 cursor-pointer text-xs font-cinzel font-bold"
            title="Kelola Undangan, Tamu & Foto (Google Drive)"
          >
            <Settings className="w-3.5 h-3.5 text-gold-400 animate-spin-slow" />
            <span>Mode Admin</span>
          </button>
        </div>
      )}

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
          isAdmin={isAdmin}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onSecretAdminTrigger={handleSecretAdminTrigger}
        />
      </main>

      {/* Floating Audio Ambience Toggle */}
      <FloatingAudioControl
        isPlaying={isPlayingMusic}
        onToggle={handleToggleAudio}
        visible={isGateOpen}
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
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          setIsPasscodeOpen(false);
          setIsAdminOpen(true);
        }}
        onShowToast={handleShowToast}
      />

      {/* Admin, Guest List & Photo Manager Modal (Google Drive & Sheets) */}
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
          setIsAdmin(false);
          setIsAdminOpen(false);
        }}
        onShowToast={handleShowToast}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
