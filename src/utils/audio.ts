/**
 * Generative Javanese Gamelan Synthesizer via Web Audio API.
 * Uses the traditional Slendro pentatonic tuning scale.
 */
export const SLENDRO_SCALE = [261.63, 293.66, 349.23, 392.00, 440.00, 523.25, 587.33];

export class GamelanAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.75;
  private onStateChange?: (playing: boolean) => void;
  private onMuteChange?: (muted: boolean) => void;

  constructor(
    onStateChange?: (playing: boolean) => void,
    onMuteChange?: (muted: boolean) => void
  ) {
    this.onStateChange = onStateChange;
    this.onMuteChange = onMuteChange;
  }

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(
          this.isMuted ? 0 : this.volume,
          this.audioCtx.currentTime
        );
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.audioCtx && this.masterGain) {
      const targetGain = muted ? 0 : this.volume;
      this.masterGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.masterGain.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
    }
    this.onMuteChange?.(muted);
  }

  public setVolume(vol: number) {
    // vol is expected 0 to 100 or 0 to 1
    const normalized = vol > 1 ? vol / 100 : vol;
    this.volume = Math.max(0, Math.min(1, normalized));
    if (!this.isMuted && this.audioCtx && this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playChime() {
    if (!this.audioCtx || !this.isPlaying) return;

    try {
      const now = this.audioCtx.currentTime;
      const freq = SLENDRO_SCALE[Math.floor(Math.random() * SLENDRO_SCALE.length)];

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      if (this.masterGain) {
        gain.connect(this.masterGain);
      } else {
        gain.connect(this.audioCtx.destination);
      }

      osc.start(now);
      osc.stop(now + 3.3);
    } catch {
      // Audio context might be restricted or closed
    }
  }

  public async start(): Promise<boolean> {
    try {
      this.initContext();
      if (!this.audioCtx) return false;

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.isPlaying = true;
      this.onStateChange?.(true);

      // Play initial welcoming chime
      this.playChime();

      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this.intervalId = setInterval(() => {
        this.playChime();
      }, 1900);

      return true;
    } catch {
      return false;
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.onStateChange?.(false);
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      void this.start();
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public destroy() {
    this.pause();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      void this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
