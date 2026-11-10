import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEffectiveVolume,
  toggleMuteState,
  getAudioControlDisplay,
} from './muteController';

test('calculateEffectiveVolume returns 0 when muted regardless of base volume', () => {
  assert.equal(calculateEffectiveVolume(100, true), 0);
  assert.equal(calculateEffectiveVolume(75, true), 0);
  assert.equal(calculateEffectiveVolume(30, true), 0);
});

test('calculateEffectiveVolume restores base volume when unmuted', () => {
  assert.equal(calculateEffectiveVolume(80, false), 80);
  assert.equal(calculateEffectiveVolume(100, false), 100);
  assert.equal(calculateEffectiveVolume(0, false), 0);
  // Fallbacks
  assert.equal(calculateEffectiveVolume(undefined, false), 75);
  assert.equal(calculateEffectiveVolume(NaN, false), 75);
});

test('toggleMuteState toggles mute from false to true and sets volume to 0', () => {
  const result = toggleMuteState({ isPlaying: true, isMuted: false, baseVolume: 80 });
  assert.equal(result.isMuted, true);
  assert.equal(result.effectiveVolume, 0);
});

test('toggleMuteState toggles mute from true to false and restores volume', () => {
  const result = toggleMuteState({ isPlaying: true, isMuted: true, baseVolume: 80 });
  assert.equal(result.isMuted, false);
  assert.equal(result.effectiveVolume, 80);
});

test('getAudioControlDisplay indicates background playback when muted', () => {
  const display = getAudioControlDisplay(true, true, 'Gamelan Slendro');
  assert.ok(display.buttonLabel.includes('Unmute'));
  assert.ok(display.buttonTitle.includes('latar belakang'));
  assert.ok(display.pillText.includes('Hening'));
  assert.equal(display.isBackgroundActive, true);
});

test('getAudioControlDisplay indicates mute action when currently unmuted', () => {
  const display = getAudioControlDisplay(true, false, 'Gamelan Slendro');
  assert.ok(display.buttonLabel.includes('Mute'));
  assert.equal(display.pillText, 'Gamelan Slendro');
  assert.equal(display.isBackgroundActive, true);
});
