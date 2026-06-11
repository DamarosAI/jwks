/* ============================================================
 * DAMAROS — doc-world.js
 * The home journey's WebGL world (skydome + curved datum terrain
 * + twin star shells) as a CALM AMBIENT BACKDROP for the document
 * pages, pinned to the HOME vantage (section 0).
 *
 * RENDER PIPELINE IS A 1:1 CLONE OF shared/space.js so color and
 * brightness match the home page exactly on every device class:
 *   · desktop: EffectComposer (MSAA + SSAA) → UnrealBloom → OutputPass
 *     with ACES tone mapping at the home exposure
 *   · mobile / software GL: direct render, antialiased, with the same
 *     authored mobile brightness lifts space.js ships
 *   · same skydome, terrain constants, star shells, and vignette
 * Differences from home are BEHAVIORAL only:
 *   · no station navigation, no scroll/wheel hijack
 *   · terrain reveals once on load, then only breathes
 *   · pointer parallax leans the camera a few degrees
 *   · reduced-motion renders a still frame
 *   · paused when the tab is hidden
 * ============================================================ */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const MOBILE = matchMedia('(hover: none),(pointer: coarse)').matches || innerWidth <= 820;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = THREE.MathUtils.clamp;
const TAU = Math.PI * 2;

const css = getComputedStyle(document.documentElement);
const hx = (n, f) => { const v = css.getPropertyValue(n).trim(); return v ? new THREE.Color(v) : new THREE.Color(f); };
const COL = { steel: hx('--steel', '#a9c0d6') };

const canvas = document.getElementById('world');
if (canvas) { try { boot(); } catch (e) { canvas.remove(); } }

