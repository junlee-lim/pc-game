
/* =========================================================
   유틸
   ========================================================= */
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (k, dt) => 1 - Math.exp(-k * dt);
let seed = 12345;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const rr = (a, b) => a + (b - a) * rand();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function lerpAngle(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}
const save = {
  get(k, d) { try { const v = localStorage.getItem('pogeun:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('pogeun:' + k, JSON.stringify(v)); } catch {} },
};

// 폰트가 늦게 와도 너무 오래 기다리지 않기
try { await Promise.race([document.fonts.load('48px Jua'), new Promise((r) => setTimeout(r, 1500))]); } catch {}

/* =========================================================
   렌더러 · 씬 · 카메라
   ========================================================= */
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xd8f1ff, 70, 170);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 30, 50);

const hemi = new THREE.HemisphereLight(0xffffff, 0x9bc58a, 1.6);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2d6, 2.4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 1, far: 120 });
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

// 툰 셰이딩용 그라데이션
const gradTex = new THREE.DataTexture(new Uint8Array([110, 185, 255]), 3, 1, THREE.RedFormat);
gradTex.minFilter = gradTex.magFilter = THREE.NearestFilter;
gradTex.needsUpdate = true;

const matCache = new Map();
function mat(color) {
  if (!matCache.has(color)) matCache.set(color, new THREE.MeshToonMaterial({ color, gradientMap: gradTex }));
  return matCache.get(color);
}
function toon(opts) { return new THREE.MeshToonMaterial({ gradientMap: gradTex, ...opts }); }

