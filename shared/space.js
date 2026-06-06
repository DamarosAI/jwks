/* ============================================================
 * DAMAROS — Space. A governed execution field (Three.js + GLSL).
 *
 * One persistent world traversed station by station. THREE depth layers:
 *   DEEP   — a curved topology terrain (grid + contour lines + grain), a
 *            gradient skydome, atmosphere haze. Never flat black.
 *   MID    — distant node constellations, travelling signal traces, and (on
 *            capable GPUs) purple provenance filaments.
 *   FRONT  — a 48k-particle field that MORPHS between a distinct, structured
 *            FORM per section, with a hard LINE skeleton overlaid for legibility
 *            and, on Evidence, a trust-boundary MEMBRANE the fragments cross.
 *
 * Crispness, not haze: each particle is a tight HDR core + a faint halo; ACES
 * rolls hot cores into clean highlights; bloom is a disciplined halo on the
 * brightest pixels only. Continuity, not slideshow: a critically-damped
 * spherical camera flies "through glass" and the cloud settles into each form
 * with a per-particle staggered morph. Color = STATE, never decoration.
 *
 * Device-adaptive: particle/world counts + bloom scale to the GPU (software/
 * mobile get far fewer); morph is wall-clock so it never slow-motions; paused
 * when hidden; reduced-motion calms the flow and snaps morphs. ?hi forces the
 * full-fidelity path for QA under headless software GL.
 * ============================================================ */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* ---------- environment ---------- */
const MOBILE = matchMedia('(hover: none),(pointer: coarse)').matches || innerWidth <= 820;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = THREE.MathUtils.clamp;
const ss = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const smoother = (x) => { x = clamp(x, 0, 1); return x * x * x * (x * (x * 6 - 15) + 10); };

/* ---------- motion primitives (frame-rate independent) ---------- */
const damp = (cur, tgt, lambda, dt) => tgt + (cur - tgt) * Math.exp(-lambda * dt);
function dampV(out, tgt, lambda, dt) { const e = Math.exp(-lambda * dt); out.x = tgt.x + (out.x - tgt.x) * e; out.y = tgt.y + (out.y - tgt.y) * e; out.z = tgt.z + (out.z - tgt.z) * e; return out; }
function dampAngle(cur, tgt, lambda, dt) { let d = (tgt - cur) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return cur + d * (1 - Math.exp(-lambda * dt)); }
class Spring { constructor(v, omega = 5) { this.x = v; this.v = 0; this.omega = omega; this.target = v; } set(t) { this.target = t; } snap(t) { this.target = t; this.x = t; this.v = 0; } step(dt) { const w = this.omega, e = Math.exp(-w * dt), x = this.x - this.target; const nx = (x + (this.v + w * x) * dt) * e, nv = (this.v - (this.v + w * x) * w * dt) * e; this.x = this.target + nx; this.v = nv; return this.x; } }

/* ---------- palette ---------- */
const css = getComputedStyle(document.documentElement);
const hx = (n, f) => { const v = css.getPropertyValue(n).trim(); return v ? new THREE.Color(v) : new THREE.Color(f); };
const COL = { jet: hx('--jet', '#06080b'), cold: hx('--cold', '#e8ecf0'), steel: hx('--steel', '#a9c0d6'), deep: hx('--deep', '#2f5f8c'), amber: hx('--amber', '#d9a23e'), breach: hx('--breach', '#f2566e'), ok: hx('--ok', '#5bb98c'), luna: hx('--luna', '#8c7cf0') };

