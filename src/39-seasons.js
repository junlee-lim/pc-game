/* =========================================================
   🌸🌻🍁⛄ 사계절 & 계절 축제
   하루(밤 → 아침)가 3번 지나면 다음 계절이 와요.
   ========================================================= */
const DAYS_PER_SEASON = 3;
const SEASONS = [
  { id: 'spring', name: '봄', emoji: '🌸', event: '벚꽃 축제', token: { name: '벚꽃잎', emoji: '🌸' }, food: 'mochi', hat: 'blossom', furn: 'sakurapot',
    ground: 0xa9e38c, hill: 0xbdeb9c, bush: 0x9edc7a, petals: 0xffd23f, leaves: [[0xffc4d8, 0xffd6e4, 0xa8e38a], [0xffb3cc, 0xffc4d8, 0xffe0ea]], fall: 0xffc4d8 },
  { id: 'summer', name: '여름', emoji: '🌻', event: '여름 축제', token: { name: '조개껍데기', emoji: '🐚' }, food: 'hwachae', hat: 'melonhat', furn: 'fan',
    ground: 0x9fdc7c, hill: 0xb3e68c, bush: 0x86cf6a, petals: 0xffd23f, leaves: null, fall: null },
  { id: 'autumn', name: '가을', emoji: '🍁', event: '수확 축제', token: { name: '단풍잎', emoji: '🍁' }, food: 'goguma', hat: 'beret', furn: 'pumpkin',
    ground: 0xcfd57e, hill: 0xdedc8c, bush: 0xd9a548, petals: 0xd9962c, leaves: [[0xff9f43, 0xffc14d, 0xe8663d], [0xffb36b, 0xff8a5c, 0xffd07a]], fall: 0xff9f43 },
  { id: 'winter', name: '겨울', emoji: '⛄', event: '눈꽃 축제', token: { name: '눈꽃 결정', emoji: '❄️' }, food: 'cocoa', hat: 'knithat', furn: 'xtree',
    ground: 0xe4ecf7, hill: 0xedf2fa, bush: 0xe3ecf8, petals: 0xf4f4f4, leaves: [[0xf4f8ff, 0xe3eefc, 0xffffff], [0xf4f8ff, 0xe3eefc, 0xffffff]], fall: 0xffffff },
];
const season = () => SEASONS[S.season] || SEASONS[1];
const SEASON_LINES = {
  spring: ['벚꽃이 활짝 폈어! 꽃잎이 눈처럼 날려 🌸', '봄바람이 살랑~ 소풍 가고 싶다!', '축제 부스에서 딸기 찹쌀떡 팔더라 🍓', '꽃잎을 모으면 벚꽃 화관이랑 바꿔 준대!'],
  summer: ['여름이다! 바닷가에서 조개껍데기를 주웠어 🐚', '수박 화채 먹어 봤어? 시원해~', '조개껍데기 모으면 수박 모자랑 바꿔 준대!'],
  autumn: ['나뭇잎이 알록달록 물들었어 🍁', '군고구마 냄새 솔솔~ 축제 부스에 가 봐!', '허수아비 아저씨가 해바라기 미로를 지키고 있어', '단풍잎 모으면 베레모랑 바꿔 준대!'],
  winter: ['눈이다아~! ⛄ 광장에서 눈사람 만들자!', '목도리 두르니까 따뜻해~', '온천은 겨울에 더 좋더라 ♨️', '크리스마스 트리 반짝반짝 예쁘다 🎄', '눈꽃 결정 모으면 방울 털모자랑 바꿔 준대!'],
};

