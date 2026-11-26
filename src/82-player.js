/* =========================================================
   플레이어
   ========================================================= */
const player = makeCreature({ color: 0xfff1df, ears: 'bear', accent: 0xffa3b8 });
player.root.position.set(0, 0, 10);
player.root.rotation.y = Math.PI;
scene.add(player.root);

const S = {
  coins: save.get('coins', 5),
  full: save.get('full', 70),
  energy: save.get('energy', 80),
  owned: save.get('owned', []),
  equipped: save.get('equipped', {}),
  bag: save.get('bag', {}),            // 가방 { 음식키/melon: 개수 }
  bugDex: save.get('bugDex', {}),      // 곤충 도감 { id: 잡은 수 }
  fishDex: save.get('fishDex', {}),    // 물고기 도감
  furniture: save.get('furniture', []),
  quest: save.get('quest', null),      // 우체통 부탁
  questsDone: save.get('questsDone', 0),
  bikeRented: save.get('bikeRented', false),
  layout: save.get('layout', {}),       // 내 집 가구 배치 { id: [x, z, 회전, 보관중] }
  season: save.get('season', 1),        // 0 봄 · 1 여름 · 2 가을 · 3 겨울
  seasonDay: save.get('seasonDay', 1),
  tokens: save.get('tokens', {}),       // 계절 축제 토큰
  snowman: save.get('snowman', 0),
  friends: save.get('friends', {}),     // 친구 호감도 { 이름: 0~100 }
  friendDay: save.get('friendDay', {}), // 오늘 이미 이야기했는지
  giftDay: save.get('giftDay', {}),     // 오늘 이미 선물했는지
  favKnown: save.get('favKnown', {}),   // 좋아하는 것을 알아냈는지
  stars: save.get('stars', {}),         // 찾은 별자리
  sandStage: save.get('sandStage', 0), sandDay: save.get('sandDay', ''), // 야자수섬 모래성
  visited: save.get('visited', {}),     // 놀러 간 친구 집 · 차 마신 날
};
function persist() {
  save.set('coins', S.coins); save.set('full', Math.round(S.full)); save.set('energy', Math.round(S.energy));
  save.set('owned', S.owned); save.set('equipped', S.equipped);
  for (const k of ['bag', 'bugDex', 'fishDex', 'furniture', 'quest', 'questsDone', 'bikeRented', 'layout', 'season', 'seasonDay', 'tokens', 'snowman', 'friends', 'friendDay', 'giftDay', 'favKnown', 'stars', 'sandStage', 'sandDay', 'visited']) save.set(k, S[k]);
}
const bagAdd = (k, n = 1) => { S.bag[k] = Math.max(0, (S.bag[k] || 0) + n); if (!S.bag[k]) delete S.bag[k]; persist(); };
const slotGroups = { hat: player.hatSlot, face: player.faceSlot, hand: player.handSlot };
let balloonMesh = null;
function refreshEquip() {
  for (const g of Object.values(slotGroups)) while (g.children.length) g.remove(g.children[0]);
  balloonMesh = null;
  for (const [slot, id] of Object.entries(S.equipped)) {
    if (!id) continue;
    const m = itemModel(id);
    slotGroups[slot].add(m);
    if (id === 'balloon') balloonMesh = m;
  }
}
refreshEquip();

/* =========================================================
   불꽃놀이 파티클
   ========================================================= */