/* ---------- renderer first, so we can detect the GPU and size the world to it ---------- */
const canvas = document.getElementById('world');
// antialias only matters for the DIRECT-render path (mobile / software GL). On desktop the EffectComposer
// owns AA (MSAA RT + SSAA), so a multisampled default framebuffer here would be pure wasted VRAM/bandwidth.
const renderer = new THREE.WebGLRenderer({ canvas, antialias: MOBILE, powerPreference: 'high-performance', alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOBILE ? 1.25 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
let SOFT = false;
try { const gl = renderer.getContext(); const dbg = gl.getExtension('WEBGL_debug_renderer_info'); const r = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''; SOFT = /swiftshader|llvmpipe|software|basic render|microsoft/i.test(r); } catch (e) { SOFT = false; }
const HI = location.search.indexOf('hi') >= 0;          // QA: force full fidelity under headless software GL
const BLOOM = HI || (!MOBILE && !SOFT);
const N = HI ? 48000 : (SOFT ? 12000 : (MOBILE ? 18000 : 48000));
renderer.toneMappingExposure = (SOFT && !HI) ? 0.84 : (MOBILE ? 0.80 : 0.62);   // mobile: brighter — no bloom pass, smaller OLED panels need more lift
try { renderer.outputColorSpace = THREE.SRGBColorSpace; } catch (e) { /* older builds */ }

/* ============================================================
 * Section forms — each fills a Float32Array of N particle targets (same N so the
 * cloud morphs 1:1). Forms are STRUCTURED (plates, rings, prongs, lattices,
 * crossing streams) not random clouds — the silhouette must read.
 * ============================================================ */
const R = () => Math.random(), TAU = Math.PI * 2;
function onSphere(r) { const u = R() * 2 - 1, a = R() * TAU, s = Math.sqrt(1 - u * u); return [Math.cos(a) * s * r, u * r, Math.sin(a) * s * r]; }

// FRONT particles are now ONLY barely-visible atmospheric depth — a wide, faint, low drift.
// No station forms a product object; each is a slightly different calm field, so the morph
// between stations is just a quiet reshuffle of dust (never a cube / orb / lattice / etc).
function calm(a, r0, rw, y0, yh, z0, zh, u) { for (let i = 0; i < N; i++) { const k = i * 3, ang = R() * TAU, rad = r0 + R() * rw; a[k] = Math.cos(ang) * rad; a[k + 1] = y0 - R() * yh + Math.sin(ang * 2.0) * u; a[k + 2] = z0 - R() * zh + Math.sin(ang) * u * 3.0; } }
function fCore(a)    { calm(a, 14, 44, -12, 18, -28, 46, 1.0); }   // 00 opening
function fStacks(a)  { calm(a, 12, 40, -13, 16, -26, 44, 1.1); }   // 01 protocol
function fCross(a)   { calm(a, 16, 46, -11, 18, -30, 46, 0.9); }   // 02 evidence
function fBands(a)   { calm(a, 13, 42, -12, 17, -27, 45, 1.2); }   // 03 screening
function fRings(a)   { calm(a, 15, 44, -12, 18, -29, 46, 1.0); }   // 04 replay
function fTrident(a) { calm(a, 14, 46, -13, 16, -28, 46, 1.0); }   // 05 trident
function fField(a)   { calm(a, 16, 46, -11, 19, -30, 48, 0.8); }   // 06 luna
function fNode(a)    { calm(a, 12, 40, -13, 15, -26, 42, 1.1); }   // 07 node
function fLattice(a) { calm(a, 17, 48, -11, 18, -31, 48, 0.9); }   // 08 console
function fTorus(a)   { calm(a, 14, 42, -11, 16, -26, 44, 1.0); }   // 09 final

// (product-object geometry data removed in the hard reset — no Trident net / Node box / Console nodes)

const FORMS = [fCore, fStacks, fCross, fBands, fRings, fTrident, fField, fNode, fLattice, fTorus];
const KINDS = ['opening', 'protocol', 'evidence', 'screening', 'replay', 'trident', 'luna', 'node', 'console', 'final'];
const NS = KINDS.length;
// accent = STATE: structure(steel) · proof(cold/white) · readiness(ok/green) · provenance(luna/purple)
const ACCENT = [COL.steel, COL.cold, COL.steel, COL.cold, COL.steel, COL.steel, COL.luna, COL.ok, COL.steel, COL.steel];
// state colour is carried by DOM chips now, not particles — no particle state mix
const STATEMIX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// particles are barely-visible atmospheric depth everywhere now (uniform, low)
const CLOUD_DIM = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
// cursor verb weights: [sharpen, reveal, seam, state, scrub, trail, stage, attract, slice, compute]
// hard reset — only a gentle ambient reveal + faint attract on the dust; all product verbs retired
const CURSOR_W = [
  [0, 0.12, 0, 0, 0, 0, 0, 0.08, 0, 0],   // 0 opening
  [0, 0.12, 0, 0, 0, 0, 0, 0.08, 0, 0],   // 1 protocol
  [0, 0.12, 0, 0, 0, 0, 0, 0.08, 0, 0],   // 2 evidence
  [0, 0.12, 0, 0, 0, 0, 0, 0.08, 0, 0],   // 3 screening
  [0, 0.12, 0, 0, 0, 0, 0, 0.08, 0, 0],   // 4 replay
  [0, 0.12, 0, 0, 0, 0, 0, 0.08, 0, 0],   // 5 trident
  [0, 0.12, 0, 0, 0, 0, 0, 0.08, 0, 0],   // 6 luna
  [0, 0.12, 0, 0, 0, 0, 0, 0.08, 0, 0],   // 7 node
  [0, 0.12, 0, 0, 0, 0, 0, 0.08, 0, 0],   // 8 console
  [0, 0.12, 0, 0, 0, 0, 0, 0.08, 0, 0],   // 9 final
];
const CW_KEYS = ['uCwSharpen', 'uCwReveal', 'uCwSeam', 'uCwState', 'uCwScrub', 'uCwTrail', 'uCwStage', 'uCwAttract', 'uCwSlice', 'uCwCompute'];
const SHAPES = FORMS.map((f) => { const a = new Float32Array(N * 3); f(a); return a; });
const bandArr = new Float32Array(N); for (let i = 0; i < N; i++) bandArr[i] = i % 3;   // 0 fail · 1 review · 2 pass
// per-particle SUB id — retired in the hard reset (particles are uniform calm dust now; no roles)
function fSub() { return new Float32Array(N); }
const SUB = FORMS.map(() => fSub());

/* ============================================================
 * GLSL — flow-field noise + crisp two-zone particles
 * ============================================================ */
const SNOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 flowField(vec3 p){ return vec3(snoise(p), snoise(p+vec3(31.4,11.7,5.2)), snoise(p+vec3(-19.3,7.7,23.1))); }`;

const VERT = SNOISE + `
attribute vec3 aTo; attribute float aRnd, aBand, aSub;
uniform float uMorph, uTime, uSize, uCursorAmt, uFlow, uArrowAmt, uFocus, uAssemble, uLive, uKind, uAuto;
uniform float uCwSharpen, uCwReveal, uCwSeam, uCwState, uCwScrub, uCwTrail, uCwStage, uCwAttract, uCwSlice, uCwCompute, uScrub, uStageT;
uniform vec3 uCursor; uniform vec2 uParallax, uArrowDir, uProbe;
uniform vec3 uTrail[6]; uniform float uTrailAge[6];
varying float vRnd, vDepth, vGlow, vHot, vBand, vTw, vReveal, vStateBoost, vAuto, vProvTintV, vAmber, vReady, vStop;
void main(){
  vReveal = 0.0; vStateBoost = 0.0; vAuto = 0.0; vProvTintV = 0.0; vAmber = 0.0; vReady = 0.0; vStop = 0.0;
  // staggered, smootherstep morph — the cloud SETTLES into the form (no lockstep crossfade)
  float stagger = aRnd * 0.26;
  float mL = clamp((uMorph - stagger) / (1.0 - stagger), 0.0, 1.0);
  float me = mL*mL*mL*(mL*(mL*6.0-15.0)+10.0);
  vec3 base = mix(position, aTo, me);
  base *= (1.0 - uFocus * 0.08);                          // CTA focus: tighten once
  // construction: scatter outward at mid-morph, implode into the resolved form (no crossfade)
  base += normalize(base + 1e-3) * (sin(me * 3.14159) * uAssemble) * (0.8 + aRnd * 1.5);

  // ===== ambient drift only — particles are barely-visible atmospheric depth now (no product process) =====
  // one calm motion for every station, gated by uLive so it eases in as a station settles (pop-free)
  float L = uLive * uAuto;
  if (L > 0.001) {
    base *= 1.0 + sin(uTime * 0.20 + aRnd * 6.2831) * 0.010 * L;                                       // a slow, faint depth breath
    base.xy += vec2(sin(uTime * 0.13 + aRnd * 9.0), cos(uTime * 0.11 + aRnd * 7.0)) * 0.10 * L;        // a gentle, formless wander
    vAuto += 0.05 * L * (0.5 + 0.5 * sin(uTime * 0.35 + aRnd * 6.2831));                               // a quiet shimmer of life
  }

  // ===== cursor: a gentle, premium ambient touch on the dust (no product verbs) =====
  float flowCut = 0.0;
  {
    vec3 toC = uCursor - base; float dl = length(toC); vec3 dir = toC / max(dl, 1e-4);
    float near = exp(-dl*dl*0.020);                       // ~7u radius
    float wide = exp(-dl*dl*0.006);                       // ~13u radius
    base += dir * near * uCwAttract * 1.4;               // a faint pull toward the cursor
    vReveal += wide * uCwReveal;                          // a soft local brighten
  }

  vec3 f = flowField(base*0.07 + vec3(0.0,0.0,uTime*0.05));
  base += f * uFlow * (0.45 + aRnd*0.85) * (1.0 - clamp(flowCut, 0.0, 0.9));
  vGlow = length(f);
  vTw = 0.82 + 0.18 * sin(uTime*(1.4+aRnd*3.0) + aRnd*6.2831);

  // multi-layer parallax + directional current on arrow hover (kept)
  base.xy += uParallax * (0.35 + aRnd*0.65) * 0.7;
  base.xy += uArrowDir * uArrowAmt * (0.6 + aRnd*0.8) * 1.3;

  vec4 mv = modelViewMatrix * vec4(base,1.0);
  gl_Position = projectionMatrix * mv;
  vDepth = -mv.z; vRnd = aRnd; vBand = aBand;
  vHot = smoothstep(0.7,1.0,aRnd) + vGlow*0.5;
  gl_PointSize = clamp(uSize*(0.55+aRnd*1.0)*(220.0/max(1.0,-mv.z)), 1.2, 7.5);
}`;

const FRAG = `
precision highp float;
uniform vec3 uColA, uColB, uAccent, uFogCol, uOk, uAmber, uBreach, uLuna; uniform float uAlpha, uCloudDim, uStateMix, uFocus, uHot, uCwTrail;
varying float vRnd, vDepth, vGlow, vHot, vBand, vTw, vReveal, vStateBoost, vAuto, vProvTintV, vAmber, vReady, vStop;
void main(){
  vec2 uv = gl_PointCoord*2.0-1.0; float r = length(uv); if(r>1.0) discard;
  float core = pow(1.0 - smoothstep(0.0, 0.46, r), 1.85);    // tight, sharp center
  float halo = exp(-r * r * 3.0) * 0.30;                  // fainter, smaller glow
  float shape = core + halo;

  vec3 col = mix(uColA, uColB, vRnd);
  col = mix(col, uAccent, smoothstep(0.66,1.0,vRnd)*0.7 + vGlow*0.10);
  // color = STATE: fail/review/pass for band particles, intensified locally by the diagnostic-focus cursor
  vec3 stateCol = mix(mix(uBreach, uAmber, step(0.5,vBand)), uOk, step(1.5,vBand));
  col = mix(col, stateCol, clamp(uStateMix + vStateBoost, 0.0, 1.0) * 0.85);
  // cursor REVEAL: admitted/hovered brighten, rejected darken; Luna trail tints toward provenance violet
  col *= 1.0 + max(vReveal, 0.0) * 0.5;
  col *= 1.0 - clamp(-vReveal, 0.0, 0.55);
  col = mix(col, uLuna, clamp(vReveal, 0.0, 1.0) * uCwTrail * 0.6);
  // autonomous: system glow (sweeps, glints, activation) + Luna governance tint — present with no cursor
  col *= 1.0 + clamp(vAuto, 0.0, 2.0) * 0.3;
  col = mix(col, uLuna, clamp(vProvTintV, 0.0, 1.0) * 0.5);
  // color = STATE channels (amber unstable/held/review · green ready · red stop) — driven by the autonomous process
  col = mix(col, uAmber,  clamp(vAmber, 0.0, 1.0) * 0.8);
  col = mix(col, uOk,     clamp(vReady, 0.0, 1.0) * 0.8);
  col = mix(col, uBreach, clamp(vStop,  0.0, 1.0) * 0.85);
  col *= 1.0 + (clamp(vAmber, 0.0, 1.0) + clamp(vReady, 0.0, 1.0) + clamp(vStop, 0.0, 1.0)) * 0.22;

  float fog = smoothstep(16.0, 140.0, vDepth);
  col = mix(col, uFogCol, fog*0.85);
  col *= 1.0 + (vHot*vTw) * uHot;                         // push hot cores >1.0 -> ACES highlight + bloom seed
  col *= 1.0 + uFocus*0.5;

  float a = shape * uAlpha * uCloudDim * (1.0 - fog*0.6) * (1.0 + uFocus*0.4) * (1.0 + max(vReveal, 0.0) * 0.22) * (1.0 + clamp(vAuto, 0.0, 1.0) * 0.25) * (1.0 + clamp(vAmber + vReady + vStop, 0.0, 1.5) * 0.2);
  gl_FragColor = vec4(col, a);
}`;

/* ---------- particle geometry + material ---------- */
const geo = new THREE.BufferGeometry();
const posArr = new Float32Array(N * 3); posArr.set(SHAPES[0]);
const toArr = new Float32Array(N * 3); toArr.set(SHAPES[0]);
const rndArr = new Float32Array(N); for (let i = 0; i < N; i++) rndArr[i] = Math.random();
geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
geo.setAttribute('aTo', new THREE.BufferAttribute(toArr, 3));
geo.setAttribute('aRnd', new THREE.BufferAttribute(rndArr, 1));
geo.setAttribute('aBand', new THREE.BufferAttribute(bandArr, 1));
const subArr = new Float32Array(N); subArr.set(SUB[0]);
geo.setAttribute('aSub', new THREE.BufferAttribute(subArr, 1));
geo.setDrawRange(0, N);
const uniforms = {
  uMorph: { value: 1 }, uTime: { value: 0 }, uSize: { value: MOBILE ? 1.2 : 1.35 }, uAlpha: { value: 0.13 }, uCloudDim: { value: 0.5 }, uFlow: { value: 0.9 },
  uCursor: { value: new THREE.Vector3(999, 999, 999) }, uCursorAmt: { value: 0 }, uParallax: { value: new THREE.Vector2(0, 0) },
  uArrowDir: { value: new THREE.Vector2(1, 0) }, uArrowAmt: { value: 0 }, uFocus: { value: 0 }, uAssemble: { value: 0 },
  // autonomous motion: uLive gates the cycle in as a form settles (pop-free); uKind selects the scene's block; uAuto = amplitude master
  uLive: { value: 0 }, uKind: { value: 0 }, uAuto: { value: REDUCED ? 0.32 : 1 },
  // per-section cursor physics: an eased weight bank (verb selection) + driver inputs
  uCwSharpen: { value: 0 }, uCwReveal: { value: 0 }, uCwSeam: { value: 0 }, uCwState: { value: 0 }, uCwScrub: { value: 0 }, uCwTrail: { value: 0 }, uCwStage: { value: 0 }, uCwAttract: { value: 0 }, uCwSlice: { value: 0 }, uCwCompute: { value: 0 },
  uProbe: { value: new THREE.Vector2(0, 0) }, uScrub: { value: 0 }, uStageT: { value: 0 },
  uTrail: { value: Array.from({ length: 6 }, () => new THREE.Vector3(999, 999, 999)) }, uTrailAge: { value: new Float32Array(6) },
  uColA: { value: new THREE.Color('#16314f') }, uColB: { value: new THREE.Color('#cdd9e6') }, uAccent: { value: ACCENT[0].clone() },
  uFogCol: { value: new THREE.Color('#0e151f') }, uOk: { value: COL.ok.clone() }, uAmber: { value: COL.amber.clone() }, uBreach: { value: COL.breach.clone() }, uLuna: { value: COL.luna.clone() }, uStateMix: { value: 0 },
  uHot: { value: (BLOOM ? 0.30 : 0.18) }   // particles are now SECONDARY signal: HDR push tamed so the authored geometry owns the silhouette
};
const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
const cloud = new THREE.Points(geo, mat);

/* ============================================================
 * Scene + the three depth layers
 * ============================================================ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(MOBILE ? '#101a28' : '#0a121b');   // match the horizon; mobile lifts the floor so wireframe never reads as void black
// PARTICLE FIELD PURGED — the morphing dust cloud is no longer added to the scene (no dots, no dust at all).
// The cloud/material/uniforms remain defined (the loop still eases their values harmlessly) but render NOTHING.
// scene.add(cloud);

// shared world clock + eased state (one source the world materials animate from)
function viewportFillBoost() {
  const ar = innerWidth / innerHeight;
  let fill = MOBILE ? 0.72 : 0.1;
  if (ar < 0.78) fill = Math.max(fill, clamp((0.84 - ar) / 0.42, 0, 1));
  return fill;
}
function syncViewport() { W.uViewport.value.set(innerWidth / innerHeight, viewportFillBoost()); }

const W = { uTime: { value: 0 }, uSection: { value: 0 }, uHue: { value: COL.steel.clone() }, uReveal: { value: 0 }, uProvenance: { value: 0 }, uHover: { value: 0 }, uFinal: { value: 0 }, uSoft: { value: 0 }, uViewport: { value: new THREE.Vector2(innerWidth / innerHeight, viewportFillBoost()) } };   // uViewport: aspect + bottom-fill boost for tall/mobile viewports
syncViewport();
W.uBurst = { value: 0 };   // star-twinkle burst (Node hover) — shared by both star shells
const W_PROV = [0.06, 0.10, 0.30, 0.12, 0.55, 0.14, 0.95, 0.20, 0.24, 0.34];
const TERRAIN_PROV = [W_PROV[0], W_PROV[1], W_PROV[5], W_PROV[6], W_PROV[7], W_PROV[9]];   // 6 deck stops — home · spine · engine · mesh · intel · closer
const SEG_X = SOFT ? 70 : (MOBILE ? 88 : 176), SEG_Y = SOFT ? 74 : (MOBILE ? 100 : 184);   // mobile: lighter mesh for smoother fps
const PLANE_D = MOBILE ? 520 : 440;
const NODE_N = SOFT ? 90 : (MOBILE ? 160 : 300);   // fewer distant nodes — quieter, darker background
const FILAMENTS = !SOFT;

const deepLayer = new THREE.Group(); deepLayer.position.z = -120;
const midLayer = new THREE.Group(); midLayer.position.z = -55;
scene.add(deepLayer, midLayer);

// gradient skydome — fills the void with atmosphere instead of black
(function () {
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    uniforms: { uTop: { value: new THREE.Color(MOBILE ? '#080d16' : '#03050a') }, uMid: { value: new THREE.Color(MOBILE ? '#121e30' : '#0a1320') }, uHoriz: { value: new THREE.Color(MOBILE ? '#243a54' : '#16263a') } },
    vertexShader: 'varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
    fragmentShader: 'precision highp float; varying vec3 vP; uniform vec3 uTop,uMid,uHoriz; void main(){ float h=clamp(vP.y/180.0*0.5+0.5,0.0,1.0); vec3 lower=mix(uHoriz,uMid,smoothstep(0.0,0.5,h)); vec3 col=mix(lower,uTop,smoothstep(0.46,1.0,h)); col*=1.0-0.06*smoothstep(0.6,1.0,h); gl_FragColor=vec4(col,1.0);} '
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(190, 32, 20), m); sky.renderOrder = -10; scene.add(sky);
})();

// DEEP — one curved topology terrain plane (grid + contour lines + grain)
function makeDeepTerrain() {
  const g = new THREE.PlaneGeometry(420, PLANE_D, SEG_X, SEG_Y); g.rotateX(-Math.PI * 0.5);   // deeper plane: the near edge overshoots toward the camera so the bottom never runs out of terrain
  // terrain morphs across 5 deck stops only (home · spine · substrate · intel · closer) — not per-vantage
  const vert = SNOISE + `
    uniform float uTime, uSection, uHover, uFinal; uniform vec2 uViewport;
    varying vec3 vWorld; varying float vFog, vH, vRidge, vFill;
    float secW(float s, float k){ return clamp(1.0 - abs(s-k), 0.0, 1.0); }
    void main(){
      vec3 p = position;
      float bowl = (p.x*p.x)*0.0009 + (p.z*p.z)*0.00035;
      float s1 = snoise(vec3(p.x*0.010, p.z*0.010, uTime*0.015));
      float s2 = snoise(vec3(p.x*0.026+4.0, p.z*0.022-2.0, uTime*0.022));
      float h = bowl + s1*7.0 + s2*3.0;
      float wSpine=secW(uSection,1.0), wSub=secW(uSection,2.0), wMesh=secW(uSection,3.0), wIntel=secW(uSection,4.0), wClose=secW(uSection,5.0);
      vRidge = 0.0;
      // SPINE — vertical strata (unified execution spine)
      { float ridgeX = sin(p.x*0.05)*4.5; float flatZ = mix(h, bowl + s1*7.0*0.3, 0.85); h = mix(h, mix(flatZ, ridgeX, 0.5), wSpine); }
      // SUBSTRATE — calibration: flatten the swells
      h = mix(h, bowl + s1*1.5, wSub);
      // MESH — an interlocking operational weave: two crossing diagonal ridge sets that drift
      { float weave = sin((p.x+p.z)*0.075 + uTime*0.25)*2.3 + sin((p.x-p.z)*0.072 - uTime*0.20)*2.3; h = mix(h, bowl*0.55 + s1*1.4 + weave, wMesh); }
      // INTEL — lift toward camera + tighten
      { float local = h*0.45 + sin(p.x*0.12)*0.6 + cos(p.z*0.12)*0.6; h = mix(h, local + 4.0, wIntel); }
      // CLOSER — rising, surging field
      { float radf = length(p.xz); float surge = sin(radf*0.05 - uTime*0.9)*2.0 + sin(uTime*0.5 + radf*0.02)*1.2; h = mix(h, bowl*0.7 + s1*2.0 + surge*(0.45+0.55*uFinal), wClose); }
      // CARD HOVER — the topology breathes upward and ripples while a sub-block is hovered (leaned-in interaction)
      if (uHover > 0.001){ float radh = length(p.xz); h += (sin(radh*0.09 - uTime*1.4)*0.75 + exp(-radh*radh*0.00028)*1.05) * uHover; }
      // near apron: flatten overshoot toward camera so wireframe fills the bottom of tall/mobile viewports
      float fill = clamp(uViewport.y + clamp(0.80 - uViewport.x, 0.0, 0.38) * 1.35, 0.0, 1.0);
      float apronLo = mix(135.0, 108.0, fill);
      float apronHi = mix(215.0, 282.0, fill);
      float apronStr = mix(1.0, 0.26, fill);
      float apron = smoothstep(apronLo, apronHi, p.z) * apronStr;
      h = mix(h, h * mix(0.25, 0.54, fill) - mix(3.0, 0.45, fill), apron);
      vFill = fill;
      vH = h; p.y -= 26.0; p.y += h;
      vec4 mv = modelViewMatrix * vec4(p,1.0); vWorld = p; vFog = clamp((-mv.z-60.0)/220.0,0.0,1.0);
      gl_Position = projectionMatrix * mv;
    }`;
  const GO = (MOBILE || SOFT) ? 1 : 2;
  const gGrid = MOBILE ? 0.504 : 0.378, gCont = MOBILE ? 0.684 : 0.54;
  const gLineL = MOBILE ? 0.432 : 0.315, gLineH = MOBILE ? 0.468 : 0.585;
  const gAlphaB = MOBILE ? 0.063 : 0.045, gAlphaL = MOBILE ? 0.468 : 0.378;
  const gFog = MOBILE ? 0.88 : 0.94, gRevA = MOBILE ? 0.234 : 0.162, gRevB = MOBILE ? 0.396 : 0.468;
  const frag = `
    precision highp float; uniform float uTime, uReveal, uSection, uProv, uFinal, uSoft; uniform vec3 uHue, uOk, uAmber, uBreach, uLuna;
    varying vec3 vWorld; varying float vFog, vH, vRidge, vFill;
    float secW(float s, float k){ return clamp(1.0 - abs(s-k), 0.0, 1.0); }
    float hash21(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
    float grain(vec2 uv){ float g=0.0,amp=0.5; vec2 q=uv; for(int i=0;i<${GO};i++){ g+=(hash21(floor(q))-0.5)*amp; q*=2.03; amp*=0.5; } return g; }
    // feathered line: a soft falloff plus a constant softness floor so lines never resolve to a razor-hard
    // edge (even head-on in the foreground where fwidth is tiny) -> kills the hard edges on every topology line
    float gridLine(float c, float w){ float d=abs(fract(c)-0.5); float aa=fwidth(c)+1e-4; float hw=max(w, aa*0.5); float soft=aa*4.5+0.022+uSoft; return 1.0-smoothstep(hw*0.5, hw+soft, d); }
    void main(){
      float wSpine=secW(uSection,1.0), wSub=secW(uSection,2.0), wMesh=secW(uSection,3.0), wIntel=secW(uSection,4.0), wClose=secW(uSection,5.0);
      vec2 gf = vec2(0.05);
      gf = mix(gf, vec2(0.060,0.050), wSpine);
      gf = mix(gf, vec2(0.055), wSub);
      gf = mix(gf, vec2(0.066), wMesh);
      gf = mix(gf, vec2(0.058), wIntel);
      vec2 gw = vWorld.xz;
      float gx = gridLine(gw.x*gf.x, 0.0096), gz = gridLine(gw.y*gf.y, 0.0096);
      float grid = max(gx,gz)*${gGrid};
      float contFreq = mix(0.18, 0.34, wSub), contW = mix(0.04, 0.028, wSub);
      float contour = gridLine(vH*contFreq, contW)*${gCont};
      float gr = grain(gl_FragCoord.xy*0.5 + floor(uTime*7.0)) * mix(0.035, 0.008, wSub);
      float lines = grid + contour;
      vec3 base = mix(vec3(0.012,0.018,0.030), vec3(0.02,0.035,0.06), clamp(-vH*0.04,0.0,1.0));
      vec3 lineHue = uHue;
      float contrast = 1.0 + wSub*0.8;
      vec3 col = base + lineHue*lines*contrast*(${gLineL}+${gLineH}*uReveal) + gr;
      float fogK = vFog * mix(${gFog}, ${MOBILE ? '0.68' : '0.86'}, vFill * 0.9);
      col *= (1.0 - fogK);
      float a = (${gAlphaB} + lines*${gAlphaL})*(1.0 - fogK)*(${gRevA}+${gRevB}*uReveal);
      col *= 1.0 + uFinal*0.85;          // FINAL: glow everything for the closing frame
      a   *= 1.0 + uFinal*0.55;
      col *= ${MOBILE ? '1.16' : '1.0'};
      a   *= ${MOBILE ? '1.12' : '1.0'};
      gl_FragColor = vec4(col, a);
    }`;
  const m = new THREE.ShaderMaterial({ uniforms: { uTime: W.uTime, uReveal: W.uReveal, uHue: W.uHue, uSection: W.uSection, uProv: W.uProvenance, uHover: W.uHover, uFinal: W.uFinal, uSoft: W.uSoft, uViewport: W.uViewport, uOk: { value: COL.ok.clone() }, uAmber: { value: COL.amber.clone() }, uBreach: { value: COL.breach.clone() }, uLuna: { value: COL.luna.clone() } }, vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const mesh = new THREE.Mesh(g, m); mesh.renderOrder = -8; return mesh;
}

// MID — distant node constellation that brightens near the active section
function makeNodes() {
  const n = NODE_N, pos = new Float32Array(n * 3), rnd = new Float32Array(n), band = new Float32Array(n);
  for (let i = 0; i < n; i++) { const ang = Math.random() * TAU, rad = 40 + Math.random() * 120, k = i * 3; pos[k] = Math.cos(ang) * rad; pos[k + 1] = (Math.random() - 0.5) * 70 + 6; pos[k + 2] = -Math.random() * 90 - 10; rnd[i] = Math.random(); band[i] = Math.floor(Math.random() * NS); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1)); g.setAttribute('aBand', new THREE.BufferAttribute(band, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: W.uTime, uSection: W.uSection, uReveal: W.uReveal, uHue: W.uHue }, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aRnd, aBand; uniform float uTime, uSection, uReveal; varying float vGlow, vRnd;
      void main(){ float near=1.0-clamp(abs(uSection-aBand)*0.6,0.0,1.0); float tw=0.55+0.45*sin(uTime*0.7+aRnd*30.0);
        vGlow=(0.18+near*0.7)*tw*uReveal; vRnd=aRnd; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv;
        gl_PointSize=(1.4+aRnd*2.6+near*3.0)*(260.0/max(1.0,-mv.z)); }`,
    fragmentShader: `precision highp float; uniform vec3 uHue; varying float vGlow, vRnd;
      void main(){ vec2 uv=gl_PointCoord*2.0-1.0; float r2=dot(uv,uv); if(r2>1.0) discard; float a=exp(-r2*4.0);
        gl_FragColor=vec4(mix(uHue*0.6,uHue,vRnd), a*vGlow*0.6); }`
  });
  const pts = new THREE.Points(g, m); pts.renderOrder = -6; return pts;
}

