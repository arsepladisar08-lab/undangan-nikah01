import { WeddingAudioConfig, DEFAULT_AUDIO_CONFIG } from '../types/audio';

export const AUDIO_CONFIG_STORAGE_KEY = 'javanese_wedding_audio_config';

/**
 * Extracts the 11-character YouTube video ID from various YouTube URL formats.
 * Supports standard watch URLs, short links (youtu.be), embeds, shorts, mobile links, or raw IDs.
 */
export function extractYouTubeId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();

  // If already an 11-char video ID (alphanumeric, -, _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common patterns
  // 1. https://youtu.be/ID
  // 2. https://www.youtube.com/watch?v=ID
  // 3. https://www.youtube.com/embed/ID
  // 4. https://www.youtube.com/shorts/ID
  // 5. https://www.youtube.com/live/ID
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }

  return null;
}

/**
 * Returns the highest resolution available thumbnail URL for a given YouTube ID.
 */
export function getYouTubeThumbnail(videoId: string): string {
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Loads the saved WeddingAudioConfig from localStorage with safe fallback.
 */
export function loadAudioConfig(): WeddingAudioConfig {
  try {
    const saved = localStorage.getItem(AUDIO_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_AUDIO_CONFIG,
        ...parsed,
        // Re-validate youtubeId from youtubeUrl if corrupted
        youtubeId: parsed.youtubeId || extractYouTubeId(parsed.youtubeUrl) || DEFAULT_AUDIO_CONFIG.youtubeId,
      };
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_AUDIO_CONFIG;
}

/**
 * Saves the WeddingAudioConfig to localStorage.
 */
export function saveAudioConfig(config: WeddingAudioConfig): void {
  try {
    localStorage.setItem(AUDIO_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Quota or disabled storage
  }
}

/**
 * Generates an optimized YouTube embed URL for background audio playback.
 */
export function buildYouTubeEmbedUrl(
  videoId: string,
  options: {
    autoplay?: boolean;
    loop?: boolean;
    startSeconds?: number;
    enableJsApi?: boolean;
  } = {}
): string {
  const { autoplay = true, loop = true, startSeconds = 0, enableJsApi = true } = options;
  const params = new URLSearchParams({
    enablejsapi: enableJsApi ? '1' : '0',
    autoplay: autoplay ? '1' : '0',
    controls: '0',
    modestbranding: '1',
    rel: '0',
    playsinline: '1',
    start: String(Math.max(0, startSeconds)),
  });

  if (loop && videoId) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }

  // Origin helps postMessage communication with YouTube IFrame API
  if (typeof window !== 'undefined' && window.location?.origin) {
    params.set('origin', window.location.origin);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
