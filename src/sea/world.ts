import { Painter, type Boat, type Frame, type Ripple } from "./painter";
import { lightAt, lightName, type Light, type Rgb } from "./light";
import { StrokeList, mix, paintBoat, paintEdge, paintSky } from "./strokes";
import { CAP, lettering, measure, standing } from "./lettering";
import { RULES, Run, type Hit } from "./rules";
import { SeaAudio } from "./audio";
import { FLAT } from "./brush";

/** Everything that is a matter of feel. Seconds and metres unless said. */
const FEEL = {
  camHeight: 2.2, lead: 3.3,
  ring: { shut: 0.19, run: 0.5, idle: 0.27, from: 0.8, floor: 76 }, // how far it opens, when it shows, and the pixels it leaves the label below it
  follow: 5.5, catchUp: 2.2,          // how tightly the camera rides behind the stone
  keepUp: 0.62,                       // how much of that lag it makes up for at speed
  hitstop: { perfect: 0.055, good: 0.02, poor: 0 },
  kick: { perfect: 0.1, good: 0.04, poor: 0 }, kickDecay: 4.5,
  shake: { perfect: 0.012, good: 0.004, poor: 0.016, sink: 0.02 }, shakeDecay: 7,
  ripple: { perfect: 0.125, good: 0.09, poor: 0.07, idle: 0.05, sink: 0.2, pointer: 0.026 },
  spray: { perfect: 34, good: 20, poor: 12, sink: 34 },
  drawTitle: 1.5, titleBack: 0.55,
  lightSpeed: 1.6,                    // how fast the day answers to distance
  retryLock: 0.45, idleAfter: 5.5,
  idleHop: 1.15, idleHeight: 0.09, idleTop: 0.24, // the last is how high the waiting stone reaches
  headroom: 70,                       // pixels of sky the header needs above the horizon
  boatClear: 0.05,                    // screen units between the near boat's water line and the title's top
  sway: 0.22,
  lookUp: 0.22, lookFrom: 40, lookTo: 320, // a longer throw is rewarded with more of the sky
  teach: 2, teachFrom: 0.2, teachHold: 4, // a visitor's first touches slow down and wait this long for the tap
};

/** The ring is a little longer than wide, so it stays round to the eye. */
const OVAL = 1.15;
/** Screens that get the two-line title; globals.css swaps its still pictures at the same shape. */
const TALL = "(max-aspect-ratio: 4/5)";

export type WorldOptions = {
  reduced: boolean;
  /** one fixed frame, for the poster and the pictures further down the page */
  still?: { at: number; title?: boolean; edge?: boolean; horizon?: number };
};

export type Hud = {
  metres: (m: number) => void;
  say: (word: string, tone: "perfect" | "good" | "poor") => void;
  state: (s: "idle" | "run" | "over", result?: { metres: number; skips: number; best: number; light: string; fresh: boolean }) => void;
  firstTap: () => void;
  ran: (r: { metres: number; skips: number; perfects: number; light: string; ms: number }) => void;
};

type Drop = { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; size: number; tone: number };

export class World {
  readonly audio = new SeaAudio();
  private canvas: HTMLCanvasElement;
  private painter: Painter;
  private sky = new StrokeList();
  private sprites = new StrokeList();
  private edge = new StrokeList();
  private time = 12;
  private camX = 0;
  private camZ = 0;
  private aspect = 1;
  private tall = false;
  private focal = 2;
  private baseFocal = 2;
  private horizon = 0.72;
  private baseHorizon = 0.72;
  private titleBox: [number, number, number, number] = [0, 0, 0.5, 0.2];
  private titleZ = 0;
  private idleLead: number = FEEL.lead;
  private draw = 0;
  private titleGone = false;
  private light: Light = lightAt(0);
  private day = 0;
  private ripples: Ripple[] = [];
  private boats: Boat[] = [];
  private drops: Drop[] = [];
  private trail: { x: number; z: number; age: number; tone: number }[] = [];
  private phase: "idle" | "run" | "over" = "idle";
  private run: Run | null = null;
  private runZ = 0;
  private phaseTime = 0;
  private idleT = 0;
  private stone = { x: 0, y: 0.3, z: FEEL.lead as number, spin: 0, visible: true, sink: 0 };
  private hitstop = 0;
  private kick = 0;
  private shake = 0;
  private glow = 0;
  private best = 0;
  private taught = 0;
  private waited = 0;
  private pointer = { x: 0, y: 0, last: 0 };
  private raf = 0;
  private last = 0;
  private slow = { n: 0, sum: 0, scale: 1 };
  private seen = true;

