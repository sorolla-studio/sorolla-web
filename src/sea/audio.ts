// All sound is made here: a plucked string for every skip (the scale is Phrygian dominant, the one
// Spanish guitar leans on), water noise, and a quiet sea.
const SCALE = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16, 17, 19, 20, 22, 24];
const ROOT = 164.81; // E3
const VOLUME = { master: 0.55, pluck: 0.5, tick: 0.35, sea: 0.05, plop: 0.6 };

export class SeaAudio {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private notes = new Map<number, AudioBuffer>();
  private noise: AudioBuffer | null = null;
  muted = false;

  /** Must be called from a tap. */
  wake() {
    if (this.ctx) { if (this.ctx.state === "suspended") void this.ctx.resume(); return; }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = (this.ctx = new Ctx());
    this.out = ctx.createGain();
    this.out.gain.value = this.muted ? 0 : VOLUME.master;
    const comp = ctx.createDynamicsCompressor();
    this.out.connect(comp).connect(ctx.destination);
    const n = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = n;
    // the sea: brown-ish noise that breathes
    const src = ctx.createBufferSource(); src.buffer = n; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520;
    const g = ctx.createGain(); g.gain.value = VOLUME.sea;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.13;
    const depth = ctx.createGain(); depth.gain.value = VOLUME.sea * 0.55;
    lfo.connect(depth).connect(g.gain); lfo.start();
    src.connect(lp).connect(g).connect(this.out); src.start();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.out && this.ctx) this.out.gain.setTargetAtTime(m ? 0 : VOLUME.master, this.ctx.currentTime, 0.03);
  }

  suspend() { void this.ctx?.suspend(); }
  resume() { if (this.ctx?.state === "suspended") void this.ctx.resume(); }
  close() { void this.ctx?.close(); this.ctx = null; }

  throw() { this.hiss(0.22, 700, 2600, 0.16); }

  /** step climbs with the streak */
  skip(kind: "perfect" | "good" | "poor", step: number) {
    const i = Math.min(SCALE.length - 1, step);
    if (kind === "poor") { this.pluck(SCALE[0] - 5, 0.5); this.hiss(0.14, 900, 300, 0.3); return; }
    this.pluck(SCALE[i], 1);
    if (kind === "perfect") { this.pluck(SCALE[Math.min(SCALE.length - 1, i + 4)], 0.55, 0.035); this.pluck(SCALE[i] + 12, 0.4, 0.07); }
    this.hiss(0.1, 2400, 900, VOLUME.tick);
  }

  sink() {
    const ctx = this.ctx; if (!ctx || !this.out) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.frequency.setValueAtTime(320, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.28);
    g.gain.setValueAtTime(VOLUME.plop, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g).connect(this.out); o.start(t); o.stop(t + 0.45);
    this.hiss(0.5, 1200, 240, 0.4);
    this.pluck(SCALE[0], 0.5, 0.18); this.pluck(SCALE[0] - 12, 0.6, 0.3);
  }

  private pluck(semi: number, gain: number, delay = 0) {
    const ctx = this.ctx; if (!ctx || !this.out) return;
    let buf = this.notes.get(semi);
    if (!buf) { buf = this.string(ROOT * 2 ** (semi / 12)); this.notes.set(semi, buf); }
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf; s.playbackRate.value = 1 + (Math.random() - 0.5) * 0.004;
    g.gain.value = gain * VOLUME.pluck;
    s.connect(g).connect(this.out); s.start(ctx.currentTime + delay);
  }

  /** Karplus-Strong */
  private string(freq: number) {
    const sr = this.ctx!.sampleRate, n = Math.round(sr / freq), len = Math.floor(sr * 1.5);
    const buf = this.ctx!.createBuffer(1, len, sr), d = buf.getChannelData(0);
    const ring = new Float32Array(n);
    let prev = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; prev = prev * 0.45 + w * 0.55; ring[i] = prev; }
    for (let i = 0; i < len; i++) {
      const j = i % n, v = ring[j];
      ring[j] = (v + ring[(j + 1) % n]) * 0.4978;
      d[i] = v * Math.min(1, (len - i) / (sr * 0.2));
    }
    return buf;
  }

  private hiss(dur: number, from: number, to: number, gain: number) {
    const ctx = this.ctx; if (!ctx || !this.out || !this.noise) return;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime;
    s.buffer = this.noise; f.type = "bandpass"; f.Q.value = 0.9;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(this.out); s.start(t, Math.random() * 2, dur + 0.05);
  }
}