function add(geo, material, x = 0, y = 0, z = 0, parent = scene, cast = true) {
  const m = new THREE.Mesh(geo, typeof material === 'number' ? mat(material) : material);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
const UP = new THREE.Vector3(0, 1, 0);
function rod(a, b, r, material, parent = scene) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = add(new THREE.CylinderGeometry(r, r, len, 6), material, 0, 0, 0, parent, false);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  return m;
}
function textTexture(text, { w = 512, h = 160, bg = '#fff8ec', fg = '#6a4c3f', border = '#f1b8c8', font = 84 } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = border;
  g.beginPath(); g.roundRect(0, 0, w, h, 36); g.fill();
  g.fillStyle = bg;
  g.beginPath(); g.roundRect(10, 10, w - 20, h - 20, 28); g.fill();
  g.fillStyle = fg;
  g.font = `${font}px Jua, "Malgun Gothic", sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function signPlane(text, width, opts = {}) {
  const tex = textTexture(text, opts);
  const ratio = (opts.h || 160) / (opts.w || 512);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width * ratio), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  return m;
}
function stripeTexture(a, b, n = 8) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect((i * 128) / n, 0, 128 / n + 1, 128); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* =========================================================
   하늘 · 시간대
   ========================================================= */
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  fog: false,
  uniforms: { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } },
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying vec3 vP;
    void main(){ float h = clamp(vP.y * 1.6 + 0.1, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, h), 1.0);
    #include <colorspace_fragment>
    }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(320, 32, 16), skyMat);
sky.renderOrder = -1;
scene.add(sky);

const starGeo = new THREE.BufferGeometry();
{
  const p = [];
  for (let i = 0; i < 700; i++) {
    const th = Math.random() * Math.PI * 2, ph = Math.random() * 0.45 * Math.PI + 0.05;
    p.push(Math.cos(th) * Math.cos(ph) * 290, Math.sin(ph) * 290, Math.sin(th) * Math.cos(ph) * 290);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
}
const starMat = new THREE.PointsMaterial({ color: 0xfff6d8, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff3c6, transparent: true, opacity: 0, fog: false }));
moon.position.set(-110, 120, -230);
scene.add(moon);

// 0 = 낮, 1 = 노을, 2 = 밤
const TOD = {
  skyTop: [0x6fc3ff, 0x7b7fd8, 0x0e1546].map((c) => new THREE.Color(c)),
  skyBottom: [0xdff4ff, 0xffb592, 0x2c2f70].map((c) => new THREE.Color(c)),
  fog: [0xdff4ff, 0xffc5a5, 0x232a62].map((c) => new THREE.Color(c)),
  sunColor: [0xfff2d6, 0xffb070, 0xa8b8ff].map((c) => new THREE.Color(c)),
  sunI: [2.4, 1.7, 0.55],
  hemiSky: [0xffffff, 0xffd9c2, 0x7d8fe0].map((c) => new THREE.Color(c)),
  hemiI: [1.6, 1.25, 0.75],
  sunDir: [new THREE.Vector3(18, 34, 14), new THREE.Vector3(34, 14, 6), new THREE.Vector3(-20, 30, -18)],
};
let tod = 0, todTarget = 0;
const tmpC = new THREE.Color(), tmpV = new THREE.Vector3();
function sampleColor(arr, t, out) {
  const i = Math.min(Math.floor(t), 1), f = t - i;
  return out.copy(arr[i]).lerp(arr[i + 1], f);
}
function sampleNum(arr, t) { const i = Math.min(Math.floor(t), 1); return lerp(arr[i], arr[i + 1], t - i); }

/* =========================================================
   지형
   ========================================================= */
const ISLAND_R = 60;
const HILL = { x: -40, z: 4, r: 14, h: 2.8 };
// 바다로 뻗은 낚시 선착장
const PIER = { x: 0, z0: 56, z1: 72, w: 3.2, h: 0.3 };
const onPier = (x, z) => Math.abs(x - PIER.x) < PIER.w / 2 && z > PIER.z0 && z < PIER.z1;
// 자전거 점프대: 시작점(x,z), 오르막 방향(dx,dz), 길이, 폭, 높이
const RAMPS = [
  { x: 9, z: 0, dx: 1, dz: 0, len: 4, w: 3, h: 1.2 },
  { x: 0, z: 42, dx: 0, dz: 1, len: 4, w: 3, h: 1.2 },
  { x: -11, z: 1.4, dx: -1, dz: 0, len: 4, w: 3, h: 1.2 },
];
function rampY(x, z) {
  for (const r of RAMPS) {
    const ox = x - r.x, oz = z - r.z;
    const u = ox * r.dx + oz * r.dz, v = -ox * r.dz + oz * r.dx;
    if (u >= 0 && u <= r.len && Math.abs(v) <= r.w / 2) return (r.h * u) / r.len;
  }
  return 0;
}
function groundY(x, z) {
  if (onPier(x, z)) return PIER.h;
  if (Math.abs(x) + Math.abs(z) > 110) {
    // 하늘섬은 구름 위 높은 곳에 떠 있어요
    for (const I of ISLANDS) if (I.sky && Math.hypot(x - I.x, z - I.z) < I.r + 4) return I.y;
    // 다른 섬의 언덕
    for (const I of ISLANDS) {
      if (!I.hill) continue;
      const hd = Math.hypot(x - I.hill.x, z - I.hill.z);
      if (hd < I.hill.r) { const c = Math.cos((hd / I.hill.r) * Math.PI * 0.5); return I.hill.h * c * c; }
    }
    return 0;
  }
  const d = Math.hypot(x - HILL.x, z - HILL.z);
  if (d >= HILL.r) return rampY(x, z);
  const c = Math.cos((d / HILL.r) * Math.PI * 0.5);
  return HILL.h * c * c;
}
const colliders = [];
ISLANDS.push({ id: 'main', name: '포근섬', emoji: '🌼', x: 0, z: 0, r: ISLAND_R });
const collide = (x, z, r) => colliders.push({ x, z, r });

// 섬
SEASONAL.ground = add(new THREE.CylinderGeometry(ISLAND_R, ISLAND_R, 1, 72), toon({ color: 0x9fdc7c }), 0, -0.5, 0, scene, false);
add(new THREE.CylinderGeometry(ISLAND_R + 0.3, ISLAND_R - 6, 7, 72), 0xd9a878, 0, -4.5, 0, scene, false);
add(new THREE.CylinderGeometry(ISLAND_R + 0.6, ISLAND_R + 0.6, 0.5, 72), 0xf6e3b4, 0, -0.65, 0, scene, false);
const sea = new THREE.Mesh(new THREE.CircleGeometry(400, 64), toon({ color: 0x7fd3ea, transparent: true, opacity: 0.95 }));
sea.rotation.x = -Math.PI / 2;
sea.position.y = -1.6;
sea.receiveShadow = true;
scene.add(sea);

// 언덕
{
  const s = HILL.r * 2 + 2;
  const geo = new THREE.PlaneGeometry(s, s, 56, 56);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + HILL.x, z = pos.getZ(i) + HILL.z;
    pos.setY(i, Math.hypot(x - HILL.x, z - HILL.z) < HILL.r ? groundY(x, z) + 0.01 : -0.1);
  }
  geo.computeVertexNormals();
  SEASONAL.hill = add(geo, toon({ color: 0xb3e68c }), HILL.x, 0, HILL.z, scene, false);
}
function terrainPatch(w, d, cx, cz, material, lift = 0.04) {
  const geo = new THREE.PlaneGeometry(w, d, 12, 12);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, groundY(pos.getX(i) + cx, pos.getZ(i) + cz) + lift);
  geo.computeVertexNormals();
  return add(geo, material, cx, 0, cz, scene, false);
}

// 길
const pathMat = mat(0xf5dfb6);
const PATHS = [
  [0, 0, 0, -29], [0, 0, 50, 0], [0, 0, -27, 3.5], [5, -3, 22, -19],
  [0, 0, 0, 57.5], [-4, -4, -26, -25], [-4, 3, -35, 25.5], [4, 4, 25, 25], [25, 25, 30, 31],
];
for (const [x1, z1, x2, z2] of PATHS) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const m = add(new THREE.PlaneGeometry(4, len), pathMat, (x1 + x2) / 2, 0.02, (z1 + z2) / 2, scene, false);
  m.rotation.x = -Math.PI / 2;
  m.rotation.z = Math.atan2(x2 - x1, z2 - z1) + Math.PI;
}
{
  const m = add(new THREE.CircleGeometry(8, 40), pathMat, 0, 0.03, 0, scene, false);
  m.rotation.x = -Math.PI / 2;
  // 돌길 무늬
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const s = add(new THREE.CylinderGeometry(0.45, 0.5, 0.06, 7), 0xead0a2, Math.cos(a) * 7, 0.05, Math.sin(a) * 7, scene, false);
    s.rotation.y = a;
  }
}
function distToSegment(px, pz, x1, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1;
  const t = clamp(((px - x1) * dx + (pz - z1) * dz) / (dx * dx + dz * dz), 0, 1);
  return Math.hypot(px - (x1 + dx * t), pz - (z1 + dz * t));
}
const nearPath = (x, z, m) => PATHS.some((p) => distToSegment(x, z, ...p) < m);