/* ---------- 계절 축제 부스 ---------- */
const EVENT_BOOTH = { x: -9, z: 12.5 };
const boothSigns = {};
{
  const g = new THREE.Group();
  g.position.set(EVENT_BOOTH.x, 0, EVENT_BOOTH.z);
  scene.add(g);
  add(new THREE.BoxGeometry(3.8, 1.0, 1.4), 0xf2d3a8, 0, 0.5, 0, g);
  add(new THREE.BoxGeometry(3.82, 0.5, 0.05), 0xc3a6ff, 0, 0.55, 0.72, g);
  for (const px of [-1.8, 1.8]) for (const pz of [-0.7, 0.7]) add(new THREE.CylinderGeometry(0.07, 0.07, 2.8, 6), 0xb07a56, px, 1.4, pz, g);
  for (let i = 0; i < 7; i++) {
    const s = add(new THREE.BoxGeometry(4.2 / 7 + 0.01, 0.12, 2.1), i % 2 ? 0xffffff : 0xc3a6ff, -2.1 + 4.2 / 14 + (i * 4.2) / 7, 2.85, 0.15, g);
    s.rotation.x = 0.18;
  }
  for (const se of SEASONS) {
    const sign = signPlane(`${se.emoji} ${se.event}`, 2.8, { font: 74, border: '#c3a6ff' });
    sign.position.set(0, 3.5, 0.3);
    g.add(sign);
    boothSigns[se.id] = sign;
  }
  const k = makeCreature({ color: 0xfff6c8, ears: 'bunny', accent: 0xc3a6ff });
  k.root.position.set(0, 0, -1.3);
  g.add(k.root);
  stallKeepers.push(k);
  // 달력 판
  const cal = add(new THREE.BoxGeometry(0.9, 1.1, 0.08), 0xffffff, 1.2, 1.55, 0.3, g, false);
  add(new THREE.BoxGeometry(0.9, 0.25, 0.1), 0xff8fb1, 1.2, 2.0, 0.31, g, false);
  collide(EVENT_BOOTH.x, EVENT_BOOTH.z, 2.1); collide(EVENT_BOOTH.x - 1.4, EVENT_BOOTH.z, 1.3); collide(EVENT_BOOTH.x + 1.4, EVENT_BOOTH.z, 1.3);
  interact({ x: EVENT_BOOTH.x, z: EVENT_BOOTH.z + 2.4, r: 2.4, get label() { return `${season().emoji} ${season().event} 부스`; }, action: () => openEventBooth() });
}
ZONE_LABELS.push(['🗓️ 계절 축제', EVENT_BOOTH.x, 4.6, EVENT_BOOTH.z]);
MAP_MARKS.push(['🗓️', EVENT_BOOTH.x, EVENT_BOOTH.z]);
AVOID.push([EVENT_BOOTH.x, EVENT_BOOTH.z, 4]);

