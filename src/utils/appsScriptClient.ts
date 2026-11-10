import { PhotoSlotKey, GuestItem } from '../types/photos';
import { WeddingAudioConfig, AudioSourceMode } from '../types/audio';
import { WishItem } from '../types/wedding';

/**
 * Storage keys for local persistence
 */
export const APPS_SCRIPT_URL_STORAGE_KEY = 'javanese_wedding_apps_script_url';
export const CUSTOM_PHOTOS_STORAGE_KEY = 'javanese_wedding_custom_photos';
export const GUESTS_STORAGE_KEY = 'javanese_wedding_guests';
export const PUBLIC_DOMAIN_STORAGE_KEY = 'javanese_wedding_public_domain';
export const ADMIN_PIN_STORAGE_KEY = 'javanese_wedding_admin_pin';
export const ADMIN_SESSION_STORAGE_KEY = 'javanese_wedding_admin_authenticated';
export const RSVP_STORAGE_KEY = 'bagaskara_sekar_wishes';

/**
 * Default PIN for Host / Admin access (1212 - matching wedding date 12.12.2026)
 */
export const DEFAULT_ADMIN_PIN = '1212';

/**
 * Check if admin is currently authenticated in the session.
 * STRICT SECURITY: Admin session is ONLY stored ephemerally in sessionStorage.
 * Any stale localStorage keys are aggressively purged to prevent leaking admin mode
 * to public visitors or guest links.
 */
export function isCurrentlyAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // Purge any lingering localStorage session to guarantee guest visitors never see admin mode
    localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    return sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Store admin authentication state ephemerally (sessionStorage only)
 */
export function setAdminAuthenticated(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    if (authenticated) {
      sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Verify given PIN against saved or default PIN
 */
export function verifyAdminPin(enteredPin: string): boolean {
  const cleanEntered = enteredPin ? enteredPin.trim() : '';
  if (!cleanEntered) return false;
  if (typeof window === 'undefined') return cleanEntered === DEFAULT_ADMIN_PIN;
  try {
    const savedPin = localStorage.getItem(ADMIN_PIN_STORAGE_KEY) || DEFAULT_ADMIN_PIN;
    return cleanEntered === savedPin.trim();
  } catch {
    return cleanEntered === DEFAULT_ADMIN_PIN;
  }
}

/**
 * Update the Admin PIN
 */
export function saveAdminPin(newPin: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_PIN_STORAGE_KEY, newPin.trim());
}

/**
 * Get effective public base URL (preferring user's custom Netlify/Vercel/custom domain if set)
 */
export function getEffectiveBaseUrl(configuredDomain?: string): string {
  let domain = configuredDomain;
  if (!domain && typeof window !== 'undefined') {
    try {
      domain = localStorage.getItem(PUBLIC_DOMAIN_STORAGE_KEY) || undefined;
    } catch {
      // Ignore
    }
  }

  if (domain && domain.trim()) {
    let clean = domain.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    // Remove trailing slashes
    return clean.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    return (window.location.origin + window.location.pathname).replace(/\/+$/, '');
  }

  return 'https://bagaskara-sekar.vercel.app';
}

/**
 * Generate a personalized wedding invitation URL for a given guest
 */
export function generatePersonalizedUrl(baseUrl: string, guestName: string): string {
  const trimmedName = guestName.trim();
  if (!trimmedName) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    url.searchParams.set('to', trimmedName);
    return url.toString();
  } catch {
    const cleanBase = baseUrl.split('?')[0];
    return `${cleanBase}?to=${encodeURIComponent(trimmedName)}`;
  }
}

/**
 * Generate an Indonesian/Javanese polite WhatsApp sharing text and URL
 */
export function generateWhatsAppMessage(
  guestName: string,
  invitationUrl: string,
  groomName = 'Raden Mas Bagaskara Adi Nugraha',
  brideName = 'Roro Sekar Arum Kusumawardhani'
): string {
  const trimmed = guestName.trim() || 'Bapak/Ibu/Saudara/i';

  return `Yth. ${trimmed},

Assalamu’alaikum Warahmatullahi Wabarakatuh.

Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta'ala, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada pernikahan putra-putri kami:

*${groomName}*
&
*${brideName}*

🗓️ *Sabtu, 12 Desember 2026*
📍 *Pendopo Agung Ambarrukmo, Yogyakarta*

Berikut tautan undangan resmi Anda:
${invitationUrl}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk melengkapi berkah pernikahan ini.

Matur nuwun sanget,
Wassalamu’alaikum Warahmatullahi Wabarakatuh.

_Keluarga Besar K.R.T. H. Hendrawan Adi Kusumo & Ir. H. Bambang Widjojanto_`;
}

/**
 * Build WhatsApp Web/Mobile link with prefilled text
 */
