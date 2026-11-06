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
import { GamelanAudioEngine } from './utils/audio';
import { VenueDetail } from './types/wedding';

export default function App() {
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [guestName, setGuestName] = useState('Keluarga Besar Bapak K.R.T. H. Suryo Diningrat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeMapVenue, setActiveMapVenue] = useState<VenueDetail | null>(null);
  const [lightboxData, setLightboxData] = useState<{ src: string; caption: string } | null>(null);

  const audioRef = useRef<GamelanAudioEngine | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Parse query params for guest name and testability autostart
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to');
    if (toParam) {
      setGuestName(toParam);
    }

    const autostart = params.get('autostart');
    if (autostart === '1' || autostart === 'true') {
      setIsGateOpen(true);
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
        <HeroSection onScrollToExplore={handleScrollToExplore} />
        <PhilosophySection />
        <CoupleSection />
        <CountdownSection onShowToast={handleShowToast} />
        <StoryTimeline />
        <EventsSection onOpenMapModal={(venue) => setActiveMapVenue(venue)} />
        <GallerySection
          onOpenLightbox={(src, caption) => setLightboxData({ src, caption })}
        />
        <RsvpWishesSection onShowToast={handleShowToast} />
        <GiftSection onCopyText={handleCopyText} />
        <Footer />
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

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