function boot() {
  /* ---------- renderer — identical config to space.js ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: MOBILE, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOBILE ? 1.25 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  let SOFT = false;
  try { const gl = renderer.getContext(); const dbg = gl.getExtension('WEBGL_debug_renderer_info'); const r = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''; SOFT = /swiftshader|llvmpipe|software|basic render|microsoft/i.test(r); } catch (e) { SOFT = false; }
  const BLOOM = !MOBILE && !SOFT;
  renderer.toneMappingExposure = SOFT ? 0.84 : (MOBILE ? 0.80 : 0.62);   // home exposure: mobile brighter (no bloom pass)
  try { renderer.outputColorSpace = THREE.SRGBColorSpace; } catch (e) { /* older builds */ }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(MOBILE ? '#101a28' : '#0a121b');   // match the horizon (same as home)

  /* ---------- shared uniforms (the doc vantage is HOME: section 0) ---------- */
  function viewportFillBoost() {
    const ar = innerWidth / innerHeight;
    let fill = MOBILE ? 0.72 : 0.1;
    if (ar < 0.78) fill = Math.max(fill, clamp((0.84 - ar) / 0.42, 0, 1));
    return fill;
  }
  const W = {
    uTime: { value: 0 },
    uReveal: { value: REDUCED ? 1 : 0 },
    uSection: { value: 0 },                         // pinned: home look
    uHue: { value: COL.steel.clone() },
    uHover: { value: 0 },
    uFinal: { value: 0 },
    uSoft: { value: 0 },                            // home at rest: no extra line feathering
    uBurst: { value: 0 },
    uViewport: { value: new THREE.Vector2(innerWidth / innerHeight, viewportFillBoost()) }
  };

  const deepLayer = new THREE.Group(); deepLayer.position.z = -120;
  const midLayer = new THREE.Group(); midLayer.position.z = -55;
  scene.add(deepLayer, midLayer);

  /* ---------- gradient skydome (verbatim from space.js) ---------- */
  {
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
      uniforms: { uTop: { value: new THREE.Color(MOBILE ? '#080d16' : '#03050a') }, uMid: { value: new THREE.Color(MOBILE ? '#121e30' : '#0a1320') }, uHoriz: { value: new THREE.Color(MOBILE ? '#243a54' : '#16263a') } },
      vertexShader: 'varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
      fragmentShader: 'precision highp float; varying vec3 vP; uniform vec3 uTop,uMid,uHoriz; void main(){ float h=clamp(vP.y/180.0*0.5+0.5,0.0,1.0); vec3 lower=mix(uHoriz,uMid,smoothstep(0.0,0.5,h)); vec3 col=mix(lower,uTop,smoothstep(0.46,1.0,h)); col*=1.0-0.06*smoothstep(0.6,1.0,h); gl_FragColor=vec4(col,1.0);} '
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(190, 32, 20), m); sky.renderOrder = -10; scene.add(sky);
  }

  /* ---------- simplex noise (verbatim) ---------- */
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
  }`;

  /* ---------- DEEP: curved topology terrain (home vantage of space.js terrain) ---------- */
  {
    const SEG_X = SOFT ? 70 : (MOBILE ? 88 : 176), SEG_Y = SOFT ? 74 : (MOBILE ? 100 : 184);
    const PLANE_D = MOBILE ? 520 : 440;
    const g = new THREE.PlaneGeometry(420, PLANE_D, SEG_X, SEG_Y); g.rotateX(-Math.PI * 0.5);
    const vert = SNOISE + `
      uniform float uTime, uHover; uniform vec2 uViewport;
      varying vec3 vWorld; varying float vFog, vH, vFill;
      void main(){
        vec3 p = position;
        float bowl = (p.x*p.x)*0.0009 + (p.z*p.z)*0.00035;
        float s1 = snoise(vec3(p.x*0.010, p.z*0.010, uTime*0.015));
        float s2 = snoise(vec3(p.x*0.026+4.0, p.z*0.022-2.0, uTime*0.022));
        float h = bowl + s1*7.0 + s2*3.0;
        // card hover — the topology breathes upward and ripples (the deck's leaned-in verb)
        if (uHover > 0.001){ float radh = length(p.xz); h += (sin(radh*0.09 - uTime*1.4)*0.75 + exp(-radh*radh*0.00028)*1.05) * uHover; }
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
      precision highp float; uniform float uTime, uReveal, uSoft; uniform vec3 uHue;
      varying vec3 vWorld; varying float vFog, vH, vFill;
      float hash21(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
      float grain(vec2 uv){ float g=0.0,amp=0.5; vec2 q=uv; for(int i=0;i<${GO};i++){ g+=(hash21(floor(q))-0.5)*amp; q*=2.03; amp*=0.5; } return g; }
      float gridLine(float c, float w){ float d=abs(fract(c)-0.5); float aa=fwidth(c)+1e-4; float hw=max(w, aa*0.5); float soft=aa*4.5+0.022+uSoft; return 1.0-smoothstep(hw*0.5, hw+soft, d); }
      void main(){
        vec2 gw = vWorld.xz;
        float gx = gridLine(gw.x*0.05, 0.0096), gz = gridLine(gw.y*0.05, 0.0096);
        float grid = max(gx,gz)*${gGrid};
        float contour = gridLine(vH*0.18, 0.04)*${gCont};
        float gr = grain(gl_FragCoord.xy*0.5 + floor(uTime*7.0)) * 0.035;
        float lines = grid + contour;
        vec3 base = mix(vec3(0.012,0.018,0.030), vec3(0.02,0.035,0.06), clamp(-vH*0.04,0.0,1.0));
        vec3 col = base + uHue*lines*(${gLineL}+${gLineH}*uReveal) + gr;
        float fogK = vFog * mix(${gFog}, ${MOBILE ? '0.68' : '0.86'}, vFill * 0.9);
        col *= (1.0 - fogK);
        float a = (${gAlphaB} + lines*${gAlphaL})*(1.0 - fogK)*(${gRevA}+${gRevB}*uReveal);
        col *= ${MOBILE ? '1.16' : '1.0'};
        a   *= ${MOBILE ? '1.12' : '1.0'};
        gl_FragColor = vec4(col, a);
      }`;
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: W.uTime, uReveal: W.uReveal, uHue: W.uHue, uHover: W.uHover, uSoft: W.uSoft, uViewport: W.uViewport },
      vertexShader: vert, fragmentShader: frag,
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = -8; deepLayer.add(mesh);
  }

  /* ---------- STAR LAYERS — the home page's twin pulsing star shells (verbatim) ---------- */
  function onSphere(r) { const u = Math.random() * 2 - 1, a = Math.random() * TAU, s = Math.sqrt(1 - u * u); return [Math.cos(a) * s * r, u * r, Math.sin(a) * s * r]; }
  const STAR_VERT = (alphaExpr, bigSz, smSz) => `attribute float aRnd, aPhase, aRate; uniform float uTime, uBurst; varying float vA;
    void main(){
      vec4 mv = modelViewMatrix * vec4(position,1.0);
      gl_Position = projectionMatrix * mv;
      float pulse = 0.50 + 0.50 * sin(uTime * aRate + aPhase);
      float flicker = 0.82 + 0.18 * sin(uTime * (aRate * 2.35 + 0.55) + aPhase * 4.2);
      float base = (${alphaExpr}) * pulse * flicker;
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

  /* ---------- camera: the home framing, breathing, pointer-leaned ---------- */
  const camera = new THREE.PerspectiveCamera(MOBILE ? 56.5 : 52, innerWidth / innerHeight, 0.1, 400);
  const AZ = -0.14, EL = 0.16, DIST = 25;
  const look = new THREE.Vector3(0, 0, 0);
  const basePos = new THREE.Vector3();
  { const ce = Math.cos(EL); basePos.set(Math.sin(AZ) * ce * DIST, Math.sin(EL) * DIST, Math.cos(AZ) * ce * DIST); }
  camera.position.copy(basePos); camera.lookAt(look);

  /* ---------- post: the home composer (bloom at the rest strength) ---------- */
  let composer = null;
  if (BLOOM) {
    const _dpr = Math.min(devicePixelRatio || 1, 2);
    const _targetRatio = Math.min(_dpr * 1.5, 2);
    const _msaaRT = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: 2 });
    composer = new EffectComposer(renderer, _msaaRT);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.14, 0.5, 0.90);   // home's at-rest bloom strength
    try { bloomPass.highPassUniforms['smoothWidth'].value = 0.06; } catch (e) { /* ignore */ }
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    composer.setPixelRatio(_targetRatio);
    composer.setSize(innerWidth, innerHeight);
  }

  /* ---------- vignette (verbatim from space.js) ---------- */
  { const v = document.createElement('div'); const vig = MOBILE ? 0.30 : 0.5, mid = MOBILE ? 50 : 54; v.style.cssText = `position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse at center, rgba(0,0,0,0) ${mid}%, rgba(4,6,10,${vig}) 100%);`; document.body.appendChild(v); }

  /* ---------- pointer + hover state ---------- */
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const hover = { v: 0, t: 0 };
  window.DocWorld = { hover(x) { hover.t = clamp(x, 0, 1); } };
  if (!REDUCED && !MOBILE) {
    addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      ptr.tx = (e.clientX / innerWidth) * 2 - 1;
      ptr.ty = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
    addEventListener('pointerleave', () => { ptr.tx = 0; ptr.ty = 0; });
  }

  /* ---------- loop (home damp rates) ---------- */
  const _v = new THREE.Vector3();
  let raf = 0, last = performance.now(), shown = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (!REDUCED) {
      W.uTime.value += dt;
      W.uReveal.value += (1 - W.uReveal.value) * (1 - Math.exp(-dt * 0.8));   // home reveal ease
      const lam = hover.t > hover.v ? 9 : 3.2;                                // home hover damp: fast in, slow out
      hover.v = hover.t + (hover.v - hover.t) * Math.exp(-lam * dt);
      W.uHover.value = hover.v;
      const t = W.uTime.value;
      camera.position.copy(basePos);
      camera.position.x += Math.sin(t * 0.12) * 0.8;
      camera.position.y += Math.sin(t * 0.16) * 0.5;
      // pointer parallax — same grammar as the deck: yaw/pitch the offset, aim stays glued
      const e = Math.exp(-3.5 * dt);
      ptr.x = ptr.tx + (ptr.x - ptr.tx) * e; ptr.y = ptr.ty + (ptr.y - ptr.ty) * e;
      const yaw = ptr.x * 0.040, pitch = -ptr.y * 0.026;
      const off = _v.copy(camera.position).sub(look);
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const nx = off.x * cy - off.z * sy, nz = off.x * sy + off.z * cy;
      off.x = nx; off.z = nz; off.y += pitch * off.length();
      camera.position.copy(look).add(off);
      // home layer parallax (deep drifts less than mid)
      deepLayer.position.x = -ptr.x * 4.0; deepLayer.position.y = -ptr.y * 1.6;
      midLayer.position.x = -ptr.x * 8.5; midLayer.position.y = -ptr.y * 5.0;
    }
    camera.lookAt(look);
    if (composer) composer.render(); else renderer.render(scene, camera);
    if (!shown) { shown = true; if (REDUCED) cancelAnimationFrame(raf); }
  }
  raf = requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else if (!REDUCED || !shown) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });

  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    W.uViewport.value.set(innerWidth / innerHeight, viewportFillBoost());
    if (composer) composer.setSize(innerWidth, innerHeight);
    if (REDUCED) { if (composer) composer.render(); else renderer.render(scene, camera); }
  });
}