const FW_MAX = 7000;
const fw = {
  pos: new Float32Array(FW_MAX * 3), col: new Float32Array(FW_MAX * 3), size: new Float32Array(FW_MAX), alpha: new Float32Array(FW_MAX),
  vel: new Float32Array(FW_MAX * 3), life: new Float32Array(FW_MAX), max: new Float32Array(FW_MAX), drag: new Float32Array(FW_MAX),
  grav: new Float32Array(FW_MAX), base: new Float32Array(FW_MAX), flicker: new Uint8Array(FW_MAX), cursor: 0,
};
const fwGeo = new THREE.BufferGeometry();
fwGeo.setAttribute('position', new THREE.BufferAttribute(fw.pos, 3).setUsage(THREE.DynamicDrawUsage));
fwGeo.setAttribute('pcolor', new THREE.BufferAttribute(fw.col, 3).setUsage(THREE.DynamicDrawUsage));
fwGeo.setAttribute('size', new THREE.BufferAttribute(fw.size, 1).setUsage(THREE.DynamicDrawUsage));
fwGeo.setAttribute('alpha', new THREE.BufferAttribute(fw.alpha, 1).setUsage(THREE.DynamicDrawUsage));
const fwMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uScale: { value: innerHeight * 0.5 } },
  vertexShader: `attribute float size; attribute float alpha; attribute vec3 pcolor; uniform float uScale;
    varying vec3 vC; varying float vA;
    void main(){ vC = pcolor; vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying vec3 vC; varying float vA;
    void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
      float core = smoothstep(0.5, 0.0, d); float a = core * core * vA;
      gl_FragColor = vec4(mix(vC, vec3(1.0), core * 0.35) * a * 1.5, a); }`,
});
const fwPoints = new THREE.Points(fwGeo, fwMat);
fwPoints.frustumCulled = false;
scene.add(fwPoints);
const rockets = [];
const fwFlash = new THREE.PointLight(0xffffff, 0, 90, 1.1);
scene.add(fwFlash);
let flashColor = new THREE.Color();