// MID — travelling signal traces (a bright pulse flows along each hairline)
function makeTraces(count, speed, hue, baseA, prov) {
  const SEG = 22, verts = [], aT = [], aSeed = [];
  for (let t = 0; t < count; t++) { const y0 = (Math.random() - 0.5) * 60 + 4, z0 = -Math.random() * 70 - 8, seed = Math.random(), bow = prov ? 18 : 0; let px, py, pz; for (let s = 0; s <= SEG; s++) { const u = s / SEG, x = -150 + 300 * u, y = y0 + Math.sin(u * 6.0 + seed * 20.0) * 8.0 + (prov ? Math.sin(u * Math.PI) * bow : 0), z = z0 + Math.cos(u * 4.0 + seed * 12.0) * 10.0; if (s > 0) { verts.push(px, py, pz, x, y, z); aT.push((s - 1) / SEG, s / SEG); aSeed.push(seed, seed); } px = x; py = y; pz = z; } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); g.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1)); g.setAttribute('aSeed', new THREE.Float32BufferAttribute(aSeed, 1));
  const uni = { uTime: W.uTime, uReveal: W.uReveal, uHue: hue ? { value: hue.clone() } : W.uHue, uSpeed: { value: speed }, uBase: { value: baseA }, uProv: prov ? W.uProvenance : { value: 1 } };
  const m = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aT, aSeed; uniform float uTime, uReveal, uSpeed; varying float vPulse;
      void main(){ float head=fract(uTime*uSpeed+aSeed); float d=abs(fract(aT-head+0.5)-0.5); vPulse=(1.0-smoothstep(0.0,0.12,d))*uReveal;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `precision highp float; uniform vec3 uHue; uniform float uBase, uProv; varying float vPulse;
      void main(){ float a=(uBase+vPulse*0.85)*(0.15+0.85*uProv); gl_FragColor=vec4(mix(uHue*0.5,uHue,vPulse), a*0.5); }`
  });
  const ls = new THREE.LineSegments(g, m); ls.renderOrder = -6; return ls;
}