export function generateWhatsAppShareUrl(
  guestName: string,
  invitationUrl: string,
  phone?: string
): string {
  const text = generateWhatsAppMessage(guestName, invitationUrl);
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const internationalPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone;

  if (internationalPhone) {
    return `https://api.whatsapp.com/send?phone=${internationalPhone}&text=${encodeURIComponent(text)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Convert browser File object to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload a photo directly to Google Drive via Google Apps Script Web App
 * Automatically updates Google Sheet with image URL and metadata
 */
export async function uploadPhotoToAppsScript(
  webAppUrl: string,
  slotKey: PhotoSlotKey,
  slotLabel: string,
  file: File
): Promise<{ url: string; fileId: string; driveViewUrl?: string }> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    throw new Error('URL Google Apps Script belum dikonfigurasi.');
  }

  const base64Data = await fileToBase64(file);

  const payload = {
    action: 'uploadPhoto',
    slotKey,
    slotLabel,
    fileName: `${slotKey}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
    mimeType: file.type || 'image/jpeg',
    base64Data,
  };

  const response = await fetch(webAppUrl, {
    method: 'POST',
    // In Google Apps Script CORS with simple requests works well with text/plain or no-cors
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Gagal menghubungi Google Apps Script: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || 'Gagal mengunggah foto ke Google Drive.');
  }

  return {
    url: result.data.url,
    fileId: result.data.fileId,
    driveViewUrl: result.data.driveViewUrl,
  };
}

/**
 * Fetch saved photos from Google Apps Script / Google Sheets
 */
export async function fetchPhotosFromAppsScript(
  webAppUrl: string
): Promise<Record<string, string>> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return {};
  }

  const url = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=getPhotos&_t=${Date.now()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gagal mengambil foto: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.status === 'success' && result.data) {
    return result.data as Record<string, string>;
  }
  return {};
}

/**
 * Save guest list to Google Apps Script / Google Sheets
 */
export async function saveGuestsToAppsScript(
  webAppUrl: string,
  guests: GuestItem[]
): Promise<number> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    throw new Error('URL Google Apps Script belum dikonfigurasi.');
  }

  const payload = {
    action: 'saveGuests',
    guests,
  };

  const response = await fetch(webAppUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Gagal menyimpan daftar tamu: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || 'Gagal menyimpan tamu ke Google Sheet.');
  }

  return result.count || guests.length;
}

/**
 * Fetch guest list from Google Apps Script / Google Sheets
 */
export async function fetchGuestsFromAppsScript(
  webAppUrl: string
): Promise<GuestItem[]> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return [];
  }

  const url = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=getGuests&_t=${Date.now()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gagal mengambil daftar tamu: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.status === 'success' && Array.isArray(result.data)) {
    return result.data as GuestItem[];
  }
  return [];
}

/**
 * Test connectivity with Google Apps Script Web App
 */
export async function pingAppsScript(webAppUrl: string): Promise<boolean> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return false;
  }

  const url = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=ping&_t=${Date.now()}`;
  const response = await fetch(url);
  if (!response.ok) {
    return false;
  }
  const result = await response.json();
  return result.status === 'success';
}

/**
 * Automatically save YouTube / audio configuration to Google Apps Script / Google Spreadsheet
 */
export async function saveAudioToAppsScript(
  webAppUrl: string,
  config: WeddingAudioConfig
): Promise<boolean> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    throw new Error('URL Google Apps Script belum dikonfigurasi.');
  }

  const payload = {
    action: 'saveAudio',
    config: {
      mode: config.mode,
      youtubeId: config.youtubeId || '',
      youtubeUrl: config.youtubeUrl || '',
      title: config.title || '',
      volume: config.volume ?? 75,
      startSeconds: config.startSeconds ?? 0,
      loop: config.loop ?? true,
    },
  };

  const response = await fetch(webAppUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Gagal menyimpan pengaturan audio ke Apps Script: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || 'Gagal menyimpan pengaturan audio ke Google Spreadsheet.');
  }

  return true;
}

/**
 * Automatically fetch saved YouTube / audio configuration from Google Apps Script / Google Spreadsheet
 */
export async function fetchAudioFromAppsScript(
  webAppUrl: string
): Promise<WeddingAudioConfig | null> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return null;
  }

  try {
    const url = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=getAudio&_t=${Date.now()}`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    if (result.status === 'success' && result.data && typeof result.data === 'object') {
      const d = result.data;
      if (d.youtubeId || d.mode) {
        return {
          mode: (d.mode === 'youtube' ? 'youtube' : 'gamelan') as AudioSourceMode,
          youtubeId: String(d.youtubeId || ''),
          youtubeUrl: String(d.youtubeUrl || (d.youtubeId ? `https://www.youtube.com/watch?v=${d.youtubeId}` : '')),
          title: String(d.title || (d.mode === 'youtube' ? 'Musik YouTube Pernikahan' : 'Gamelan Slendro Ambience')),
          volume: typeof d.volume === 'number' ? d.volume : 75,
          startSeconds: typeof d.startSeconds === 'number' ? d.startSeconds : 0,
          loop: d.loop !== false,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch all RSVP responses from Google Apps Script / Google Spreadsheet
 */
export async function fetchRsvpFromAppsScript(
  webAppUrl: string
): Promise<WishItem[]> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return [];
  }

  try {
    const url = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=getRsvp&_t=${Date.now()}`;
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    if (result.status === 'success' && Array.isArray(result.data)) {
      return result.data as WishItem[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Save / append a new RSVP response to Google Apps Script / Google Spreadsheet
 */
export async function saveRsvpToAppsScript(
  webAppUrl: string,
  rsvp: WishItem
): Promise<boolean> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return false;
  }

  try {
    const payload = {
      action: 'saveRsvp',
      rsvp,
    };

    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.status === 'success';
  } catch {
    return false;
  }
}


