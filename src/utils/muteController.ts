/**
 * Pure helper logic for mute / unmute state and volume calculation.
 * Ensures audio playback continuous operation without pause.
 */

export interface AudioPlaybackState {
  isPlaying: boolean;
  isMuted: boolean;
  baseVolume: number; // 0 to 100
}

/**
 * Calculates effective volume given base volume and mute state.
 * When muted, volume is strictly 0%.
 * When unmuted, volume is restored to baseVolume (defaults to 75% if invalid).
 */
export function calculateEffectiveVolume(baseVolume: number | undefined | null, isMuted: boolean): number {
  if (isMuted) return 0;
  if (typeof baseVolume !== 'number' || isNaN(baseVolume)) return 75;
  return Math.max(0, Math.min(100, Math.round(baseVolume)));
}

/**
 * Toggles mute state and computes new effective volume.
 * Does not pause playback: playback continues running in the background.
 */
export function toggleMuteState(
  currentState: AudioPlaybackState
): { isMuted: boolean; effectiveVolume: number } {
  const nextMuted = !currentState.isMuted;
  const effectiveVolume = calculateEffectiveVolume(currentState.baseVolume, nextMuted);
  return {
    isMuted: nextMuted,
    effectiveVolume,
  };
}

/**
 * Human-readable status label and tooltip for UI buttons.
 */
export function getAudioControlDisplay(
  isPlaying: boolean,
  isMuted: boolean,
  trackTitle: string
): { buttonLabel: string; buttonTitle: string; pillText: string; isBackgroundActive: boolean } {
  if (!isPlaying) {
    return {
      buttonLabel: 'Putar Pengiring Musik',
      buttonTitle: `Putar Musik (${trackTitle})`,
      pillText: 'Audio Belum Diputar',
      isBackgroundActive: false,
    };
  }

  if (isMuted) {
    return {
      buttonLabel: 'Bunyikan Suara (Unmute)',
      buttonTitle: `Bunyikan Suara (${trackTitle}) • Musik berjalan di latar belakang`,
      pillText: 'Suara Hening (0%) • Musik Tetap Berjalan',
      isBackgroundActive: true,
    };
  }

  return {
    buttonLabel: 'Heningkan Suara (Mute)',
    buttonTitle: `Heningkan Suara (${trackTitle})`,
    pillText: trackTitle,
    isBackgroundActive: true,
  };
}
