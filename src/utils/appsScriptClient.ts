import { PhotoSlotKey, GuestItem } from '../types/photos';
import { WeddingAudioConfig, AudioSourceMode } from '../types/audio';
import { WishItem } from '../types/wedding';

export const APPS_SCRIPT_URL_STORAGE_KEY = 'javanese_wedding_apps_script_url';
export const CUSTOM_PHOTOS_STORAGE_KEY = 'javanese_wedding_custom_photos';
export const GUESTS_STORAGE_KEY = 'javanese_wedding_guests';
export const PUBLIC_DOMAIN_STORAGE_KEY = 'javanese_wedding_public_domain';
export const ADMIN_TOKEN_STORAGE_KEY = 'javanese_wedding_admin_token';
export const RSVP_STORAGE_KEY = 'bagaskara_sekar_wishes';

type AppsScriptResult<T> = {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  token?: string;
  count?: number;
  expiresIn?: number;
};

function cleanAppsScriptUrl(url: string): string {
  return String(url || '').trim();
}

/** Public Apps Script URL is build-time config for guest devices; localStorage is owner override. */
export function getAppsScriptUrl(): string {
  try {
    const stored = localStorage.getItem(APPS_SCRIPT_URL_STORAGE_KEY);
    if (stored && /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(stored)) return stored;
  } catch {
    // Use build-time public configuration.
  }
  const buildTimeUrl = import.meta.env?.VITE_APPS_SCRIPT_URL || '';
  return cleanAppsScriptUrl(buildTimeUrl);
}

function assertAppsScriptUrl(url: string): string {
  const clean = cleanAppsScriptUrl(url);
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(clean)) {
    throw new Error('URL Google Apps Script belum dikonfigurasi atau tidak valid.');
  }
  return clean;
}

async function postAction<T>(webAppUrl: string, payload: Record<string, unknown>): Promise<AppsScriptResult<T>> {
  const url = assertAppsScriptUrl(webAppUrl);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Gagal menghubungi Google Apps Script: ${response.statusText || response.status}`);
  const result = await response.json() as AppsScriptResult<T>;
  if (result.status !== 'success') throw new Error(result.message || 'Permintaan ke Google Apps Script gagal.');
  return result;
}

export function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  try { return sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || ''; } catch { return ''; }
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    localStorage.removeItem('javanese_wedding_admin_pin');
    localStorage.removeItem('javanese_wedding_admin_authenticated');
    sessionStorage.removeItem('javanese_wedding_admin_authenticated');
  } catch {
    throw new Error('Browser tidak dapat menyimpan sesi admin. Periksa pengaturan penyimpanan browser.');
  }
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem('javanese_wedding_admin_authenticated');
    localStorage.removeItem('javanese_wedding_admin_pin');
    localStorage.removeItem('javanese_wedding_admin_authenticated');
  } catch {
    // Best-effort local cleanup.
  }
}

export function isCurrentlyAdminAuthenticated(): boolean {
  return Boolean(getAdminToken());
}

export async function loginAdminToAppsScript(webAppUrl: string, pin: string): Promise<{ token: string; expiresIn: number }> {
  const result = await postAction<never>(webAppUrl, { action: 'adminLogin', pin });
  if (!result.token) throw new Error('Server tidak mengembalikan sesi admin.');
  setAdminToken(result.token);
  return { token: result.token, expiresIn: result.expiresIn || 21600 };
}

export async function logoutAdminFromAppsScript(webAppUrl?: string): Promise<void> {
  const token = getAdminToken();
  const url = webAppUrl || getAppsScriptUrl();
  try {
    if (token && url) await postAction(url, { action: 'adminLogout', token });
  } catch (error) {
    // Local logout must still complete when the server session already expired.
    console.warn('Admin logout could not reach the backend:', error);
  } finally {
    clearAdminToken();
  }
}

export async function changeAdminPinOnAppsScript(webAppUrl: string, newPin: string): Promise<void> {
  const token = getAdminToken();
  if (!token) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
  await postAction(webAppUrl, { action: 'changeAdminPin', token, newPin });
  clearAdminToken();
}

export function getEffectiveBaseUrl(configuredDomain?: string): string {
  let domain = configuredDomain;
  if (!domain && typeof window !== 'undefined') {
    try { domain = localStorage.getItem(PUBLIC_DOMAIN_STORAGE_KEY) || undefined; } catch { /* ignore */ }
  }
  if (domain && domain.trim()) {
    let clean = domain.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) clean = 'https://' + clean;
    return clean.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') return (window.location.origin + window.location.pathname).replace(/\/+$/, '');
  return 'https://bagaskara-sekar.vercel.app';
}

export function generatePersonalizedUrl(baseUrl: string, guestName: string): string {
  const trimmedName = guestName.trim();
  if (!trimmedName) return baseUrl;
  try {
    const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    url.searchParams.set('to', trimmedName);
    return url.toString();
  } catch {
    const cleanBase = baseUrl.split('?')[0];
    return `${cleanBase}?to=${encodeURIComponent(trimmedName)}`;
  }
}

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

export function generateWhatsAppShareUrl(guestName: string, invitationUrl: string, phone?: string): string {
  const text = generateWhatsAppMessage(guestName, invitationUrl);
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const internationalPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
  if (internationalPhone) return `https://api.whatsapp.com/send?phone=${internationalPhone}&text=${encodeURIComponent(text)}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
  });
}

