import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  buildYouTubeEmbedUrl,
} from './audioConfig';

test('extractYouTubeId extracts 11-character ID from standard watch URL', () => {
  const url = 'https://www.youtube.com/watch?v=SB7qdt7A92A';
  assert.equal(extractYouTubeId(url), 'SB7qdt7A92A');
});

test('extractYouTubeId handles watch URL with additional query parameters', () => {
  const url = 'https://www.youtube.com/watch?feature=share&v=G1sEqyx-uzM&t=45s';
  assert.equal(extractYouTubeId(url), 'G1sEqyx-uzM');
});

test('extractYouTubeId extracts ID from youtu.be short URL', () => {
  const url = 'https://youtu.be/Jmh0ogh7_4A?si=sample123';
  assert.equal(extractYouTubeId(url), 'Jmh0ogh7_4A');
});

test('extractYouTubeId extracts ID from shorts and embed URLs', () => {
  const shortsUrl = 'https://www.youtube.com/shorts/JtVx8OUY5NE';
  const embedUrl = 'https://www.youtube.com/embed/JtVx8OUY5NE';
  assert.equal(extractYouTubeId(shortsUrl), 'JtVx8OUY5NE');
  assert.equal(extractYouTubeId(embedUrl), 'JtVx8OUY5NE');
});

test('extractYouTubeId accepts raw 11-character video ID', () => {
  const rawId = 'SB7qdt7A92A';
  assert.equal(extractYouTubeId(rawId), 'SB7qdt7A92A');
});

test('extractYouTubeId returns null for invalid inputs', () => {
  assert.equal(extractYouTubeId(''), null);
  assert.equal(extractYouTubeId('not-a-youtube-url'), null);
  assert.equal(extractYouTubeId('https://google.com'), null);
  assert.equal(extractYouTubeId('abc'), null);
});

test('getYouTubeThumbnail constructs valid thumbnail URL', () => {
  assert.equal(
    getYouTubeThumbnail('SB7qdt7A92A'),
    'https://img.youtube.com/vi/SB7qdt7A92A/hqdefault.jpg'
  );
  assert.equal(getYouTubeThumbnail(''), '');
});

test('buildYouTubeEmbedUrl creates proper embed URL with loop & autoplay', () => {
  const url = buildYouTubeEmbedUrl('SB7qdt7A92A', {
    autoplay: true,
    loop: true,
    startSeconds: 15,
  });
  assert.ok(url.includes('https://www.youtube-nocookie.com/embed/SB7qdt7A92A'));
  assert.ok(url.includes('autoplay=1'));
  assert.ok(url.includes('loop=1'));
  assert.ok(url.includes('playlist=SB7qdt7A92A'));
  assert.ok(url.includes('start=15'));
});