deepLayer.add(makeDeepTerrain());
// DISTANT NODE CONSTELLATION PURGED — those background point-sprites read as "dots"; removed entirely.
// midLayer.add(makeNodes());
// background travelling traces REMOVED — they read as random long scaffolding strokes; the dark topology terrain carries depth on its own now

// ATMOSPHERE HAZE (depth dust) PURGED — no faint floating points anywhere in the field now; the terrain carries all depth.

// STAR LAYERS — populated pinpoints with independent random pulse (near + deep shell)
const STAR_VERT = (alphaExpr, bigSz, smSz) => `attribute float aRnd, aPhase, aRate; uniform float uTime, uBurst; varying float vA;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    gl_Position = projectionMatrix * mv;
    float pulse = 0.50 + 0.50 * sin(uTime * aRate + aPhase);
    float flicker = 0.82 + 0.18 * sin(uTime * (aRate * 2.35 + 0.55) + aPhase * 4.2);
    float base = (${alphaExpr}) * pulse * flicker;
    // a quiet reserve of dim stars (aRnd<0.34) that only SPARKLE IN when a burst is summoned (Node hover)
    float dormant = step(aRnd, 0.34);
    float spark = 0.5 + 0.5 * sin(uTime * (3.0 + aRnd * 7.0) + aPhase * 9.0);
    vA = base * (1.0 + uBurst * 0.5) + uBurst * dormant * spark * (0.55 + aRnd);
    float sz = aRnd > 0.9 ? ${bigSz} : ${smSz};
    sz *= 1.0 + uBurst * (0.45 + dormant * 0.85);
    gl_PointSize = sz * (260.0 / max(1.0, -mv.z));
  }`;
const STAR_FRAG = 'precision highp float; varying float vA; void main(){ vec2 uv = gl_PointCoord - 0.5; if (dot(uv,uv) > 0.25) discard; gl_FragColor = vec4(vec3(0.82,0.88,0.96), vA); }';
function addStarShell(sn, r0, r1, yMul, yOff, alphaExpr, bigSz, smSz) {
  const sp = new Float32Array(sn * 3), sr = new Float32Array(sn), sph = new Float32Array(sn), srt = new Float32Array(sn);
  for (let i = 0; i < sn; i++) {
    const [x, y, z] = onSphere(r0 + Math.random() * r1), k = i * 3;
    sp[k] = x; sp[k + 1] = Math.abs(y) * yMul + yOff; sp[k + 2] = z;
    sr[i] = Math.random(); sph[i] = Math.random() * TAU; srt[i] = 0.4 + Math.random() * 2.2;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  g.setAttribute('aRnd', new THREE.BufferAttribute(sr, 1));
  g.setAttribute('aPhase', new THREE.BufferAttribute(sph, 1));
  g.setAttribute('aRate', new THREE.BufferAttribute(srt, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: W.uTime, uBurst: W.uBurst }, transparent: true, depthWrite: false, depthTest: false, blending: THREE.NormalBlending,
    vertexShader: STAR_VERT(alphaExpr, bigSz, smSz), fragmentShader: STAR_FRAG
  });
  const pts = new THREE.Points(g, m); pts.renderOrder = -9; scene.add(pts);
}
addStarShell(SOFT ? 320 : (MOBILE ? 760 : 1100), 150, 28, 0.82, 10, MOBILE ? '0.44 + aRnd*0.54' : '0.22 + aRnd*0.44', MOBILE ? '2.4' : '1.9', MOBILE ? '1.45' : '1.15');
addStarShell(SOFT ? 220 : (MOBILE ? 520 : 840), 205, 48, 0.94, 16, MOBILE ? '0.26 + aRnd*0.38' : '0.12 + aRnd*0.26', MOBILE ? '1.75' : '1.45', MOBILE ? '1.3' : '1.05');