  constructor(private host: HTMLElement, private hud: Hud, private opts: WorldOptions) {
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("aria-hidden", "true");
    this.painter = new Painter(this.canvas);
    host.appendChild(this.canvas);
    if (opts.reduced || opts.still) this.draw = 1;
    if (opts.still) { this.day = opts.still.at; this.stone.visible = false; if (opts.still.title === false) this.titleGone = true; }
    this.resize();
  }

  /* ---------- life cycle ---------- */

  start() {
    if (this.raf || this.opts.still || (this.opts.reduced && this.phase === "idle")) return;
    this.last = 0;
    const loop = (t: number) => {
      const raw = this.last ? (t - this.last) / 1000 : 0.016;
      this.last = t;
      this.measureSpeed(raw);
      this.frame(Math.min(0.05, raw));
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() { cancelAnimationFrame(this.raf); this.raf = 0; }

  setSeen(seen: boolean) {
    this.seen = seen;
    if (seen && !document.hidden) { this.start(); this.audio.resume(); } else { this.stop(); this.audio.suspend(); }
  }

  destroy() { this.stop(); this.audio.close(); this.painter.destroy(); this.canvas.remove(); }

  resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * this.slow.scale;
    this.painter.resize(Math.round(w * dpr), Math.round(h * dpr), dpr);
    this.aspect = w / h;
    const tall = this.tall = matchMedia(TALL).matches;
    this.baseFocal = tall ? 1.75 : 2;
    this.focal = this.baseFocal;
    this.horizon = this.baseHorizon = this.opts.still?.horizon ?? Math.min(tall ? 0.74 : 0.72, 1 - (2 * FEEL.headroom) / h);
    // the waiting stone sits as near as it can with its whole ring above the label
    const { shut, idle, from, floor } = FEEL.ring;
    this.idleLead = (shut + idle * from) * OVAL + (this.baseFocal * FEEL.camHeight) / (this.horizon + 1 - (2 * floor) / h);
    const lines = tall ? ["Just", "Play"] : ["Just Play"];
    // the title keeps between the boats and the top of the stone's hop
    const low = this.horizon - (this.baseFocal * (FEEL.camHeight - FEEL.idleTop)) / this.idleLead + 0.045, high = this.horizon - 0.14;
    const unit = Math.min((2 * this.aspect * 0.76) / Math.max(...lines.map(measure)), tall ? 0.245 : 0.66 / CAP, (high - low) / standing(lines.length));
    const cy = Math.max(tall ? 0.1 : -0.07, low + (standing(lines.length) * unit) / 2);
    const t = lettering(lines, { unit, cx: 0, cy }, { focal: this.baseFocal, horizon: this.horizon, camH: FEEL.camHeight });
    this.painter.setLettering(t);
    this.titleBox = [0, cy, t.halfW, t.halfH];
    if (this.opts.still?.edge === false) this.edge.clear(); else paintEdge(this.edge, this.aspect, h / 2);
    if (this.phase === "idle") this.placeBoats();
    this.frame(0);
  }

  private measureSpeed(dt: number) {
    if (dt > 0.2) return;
    this.slow.n++; this.slow.sum += dt;
    if (this.slow.n < 50) return;
    const avg = this.slow.sum / this.slow.n;
    this.slow.n = 0; this.slow.sum = 0;
    if (avg > 0.0215 && this.slow.scale > 0.55) { this.slow.scale *= 0.82; this.resize(); }
  }

  private placeBoats() {
    const [near, ...far] = this.tall
      ? [{ x: 2.3, z: 17, scale: 1.8, lean: -0.06 }, { x: -5.2, z: 34, scale: 1.9, lean: 0.05 }, { x: -1.2, z: 60, scale: 2.2, lean: -0.04 }]
      : [{ x: 6.4, z: 13, scale: 1.75, lean: -0.06 }, { x: -13, z: 34, scale: 2.1, lean: 0.05 }, { x: 4, z: 58, scale: 2.3, lean: -0.04 }];
    // the near boat sails behind the title: where the letters reach up to it, it moves back along its line of sight
    const top = this.titleBox[1] + this.titleBox[3] + FEEL.boatClear;
    const back = Math.max(1, (this.baseFocal * FEEL.camHeight) / Math.max(0.02, this.baseHorizon - top) / near.z);
    this.boats = [{ ...near, x: near.x * back, z: near.z * back }, ...far].map((b) => ({ ...b, z: this.camZ + b.z }));
  }

  /* ---------- input ---------- */

  point(nx: number, ny: number) {
    this.pointer.x = nx; this.pointer.y = ny;
    const now = this.time;
    if (this.phase === "idle" && ny < this.horizon - 0.06 && now - this.pointer.last > 0.14) {
      this.pointer.last = now;
      const z = (this.baseFocal * FEEL.camHeight) / (this.horizon - ny);
      this.ripple(this.camX + (nx * this.aspect * z) / this.baseFocal, this.camZ + z, FEEL.ripple.pointer);
    }
  }

  get playing() { return this.phase === "run"; }

  tap() {
    this.audio.wake();
    if (this.phase === "run") { this.skipTap(); return; }
    if (this.phase === "over" && this.phaseTime < FEEL.retryLock) return;
    this.throwStone();
  }

  private throwStone() {
    this.hud.firstTap();
    this.run = new Run();
    this.waited = 0;
    this.runZ = this.camZ + FEEL.lead;
    this.stone = { x: 0, y: 0.5, z: this.runZ, spin: 0, visible: true, sink: 0 };
    if (this.phase === "over") { this.day *= 0.15; }
    this.setPhase("run");
    this.hud.metres(0);
    this.hud.state("run");
    this.audio.throw();
    this.kick = 0.08;
    this.buzz(8);
    this.start();
  }

  private skipTap() {
    const run = this.run!;
    const hit = run.tap();
    if (!hit) return;
    this.taught++; this.waited = 0;
    this.glow = 1;
    this.audio.skip(hit, hit === "poor" ? 0 : Math.min(14, run.streak + (hit === "perfect" ? 1 : 0)));
    this.hud.say(hit === "poor" ? (run.lastOffset < 0 ? "early" : "late") : hit === "perfect" ? (run.streak >= 2 ? `perfect ${run.streak + 1}` : "perfect") : "good", hit);
    this.buzz(hit === "perfect" ? 14 : 6);
  }

  private buzz(ms: number) { if (!this.audio.muted) navigator.vibrate?.(ms); }

  /* ---------- one frame ---------- */

  private setPhase(p: "idle" | "run" | "over") { this.phase = p; this.phaseTime = 0; }

  private frame(dt: number) {
    this.time += dt;
    this.phaseTime += dt;
    const sim = dt * (this.hitstop > 0 ? 0.06 : this.patience(dt));
    this.hitstop = Math.max(0, this.hitstop - dt);
    this.kick *= Math.exp(-FEEL.kickDecay * dt);
    this.shake *= Math.exp(-FEEL.shakeDecay * dt);
    this.glow *= Math.exp(-5 * dt);

    if (this.phase === "run") this.stepRun(sim); else if (this.phase === "idle") { if (!this.opts.still) this.stepIdle(dt); } else this.stepOver(dt);
    this.stepBits(sim);

    const sway = this.phase === "idle" && !this.opts.reduced ? this.pointer.x * FEEL.sway : 0;
    this.camX += (sway - this.camX) * Math.min(1, dt * 2.2);
    if (dt) this.day += ((this.run?.metres ?? 0) - this.day) * Math.min(1, dt * FEEL.lightSpeed);
    this.light = lightAt(this.day);
    this.focal = this.baseFocal * (1 - this.kick);
    if (!this.opts.still && !this.opts.reduced) {
      const up = Math.min(1, Math.max(0, (this.day - FEEL.lookFrom) / (FEEL.lookTo - FEEL.lookFrom)));
      this.horizon = this.baseHorizon - FEEL.lookUp * up * up * (3 - 2 * up);
    }

    const L = this.light;
    const sunX = this.tall ? -0.05 : 0.35;
    paintSky(this.sky, L, this.aspect, this.horizon, this.time, sunX);
    this.paintSprites(L);
    const sx = (Math.random() - 0.5) * this.shake, sy = (Math.random() - 0.5) * this.shake;
    const f: Frame = {
      focal: this.focal, horizon: this.horizon + sy, camH: FEEL.camHeight, camX: this.camX + sx, camZ: this.camZ, time: this.time,
      light: L, sunX, haze: 0.6, flash: 0, ripples: this.ripples, boats: this.boats,
      stone: this.stone.visible ? { x: this.stone.x, y: this.stone.y, z: this.stone.z, size: 0.13 } : null,
      titleBox: this.titleBox, titleK: this.titleGone ? 0 : Math.max(0, 1 - Math.abs(this.camZ - this.titleZ) * 0.4),
      titleZ: this.titleZ, draw: this.draw, scatter: this.titleGone ? 1 : 0, sky: this.sky, sprites: this.sprites, edge: this.edge,
    };
    this.painter.draw(f);
  }

  /** Nobody sinks before they know the game: the first touches slow to a hang until the tap comes. */
  private patience(dt: number) {
    const run = this.run;
    if (this.phase !== "run" || !run || run.tapped || this.taught >= FEEL.teach || run.untilTouch > FEEL.teachFrom) return 1;
    this.waited += dt;
    return this.waited > FEEL.teachHold ? 1 : Math.max(0.02, run.untilTouch / FEEL.teachFrom);
  }

  private stepIdle(dt: number) {
    if (!this.titleGone) this.draw = Math.min(1, this.draw + dt / FEEL.drawTitle);
    const s = this.stone;
    s.visible = this.draw > 0.75;
    if (!s.visible) return;
    this.idleT += dt;
    const u = (this.idleT % FEEL.idleHop) / FEEL.idleHop;
    const was = ((this.idleT - dt) % FEEL.idleHop) / FEEL.idleHop;
    s.x = this.camX; s.z = this.camZ + this.idleLead;
    s.y = 0.06 + FEEL.idleHeight * 4 * u * (1 - u);
    s.spin += dt * 5;
    if (u < was && dt) this.ripple(s.x, s.z, FEEL.ripple.idle);
  }

  private stepRun(dt: number) {
    const run = this.run!;
    const hit = run.step(dt);
    const s = this.stone;
    s.z = this.runZ + run.metres;
    s.y = Math.max(0, run.height) + 0.05;
    s.spin += dt * (9 + run.energy * 9);
    const want = s.z - FEEL.lead + (run.speed / FEEL.follow) * FEEL.keepUp;
    this.camZ += (want - this.camZ) * Math.min(1, dt * (run.metres < 4 ? FEEL.catchUp : FEEL.follow)) ;
    if (hit) this.onSkip(hit);
    this.hud.metres(run.metres);
    if (!this.titleGone && this.camZ - this.titleZ > 9) this.titleGone = true;
    for (const b of this.boats) if (b.z - this.camZ < 0.9) {
      const side = Math.random() < 0.5 ? -1 : 1;
      b.z = this.camZ + 55 + Math.random() * 45;
      b.x = side * (10 + Math.random() * 18);
      b.scale = 1.4 + Math.random() * 0.9; b.lean = -side * 0.06;
    }
    if (run.over) this.onOver();
  }

  private onSkip(hit: Hit) {
    const s = this.stone;
    this.hitstop = FEEL.hitstop[hit];
    this.kick = Math.max(this.kick, FEEL.kick[hit]);
    this.shake = Math.max(this.shake, FEEL.shake[hit]);
    this.ripple(s.x, s.z, FEEL.ripple[hit]);
    this.spray(FEEL.spray[hit], hit === "perfect" ? 1 : 0.65, hit === "perfect" ? 1 : 0);
    this.trail.push({ x: s.x, z: s.z, age: 0, tone: hit === "perfect" ? 1 : 0 });
  }

  private onOver() {
    const run = this.run!, s = this.stone;
    this.ripple(s.x, s.z, FEEL.ripple.sink);
    this.spray(FEEL.spray.sink, 0.9, 0);
    this.shake = FEEL.shake.sink;
    this.audio.sink();
    this.buzz(30);
    s.sink = 0.001;
    const metres = Math.round(run.metres), fresh = metres > this.best;
    this.best = Math.max(this.best, metres);
    const light = lightName(run.metres);
    this.hud.ran({ metres, skips: run.skips, perfects: run.perfects, light, ms: this.phaseTime * 1000 });
    this.setPhase("over");
    this.hud.state("over", { metres, skips: run.skips, best: this.best, light, fresh });
  }

  private stepOver(dt: number) {
    const s = this.stone;
    s.sink += dt; s.y = 0.04 - s.sink * 0.5;
    if (s.sink > 0.35) s.visible = false;
    const glide = Math.max(0, 1 - this.phaseTime / 1.4);
    this.camZ += 3.4 * glide * glide * dt;
    if (this.phaseTime > FEEL.idleAfter) {
      this.run = null;
      this.titleZ = this.camZ; this.titleGone = false; this.draw = 0; this.idleT = 0;
      this.placeBoats();
      this.setPhase("idle");
      this.hud.state("idle");
    }
  }

  private stepBits(dt: number) {
    for (const r of this.ripples) r.age += dt;
    this.ripples = this.ripples.filter((r) => r.age < 4 && r.z > this.camZ - 1);
    for (const d of this.drops) { d.life -= dt; d.vy -= 6.2 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt; }
    this.drops = this.drops.filter((d) => d.life > 0 && d.y > -0.05);
    for (const t of this.trail) t.age += dt;
    this.trail = this.trail.filter((t) => t.age < 1.4);
  }

  private ripple(x: number, z: number, amp: number) {
    this.ripples.push({ x, z, age: 0, amp });
    if (this.ripples.length > 10) this.ripples.splice(0, this.ripples.length - 10);
  }

  private spray(n: number, power: number, tone: number) {
    const s = this.stone, v = this.run ? this.run.speed : 4;
    for (let i = 0; i < n && this.drops.length < 220; i++) {
      const a = Math.random() * Math.PI * 2, p = (0.4 + Math.random()) * power;
      this.drops.push({ x: s.x, y: 0.05, z: s.z, vx: Math.cos(a) * p * 1.1, vy: (1.1 + Math.random() * 1.7) * power, vz: v * 0.55 + Math.sin(a) * p, life: 0.5 + Math.random() * 0.35, size: 0.02 + Math.random() * 0.035, tone: tone ? Math.random() : 0 });
    }
  }

  /* ---------- painting what moves ---------- */

  private paintSprites(L: Light) {
    const out = this.sprites;
    out.clear();
    [...this.boats].sort((a, b) => b.z - a.z).forEach((b) => paintBoat(out, b, L, this.camX, this.camZ, this.time, this.boats.indexOf(b) + 1));
    const s = this.stone, rx = s.x - this.camX, rz = s.z - this.camZ;

    for (const t of this.trail) {
      const z = t.z - this.camZ, a = 1 - t.age / 1.4;
      if (z < 0.6) continue;
      for (let i = 0; i < 5; i++) out.add(t.x - this.camX + (i - 2) * 0.16, 0, z + Math.sin(i * 2.1) * 0.08, 2, 0.11, 0.02, 0, 0.2, t.tone ? mix(L.sun, L.foam, 0.3) : L.foam, a * 0.9, i % FLAT, 0.8);
    }

    if (s.visible && rz > 0.6) {
      this.paintCue(out, L, rx, rz);
      this.paintStone(out, L, rx, s.y, rz, s.spin);
    }
    for (const d of this.drops) {
      const z = d.z - this.camZ;
      if (z < 0.5) continue;
      const c = d.tone > 0.6 ? mix(L.sun, L.hot, 0.35) : d.tone > 0.3 ? L.sun : L.foam;
      out.add(d.x - this.camX, d.y, z, 2, d.size * 1.9, d.size * 0.62, Math.atan2(d.vy, d.vx), 0.2, c, Math.min(1, d.life * 4), Math.floor(d.size * 1000) % FLAT, 1);
    }
  }

  /** The ring that closes on the stone: tap when it arrives. */
  private paintCue(out: StrokeList, L: Light, x: number, z: number) {
    let k: number;
    if (this.phase === "run") k = Math.max(0, this.run!.untilTouch) / Math.max(0.55, this.run!.hop);
    else if (this.phase === "idle") k = 1 - (this.idleT % FEEL.idleHop) / FEEL.idleHop;
    else return;
    const { shut, run, idle, from } = FEEL.ring, waiting = this.phase === "idle";
    if (k > from) return;
    const near = this.phase === "run" && Math.abs(this.run!.untilTouch) < RULES.good;
    const rad = shut + k * (waiting ? idle : run), n = 22;
    const a = Math.min(1, (from - k) * 3.2) * (waiting ? 0.7 : 1);
    const c: Rgb = near ? mix(L.hot, L.sun, 0.25) : mix(L.foam, L.sun, 0.4);
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const px = x + Math.cos(t) * rad, pz = z + Math.sin(t) * rad * OVAL;
      if (pz < 0.6) continue;
      // tangent of the foreshortened ring on screen
      const ang = Math.atan2(Math.cos(t) * OVAL * (FEEL.camHeight / z), -Math.sin(t));
      out.add(px, 0, pz, 2, 0.026 + rad * 0.07, near ? 0.034 : 0.024, ang, 0.12, c, a, i % FLAT, 0.9);
    }
  }

