/**
 * Generative Javanese Gamelan Synthesizer via Web Audio API.
 * Uses the traditional Slendro pentatonic tuning scale.
 */
export const SLENDRO_SCALE = [261.63, 293.66, 349.23, 392.00, 440.00, 523.25, 587.33];

export class GamelanAudioEngine {
  private audioCtx: AudioContext | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isPlaying = false;
  private onStateChange?: (playing: boolean) => void;

  constructor(onStateChange?: (playing: boolean) => void) {
    this.onStateChange = onStateChange;
  }

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
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
      gain.connect(this.audioCtx.destination);

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