function spark(x, y, z, vx, vy, vz, life, color, size, drag = 1.2, grav = 4, flicker = 0) {
  let i = fw.cursor;
  for (let k = 0; k < FW_MAX; k++) {
    if (fw.life[i] <= 0) break;
    i = (i + 1) % FW_MAX;
  }
  fw.cursor = (i + 1) % FW_MAX;
  fw.pos[i * 3] = x; fw.pos[i * 3 + 1] = y; fw.pos[i * 3 + 2] = z;
  fw.vel[i * 3] = vx; fw.vel[i * 3 + 1] = vy; fw.vel[i * 3 + 2] = vz;
  fw.col[i * 3] = color.r; fw.col[i * 3 + 1] = color.g; fw.col[i * 3 + 2] = color.b;
  fw.life[i] = fw.max[i] = life;
  fw.base[i] = size * 1.8; fw.drag[i] = drag; fw.grav[i] = grav; fw.flicker[i] = flicker;
}
const FW_COLORS = [0xff6b9a, 0xffd166, 0x7ae7ff, 0xb28dff, 0x8dffb0, 0xffffff, 0xff9f5a, 0xff8fe0].map((c) => new THREE.Color(c));
function launchRocket() {
  const x = rr(-14, 14), z = POND.z + rr(-8, 2);
  rockets.push({
    p: new THREE.Vector3(x, 0.5, z), v: new THREE.Vector3(rr(-1.5, 1.5), rr(18, 22), rr(-0.5, 0.5)),
    fuse: rr(1.05, 1.35), type: pick(['peony', 'peony', 'ring', 'heart', 'willow', 'double', 'star']),
    c1: pick(FW_COLORS), c2: pick(FW_COLORS),
  });
  sfx.whistle();
}
function explode(r) {
  const { p, type, c1, c2 } = r;
  const tc = new THREE.Color();
  const sphereDir = () => {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    return [s * Math.cos(th), u, s * Math.sin(th)];
  };
  if (type === 'heart') {
    const n = 110;
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const hx = 16 * Math.sin(t) ** 3, hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      spark(p.x, p.y, p.z, hx * 0.55, hy * 0.55 + 1.5, rr(-0.4, 0.4), rr(1.6, 2.0), tc.copy(c1).lerp(FW_COLORS[0], 0.5), 1.1, 1.8, 2.2);
    }
  } else if (type === 'ring') {
    const n = 90, tilt = rr(-0.6, 0.6);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const vx = Math.cos(a) * 10, vy = Math.sin(a) * 10;
      spark(p.x, p.y, p.z, vx, vy * Math.cos(tilt), vy * Math.sin(tilt), rr(1.4, 1.8), c1, 1.1, 1.6, 3);
    }
    for (let i = 0; i < 40; i++) { const d = sphereDir(); spark(p.x, p.y, p.z, d[0] * 3, d[1] * 3, d[2] * 3, 1.2, c2, 0.9, 1.4, 2); }
  } else if (type === 'willow') {
    for (let i = 0; i < 150; i++) {
      const d = sphereDir(), s = rr(6, 8);
      spark(p.x, p.y, p.z, d[0] * s, d[1] * s + 2, d[2] * s, rr(2.6, 3.4), tc.setHex(0xffc65a), 0.9, 1.1, 5.5, 1);
    }
  } else if (type === 'star') {
    const arms = 5;
    for (let i = 0; i < 150; i++) {
      const a = (i / 150) * Math.PI * 2;
      const rad = 0.55 + 0.45 * Math.abs(Math.cos((a * arms) / 2));
      spark(p.x, p.y, p.z, Math.cos(a) * 11 * rad, Math.sin(a) * 11 * rad, rr(-0.5, 0.5), rr(1.5, 1.9), i % 2 ? c1 : c2, 1.0, 1.7, 2.5);
    }
  } else {
    const n = type === 'double' ? 120 : 170;
    for (let i = 0; i < n; i++) {
      const d = sphereDir(), s = rr(9.5, 11);
      spark(p.x, p.y, p.z, d[0] * s, d[1] * s, d[2] * s, rr(1.5, 2.1), tc.copy(c1).lerp(c2, Math.random() * 0.4), 1.15, 1.5, 3.5, Math.random() < 0.3 ? 1 : 0);
    }
    if (type === 'double') for (let i = 0; i < 80; i++) {
      const d = sphereDir(), s = rr(4, 5);
      spark(p.x, p.y, p.z, d[0] * s, d[1] * s, d[2] * s, rr(1.3, 1.7), c2, 1.0, 1.5, 3);
    }
  }
  fwFlash.position.copy(p);
  fwFlash.intensity = 260;
  flashColor.copy(c1);
  fwFlash.color.copy(c1);
  const dist = p.distanceTo(camera.position);
  setTimeout(() => sfx.boom(), Math.min(dist * 6, 500));
  setTimeout(() => sfx.crackle(), 600 + Math.random() * 300);
}
const sparkleColor = new THREE.Color(0xffe27a);
function sparkle(x, y, z, color = sparkleColor, n = 24) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    spark(x, y, z, Math.cos(a) * rr(1, 3), rr(2, 5), Math.sin(a) * rr(1, 3), rr(0.5, 0.9), color, 0.35, 2, 6);
  }
}
function updateParticles(dt) {
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    r.v.y -= 9 * dt;
    r.p.addScaledVector(r.v, dt);
    r.fuse -= dt;
    spark(r.p.x, r.p.y, r.p.z, rr(-0.4, 0.4), rr(-2, 0), rr(-0.4, 0.4), 0.45, sparkleColor, 0.55, 2, 2);
    if (r.fuse <= 0) { explode(r); rockets.splice(i, 1); }
  }
  for (let i = 0; i < FW_MAX; i++) {
    if (fw.life[i] <= 0) { if (fw.alpha[i] !== 0) { fw.alpha[i] = 0; fw.size[i] = 0; } continue; }
    fw.life[i] -= dt;
    const k = Math.exp(-fw.drag[i] * dt);
    fw.vel[i * 3] *= k; fw.vel[i * 3 + 1] = fw.vel[i * 3 + 1] * k - fw.grav[i] * dt; fw.vel[i * 3 + 2] *= k;
    fw.pos[i * 3] += fw.vel[i * 3] * dt; fw.pos[i * 3 + 1] += fw.vel[i * 3 + 1] * dt; fw.pos[i * 3 + 2] += fw.vel[i * 3 + 2] * dt;
    const t = Math.max(fw.life[i], 0) / fw.max[i];
    let a = Math.pow(t, 0.8);
    if (fw.flicker[i] && t < 0.6) a *= Math.random() < 0.5 ? 0.25 : 1;
    fw.alpha[i] = a;
    fw.size[i] = fw.base[i] * (0.6 + 0.4 * t);
  }
  fwGeo.attributes.position.needsUpdate = true;
  fwGeo.attributes.pcolor.needsUpdate = true;
  fwGeo.attributes.size.needsUpdate = true;
  fwGeo.attributes.alpha.needsUpdate = true;
  fwFlash.intensity *= Math.exp(-5 * dt);
}

