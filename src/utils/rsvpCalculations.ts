import { WishItem } from '../types/wedding';

export interface RsvpStats {
  totalResponses: number;
  attendingCount: number;
  unableCount: number;
  totalHeadcount: number;
  attendingRate: number; // 0 to 100
}

/**
 * Parse headcount number from strings like "2 Persons", "1 Person", "2", "3 orang"
 */
export function parseHeadcount(guestCountStr: string): number {
  if (!guestCountStr) return 1;
  const match = guestCountStr.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return isNaN(num) || num <= 0 ? 1 : num;
  }
  return 1;
}

/**
 * Calculate statistical summary from RSVP items
 */
export function calculateRsvpStats(items: WishItem[]): RsvpStats {
  if (!items || items.length === 0) {
    return {
      totalResponses: 0,
      attendingCount: 0,
      unableCount: 0,
      totalHeadcount: 0,
      attendingRate: 0,
    };
  }

  let attendingCount = 0;
  let unableCount = 0;
  let totalHeadcount = 0;

  for (const item of items) {
    const isAttending =
      item.attendance === 'InshaAllah Attending' ||
      item.attendance?.toLowerCase().includes('attend') ||
      item.attendance?.toLowerCase().includes('hadir');

    if (isAttending) {
      attendingCount++;
      totalHeadcount += parseHeadcount(item.guestCount);
    } else {
      unableCount++;
    }
  }

  const totalResponses = items.length;
  const attendingRate = totalResponses > 0 ? Math.round((attendingCount / totalResponses) * 100) : 0;

  return {
    totalResponses,
    attendingCount,
    unableCount,
    totalHeadcount,
    attendingRate,
  };
}

/**
 * Generate a formatted text summary for sharing to WhatsApp / panitia keluarga
 */
export function formatRsvpSummaryText(
  items: WishItem[],
  weddingTitle = 'Pernikahan Bagaskara & Sekar'
): string {
  const stats = calculateRsvpStats(items);
  const now = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const attendeeList = items
    .filter(
      (i) =>
        i.attendance === 'InshaAllah Attending' ||
        i.attendance?.toLowerCase().includes('attend') ||
        i.attendance?.toLowerCase().includes('hadir')
    )
    .map((i, idx) => `${idx + 1}. ${i.name} (${parseHeadcount(i.guestCount)} org)`)
    .join('\n');

  return `📊 *RINGKASAN RSVP GOOGLE SHEET*
💍 *${weddingTitle}*
🗓️ Per: ${now}

━━━━━━━━━━━━━━━━━━━━━
📈 *Statistik Kehadiran:*
• Total Respon: *${stats.totalResponses}*
• Tamu Konfirmasi Hadir: *${stats.attendingCount} keluarga/tamu*
• Estimasi Jumlah Porsi/Pax: *${stats.totalHeadcount} orang*
• Berhalangan Hadir: *${stats.unableCount} tamu*
• Tingkat Konfirmasi Hadir: *${stats.attendingRate}%*

━━━━━━━━━━━━━━━━━━━━━
📋 *Daftar Tamu Konfirmasi Hadir:*
${attendeeList || '- Belum ada data tamu hadir -'}

_Data diambil langsung dari Google Spreadsheet_`;
}