// (Evidence trust-boundary membrane removed in the hard reset)

// (All authored-geometry RIGS removed in the hard reset — the topology terrain + centered
//  manifesto typography carry every station now; particles are barely-visible depth only.)

/* ---------- camera + post ---------- */
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 400);
// deliberate framing per form
// calm cinematic glide over the terrain — gentle per-station variation, no dramatic object-framing swings
const AZ = [-0.14, -0.22, 0.22, -0.12, 0.05, -0.18, 0.20, -0.10, 0.16, 0.10];
const EL = [0.16, 0.15, 0.17, 0.19, 0.21, 0.18, 0.23, 0.20, 0.22, 0.18];
const DIST = [25, 25, 26, 25, 24, 26, 25, 24, 27, 25];
const LOOK0 = new THREE.Vector3(0, 0, 0);
const camAz = { v: AZ[0] }, camEl = { v: EL[0] }, camDist = new Spring(DIST[0], 5);
const lookCur = new THREE.Vector3(0, 0, 0);
{ const ce = Math.cos(EL[0]); camera.position.set(Math.sin(AZ[0]) * ce * DIST[0], Math.sin(EL[0]) * DIST[0], Math.cos(AZ[0]) * ce * DIST[0]); }

let composer = null, bloomPass = null, aberr = null;
// adaptive AA governor — composer SSAA pixel ratio eases down on sustained low FPS so weak GPUs don't pay for supersampling
let aaRatio = 1, aaFloor = 1, aaEMA = 14, aaAccum = 0, aaSettled = true;
if (BLOOM) {
  // AA budget: a 1.5x supersample resolves the procedural (in-shader) topology lines; a light 2x MSAA covers
  // the sparse polygon edges (terrain silhouette, sprites). SSAA already supersamples everything, so the old
  // 4x MSAA on top was redundant cost — 2x is visually identical here at roughly half the MSAA bandwidth.
  const _dpr = Math.min(devicePixelRatio || 1, 2);
  const _ss = SOFT ? 1.0 : 1.5;
  const _targetRatio = Math.min(_dpr * _ss, 2);                  // cap: retina is already dense, no SSAA stacked on top
  const _msaaRT = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: SOFT ? 0 : 2 });
  composer = new EffectComposer(renderer, _msaaRT);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.26, 0.5, 0.90);
  try { bloomPass.highPassUniforms['smoothWidth'].value = 0.06; } catch (e) { /* ignore */ }
  composer.addPass(bloomPass);
  aberr = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uAmt: { value: 0 }, uDir: { value: new THREE.Vector2(0, 0) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0);} ',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uAmt; uniform vec2 uDir; varying vec2 vUv;
      void main(){ vec2 c=vUv-0.5; float edge=dot(c,c); vec2 off=(uDir*0.6+c*1.2)*uAmt*(0.4+edge);
        vec2 b=vUv;                                  // tile/block quantization removed -> no stair-stepped edges in transitions
        float r=texture2D(tDiffuse,b+off).r, g=texture2D(tDiffuse,b).g, bl=texture2D(tDiffuse,b-off).b;
        gl_FragColor=vec4(r,g,bl,1.0); }`
  });
  composer.addPass(aberr);
  composer.addPass(new OutputPass());
  // hold full supersample on capable GPUs; the loop eases this down toward native if a device sustains low FPS
  aaRatio = _targetRatio; aaFloor = Math.min(_dpr, _targetRatio);   // never supersample below native
  aaSettled = (aaRatio <= aaFloor + 1e-3);                          // e.g. retina: target == native → nothing to ease, lock now
  composer.setPixelRatio(aaRatio);
  composer.setSize(innerWidth, innerHeight);
}

// vignette
(function () { const v = document.createElement('div'); const vig = MOBILE ? 0.30 : 0.5, mid = MOBILE ? 50 : 54; v.style.cssText = `position:fixed;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at center, rgba(0,0,0,0) ${mid}%, rgba(4,6,10,${vig}) 100%);`; document.body.appendChild(v); })();

/* ============================================================
 * Navigation + morph (wall-clock so it never runs in slow-motion)
 * ============================================================ */
let cur = 0, target = 0, flying = false, morphStart = performance.now() - 9999, frames = 0, navDir = 0;
let starBurstT = 0;   // Node-hover star-burst target (the loop eases W.uBurst toward this)
const MORPH_MS = 850;
let morphMs = MORPH_MS, flightAssemble = 1;   // per-flight: skips reconfigure faster + compress harder through a shared core
const pointer = new THREE.Vector2(0, 0); let ptrHas = false;

function go(i) {
  i = Math.max(0, Math.min(NS - 1, Math.round(i)));
  if (navLocked()) return;
  if (i === target && !flying) return;
  // transition character by jump distance: adjacent = full cinematic morph; skip = faster "system reconfiguration"
  const fromS = flying ? target : cur, jump = Math.abs(i - fromS);
  const fromSeq = seqIndex(fromS), toSeq = seqIndex(i);
  navDir = toSeq > fromSeq ? 1 : toSeq < fromSeq ? -1 : navDir;
  morphMs = jump >= 3 ? 650 : (jump === 2 ? 750 : 850);
  armNavLock(morphMs + (REDUCED ? 120 : 320));
  flightAssemble = (fromS === 0 && i === 1) ? 2.1 : (1.0 + Math.min(Math.max(jump - 1, 0), 8) * 0.16);   // compress through a shared core on skips; lightspeed into Protocol
  // snapshot the CURRENT interpolated positions into the 'from' buffer (seamless continuation).
  // MUST mirror the shader's per-particle stagger + smootherstep exactly.
  const uM = uniforms.uMorph.value;
  for (let p = 0; p < N; p++) { const stg = rndArr[p] * 0.26, mL = clamp((uM - stg) / (1 - stg), 0, 1), me = smoother(mL), k = p * 3; posArr[k] += (toArr[k] - posArr[k]) * me; posArr[k + 1] += (toArr[k + 1] - posArr[k + 1]) * me; posArr[k + 2] += (toArr[k + 2] - posArr[k + 2]) * me; }
  toArr.set(SHAPES[i]); subArr.set(SUB[i]); geo.attributes.position.needsUpdate = true; geo.attributes.aTo.needsUpdate = true; geo.attributes.aSub.needsUpdate = true;
  uniforms.uMorph.value = 0; morphStart = performance.now(); target = i; flying = true; camDist.set(DIST[i]);
  if (i === 9 && !REDUCED) document.body.classList.add('end-hold'); else clearEndHold();
  const tgtCap = capForVantage(i);
  if (tgtCap && tgtCap === activeCapEl) updateFacets(tgtCap, i);   // same combined section → swap facet in place (keep title, no re-scramble)
  else setCaps(-1);                                               // crossing into a different section → clear copy during the flight
}
const SEQ = [0, 1, 5, 6, 7, 9];   // reachable vantages in order — Operations Mesh (6) sits between Logic Engine (5) and Trial Intelligence (7)
function seqIndex(v) { let i = SEQ.indexOf(v); if (i < 0) { i = 0; for (let k = 0; k < SEQ.length; k++) if (SEQ[k] <= v) i = k; } return i; }
function seqStep(dir) { return SEQ[Math.max(0, Math.min(SEQ.length - 1, seqIndex(flying ? target : cur) + dir))]; }
function syncSubsectionPanels(cap, idx) {
  if (!cap) return;
  const panels = [...cap.querySelectorAll('.ps-half, .ti-half')];
  if (MOBILE) panels.forEach((p, i) => { if (i === idx) { if (p._hOn) p._hOn(); } else if (p._hOff) p._hOff(); });
  else {
    panels.forEach((p) => { if (p._hOff) p._hOff(); });
    if (window.DamarosPanels?.syncHover) requestAnimationFrame(() => window.DamarosPanels.syncHover());
  }
  const split = cap.querySelector('.ti-split');
  if (split && panels.length > 1) {
    split.classList.add('has-emph');
    panels.forEach((p, i) => p.classList.toggle('is-emph', i === idx));
  }
}
function landSubsection(cap, backward) {
  if (!cap) return;
  const hs = cap.querySelector('[data-hswipe]');
  if (!hs || hs.children.length < 2) return;
  const idx = backward ? hs.children.length - 1 : 0;
  requestAnimationFrame(() => {
    hs._hswipeCommitted = null;
    hswipeGo(hs, idx);
    if (!MOBILE || hs.scrollWidth <= hs.clientWidth) commitHSwipe(hs, idx);
    syncSubsectionPanels(cap, idx);
    const panel = hs.children[idx];
    if (panel && !MOBILE) panel.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' });
  });
}
function next() { go(seqStep(1)); }
function prev() { go(seqStep(-1)); }
function starBurst(v) { starBurstT = clamp(v, 0, 1.4); }   // Node hover → a few more stars twinkle in

/* ---------- captions + nav UI ---------- */
const caps = [...document.querySelectorAll('[data-cap]')];
const counterEl = document.querySelector('[data-counter]');
const progEl = document.querySelector('[data-deck-progress]');
const dots = [...document.querySelectorAll('[data-dot]')];   // 5-stop diamond nav (click to skip around)

/* ---- station grouping: 10 engine vantages collapse into 5 navigable stops ----
   each combined section spans several vantages; the camera/terrain still fly to the
   exact vantage, but the journey reads as one stop with internal facets. */
const GROUPS = [[0], [1], [5], [6], [7], [9]];
function groupOf(v) { for (let g = 0; g < GROUPS.length; g++) if (GROUPS[g].indexOf(v) >= 0) return g; return 0; }

let activeCapEl = null;
function capForVantage(v) {
  if (v < 0) return null;
  for (let i = 0; i < caps.length; i++) {
    const r = caps[i].dataset.capRange;
    if (r) { const a = +r.split('-')[0], b = +r.split('-')[1]; if (v >= a && v <= b) return caps[i]; }
    else if (+caps[i].dataset.cap === v) return caps[i];
  }
  return null;
}
/* update a combined section's internal state (rail nodes, conduit fill, active facet
   panel, half emphasis, facet counter) WITHOUT re-mounting the cap (no title re-scramble) */
function updateFacets(cap, idx) {
  if (!cap) return;
  const facets = [...cap.querySelectorAll('[data-facet]')];
  facets.forEach((f) => f.classList.toggle('facet--active', +f.dataset.facet === idx));
  cap.querySelectorAll('[data-rail]').forEach((n) => { const v = +n.dataset.rail; n.classList.toggle('is-active', v === idx); n.classList.toggle('is-done', v < idx); });
  const fill = cap.querySelector('[data-rail-fill]'), r = cap.dataset.capRange;
  if (fill && r) { const a = +r.split('-')[0], b = +r.split('-')[1]; fill.style.transform = 'scaleX(' + ((idx - a) / Math.max(1, b - a)).toFixed(3) + ')'; }
  cap.querySelectorAll('[data-half]').forEach((h) => h.classList.toggle('is-emph', +h.dataset.half === idx));
  const leadEl = cap.querySelector('[data-facet-lead]'), leadSrc = cap.querySelector('[data-rail="' + idx + '"]');
  if (leadEl && leadSrc && leadSrc.dataset.lead != null) leadEl.innerHTML = leadSrc.dataset.lead;
  const pos = facets.map((f) => +f.dataset.facet).indexOf(idx), countEl = cap.querySelector('[data-facet-count]');
  if (countEl && pos >= 0) countEl.textContent = ('0' + (pos + 1)).slice(-2) + ' / ' + ('0' + facets.length).slice(-2);
}
function setCaps(idx) {
  const tgt = capForVantage(idx);
  if (activeCapEl && activeCapEl !== tgt) { activeCapEl.querySelectorAll('.cap-line').forEach((l) => l.classList.remove('on')); activeCapEl.classList.remove('cap--active'); activeCapEl = null; }
  if (!tgt) return;
  tgt.classList.add('cap--active');
  activeCapEl = tgt;
  updateFacets(tgt, idx);
  // simple (non-faceted) caps keep the original cap-line reveal behaviour
  if (!tgt.querySelector('[data-facet]')) {
    if (tgt.classList.contains('cap--end') && !REDUCED) tgt.querySelectorAll('.cap-line').forEach((l) => l.classList.remove('on'));
    else tgt.querySelectorAll('.cap-line').forEach((l) => l.classList.add('on'));
  }
  if (!MOBILE && window.DamarosPanels?.syncHover) requestAnimationFrame(() => window.DamarosPanels.syncHover());
}
function revealEndCap() { setCaps(9); }
const END_HOLD_MS = REDUCED ? 250 : 450;
let endHoldTimer = null;
function clearEndHold() { clearTimeout(endHoldTimer); endHoldTimer = null; document.body.classList.remove('end-hold'); }
function arriveAt(idx) {
  if (idx === 9 && !REDUCED) {
    document.body.classList.add('end-hold');
    setCaps(-1);
    clearTimeout(endHoldTimer);
    endHoldTimer = setTimeout(() => {
      document.body.classList.remove('end-hold');
      revealEndCap();
      endHoldTimer = null;
    }, END_HOLD_MS);
    return;
  }
  clearEndHold();
  setCaps(idx);
  landSubsection(capForVantage(idx), navDir < 0);
}
function sectionRevealLocked() {
  const intro = window.DamarosCapIntro;
  return intro && intro.revealUntil != null && performance.now() < intro.revealUntil;
}
function syncNavLockClass() { document.body.classList.toggle('deck-nav-locked', navLocked()); }
let _idleKey = '', _idleSince = 0;
const SWIPE_IDLE_MS = 10000;
function idlePageKey() {
  if (flying || navLocked() || document.body.classList.contains('intro-hold')) return '';
  const hs = MOBILE ? activeHSwipeEl() : null;
  const sub = hs && hs._hswipeCommitted != null ? hs._hswipeCommitted : 0;
  return cur + ':' + sub;
}
function syncFooterChrome() {
  document.body.classList.toggle('deck-on-home', !flying && cur === 0);
  const hideNavCta = !MOBILE && (document.body.classList.contains('end-hold') || cur === 9 || (flying && target === 9));
  document.body.classList.toggle('cta-nav-hidden', hideNavCta);
  if (!MOBILE) {
    document.body.classList.remove('deck-swipe-on', 'deck-swipe--pulse', 'deck-swipe-mode-up', 'deck-swipe-mode-both', 'deck-swipe-mode-down');
    return;
  }
  const showSwipe = !flying && !document.body.classList.contains('intro-hold');
  document.body.classList.toggle('deck-swipe-on', showSwipe);
  document.body.classList.remove('deck-swipe-mode-up', 'deck-swipe-mode-both', 'deck-swipe-mode-down');
  if (showSwipe) {
    if (cur === 0) document.body.classList.add('deck-swipe-mode-up');
    else if (cur === 9) document.body.classList.add('deck-swipe-mode-down');
    else document.body.classList.add('deck-swipe-mode-both');
  }
  const key = showSwipe ? idlePageKey() : '';
  if (!key) { _idleKey = ''; document.body.classList.remove('deck-swipe--pulse'); return; }
  if (key !== _idleKey) { _idleKey = key; _idleSince = performance.now(); document.body.classList.remove('deck-swipe--pulse'); }
  else if (performance.now() - _idleSince >= SWIPE_IDLE_MS) document.body.classList.add('deck-swipe--pulse');
}
function syncUI() { const shown = flying ? target : cur; const g = groupOf(shown); if (document.body.dataset.station !== String(shown)) document.body.dataset.station = String(shown); if (counterEl) counterEl.textContent = ('0' + (g + 1)).slice(-2) + ' / ' + ('0' + GROUPS.length).slice(-2); if (progEl) progEl.style.transform = `scaleX(${(g / (GROUPS.length - 1)).toFixed(4)})`; for (let i = 0; i < dots.length; i++) dots[i].classList.toggle('active', i === g); const bp = document.querySelector('[data-prev]'), bn = document.querySelector('[data-next]'); if (bp) bp.disabled = navLocked() || (shown <= 0 && !flying); if (bn) bn.disabled = navLocked() || (shown >= NS - 1 && !flying); syncNavLockClass(); syncFooterChrome(); }

/* ---------- micro-interactions ---------- */
// arrow hover → directional current
let arrowHover = 0;
const bpEl = document.querySelector('[data-prev]'), bnEl = document.querySelector('[data-next]');
if (!MOBILE) { bnEl && bnEl.addEventListener('pointerenter', () => { arrowHover = 1; }); bpEl && bpEl.addEventListener('pointerenter', () => { arrowHover = -1; }); [bpEl, bnEl].forEach((b) => b && b.addEventListener('pointerleave', () => { arrowHover = 0; })); }
// CTA hover → one-shot tighten+brighten (cooldown prevents pulsing)
let focusTween = null, focusCool = 0;
function triggerFocus() { const now = performance.now(); if (REDUCED || now < focusCool) return; focusCool = now + 1400; const t0 = now, RISE = 260, HOLD = 220, FALL = 520; focusTween = (ms) => { const e = ms - t0; let v; if (e < RISE) v = ss(e / RISE); else if (e < RISE + HOLD) v = 1; else if (e < RISE + HOLD + FALL) v = 1 - ss((e - RISE - HOLD) / FALL); else { v = 0; focusTween = null; } uniforms.uFocus.value = v; }; }
if (!MOBILE) document.querySelectorAll('.j-cta, .j-btn').forEach((c) => c.addEventListener('pointerenter', triggerFocus));

/* ============================================================
 * Loop
 * ============================================================ */
let t0 = performance.now(), last = t0, firstFrame = false, running = true, warmed = false;
const _v = new THREE.Vector3(), accentCur = ACCENT[0].clone(), baseFog = new THREE.Color('#0e151f'), tmpFog = new THREE.Color();
const _camPar = new THREE.Vector2(0, 0), _wPar = new THREE.Vector2(0, 0);
let _wReveal = 0, stateMixCur = 0, cursorMode = 0, cursorBlend = 0, _trailAcc = 0;
let hoverTarget = 0, hoverBoost = 0, finalGlow = 0;   // sub-block hover drives brighten + a gentle ripple (hue locked to steel)

function frame() {
  if (!running) return;
  const now = performance.now(), dt = Math.min((now - last) / 1000, 0.05); last = now; const t = (now - t0) / 1000; frames++;
  uniforms.uTime.value = t; W.uTime.value = t;
  W.uBurst.value = damp(W.uBurst.value, starBurstT, 4, dt);   // ease the star-twinkle burst in / out

  // morph (wall-clock) + settle taper
  const mp = REDUCED ? 1 : clamp((now - morphStart) / morphMs, 0, 1); uniforms.uMorph.value = mp;
  const settle = ss(mp); uniforms.uFlow.value = (REDUCED ? 0.4 : 0.9) * (0.6 + 0.4 * settle);
  if (flying && mp >= 1) { posArr.set(SHAPES[target]); geo.attributes.position.needsUpdate = true; flying = false; cur = target; uniforms.uKind.value = target; arriveAt(cur); }
  const shown = flying ? target : cur;

  // ---- camera: damped spherical pose (no chord-swim, no wrap-spin) + cursor shear ----
  if (REDUCED) { camAz.v = AZ[target]; camEl.v = EL[target]; camDist.snap(DIST[target]); lookCur.copy(LOOK0); }
  else { camAz.v = dampAngle(camAz.v, AZ[target], 2.0, dt); camEl.v = damp(camEl.v, EL[target], 2.0, dt); camDist.set(DIST[target]); camDist.step(dt); dampV(lookCur, LOOK0, 2.4, dt); }
  const el = camEl.v, az = camAz.v, dist = camDist.x, ce = Math.cos(el);
  camera.position.set(Math.sin(az) * ce * dist, Math.sin(el) * dist, Math.cos(az) * ce * dist);
  const fovRest = MOBILE ? 56.5 : 52.0, fovFly = MOBILE ? 58.5 : 53.5;
  camera.fov = damp(camera.fov, flying ? fovFly : fovRest, 3.0, dt); camera.updateProjectionMatrix();
  _camPar.x = damp(_camPar.x, ptrHas && !REDUCED ? pointer.x : 0, 3.5, dt); _camPar.y = damp(_camPar.y, ptrHas && !REDUCED ? pointer.y : 0, 3.5, dt);
  if (!REDUCED) {
    camera.position.x += Math.sin(t * 0.12) * 0.8; camera.position.y += Math.sin(t * 0.16) * 0.5;
    const yaw = _camPar.x * 0.040, pitch = -_camPar.y * 0.026, off = _v.copy(camera.position).sub(lookCur), cy = Math.cos(yaw), sy = Math.sin(yaw), nx = off.x * cy - off.z * sy, nz = off.x * sy + off.z * cy;
    off.x = nx; off.z = nz; off.y += pitch * off.length(); camera.position.copy(lookCur).add(off);
  }
  camera.lookAt(lookCur); camera.updateMatrixWorld();

  // ---- world layers: terrain morphs only during main-deck flights (5 stops, not per-vantage) ----
  const deckFrom = groupOf(cur), deckTo = groupOf(target);
  if (flying) W.uSection.value = deckFrom + (deckTo - deckFrom) * smoother(mp);
  else W.uSection.value = groupOf(cur);
  _wReveal += ((firstFrame ? 1 : 0) - _wReveal) * (1 - Math.exp(-dt * 0.8)); W.uReveal.value = REDUCED ? 1 : _wReveal;
  const si = clamp(Math.round(W.uSection.value), 0, TERRAIN_PROV.length - 1);
  W.uHue.value.copy(COL.steel); W.uProvenance.value += (TERRAIN_PROV[si] - W.uProvenance.value) * (1 - Math.exp(-dt * 1.4));
  // sub-block hover: eased intensity (fast in, slow out) — brighten/ripple only, hue stays stone blue
  hoverBoost = damp(hoverBoost, hoverTarget, hoverTarget > hoverBoost ? 9 : 3.2, dt); W.uHover.value = hoverBoost;
  if (hoverBoost > 0.001) W.uReveal.value = Math.min(1, W.uReveal.value + hoverBoost * 0.5);
  finalGlow = damp(finalGlow, 0, 2.2, dt); W.uFinal.value = finalGlow;
  W.uSoft.value = REDUCED ? 0 : (1 - settle) * 0.045;   // feather the topology lines only while a transition is in motion (0 at rest -> static look unchanged)
  _wPar.x = damp(_wPar.x, ptrHas && !REDUCED ? pointer.x : 0, 3.5, dt); _wPar.y = damp(_wPar.y, ptrHas && !REDUCED ? pointer.y : 0, 3.5, dt);
  deepLayer.position.x = -_wPar.x * 4.0; deepLayer.position.y = -_wPar.y * 1.6; midLayer.position.x = -_wPar.x * 8.5; midLayer.position.y = -_wPar.y * 5.0;   // trimmed deep-layer vertical parallax so it can't lift the terrain off the bottom

  // ---- accent (slower than the camera = deliberate) + state mix + atmosphere agreement ----
  accentCur.lerp(ACCENT[shown], 1 - Math.exp(-dt * 1.8)); uniforms.uAccent.value.copy(accentCur);
  stateMixCur = damp(stateMixCur, STATEMIX[shown], 2.0, dt); uniforms.uStateMix.value = stateMixCur;
  uniforms.uCloudDim.value = damp(uniforms.uCloudDim.value, CLOUD_DIM[shown], 2.5, dt);
  tmpFog.copy(baseFog).lerp(accentCur, 0.10); uniforms.uFogCol.value.copy(tmpFog);
  if (bloomPass) bloomPass.strength = damp(bloomPass.strength, KINDS[shown] === 'luna' ? 0.15 : 0.14, 1.5, dt);

  // ---- cursor field + PER-SECTION physics (the verb is selected per section, blended pop-free) ----
  const havePtr = ptrHas && !REDUCED;
  uniforms.uCursorAmt.value = damp(uniforms.uCursorAmt.value, havePtr ? 0.9 : 0, 5, dt);
  if (havePtr) { _v.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize(); const tt = Math.abs(_v.z) > 1e-3 ? -camera.position.z / _v.z : 30; uniforms.uCursor.value.copy(camera.position).addScaledVector(_v, clamp(tt, 5, 60)); }
  else uniforms.uCursor.value.set(999, 999, 999);
  // mode + cross-section blend: fade the old verb out, switch at the bottom, fade the new verb in
  if (cursorMode !== shown) { cursorBlend = damp(cursorBlend, 0, 9, dt); if (cursorBlend < 0.04) cursorMode = shown; }
  else cursorBlend = damp(cursorBlend, havePtr ? 1 : 0, 3.5, dt);
  const cwRow = CURSOR_W[cursorMode], cwGate = (havePtr ? 1 : 0) * cursorBlend;
  for (let w = 0; w < CW_KEYS.length; w++) { const u = uniforms[CW_KEYS[w]]; u.value = damp(u.value, cwRow[w] * cwGate, 4, dt); }
  const cuw = uniforms.uCursor.value;
  uniforms.uProbe.value.set(clamp(cuw.x / 8, -1, 1), clamp(cuw.y / 8, -1, 1));
  // (per-section cursor drivers retired in the hard reset — the cursor only does a gentle ambient touch now)
  uniforms.uAssemble.value = REDUCED ? 0 : flightAssemble;
  // autonomous cycle gates in as the form settles, out during a flight — damped both ways so there is no morph-boundary pop
  uniforms.uLive.value = damp(uniforms.uLive.value, flying ? 0 : 1, 2.6, dt);
  // parallax + nav-arrow current (kept; global refraction lens removed)
  uniforms.uParallax.value.x = damp(uniforms.uParallax.value.x, havePtr ? pointer.x : 0, 4, dt);
  uniforms.uParallax.value.y = damp(uniforms.uParallax.value.y, havePtr ? pointer.y : 0, 4, dt);
  const dirX = arrowHover === 0 ? uniforms.uArrowDir.value.x : (arrowHover > 0 ? -1 : 1);
  uniforms.uArrowDir.value.x = damp(uniforms.uArrowDir.value.x, dirX, 8, dt);
  uniforms.uArrowAmt.value = damp(uniforms.uArrowAmt.value, arrowHover && !REDUCED ? 0.5 : 0, 7, dt);
  if (focusTween) focusTween(now);

  // (evidence membrane + authored geometry rigs removed in the hard reset — nothing to drive here)

  // ---- aberration (whisper, cursor-driven) ----
  if (aberr) { aberr.uniforms.uDir.value.x = damp(aberr.uniforms.uDir.value.x, ptrHas ? pointer.x : 0, 4, dt); aberr.uniforms.uDir.value.y = damp(aberr.uniforms.uDir.value.y, ptrHas ? pointer.y : 0, 4, dt); aberr.uniforms.uAmt.value = 0.0008 + (1 - mp) * 0.0010; }   // gentle RGB whisper only; block-tile glitch removed

  // ---- adaptive AA governor: if the GPU sustains < ~45fps, ease the supersample down a step (one-way, floored at native) ----
  if (composer && !aaSettled && !flying && frames > 90) {
    aaEMA += (dt * 1000 - aaEMA) * 0.1;
    if (++aaAccum >= 30) {
      aaAccum = 0;
      if (aaEMA > 22 && aaRatio > aaFloor + 1e-3) { aaRatio = Math.max(aaFloor, aaRatio * 0.85); composer.setPixelRatio(aaRatio); if (aaRatio <= aaFloor + 1e-3) aaSettled = true; }
      else aaSettled = true;   // comfortably fast → lock in full quality and stop checking
    }
  }

  if (composer) composer.render(); else renderer.render(scene, camera);
  syncUI(); firstFrame = true;
  if (frames === 2) document.body.classList.add('world-ready');   // fade the canvas in once a couple of clean frames have painted
  requestAnimationFrame(frame);
}

/* ============================================================
 * Wiring
 * ============================================================ */
addEventListener('resize', () => { syncViewport(); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); if (composer) composer.setSize(innerWidth, innerHeight); if (bloomPass) bloomPass.setSize(innerWidth, innerHeight); });
document.addEventListener('visibilitychange', () => { if (!document.hidden && running) { last = performance.now(); requestAnimationFrame(frame); } });
if (!MOBILE) { addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') { ptrHas = false; return; } pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ptrHas = true; }, { passive: true }); addEventListener('blur', () => { ptrHas = false; }); }
addEventListener('keydown', (e) => {
  if (navLocked()) return;
  const k = e.key;
  if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'd'].includes(k)) { next(); e.preventDefault(); }
  else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'a'].includes(k)) { prev(); e.preventDefault(); }
  else if (k === 'Home') go(0);
  else if (k === 'End') go(NS - 1);
});
/* ---------- pane-locked navigation: one stop at a time, resistance, subsection carousels first ---------- */
const NAV = { lockUntil: 0, acc: 0, accDir: 0, THRESH: MOBILE ? 145 : 125, LOCK_MS: MOBILE ? 1050 : 920, H_LOCK_MS: MOBILE ? 680 : 560 };
function navLocked() {
  return flying
    || document.body.classList.contains('intro-hold')
    || document.body.classList.contains('end-hold')
    || sectionRevealLocked()
    || performance.now() < NAV.lockUntil;
}
function armNavLock(ms) { NAV.lockUntil = performance.now() + (ms == null ? NAV.LOCK_MS : ms); NAV.acc = 0; NAV.accDir = 0; }
function activeHSwipeEl() {
  const cap = capForVantage(flying ? target : cur);
  if (!cap) return null;
  const el = cap.querySelector('[data-hswipe]');
  return el && el.children.length > 1 ? el : null;
}
function hswipeNearest(el) {
  const panels = el.children;
  let idx = 0, best = Infinity;
  const sl = el.scrollLeft;
  for (let i = 0; i < panels.length; i++) {
    const d = Math.abs(panels[i].offsetLeft - sl);
    if (d < best) { best = d; idx = i; }
  }
  return idx;
}
function hswipeIdx(el) { return el._hswipeCommitted != null ? el._hswipeCommitted : hswipeNearest(el); }
function commitHSwipe(el, idx) {
  if (el._hswipeCommitted === idx) return;
  el._hswipeCommitted = idx;
  const nav = el.nextElementSibling;
  if (nav && nav.classList.contains('hswipe-nav')) {
    [].forEach.call(nav.children, (b, i) => b.classList.toggle('on', i === idx));
  }
  const panel = el.children[idx];
  if (panel) {
    if (MOBILE) {
      panel._hOn && panel._hOn();
      [].forEach.call(el.children, (p, i) => { if (i !== idx && p._hOff) p._hOff(); });
    } else [].forEach.call(el.children, (p) => { if (p._hOff) p._hOff(); });
  }
}
function settleHSwipe(el) {
  if (!el || el.children.length < 2) return;
  const idx = hswipeNearest(el);
  const panel = el.children[idx];
  if (!panel) return;
  const target = panel.offsetLeft;
  const drift = Math.abs(el.scrollLeft - target);
  if (drift > 3) {
    const instant = REDUCED || drift <= 48;
    el.scrollTo({ left: target, behavior: instant ? 'auto' : 'smooth' });
    if (instant) commitHSwipe(el, idx);
    return;
  }
  commitHSwipe(el, idx);
}
function hswipeGo(el, idx) {
  const panel = el.children[idx];
  if (!panel) return;
  el.scrollTo({ left: panel.offsetLeft, behavior: REDUCED ? 'auto' : 'smooth' });
  if (REDUCED) commitHSwipe(el, idx);
}
function navStep(dir) {
  if (navLocked()) return false;
  if (MOBILE) {
    const hs = activeHSwipeEl();
    if (hs) {
      const idx = hswipeIdx(hs), last = hs.children.length - 1;
      if (dir > 0 && idx < last) { hswipeGo(hs, idx + 1); armNavLock(NAV.H_LOCK_MS); return true; }
      if (dir < 0 && idx > 0) { hswipeGo(hs, idx - 1); armNavLock(NAV.H_LOCK_MS); return true; }
    }
  }
  if (dir > 0) next(); else prev();
  armNavLock();
  return true;
}
function feedNav(delta, dir) {
  if (!delta) return;
  if (navLocked()) { NAV.acc *= 0.9; return; }
  if (dir && dir !== NAV.accDir) { NAV.acc = 0; NAV.accDir = dir; }
  NAV.acc += delta;
  if (Math.abs(NAV.acc) >= NAV.THRESH) navStep(NAV.acc > 0 ? 1 : -1);
}
function wireHSwipes() {
  [].forEach.call(document.querySelectorAll('[data-hswipe]'), (split) => {
    if (split._hswipeWired || split.children.length < 2) return;
    split._hswipeWired = true;
    if (split._hswipeCommitted == null) split._hswipeCommitted = 0;
    commitHSwipe(split, split._hswipeCommitted);
    const settle = () => settleHSwipe(split);
    split.addEventListener('scrollend', settle, { passive: true });
    split.addEventListener('scroll', () => { clearTimeout(split._settleT); split._settleT = setTimeout(settle, 140); }, { passive: true });
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireHSwipes);
else wireHSwipes();
addEventListener('wheel', (e) => {
  if (navLocked()) return;
  if (e.target && e.target.closest && e.target.closest('[data-hswipe]') && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.8) return;
  const dy = e.deltaY;
  if (!dy) return;
  feedNav(dy, dy > 0 ? 1 : -1);
}, { passive: true });
let tStart = null, tAcc = 0, tDir = 0, tOnHSwipe = false;
addEventListener('touchstart', (e) => {
  if (!e.touches[0] || navLocked()) return;
  tStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  tAcc = 0; tDir = 0;
  tOnHSwipe = !!(e.target && e.target.closest && e.target.closest('[data-hswipe]'));
}, { passive: true });
addEventListener('touchmove', (e) => {
  if (!tStart || !e.touches[0] || tOnHSwipe) return;
  const dy = tStart.y - e.touches[0].clientY, dx = e.touches[0].clientX - tStart.x;
  if (Math.abs(dx) > Math.abs(dy) * 1.25) return;
  if (Math.abs(dy) < 6) return;
  const dir = dy > 0 ? 1 : -1;
  if (dir !== tDir) { tAcc = 0; tDir = dir; }
  tAcc = dy;
}, { passive: true });
addEventListener('touchend', (e) => {
  if (!tStart || !e.changedTouches[0]) return;
  const dx = e.changedTouches[0].clientX - tStart.x, dy = tStart.y - e.changedTouches[0].clientY;
  const onHSwipe = tOnHSwipe;
  tStart = null; tOnHSwipe = false;
  if (onHSwipe) return;
  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) return;
  const pull = Math.abs(tAcc) >= (MOBILE ? 62 : 58) ? tAcc : dy;
  if (Math.abs(pull) >= (MOBILE ? 62 : 58)) navStep(pull > 0 ? 1 : -1);
  tAcc = 0; tDir = 0;
}, { passive: true });
document.querySelector('[data-prev]')?.addEventListener('click', prev);
document.querySelector('[data-next]')?.addEventListener('click', next);
dots.forEach((d) => d.addEventListener('click', () => go(+d.dataset.go)));   // 5-stop diamond nav → jump to a stop's first vantage
/* ---------- typography micro-interactions → subtle topology response ----------
   Key words / state chips / the Trident phrase nudge the topology hue + brightness
   while hovered, then settle back. Background-level only; disabled for reduced-motion. */
if (!MOBILE && !REDUCED) {
  document.querySelectorAll('[data-topo]').forEach((el) => {
    el.addEventListener('pointerenter', () => { hoverTarget = 1; });
    el.addEventListener('pointerleave', () => { hoverTarget = 0; });
  });
}

/* ---------- brand motif: glows when the cursor is near it (desktop) or holds steady on hero/closer (mobile) ---------- */
{
  const motif = document.querySelector('.brand-motif img');
  if (motif) {
    const setGlow = (v) => motif.style.setProperty('--glow', v.toFixed(3));
    if (MOBILE && !REDUCED) {
      const syncMotif = () => {
        const st = document.body.dataset.station;
        setGlow(st === '9' || st === '0' ? 0.48 : 0);
      };
      syncMotif();
      new MutationObserver(syncMotif).observe(document.body, { attributes: true, attributeFilter: ['data-station'] });
    } else if (!REDUCED) {
      addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const st = document.body.dataset.station;
        if (st !== '0' && st !== '9') { setGlow(0); return; }
        const logoH = Math.min(innerHeight * 0.70, innerWidth * 0.58);
        const reach = logoH * 0.50, fade = logoH * 0.62;
        const d = Math.hypot(e.clientX - innerWidth * 0.5, e.clientY - innerHeight * 0.5);
        const raw = clamp(1 - (d - reach) / fade, 0, 1);
        setGlow(0.22 + raw * 0.78);   /* floor keeps motif readable between hover passes */
      }, { passive: true });
      addEventListener('blur', () => setGlow(0.22));
    }
  }
}

// home wayfinding hint: touch devices swipe, pointer devices scroll (set from what the device reports)
{ const hint = document.querySelector('[data-hint]'); if (hint) hint.textContent = matchMedia('(hover: none),(pointer: coarse)').matches ? 'Swipe to travel' : 'Scroll to travel'; }

syncUI();
syncNavLockClass();
setCaps(-1);   // drum logo + topology only for the opening beat — hero copy lands after INTRO_MS
// warm the GPU before the first visible frame: precompile scene shaders so weaker devices don't stall on the reveal
try { renderer.compile(scene, camera); } catch (e) { /* older three builds */ }
warmed = true;
requestAnimationFrame(frame);
setTimeout(function () { document.body.classList.add('world-ready'); }, 400);   // safety net: reveal the canvas even if rAF is throttled at load
const INTRO_MS = REDUCED ? 250 : 450;
setTimeout(() => {
  document.body.classList.remove('intro-hold');
  document.documentElement.classList.remove('intro-hold');
  setCaps(0);
}, INTRO_MS);
window.DamarosSpace = { go, next, prev, starBurst, state: () => ({ cur, target, flying, frames }) };