/* ---------- 계절 장식 ---------- */
const decor = { spring: new THREE.Group(), summer: new THREE.Group(), autumn: new THREE.Group(), winter: new THREE.Group() };
const decorColliders = { spring: [], summer: [], autumn: [], winter: [] };
const seasonCollide = (id, x, z, r) => { const c = { x, z, r, off: true }; colliders.push(c); decorColliders[id].push(c); };
Object.values(decor).forEach((g) => { g.visible = false; scene.add(g); });
const xmasLights = [];
// 봄: 광장 옆 벚꽃 소풍
{
  const g = decor.spring;
  const mat0 = add(new THREE.BoxGeometry(3, 0.04, 2.2), toon({ map: stripeTexture('#ffc4d8', '#ffffff', 8) }), 4.6, 0.04, -10, g, false);
  mat0.rotation.y = 0.4;
  add(new THREE.BoxGeometry(0.7, 0.35, 0.5), 0xff8fb1, 4.2, 0.22, -10.2, g);
  add(new THREE.BoxGeometry(0.72, 0.08, 0.52), 0xffffff, 4.2, 0.42, -10.2, g, false);
  for (let i = 0; i < 3; i++) add(new THREE.SphereGeometry(0.12, 8, 6), 0xffffff, 5 + i * 0.25, 0.14, -9.6, g, false);
  for (const [x, z] of [[-24, -16], [7.5, 12], [-30, -4]]) {
    add(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 10), 0xe58e6b, x, 0.25, z, g);
    for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.22, 8, 6), 0xffc4d8, x + Math.cos(i) * 0.25, 0.65, z + Math.sin(i) * 0.25, g, false);
  }
}
// 여름: 해변 파라솔과 튜브
{
  const g = decor.summer;
  for (const [x, z, c] of [[-4.5, 56, '#ff8fb1'], [4.8, 55.5, '#8fd3ff']]) {
    add(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), 0xffffff, x, 1.3, z, g);
    add(new THREE.ConeGeometry(1.6, 0.6, 12), toon({ map: stripeTexture(c, '#ffffff', 12) }), x, 2.7, z, g);
    seasonCollide('summer', x, z, 0.4);
  }
  const tube = add(new THREE.TorusGeometry(0.45, 0.18, 10, 20), toon({ map: stripeTexture('#ffd166', '#ff6f91', 8) }), -2.5, 0.2, 54, g);
  tube.rotation.x = Math.PI / 2;
  const ball = add(new THREE.SphereGeometry(0.35, 14, 10), toon({ map: stripeTexture('#ff6f91', '#ffffff', 6) }), 3, 0.35, 52.5, g);
}
// 가을: 허수아비와 호박
{
  const g = decor.autumn;
  const sx = -23.5, sz = -17.5;
  add(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), 0xb07a56, sx, 1.3, sz, g);
  add(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6), 0xb07a56, sx, 1.8, sz, g).rotation.z = Math.PI / 2;
  add(new THREE.BoxGeometry(0.9, 0.9, 0.4), 0x8fb8ff, sx, 1.6, sz, g);
  add(new THREE.SphereGeometry(0.35, 12, 10), 0xf3d27a, sx, 2.45, sz, g);
  const hat = add(new THREE.ConeGeometry(0.5, 0.45, 12), 0xd9a548, sx, 2.85, sz, g);
  add(new THREE.CylinderGeometry(0.6, 0.6, 0.04, 14), 0xd9a548, sx, 2.65, sz, g);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.05, 6, 6), 0x3b2a25, sx + s * 0.12, 2.5, sz + 0.32, g, false);
  seasonCollide('autumn', sx, sz, 0.5);
  for (const [x, z, r] of [[-21.5, -16, 0.5], [-22.3, -19.6, 0.4], [6, -9.5, 0.55], [-6.5, 10, 0.45], [10, 4, 0.5], [-11.5, 14.8, 0.4]]) {
    const p = add(new THREE.SphereGeometry(r, 14, 10), 0xff8f2c, x, r * 0.8, z, g);
    p.scale.y = 0.8;
    add(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 5), 0x6a8a3c, x, r * 1.55, z, g, false);
    seasonCollide('autumn', x, z, r);
  }
  // 군고구마 드럼통
  add(new THREE.CylinderGeometry(0.45, 0.45, 1, 14), 0x6a6a7a, EVENT_BOOTH.x + 2.9, 0.5, EVENT_BOOTH.z + 0.6, g);
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8), 0x6a6a7a, EVENT_BOOTH.x + 3.1, 1.4, EVENT_BOOTH.z + 0.6, g);
  seasonCollide('autumn', EVENT_BOOTH.x + 2.9, EVENT_BOOTH.z + 0.6, 0.6);
}
// 겨울: 크리스마스 트리와 눈사람 자리
const snowmanParts = [];
const SNOWMAN = { x: -4.2, z: -10 };
{
  const g = decor.winter;
  const tx = 9.6, tz = 4.2;
  add(new THREE.CylinderGeometry(0.25, 0.3, 0.8, 8), 0x8a5a3c, tx, 0.4, tz, g);
  for (const [y, r, h] of [[1.4, 1.7, 1.8], [2.5, 1.35, 1.6], [3.5, 0.95, 1.4]]) add(new THREE.ConeGeometry(r, h, 12), 0x4fae6a, tx, y, tz, g);
  const star = add(new THREE.OctahedronGeometry(0.32, 0), toon({ color: 0xffd34d, emissive: 0xffc000, emissiveIntensity: 0.8 }), tx, 4.4, tz, g, false);
  star.name = 'star';
  for (let i = 0; i < 26; i++) {
    const y = 0.9 + (i / 26) * 3.0, a = i * 2.3, r = 1.6 * (1 - (y - 0.6) / 3.8) + 0.05;
    const l = add(new THREE.SphereGeometry(0.1, 8, 6), lanternMats[i % lanternMats.length], tx + Math.cos(a) * r, y, tz + Math.sin(a) * r, g, false);
    xmasLights.push(l);
  }
  for (const [x, z, c] of [[tx + 1.3, tz + 1, 0xff6f6f], [tx - 1.1, tz + 1.2, 0x8fb8ff], [tx + 0.2, tz + 1.6, 0xffd166]]) {
    add(new THREE.BoxGeometry(0.5, 0.45, 0.5), c, x, 0.23, z, g);
    add(new THREE.BoxGeometry(0.52, 0.47, 0.1), 0xffffff, x, 0.23, z, g, false);
  }
  seasonCollide('winter', tx, tz, 1.7);
  // 눈사람 (만들수록 하나씩 나타나요)
  const base = withOutline(add(new THREE.SphereGeometry(0.85, 18, 14), 0xffffff, SNOWMAN.x, 0.75, SNOWMAN.z, g), 1.04);
  const head = withOutline(add(new THREE.SphereGeometry(0.55, 18, 14), 0xffffff, SNOWMAN.x, 1.9, SNOWMAN.z, g), 1.04);
  const deco = new THREE.Group();
  g.add(deco);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.07, 8, 6), 0x3b2a25, SNOWMAN.x + s * 0.18, 2.0, SNOWMAN.z + 0.5, deco, false);
  const nose = add(new THREE.ConeGeometry(0.08, 0.4, 8), 0xff8f2c, SNOWMAN.x, 1.88, SNOWMAN.z + 0.65, deco, false);
  nose.rotation.x = Math.PI / 2;
  const sc = add(new THREE.TorusGeometry(0.5, 0.12, 8, 18), 0xff6f6f, SNOWMAN.x, 1.45, SNOWMAN.z, deco);
  sc.rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 14), 0x3b3b4a, SNOWMAN.x, 2.38, SNOWMAN.z, deco);
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.45, 14), 0x3b3b4a, SNOWMAN.x, 2.6, SNOWMAN.z, deco);
  for (const s of [-1, 1]) rod(new THREE.Vector3(SNOWMAN.x + s * 0.7, 1.1, SNOWMAN.z), new THREE.Vector3(SNOWMAN.x + s * 1.4, 1.6, SNOWMAN.z), 0.04, 0x8a5a3c, deco);
  snowmanParts.push(base, head, deco);
  // 눈 더미 (만들기 전 표시)
  const pile = add(new THREE.SphereGeometry(0.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xffffff, SNOWMAN.x, 0, SNOWMAN.z, g);
  pile.scale.y = 0.5;
  pile.name = 'pile';
  seasonCollide('winter', SNOWMAN.x, SNOWMAN.z, 0.9);
  interact({
    x: SNOWMAN.x, z: SNOWMAN.z + 2.0,
    get r() { return season().id === 'winter' && S.snowman < 3 ? 2.2 : 0; },
    get label() { return ['눈을 굴려 몸통 만들기 ⛄', '머리 올리기 ⛄', '눈·코·목도리 꾸미기 ⛄'][S.snowman] || ''; },
    action: () => buildSnowman(),
  });
}
function refreshSnowman() {
  snowmanParts.forEach((p, i) => (p.visible = S.snowman > i));
  decor.winter.getObjectByName('pile').visible = S.snowman === 0;
}
function buildSnowman() {
  S.snowman++;
  refreshSnowman();
  sparkle(SNOWMAN.x, 1.5, SNOWMAN.z, new THREE.Color(0xffffff), 24);
  sfx.ok();
  if (S.snowman >= 3) {
    addToken(3);
    addXP(8, '눈사람');
    sfx.fanfare();
    say(player, '눈사람 완성! 안녕, 눈사람아~ ⛄', 3);
    toast('⛄ 눈사람을 완성했어요! 눈꽃 결정 3개를 받았어요', 3.5);
  } else say(player, S.snowman === 1 ? '데굴데굴~ 몸통 완성!' : '영차! 머리를 올렸다!', 2);
  persist();
}

