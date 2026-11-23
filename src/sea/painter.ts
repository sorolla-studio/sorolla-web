import { brushAtlas, longBrush } from "./brush";
import { LETTER_FLOATS, type Lettering } from "./lettering";
import { SEA_VS, FREE_VS, STROKE_FS, LETTER_VS, LETTER_FS, QUAD_VS, GROUND_FS, VARNISH_FS } from "./shaders";
import type { Light, Rgb } from "./light";

/** 16 floats per free stroke: pos+mode, half length/thickness/angle/bend, rgba, stamp/paint/wobble/row */
export const STROKE = 16;
const MAX_FREE = 3600;

const WAVES = [
  // wavelength m, heading (radians from straight at you), amplitude m, speed
  [9.5, 0.18, 0.115, 1.0], [5.4, -0.42, 0.07, 1.06], [3.1, 0.55, 0.045, 1.1],
  [1.9, -0.2, 0.03, 1.2], [1.15, 0.9, 0.017, 1.3], [0.66, -0.8, 0.009, 1.4],
] as const;

/** Distance bands. Rows keep their thickness on screen until they would be thinner than minPx; dabs get shorter with distance. */
const BAND = { near: 2.15, ratio: 1.46, count: 11, rows: 18, minPx: 2.5, colStep: 0.17, shrink: 0.45 };

export type Ripple = { x: number; z: number; age: number; amp: number };
export type Boat = { x: number; z: number; scale: number; lean: number };

export type Frame = {
  focal: number; horizon: number; camH: number; camX: number; camZ: number; time: number;
  light: Light; sunX: number; haze: number; flash: number;
  ripples: Ripple[]; boats: Boat[];
  stone: { x: number; y: number; z: number; size: number } | null;
  titleBox: [number, number, number, number]; titleK: number; titleZ: number; draw: number; scatter: number;
  sky: { data: Float32Array; count: number };
  sprites: { data: Float32Array; count: number };
  /** strokes that take paint away, so the picture ends in brush marks instead of a straight cut */
  edge: { data: Float32Array; count: number };
};

type Program = { p: WebGLProgram; u: (name: string) => WebGLUniformLocation | null };