/* =========================================================
   사운드 (WebAudio로 직접 만든 소리)
   ========================================================= */
let actx = null, master = null, soundOn = save.get('sound', true);
let noiseBuf = null;
function initAudio() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain();
    master.gain.value = soundOn ? 0.55 : 0;
    master.connect(actx.destination);
    noiseBuf = actx.createBuffer(1, actx.sampleRate * 2, actx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } catch { actx = null; }
}
function tone(freq, dur = 0.2, type = 'sine', vol = 0.15, slide = 0, delay = 0) {
  if (!actx) return;
  const t = actx.currentTime + delay;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, filterFreq, vol, type = 'lowpass', endFreq = 0) {
  if (!actx) return;
  const t = actx.currentTime;
  const s = actx.createBufferSource(); s.buffer = noiseBuf;
  const f = actx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(filterFreq, t);
  if (endFreq) f.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  const g = actx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(master);
  s.start(t, Math.random()); s.stop(t + dur);
}
const sfx = {
  coin() { tone(988, 0.12, 'square', 0.06); tone(1319, 0.3, 'square', 0.06, 0, 0.08); },
  select() { tone(660, 0.08, 'triangle', 0.1); },
  ok() { tone(784, 0.1, 'triangle', 0.12); tone(1047, 0.2, 'triangle', 0.12, 0, 0.08); },
  no() { tone(300, 0.2, 'triangle', 0.12, 0.7); },
  eat() { for (let i = 0; i < 3; i++) tone(500 + i * 120, 0.09, 'sine', 0.14, 1.3, i * 0.14); },
  step() { tone(180 + Math.random() * 40, 0.05, 'sine', 0.03); },
  talk() { for (let i = 0; i < 4; i++) tone(600 + Math.random() * 400, 0.06, 'triangle', 0.05, 1, i * 0.07); },
  whistle() { tone(500, 1.0, 'sine', 0.025, 3.2); },
  boom() { noise(1.6, 900, 0.7, 'lowpass', 60); tone(70, 0.9, 'sine', 0.35, 0.5); },
  crackle() { for (let i = 0; i < 8; i++) setTimeout(() => noise(0.05, 4000, 0.08, 'highpass'), i * 60 + Math.random() * 60); },
  yawn() { tone(500, 1.2, 'sine', 0.08, 0.5); },
  jump() { tone(300, 0.25, 'square', 0.05, 2.2); },
  hop() { tone(420, 0.16, 'sine', 0.09, 1.9); },
  land() { noise(0.15, 500, 0.25); tone(120, 0.15, 'sine', 0.15, 0.6); },
  splash() { noise(0.5, 2500, 0.18, 'bandpass', 600); },
  bite() { tone(1200, 0.08, 'square', 0.07); tone(1500, 0.12, 'square', 0.07, 0, 0.1); },
  pop() { tone(900, 0.06, 'square', 0.06, 0.4); noise(0.05, 3000, 0.12, 'highpass'); },
  ding() { tone(1568, 0.4, 'sine', 0.1); tone(2093, 0.5, 'sine', 0.08, 0, 0.1); },
  fanfare() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.1, 0, i * 0.11)); },
  chime() { tone(pick([784, 880, 1047, 1175, 1319]), 0.5, 'sine', 0.05); },
  bell() { tone(1319, 0.6, 'sine', 0.08); tone(1760, 0.8, 'sine', 0.05, 0, 0.05); },
};
// 잔잔한 오르골 배경음
const SCALE_DAY = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
const SCALE_NIGHT = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
let musicBeat = 0;
setInterval(() => {
  if (!actx || !soundOn || state === 'title') return;
  musicBeat++;
  const scale = tod > 1.5 ? SCALE_NIGHT : SCALE_DAY;
  const vol = state === 'nap' ? 0.02 : 0.035;
  if (musicBeat % 8 === 0) tone(scale[0] / 4 * (musicBeat % 16 === 0 ? 1 : 1.335), 1.8, 'sine', vol * 1.4);
  if (Math.random() < 0.62) tone(pick(scale), 1.1, 'triangle', vol);
  if (Math.random() < 0.15) tone(pick(scale) * 2, 0.8, 'sine', vol * 0.6, 0, 0.2);
}, 420);