export async function uploadPhotoToAppsScript(
  webAppUrl: string, slotKey: PhotoSlotKey, slotLabel: string, file: File, token = getAdminToken()
): Promise<{ url: string; fileId: string; driveViewUrl?: string }> {
  if (!token) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Format foto harus JPG, PNG, atau WebP.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran foto maksimal 5 MB.');
  const base64Data = await fileToBase64(file);
  const result = await postAction<{ url: string; fileId: string; driveViewUrl?: string }>(webAppUrl, {
    action: 'uploadPhoto', token, slotKey, slotLabel, mimeType: file.type, base64Data,
  });
  if (!result.data?.url || !result.data?.fileId) throw new Error('Respons upload foto tidak lengkap.');
  return result.data;
}

export async function fetchPhotosFromAppsScript(webAppUrl: string): Promise<Record<string, string>> {
  const url = assertAppsScriptUrl(webAppUrl);
  const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=getPhotos&_t=${Date.now()}`);
  if (!response.ok) throw new Error(`Gagal mengambil foto: ${response.statusText}`);
  const result = await response.json() as AppsScriptResult<Record<string, string>>;
  return result.status === 'success' && result.data ? result.data : {};
}

export async function saveGuestsToAppsScript(webAppUrl: string, guests: GuestItem[], token = getAdminToken()): Promise<number> {
  if (!token) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
  const result = await postAction<never>(webAppUrl, { action: 'saveGuests', token, guests });
  return result.count ?? guests.length;
}

export async function deleteGuestFromAppsScript(webAppUrl: string, guestId: string, token = getAdminToken()): Promise<void> {
  if (!token) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
  await postAction(webAppUrl, { action: 'deleteGuest', token, guestId });
}

export async function fetchGuestsFromAppsScript(webAppUrl: string, token = getAdminToken()): Promise<GuestItem[]> {
  if (!token) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
  const result = await postAction<GuestItem[]>(webAppUrl, { action: 'getGuests', token });
  return Array.isArray(result.data) ? result.data : [];
}

export async function pingAppsScript(webAppUrl: string): Promise<boolean> {
  try {
    const url = assertAppsScriptUrl(webAppUrl);
    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=ping&_t=${Date.now()}`);
    if (!response.ok) return false;
    const result = await response.json() as AppsScriptResult<never>;
    return result.status === 'success';
  } catch { return false; }
}

export async function saveAudioToAppsScript(webAppUrl: string, config: WeddingAudioConfig, token = getAdminToken()): Promise<boolean> {
  if (!token) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
  await postAction(webAppUrl, {
    action: 'saveAudio', token,
    config: {
      mode: config.mode, youtubeId: config.youtubeId || '', youtubeUrl: config.youtubeUrl || '',
      title: config.title || '', volume: config.volume ?? 75,
      startSeconds: config.startSeconds ?? 0, loop: config.loop ?? true,
    },
  });
  return true;
}

export async function fetchAudioFromAppsScript(webAppUrl: string): Promise<WeddingAudioConfig | null> {
  try {
    const url = assertAppsScriptUrl(webAppUrl);
    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=getAudio&_t=${Date.now()}`);
    if (!response.ok) return null;
    const result = await response.json() as AppsScriptResult<Record<string, unknown>>;
    if (result.status !== 'success' || !result.data) return null;
    const d = result.data;
    const youtubeId = typeof d.youtubeId === 'string' ? d.youtubeId : '';
    const mode: AudioSourceMode = d.mode === 'youtube' ? 'youtube' : 'gamelan';
    return {
      mode, youtubeId,
      youtubeUrl: typeof d.youtubeUrl === 'string' ? d.youtubeUrl : (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ''),
      title: typeof d.title === 'string' ? d.title : (mode === 'youtube' ? 'Musik YouTube Pernikahan' : 'Gamelan Slendro Ambience'),
      volume: typeof d.volume === 'number' ? Math.min(100, Math.max(0, d.volume)) : 75,
      startSeconds: typeof d.startSeconds === 'number' ? Math.max(0, d.startSeconds) : 0,
      loop: d.loop !== false,
    };
  } catch { return null; }
}

export async function fetchRsvpFromAppsScript(webAppUrl: string): Promise<WishItem[]> {
  try {
    const url = assertAppsScriptUrl(webAppUrl);
    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=getRsvp&_t=${Date.now()}`);
    if (!response.ok) return [];
    const result = await response.json() as AppsScriptResult<WishItem[]>;
    return result.status === 'success' && Array.isArray(result.data) ? result.data : [];
  } catch { return []; }
}

export async function saveRsvpToAppsScript(webAppUrl: string, rsvp: WishItem): Promise<boolean> {
  try {
    await postAction<WishItem>(webAppUrl, { action: 'saveRsvp', rsvp });
    return true;
  } catch (error) {
    console.warn('RSVP save failed:', error);
    return false;
  }
}
