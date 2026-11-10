import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePersonalizedUrl,
  generateWhatsAppMessage,
  generateWhatsAppShareUrl,
  getEffectiveBaseUrl,
  getAppsScriptUrl,
  saveAudioToAppsScript,
  fetchAudioFromAppsScript,
} from './appsScriptClient';

test('generatePersonalizedUrl adds a safely encoded guest name', () => {
  const url = generatePersonalizedUrl('https://wedding.example.com/', 'Bapak Budi & Ibu Ani');
  assert.equal(url, 'https://wedding.example.com/?to=Bapak+Budi+%26+Ibu+Ani');
});

test('generatePersonalizedUrl preserves existing query parameters', () => {
  const url = generatePersonalizedUrl('https://wedding.example.com/?ref=ig', 'Raden Danang');
  assert.equal(url, 'https://wedding.example.com/?ref=ig&to=Raden+Danang');
});

test('WhatsApp message contains guest name, couple names, and invitation URL', () => {
  const message = generateWhatsAppMessage('Bapak Joko Tingkir', 'https://wedding.example.com/?to=Bapak+Joko');
  assert.ok(message.includes('Yth. Bapak Joko Tingkir,'));
  assert.ok(message.includes('Raden Mas Bagaskara Adi Nugraha'));
  assert.ok(message.includes('Roro Sekar Arum Kusumawardhani'));
  assert.ok(message.includes('https://wedding.example.com/?to=Bapak+Joko'));
});

test('WhatsApp share URL normalizes Indonesian mobile numbers', () => {
  const url = generateWhatsAppShareUrl('Bapak Joko', 'https://wedding.example.com/', '08123456789');
  assert.ok(url.startsWith('https://api.whatsapp.com/send?phone=628123456789&text='));
});

test('getEffectiveBaseUrl normalizes protocol and trailing slashes', () => {
  assert.equal(getEffectiveBaseUrl('bagaskara-sekar.vercel.app/'), 'https://bagaskara-sekar.vercel.app');
  assert.equal(getEffectiveBaseUrl('https://undangan.netlify.app///'), 'https://undangan.netlify.app');
});

test('getAppsScriptUrl is empty without browser override or build configuration', () => {
  assert.equal(getAppsScriptUrl(), '');
});

test('admin write operations reject without a server-issued session token', async () => {
  await assert.rejects(
    () => saveAudioToAppsScript('', {
      mode: 'youtube',
      youtubeUrl: 'https://www.youtube.com/watch?v=SB7qdt7A92A',
      youtubeId: 'SB7qdt7A92A',
      title: 'Kebo Giro',
      volume: 75,
      startSeconds: 0,
      loop: true,
    }),
    { message: 'Sesi admin tidak ditemukan. Silakan login kembali.' }
  );
});

test('fetchAudioFromAppsScript returns null without a configured backend URL', async () => {
  assert.equal(await fetchAudioFromAppsScript(''), null);
});
