import { test } from 'node:test';
import assert from 'node:assert';
import { parseHeadcount, calculateRsvpStats, formatRsvpSummaryText } from './rsvpCalculations';
import { WishItem } from '../types/wedding';

test('parseHeadcount correctly extracts number from varied strings', () => {
  assert.strictEqual(parseHeadcount('2 Persons'), 2);
  assert.strictEqual(parseHeadcount('1 Person'), 1);
  assert.strictEqual(parseHeadcount('3 orang'), 3);
  assert.strictEqual(parseHeadcount('4'), 4);
  assert.strictEqual(parseHeadcount(''), 1);
  assert.strictEqual(parseHeadcount('invalid'), 1);
});

test('calculateRsvpStats handles empty array gracefully', () => {
  const stats = calculateRsvpStats([]);
  assert.strictEqual(stats.totalResponses, 0);
  assert.strictEqual(stats.attendingCount, 0);
  assert.strictEqual(stats.unableCount, 0);
  assert.strictEqual(stats.totalHeadcount, 0);
  assert.strictEqual(stats.attendingRate, 0);
});

test('calculateRsvpStats calculates accurate stats for mixed attendees', () => {
  const mockItems: WishItem[] = [
    {
      id: '1',
      name: 'Bapak Joko',
      attendance: 'InshaAllah Attending',
      guestCount: '2 Persons',
      message: 'Selamat!',
      timestamp: 'Today',
    },
    {
      id: '2',
      name: 'Ibu Siti',
      attendance: 'InshaAllah Attending',
      guestCount: '1 Person',
      message: 'Barakallah',
      timestamp: 'Today',
    },
    {
      id: '3',
      name: 'Pak Budi',
      attendance: 'Regretfully Unable',
      guestCount: '1 Person',
      message: 'Maaf berhalangan',
      timestamp: 'Today',
    },
    {
      id: '4',
      name: 'Keluarga Hartono',
      attendance: 'InshaAllah Attending',
      guestCount: '3 Persons',
      message: 'Selamat menempuh hidup baru',
      timestamp: 'Today',
    },
  ];

  const stats = calculateRsvpStats(mockItems);
  assert.strictEqual(stats.totalResponses, 4);
  assert.strictEqual(stats.attendingCount, 3);
  assert.strictEqual(stats.unableCount, 1);
  assert.strictEqual(stats.totalHeadcount, 6); // 2 + 1 + 3 = 6
  assert.strictEqual(stats.attendingRate, 75); // 3 / 4 = 75%
});

test('formatRsvpSummaryText generates comprehensive summary', () => {
  const mockItems: WishItem[] = [
    {
      id: '1',
      name: 'Dr. Sekar',
      attendance: 'InshaAllah Attending',
      guestCount: '2 Persons',
      message: 'Selamat!',
      timestamp: 'Today',
    },
  ];

  const text = formatRsvpSummaryText(mockItems, 'Pernikahan Bagaskara & Sekar');
  assert.ok(text.includes('RINGKASAN RSVP GOOGLE SHEET'));
  assert.ok(text.includes('Pernikahan Bagaskara & Sekar'));
  assert.ok(text.includes('Total Respon: *1*'));
  assert.ok(text.includes('Tamu Konfirmasi Hadir: *1 keluarga/tamu*'));
  assert.ok(text.includes('Estimasi Jumlah Porsi/Pax: *2 orang*'));
  assert.ok(text.includes('1. Dr. Sekar (2 org)'));
});
