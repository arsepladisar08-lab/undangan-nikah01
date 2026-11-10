import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { WeddingAudioConfig } from '../types/audio';
import { GamelanAudioEngine } from '../utils/audio';

export interface BackgroundAudioPlayerRef {
  play: () => Promise<boolean>;
  pause: () => void;
  toggle: () => void;
  isPlaying: boolean;
  currentTitle: string;
}

interface BackgroundAudioPlayerProps {
  config: WeddingAudioConfig;
  onStateChange: (isPlaying: boolean) => void;
  onAudioError?: (errorMessage: string) => void;
}

// Global declaration for YouTube IFrame API
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          videoId?: string;
          playerVars?: Record<string, string | number | boolean>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
            onError?: (event: { data: number; target: YTPlayerInstance }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  destroy: () => void;
  loadVideoById: (options: { videoId: string; startSeconds?: number }) => void;
  cueVideoById: (options: { videoId: string; startSeconds?: number }) => void;
}

export const BackgroundAudioPlayer = forwardRef<BackgroundAudioPlayerRef, BackgroundAudioPlayerProps>(
  ({ config, onStateChange, onAudioError }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [ytReady, setYtReady] = useState(false);

    const gamelanEngineRef = useRef<GamelanAudioEngine | null>(null);
    const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
    const playerContainerId = useRef(`yt-audio-frame-${Math.random().toString(36).substring(2, 9)}`);
    const wantsPlayRef = useRef(false);

    // Initialize or reconfigure audio engines when config changes
    useEffect(() => {
      // 1. Initialize Gamelan Engine
      if (!gamelanEngineRef.current) {
        gamelanEngineRef.current = new GamelanAudioEngine((playing) => {
          if (config.mode === 'gamelan') {
            setIsPlaying(playing);
            onStateChange(playing);
          }
        });
      }

      // 2. Initialize YouTube IFrame API if in youtube mode
      if (config.mode === 'youtube' && config.youtubeId) {
        loadYouTubeApi(() => {
          initYouTubePlayer(config.youtubeId, config.volume, config.startSeconds, config.loop);
        });
      } else if (config.mode === 'gamelan') {
        // If switched to gamelan, pause YouTube player if active
        if (ytPlayerRef.current) {
          try {
            ytPlayerRef.current.pauseVideo();
          } catch {
            // ignore
          }
        }
      }

      return () => {
        // cleanup on unmount
      };
    }, [config.mode, config.youtubeId]);

    // Handle volume or start time updates for YouTube
    useEffect(() => {
      if (config.mode === 'youtube' && ytPlayerRef.current && ytReady) {
        try {
          ytPlayerRef.current.setVolume(config.volume);
        } catch {
          // ignore
        }
      }
    }, [config.volume, ytReady, config.mode]);

    // Cleanup everything on unmount
    useEffect(() => {
      return () => {
        if (gamelanEngineRef.current) {
          gamelanEngineRef.current.destroy();
        }
        if (ytPlayerRef.current) {
          try {
            ytPlayerRef.current.destroy();
          } catch {
            // ignore
          }
        }
      };
    }, []);

    const loadYouTubeApi = (callback: () => void) => {
      if (window.YT && window.YT.Player) {
        callback();
        return;
      }

      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        callback();
      };
    };

    const initYouTubePlayer = (
      videoId: string,
      volume: number,
      startSeconds: number,
      loop: boolean
    ) => {
      if (!window.YT || !window.YT.Player) return;

      const container = document.getElementById(playerContainerId.current);
      if (!container) return;

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.loadVideoById({
            videoId,
            startSeconds,
          });
          ytPlayerRef.current.setVolume(volume);
          return;
        } catch {
          try {
            ytPlayerRef.current.destroy();
          } catch {
            // ignore
          }
        }
      }

      try {
        ytPlayerRef.current = new window.YT.Player(playerContainerId.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            start: startSeconds,
            loop: loop ? 1 : 0,
            ...(loop && videoId ? { playlist: videoId } : {}),
          },
          events: {
            onReady: (event) => {
              setYtReady(true);
              try {
                event.target.setVolume(volume);
                if (wantsPlayRef.current) {
                  event.target.playVideo();
                }
              } catch {
                // ignore
              }
            },
            onStateChange: (event) => {
              if (config.mode !== 'youtube') return;

              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                onStateChange(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
                onStateChange(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                if (config.loop) {
                  try {
                    event.target.seekTo(config.startSeconds || 0);
                    event.target.playVideo();
                  } catch {
                    setIsPlaying(false);
                    onStateChange(false);
                  }
                } else {
                  setIsPlaying(false);
                  onStateChange(false);
                }
              }
            },
            onError: (event) => {
              // Code 100/101/150: Video not found or embedding restricted
              const code = event.data;
              const errorText =
                code === 101 || code === 150
                  ? 'Video YouTube ini dibatasi oleh pemiliknya untuk diputar di situs web lain. Silakan pilih link YouTube lain.'
                  : code === 100
                  ? 'Video YouTube tidak ditemukan atau telah dihapus.'
                  : 'Gagal memutar audio YouTube (Error code ' + code + ').';

              onAudioError?.(errorText);

              // Seamless fallback to Gamelan engine so guests still hear music
              if (gamelanEngineRef.current && wantsPlayRef.current) {
                void gamelanEngineRef.current.start();
              }
            },
          },
        });
      } catch (err) {
        console.warn('YouTube Player initialization exception:', err);
      }
    };

    const playAudio = async (): Promise<boolean> => {
      wantsPlayRef.current = true;
      if (config.mode === 'youtube') {
        if (ytPlayerRef.current) {
          try {
            ytPlayerRef.current.setVolume(config.volume);
            ytPlayerRef.current.playVideo();
            setIsPlaying(true);
            onStateChange(true);
            return true;
          } catch {
            // fallback
          }
        }
        // If YT is not ready yet, mark wantsPlay
        return false;
      } else {
        if (gamelanEngineRef.current) {
          const ok = await gamelanEngineRef.current.start();
          setIsPlaying(ok);
          onStateChange(ok);
          return ok;
        }
        return false;
      }
    };

    const pauseAudio = () => {
      wantsPlayRef.current = false;
      if (config.mode === 'youtube') {
        if (ytPlayerRef.current) {
          try {
            ytPlayerRef.current.pauseVideo();
          } catch {
            // ignore
          }
        }
      } else {
        if (gamelanEngineRef.current) {
          gamelanEngineRef.current.pause();
        }
      }
      setIsPlaying(false);
      onStateChange(false);
    };

    const toggleAudio = () => {
      if (isPlaying) {
        pauseAudio();
      } else {
        void playAudio();
      }
    };

    // Imperative API for Parent
    useImperativeHandle(ref, () => ({
      play: playAudio,
      pause: pauseAudio,
      toggle: toggleAudio,
      isPlaying,
      currentTitle:
        config.mode === 'youtube'
          ? config.title || 'Musik YouTube Pernikahan'
          : 'Gamelan Slendro Ambience',
    }));

    return (
      <div
        className="fixed -top-96 -left-96 w-10 h-10 pointer-events-none opacity-0 overflow-hidden"
        aria-hidden="true"
        data-testid="youtube-audio-container"
      >
        <div id={playerContainerId.current} />
      </div>
    );
  }
);

BackgroundAudioPlayer.displayName = 'BackgroundAudioPlayer';