/* ---------- 떨어지는 꽃잎 · 낙엽 · 눈 ---------- */
const FALL_N = 500;
const fallGeo = new THREE.BufferGeometry();
fallGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(FALL_N * 3), 3));
const fallTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
})();
const fallMat = new THREE.PointsMaterial({ map: fallTex, size: 0.35, transparent: true, depthWrite: false, color: 0xffffff });
const fallPts = new THREE.Points(fallGeo, fallMat);
fallPts.frustumCulled = false;
scene.add(fallPts);
const fallSeed = Array.from({ length: FALL_N }, () => [rr(-32, 32), rr(0, 22), rr(-32, 32), rr(0, 9)]);

/* ---------- 축제 토큰 (마을 곳곳에 떠 있어요) ---------- */
const tokenTex = {};
for (const se of SEASONS) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 10, 64, 64, 62);
  gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  g.font = '76px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(se.token.emoji, 64, 70);
  tokenTex[se.id] = new THREE.CanvasTexture(c);
  tokenTex[se.id].colorSpace = THREE.SRGBColorSpace;
}
const tokenMat = new THREE.SpriteMaterial({ map: tokenTex.summer, transparent: true, depthWrite: false });
const tokens = Array.from({ length: 8 }, () => {
  const s = new THREE.Sprite(tokenMat);
  s.scale.setScalar(1.3);
  s.visible = false;
  scene.add(s);
  return { s, respawn: rr(1, 4), base: 0 };
});
function addToken(n = 1) {
  const id = season().id;
  S.tokens[id] = (S.tokens[id] || 0) + n;
  persist();
}
const tokenCount = () => S.tokens[season().id] || 0;