export class Painter {
  readonly gl: WebGL2RenderingContext;
  private ground: Program; private sea: Program; private free: Program; private letters: Program; private varnish: Program;
  private corners: WebGLBuffer; private seaVao: WebGLVertexArrayObject;
  private skyVao: WebGLVertexArrayObject; private skyBuf: WebGLBuffer;
  private spriteVao: WebGLVertexArrayObject; private spriteBuf: WebGLBuffer;
  private edgeVao: WebGLVertexArrayObject; private edgeBuf: WebGLBuffer;
  private letterVao: WebGLVertexArrayObject; private letterBuf: WebGLBuffer; private letterIdx: WebGLBuffer; private letterCount = 0;
  private emptyVao: WebGLVertexArrayObject;
  private fbo: WebGLFramebuffer; private texCol: WebGLTexture; private texH: WebGLTexture; private brush: WebGLTexture; private long: WebGLTexture;
  private w = 0; private h = 0; private dpr = 1;
  private cornerCount = 0;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false });
    if (!gl) throw new Error("webgl2 unavailable");
    this.gl = gl;
    this.ground = this.program(QUAD_VS, GROUND_FS);
    this.sea = this.program(SEA_VS, STROKE_FS);
    this.free = this.program(FREE_VS, STROKE_FS);
    this.letters = this.program(LETTER_VS, LETTER_FS);
    this.varnish = this.program(QUAD_VS, VARNISH_FS);

    // one ribbon of five segments, so a stroke can bend
    const ribbon: number[] = [];
    const SEG = 5;
    for (let i = 0; i <= SEG; i++) { const u = (i / SEG) * 2 - 1; ribbon.push(u, -1, u, 1); }
    this.cornerCount = ribbon.length / 2;
    this.corners = this.buffer(new Float32Array(ribbon));
    this.seaVao = this.vao(() => this.cornerAttrib());
    const freeVao = (buf: WebGLBuffer) => this.vao(() => {
      this.cornerAttrib();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      for (let i = 0; i < 4; i++) {
        gl.enableVertexAttribArray(i + 1);
        gl.vertexAttribPointer(i + 1, 4, gl.FLOAT, false, STROKE * 4, i * 16);
        gl.vertexAttribDivisor(i + 1, 1);
      }
    });
    this.skyBuf = this.buffer(MAX_FREE * STROKE * 4); this.skyVao = freeVao(this.skyBuf);
    this.spriteBuf = this.buffer(MAX_FREE * STROKE * 4); this.spriteVao = freeVao(this.spriteBuf);
    this.edgeBuf = this.buffer(MAX_FREE * STROKE * 4); this.edgeVao = freeVao(this.edgeBuf);
    this.letterBuf = gl.createBuffer()!; this.letterIdx = gl.createBuffer()!;
    this.letterVao = this.vao(() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.letterBuf);
      for (let i = 0; i < 2; i++) { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, 4, gl.FLOAT, false, LETTER_FLOATS * 4, i * 16); }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.letterIdx);
    });
    this.emptyVao = gl.createVertexArray()!;

    this.brush = this.stamp(brushAtlas());
    this.long = this.stamp(longBrush());

    this.texCol = gl.createTexture()!; this.texH = gl.createTexture()!;
    this.fbo = gl.createFramebuffer()!;
    gl.disable(gl.DEPTH_TEST);
  }

  resize(w: number, h: number, dpr: number) {
    if (w === this.w && h === this.h) return;
    const gl = this.gl;
    this.w = w; this.h = h; this.dpr = dpr;
    gl.canvas.width = w; gl.canvas.height = h;
    const alloc = (t: WebGLTexture, internal: number, format: number) => {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.UNSIGNED_BYTE, null);
      for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    alloc(this.texCol, gl.RGBA8, gl.RGBA);
    alloc(this.texH, gl.R8, gl.RED);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texCol, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.texH, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
  }

  setLettering(l: Lettering) {
    const gl = this.gl;
    this.letterCount = l.index.length;
    gl.bindVertexArray(this.letterVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.letterBuf); gl.bufferData(gl.ARRAY_BUFFER, l.data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.letterIdx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, l.index, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
  }

  draw(f: Frame) {
    const gl = this.gl, L = f.light, aspect = this.w / this.h;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.w, this.h);

    gl.disable(gl.BLEND);
    gl.useProgram(this.ground.p);
    gl.uniform2f(this.ground.u("uRes"), this.w, this.h);
    gl.uniform1f(this.ground.u("uHorizon"), f.horizon);
    this.rgb(this.ground, { uDeep: L.deep, uMid: L.mid, uTeal: L.teal, uSkyTop: L.skyTop, uSkyLow: L.skyLow });
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.brush);

    const waves = new Float32Array(24);
    WAVES.forEach(([len, heading, amp, speed], i) => {
      const k = (Math.PI * 2) / len, kx = Math.sin(heading) * k, kz = Math.cos(heading) * k;
      const w = Math.sqrt(9.8 * k) * 0.62 * speed;
      waves.set([kx, kz, amp, (kx * f.camX + kz * f.camZ + w * f.time) % (Math.PI * 2)], i * 4);
    });
    const rip = new Float32Array(40);
    f.ripples.slice(-10).forEach((r, i) => rip.set([r.x - f.camX, r.z - f.camZ, r.age, r.amp], i * 4));
    const common = (p: Program) => {
      gl.useProgram(p.p);
      gl.uniform1i(p.u("uBrush"), 0);
      gl.uniform2f(p.u("uView"), f.focal, f.horizon);
      gl.uniform1f(p.u("uAspect"), aspect);
      gl.uniform1f(p.u("uCamH"), f.camH);
      gl.uniform1f(p.u("uTime"), f.time % 1000);
      gl.uniform4fv(p.u("uWave"), waves);
      gl.uniform4fv(p.u("uRip"), rip);
    };
    const strokes = (vao: WebGLVertexArrayObject, buf: WebGLBuffer, { data, count }: { data: Float32Array; count: number }) => {
      if (!count) return;
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, count * STROKE));
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, this.cornerCount, count);
    };

    common(this.free);
    strokes(this.skyVao, this.skyBuf, f.sky);

    common(this.sea);
    this.rgb(this.sea, { uDeep: L.deep, uMid: L.mid, uTeal: L.teal, uLight: L.light, uCool: L.cool, uWarm: L.warm, uHot: L.hot, uSkyTop: L.skyTop, uSkyLow: L.skyLow, uSun: L.sun, uFoam: L.foam });
    gl.uniform4f(this.sea.u("uSunDir"), f.sunX, L.sunY, L.glitter, f.haze);
    gl.uniform4f(this.sea.u("uTitle"), ...f.titleBox);
    gl.uniform1f(this.sea.u("uTitleK"), f.titleK);
    gl.uniform2f(this.sea.u("uCamW"), f.camX, f.camZ % (Math.PI * 20));
    const boats = new Float32Array(16);
    f.boats.slice(0, 4).forEach((b, i) => boats.set([b.x - f.camX, b.z - f.camZ, b.z - f.camZ > 1 ? b.scale : 0, b.lean], i * 4));
    gl.uniform4fv(this.sea.u("uBoat"), boats);
    if (f.stone) gl.uniform4f(this.sea.u("uStone"), f.stone.x - f.camX, f.stone.y, f.stone.z - f.camZ, f.stone.size);
    else gl.uniform4f(this.sea.u("uStone"), 0, 0, 1e4, 0);
    gl.bindVertexArray(this.seaVao);
    for (let k = BAND.count - 1; k >= 0; k--) {
      const z0 = BAND.near * BAND.ratio ** k, z1 = z0 * BAND.ratio;
      for (let layer = 0; layer < 2; layer++) {
        const fine = layer ? 0.8 : 1;
        const bandPx = f.focal * f.camH * (1 / z0 - 1 / z1) * (this.h / this.dpr / 2);
        const perBand = Math.min(BAND.rows, Math.max(5, bandPx / BAND.minPx));
        const dz = ((z1 - z0) / perBand) * fine;
        const dx = BAND.colStep * z0 * fine * (BAND.near / z0) ** BAND.shrink * (aspect < 1 ? 0.78 : 1);
        const half = ((aspect + 0.35) * z1 * 1.07) / f.focal;
        const cols = Math.ceil((half * 2) / dx) + 2;
        const c0 = Math.floor((f.camX - half) / dx) - 1, r0 = Math.floor((f.camZ + z0 * 0.93) / dz);
        const rows = Math.ceil((z1 * 1.07 - z0 * 0.93) / dz) + 1;
        gl.uniform4i(this.sea.u("uGrid"), cols, rows, c0, r0);
        gl.uniform4f(this.sea.u("uStep"), dx, dz, c0 * dx - f.camX, r0 * dz - f.camZ);
        gl.uniform2f(this.sea.u("uBand"), k === 0 ? 0.5 : z0, k === BAND.count - 1 ? z1 * 2 : z1);
        gl.uniform1i(this.sea.u("uLayer"), layer);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, this.cornerCount, cols * rows);
      }
    }

    if (f.scatter < 1 && f.draw > 0 && this.letterCount) {
      common(this.letters);
      gl.bindTexture(gl.TEXTURE_2D, this.long);
      gl.uniform1i(this.letters.u("uLong"), 0);
      gl.uniform3f(this.letters.u("uOff"), -f.camX, 0, f.titleZ - f.camZ);
      gl.uniform1f(this.letters.u("uDraw"), f.draw);
      gl.uniform1f(this.letters.u("uScatter"), f.scatter);
      this.rgb(this.letters, { uSun: L.sun, uFoam: L.foam, uHot: L.hot, uLight: L.light, uCool: L.cool });
      gl.bindVertexArray(this.letterVao);
      gl.drawElements(gl.TRIANGLES, this.letterCount, gl.UNSIGNED_SHORT, 0);
      gl.bindTexture(gl.TEXTURE_2D, this.brush);
    }

    common(this.free);
    strokes(this.spriteVao, this.spriteBuf, f.sprites);
    gl.blendFuncSeparate(gl.ZERO, gl.ONE, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
    strokes(this.edgeVao, this.edgeBuf, f.edge);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.disable(gl.BLEND);
    gl.useProgram(this.varnish.p);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.texCol);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.texH);
    gl.uniform1i(this.varnish.u("uCol"), 1); gl.uniform1i(this.varnish.u("uH"), 2);
    gl.uniform2f(this.varnish.u("uRes"), this.w, this.h);
    gl.uniform2f(this.varnish.u("uLightDir"), -0.5, 0.86);
    gl.uniform1f(this.varnish.u("uDpr"), this.dpr);
    gl.uniform1f(this.varnish.u("uFlash"), f.flash);
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  destroy() { this.gl.getExtension("WEBGL_lose_context")?.loseContext(); }

  private stamp(src: HTMLCanvasElement) {
    const gl = this.gl, t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    return t;
  }
  private rgb(p: Program, map: Record<string, Rgb>) {
    for (const [k, v] of Object.entries(map)) this.gl.uniform3f(p.u(k), v[0], v[1], v[2]);
  }
  private cornerAttrib() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.corners);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }
  private vao(setup: () => void) {
    const v = this.gl.createVertexArray()!;
    this.gl.bindVertexArray(v); setup(); this.gl.bindVertexArray(null);
    return v;
  }
  private buffer(init: Float32Array | number) {
    const gl = this.gl, b = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    if (typeof init === "number") gl.bufferData(gl.ARRAY_BUFFER, init, gl.DYNAMIC_DRAW);
    else gl.bufferData(gl.ARRAY_BUFFER, init, gl.STATIC_DRAW);
    return b;
  }
  private program(vs: string, fs: string): Program {
    const gl = this.gl, p = gl.createProgram()!;
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      gl.attachShader(p, s);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
    const cache = new Map<string, WebGLUniformLocation | null>();
    return { p, u: (n) => { if (!cache.has(n)) cache.set(n, gl.getUniformLocation(p, n)); return cache.get(n)!; } };
  }
}
