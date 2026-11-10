import { test } from 'node:test';
import assert from 'node:assert';
import {
  generatePersonalizedUrl,
  generateWhatsAppMessage,
  generateWhatsAppShareUrl,
  getEffectiveBaseUrl,
  verifyAdminPin,
  DEFAULT_ADMIN_PIN,
} from './appsScriptClient';

test('generatePersonalizedUrl adds to query parameter correctly', () => {
  const base = 'https://wedding.example.com/';
  const url = generatePersonalizedUrl(base, 'Bapak Budi & Ibu Ani');
  assert.strictEqual(url, 'https://wedding.example.com/?to=Bapak+Budi+%26+Ibu+Ani');
});

test('generatePersonalizedUrl preserves existing query parameters', () => {
  const base = 'https://wedding.example.com/?ref=ig';
  const url = generatePersonalizedUrl(base, 'Raden Danang');
  assert.strictEqual(url, 'https://wedding.example.com/?ref=ig&to=Raden+Danang');
});

test('generateWhatsAppMessage includes guest name and invitation URL', () => {
  const msg = generateWhatsAppMessage('Bapak Joko Tingkir', 'https://wedding.example.com/?to=Bapak+Joko+Tingkir');
  assert.ok(msg.includes('Yth. Bapak Joko Tingkir,'));
  assert.ok(msg.includes('Raden Mas Bagaskara Adi Nugraha'));
  assert.ok(msg.includes('Roro Sekar Arum Kusumawardhani'));
  assert.ok(msg.includes('https://wedding.example.com/?to=Bapak+Joko+Tingkir'));
  assert.ok(msg.includes('Matur nuwun sanget'));
});

test('generateWhatsAppShareUrl formats phone numbers and encodes text', () => {
  const shareUrl = generateWhatsAppShareUrl(
    'Bapak Joko Tingkir',
    'https://wedding.example.com/?to=Bapak+Joko+Tingkir',
    '08123456789'
  );
  assert.ok(shareUrl.startsWith('https://api.whatsapp.com/send?phone=628123456789&text='));
  assert.ok(shareUrl.includes(encodeURIComponent('Yth. Bapak Joko Tingkir,')));
});

test('getEffectiveBaseUrl normalizes domain and protocol', () => {
  assert.strictEqual(
    getEffectiveBaseUrl('bagaskara-sekar.vercel.app/'),
    'https://bagaskara-sekar.vercel.app'
  );
  assert.strictEqual(
    getEffectiveBaseUrl('https://undangan.netlify.app///'),
    'https://undangan.netlify.app'
  );
});

test('verifyAdminPin validates default pin 1212', () => {
  assert.strictEqual(DEFAULT_ADMIN_PIN, '1212');
  assert.strictEqual(verifyAdminPin('1212'), true);
  assert.strictEqual(verifyAdminPin('0000'), false);
});