/* ---------- 계절 바꾸기 ---------- */
function applySeason() {
  const se = season();
  const summer = SEASONS[1];
  SEASONAL.ground.material.color.setHex(se.ground);
  for (const I of ISLANDS) if (I.groundMesh) I.groundMesh.material.color.setHex(se.id === 'winter' && !I.warm ? 0xe4ecf7 : I.ground);
  SEASONAL.hill.material.color.setHex(se.hill);
  SEASONAL.bushes.material = mat(se.bush);
  SEASONAL.petals.material = mat(se.petals);
  SEASONAL.flowers.forEach((f) => (f.visible = se.id !== 'winter'));
  for (const l of SEASONAL.leaves) {
    if (!se.leaves) {
      const pal = l.kind === 'pink' ? [0xffbcd4, 0xffa9c6, 0xffd0e0] : l.kind === 'round' ? [0x7fcf6b, 0x93db78, 0x6cbf5d] : [0x8bd66f, 0x76c460, 0xa2e283];
      l.m.material = mat(pal[l.i % 3]);
    } else {
      const pal = se.leaves[l.kind === 'pink' || (se.id === 'spring' && l.i % 2) ? 1 : 0];
      l.m.material = mat(pal[l.i % 3]);
    }
  }
  const pond = SEASONAL.pondWater.material;
  pond.color.setHex(se.id === 'winter' ? 0xd8efff : 0x77cdea);
  pond.emissive.setHex(se.id === 'winter' ? 0x6a8ab0 : 0x1a4e7a);
  for (const id of Object.keys(decor)) {
    decor[id].visible = id === se.id;
    decorColliders[id].forEach((c) => (c.off = id !== se.id));
  }
  for (const [id, sign] of Object.entries(boothSigns)) sign.visible = id === se.id;
  CREATURES.forEach((c) => c.scarf.forEach((m) => (m.visible = se.id === 'winter')));
  tokenMat.map = tokenTex[se.id];
  tokenMat.needsUpdate = true;
  tokens.forEach((t) => { t.s.visible = false; t.respawn = rr(0.5, 3); });
  if (se.fall) fallMat.color.setHex(se.fall);
  fallMat.size = se.id === 'winter' ? 0.3 : 0.4;
  refreshSnowman();
  if (season().id === 'winter' && W.raining) stopRain();
}
function setSeason(i, announce = true) {
  S.season = ((i % 4) + 4) % 4;
  S.seasonDay = 1;
  if (season().id === 'winter') S.snowman = 0;
  persist();
  applySeason();
  if (announce) {
    const se = season();
    sfx.fanfare();
    toast(`${se.emoji} ${se.name}이 왔어요! 광장 옆에서 ${se.event}가 열렸어요`, 4);
    say(player, { spring: '와, 벚꽃이다! 🌸', summer: '여름이다~ 바다 가자! 🌻', autumn: '알록달록 단풍이 예쁘다 🍁', winter: '눈이다아~! ⛄' }[se.id], 3);
  }
}
function newDay() {
  S.dayCount++;
  bikeNewDay();
  S.seasonDay++;
  if (S.seasonDay > DAYS_PER_SEASON) setSeason(S.season + 1);
  else toast(`${season().emoji} ${season().name} ${S.seasonDay}일째 아침이에요`, 2.6);
  for (const h of NEW_DAY_HOOKS) h();
  persist();
}