  private paintStone(out: StrokeList, L: Light, x: number, y: number, z: number, spin: number) {
    const tilt = Math.sin(spin) * 0.16, g = this.glow;
    const coral: Rgb = mix([0.87, 0.35, 0.21], L.hot, 0.35);
    const body = mix(L.deep, [0.5, 0.13, 0.12], 0.72), mid = mix(coral, body, 0.12), top = mix(mix(coral, L.foam, 0.45), L.sun, 0.3 + g * 0.7);
    const put = (dx: number, dy: number, len: number, th: number, bend: number, c: Rgb, st: number) => out.add(x + dx, y + dy, z, 2, len, th, tilt, bend, c, 1, st, 1);
    put(0, -0.012, 0.16, 0.085, 0.1, body, 2);
    put(0.004, -0.02, 0.15, 0.07, 0.2, body, 4);
    put(0, 0.008, 0.152, 0.066, -0.08, mid, 2);
    put(-0.006, 0.02, 0.13, 0.046, -0.16, mix(mid, top, 0.35), 4);
    put(Math.cos(spin) * 0.02 - 0.012, 0.034, 0.095, 0.026, -0.2, top, 2);
    put(Math.cos(spin) * 0.04 - 0.02, 0.044, 0.042, 0.012, -0.15, mix(top, [1, 1, 1], 0.6), 3);
    put(0.02, -0.06, 0.085, 0.011, 0.3, mix(L.teal, body, 0.4), 1);
  }
}