function openEventBooth() {
  const se = season();
  const food = FOODS[se.food];
  const hat = SHOP_ITEMS.find((i) => i.id === se.hat);
  const furn = FURNITURE.find((f) => f.id === se.furn);
  sfx.ok();
  openMenu({
    title: `${se.emoji} ${se.event}`,
    desc: () => `오늘은 <b>${se.name} ${S.seasonDay}일째</b> (하루가 ${DAYS_PER_SEASON - S.seasonDay + 1}번 더 지나면 다음 계절)<br>마을에 떠 있는 ${se.token.emoji} ${se.token.name}을(를) 모아 한정 상품과 바꿔요!<br>내 ${se.token.name} ${se.token.emoji} ${tokenCount()} · 코인 🪙 ${S.coins}`,
    items: () => [
      { label: `${food.emoji} ${food.name} 사 먹기`, right: `🪙 ${food.price}`, dim: S.coins < food.price, act: () => { eat(se.food); return false; } },
      { label: `${food.emoji} 포장해서 가방에 넣기 🎒`, right: `🪙 ${food.price}`, dim: S.coins < food.price, act: () => { if (S.coins < food.price) { sfx.no(); return true; } S.coins -= food.price; bagAdd(se.food); sfx.ok(); toast(`${food.emoji} ${food.name}을(를) 포장했어요! 친구들이 아주 좋아할 거예요`); return true; } },
      { label: `${hat.emoji} ${hat.name}`, right: S.owned.includes(hat.id) ? '✅ 갖고 있어요' : `${se.token.emoji} 5`, dim: !S.owned.includes(hat.id) && tokenCount() < 5,
        act: () => {
          if (S.owned.includes(hat.id)) return true;
          if (tokenCount() < 5) { sfx.no(); toast(`${se.token.emoji} ${se.token.name}이(가) ${5 - tokenCount()}개 더 필요해요`); return true; }
          S.tokens[se.id] -= 5; givePrize(hat.id, 0); return true;
        } },
      { label: `${furn.emoji} ${furn.name} (가구)`, right: S.furniture.includes(furn.id) ? '✅ 우리 집에 있어요' : `${se.token.emoji} 8`, dim: !S.furniture.includes(furn.id) && tokenCount() < 8,
        act: () => {
          if (S.furniture.includes(furn.id)) return true;
          if (tokenCount() < 8) { sfx.no(); toast(`${se.token.emoji} ${se.token.name}이(가) ${8 - tokenCount()}개 더 필요해요`); return true; }
          S.tokens[se.id] -= 8; S.furniture.push(furn.id); persist(); refreshFurniture(); sfx.fanfare();
          toast(`${furn.emoji} ${furn.name}이(가) 내 집으로 배달됐어요!`, 3); return true;
        } },
      { label: '⏭️ 시계탑 마법으로 다음 계절 부르기', right: `→ ${SEASONS[(S.season + 1) % 4].emoji} ${SEASONS[(S.season + 1) % 4].name}`, act: () => { setTimeout(() => setSeason(S.season + 1), 200); return false; } },
      { label: '닫기', act: () => false },
    ],
  });
}

/* ---------- 매 프레임 ---------- */
tickers.push((dt) => {
  const se = season();
  // 떨어지는 것들
  fallPts.visible = !!se.fall && !insideHouse && state !== 'title' && !islandAt(player.root.position).warm;
  if (fallPts.visible) {
    const c = camera.position, arr = fallGeo.attributes.position.array;
    const speed = se.id === 'winter' ? 1.6 : 1.1;
    for (let i = 0; i < FALL_N; i++) {
      const [sx, sy, sz, o] = fallSeed[i];
      const y = (((sy - elapsed * speed) % 22) + 22) % 22;
      arr[i * 3] = c.x + sx + Math.sin(elapsed * 0.8 + o) * 1.5;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = c.z - 12 + sz + Math.cos(elapsed * 0.6 + o) * 1.2;
    }
    fallGeo.attributes.position.needsUpdate = true;
  }
  // 반딧불이는 여름 밤에만
  if (se.id !== 'summer') fireflyMat.opacity = 0;
  if (se.id === 'winter') {
    scene.fog.color.lerp(tmpC.setHex(0xe8f0ff), 0.25 * (1 - clamp(tod - 1, 0, 1)));
    xmasLights.forEach((l, i) => (l.visible = Math.sin(elapsed * 3 + i) > -0.4));
    const st = decor.winter.getObjectByName('star');
    if (st) st.rotation.y += dt;
  }
  // 토큰
  const pp = player.root.position;
  for (const t of tokens) {
    if (!t.s.visible) {
      if (state !== 'play' && state !== 'title') continue;
      t.respawn -= dt;
      if (t.respawn <= 0) {
        const [x, z] = randomFreeSpot();
        t.base = groundY(x, z) + 1.0;
        t.s.position.set(x, t.base, z);
        t.s.visible = true;
      }
      continue;
    }
    t.s.position.y = t.base + Math.sin(elapsed * 2.5 + t.s.position.x) * 0.2;
    if (state === 'play' && !insideHouse && Math.hypot(t.s.position.x - pp.x, t.s.position.z - pp.z) < 1.4) {
      t.s.visible = false;
      t.respawn = rr(25, 45);
      addToken();
      sfx.ding();
      sparkle(t.s.position.x, t.s.position.y, t.s.position.z, new THREE.Color(se.fall || 0xfff1a8), 18);
      if (tokenCount() === 1 || tokenCount() === 5 || tokenCount() === 8) toast(`${se.token.emoji} ${se.token.name} ${tokenCount()}개! 계절 축제 부스에서 바꿀 수 있어요`, 2.8);
    }
  }
});
