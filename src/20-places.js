/* =========================================================
   마을 광장 (분수)
   ========================================================= */
{
  add(new THREE.CylinderGeometry(2.6, 2.9, 0.7, 28), 0xe9e2f2, 0, 0.35, 0);
  const w = add(new THREE.CylinderGeometry(2.25, 2.25, 0.1, 28), toon({ color: 0x8fdcff, emissive: 0x2a7ea0, emissiveIntensity: 0.15 }), 0, 0.68, 0, scene, false);
  w.receiveShadow = true;
  add(new THREE.CylinderGeometry(0.3, 0.42, 1.6, 12), 0xe9e2f2, 0, 1.3, 0);
  add(new THREE.CylinderGeometry(0.95, 0.5, 0.35, 20), 0xe9e2f2, 0, 2.1, 0);
  add(new THREE.CylinderGeometry(0.8, 0.8, 0.05, 20), toon({ color: 0x8fdcff }), 0, 2.27, 0, scene, false);
  collide(0, 0, 3.1);
  bench(-6.5, 3.5, Math.PI * 0.35 + Math.PI);
  bench(6.5, -3.5, Math.PI * 0.35);
  bench(-5.8, -4.6, -Math.PI * 0.3);
}
const fountainDrops = [];
{
  const dropMat = toon({ color: 0xbfeeff, emissive: 0x6fc8ee, emissiveIntensity: 0.3 });
  for (let i = 0; i < 14; i++) {
    const d = add(new THREE.SphereGeometry(0.1, 8, 6), dropMat, 0, 2.4, 0, scene, false);
    fountainDrops.push({ m: d, a: (i / 14) * Math.PI * 2, t: i / 14 });
  }
}

/* =========================================================
   🎆 불꽃 호숫가 (북쪽)
   ========================================================= */
const POND = { x: 0, z: -44, r: 10.5 };
{
  const sand = add(new THREE.CircleGeometry(POND.r + 1.4, 48), 0xf6e3b4, POND.x, 0.025, POND.z, scene, false);
  sand.rotation.x = -Math.PI / 2;
  const water = new THREE.Mesh(new THREE.CircleGeometry(POND.r, 48), toon({ color: 0x77cdea, emissive: 0x1a4e7a, emissiveIntensity: 0.1 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(POND.x, 0.05, POND.z);
  water.receiveShadow = true;
  scene.add(water);
  SEASONAL.pondWater = water;
  collide(POND.x, POND.z, POND.r + 0.1);
  for (let i = 0; i < 9; i++) {
    const a = rr(0, Math.PI * 2), d = rr(3, POND.r - 1.5);
    const lp = add(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 14, 1, false, 0, Math.PI * 1.75), 0x7fcf6b, POND.x + Math.cos(a) * d, 0.08, POND.z + Math.sin(a) * d, scene, false);
    lp.rotation.y = rr(0, 6);
    if (i % 3 === 0) add(new THREE.SphereGeometry(0.16, 10, 8), 0xffb8d4, lp.position.x, 0.18, lp.position.z, scene, false);
  }
  // 갈대
  for (let i = 0; i < 26; i++) {
    const a = rr(0, Math.PI * 2);
    if (Math.abs(Math.sin(a) - 1) < 0.25) continue; // 데크 앞은 비워두기
    const x = POND.x + Math.cos(a) * (POND.r + 0.6), z = POND.z + Math.sin(a) * (POND.r + 0.6);
    add(new THREE.CylinderGeometry(0.04, 0.05, 1.3, 5), 0x74b85a, x, 0.65, z, scene, false);
    add(new THREE.CapsuleGeometry(0.08, 0.3, 4, 8), 0xa87250, x, 1.35, z, scene, false);
  }
  // 관람 데크
  const deck = new THREE.Group();
  deck.position.set(0, 0, -31.5);
  scene.add(deck);
  add(new THREE.BoxGeometry(9, 0.3, 5), 0xd9a878, 0, 0.2, 0, deck);
  for (let i = -4; i <= 4; i++) add(new THREE.BoxGeometry(0.06, 0.32, 5), 0xc08f63, i, 0.21, 0, deck, false);
  for (const [px, pz] of [[-4.3, -2.3], [4.3, -2.3]]) add(new THREE.BoxGeometry(0.2, 1.1, 0.2), 0xb07a56, px, 0.85, pz, deck);
  add(new THREE.BoxGeometry(8.8, 0.15, 0.15), 0xb07a56, 0, 1.3, -2.3, deck);
  // 방석
  for (const cx of [-1.6, 0, 1.6]) {
    add(new THREE.BoxGeometry(1.1, 0.22, 1.1), pick([0xffb4c8, 0xffd98a, 0xb8e6ff]), cx, 0.45, 0.6, deck).rotation.y = rr(-0.3, 0.3);
  }
  const pa = post(-5.2, -29.2, 4.2), pb = post(5.2, -29.2, 4.2);
  lanternString(pa, pb, 11, 0.9);
  const pc = post(-11, -33.5, 3.6), pd = post(11, -33.5, 3.6);
  lanternString(pc, pa, 7, 0.6);
  lanternString(pb, pd, 7, 0.6);
  glowLight(0, 3, -30, 0xffb070, 18);
  const banner = signPlane('🎆 여름밤 불꽃축제', 5.6, { w: 640, h: 160, font: 78, border: '#ffb4c8' });
  banner.position.set(0, 4.3, -29.15);
  banner.rotation.y = Math.PI;
  scene.add(banner);
  const banner2 = banner.clone();
  banner2.rotation.y = 0;
  banner2.position.z = -29.1;
  scene.add(banner2);
}

/* =========================================================
   🍢 먹자골목 (동쪽)
   ========================================================= */
const FOODS = {
  tteok: { name: '떡볶이', emoji: '🌶️', price: 3, full: 35, energy: 5, desc: '매콤달콤 쫄깃한 떡볶이!', line: '호호~ 매콤해! 그래도 또 먹고 싶어 😋' },
  fish: { name: '붕어빵', emoji: '🐟', price: 2, full: 22, energy: 5, desc: '바삭한 껍질에 달콤한 팥이 가득', line: '머리부터 먹을까, 꼬리부터 먹을까~' },
  cotton: { name: '솜사탕', emoji: '🍭', price: 2, full: 12, energy: 15, desc: '구름처럼 폭신한 분홍 솜사탕', line: '입에서 사르르 녹아요~ ☁️' },
  bingsu: { name: '팥빙수', emoji: '🍧', price: 4, full: 25, energy: 12, desc: '여름엔 역시 시원한 빙수!', line: '으~ 머리가 찡! 그래도 시원해 ❄️' },
  // 계절 축제 부스에서만 파는 음식
  mochi: { name: '딸기 찹쌀떡', emoji: '🍓', price: 3, full: 20, energy: 15, desc: '봄 딸기가 쏙 들어간 말랑 찹쌀떡', line: '말랑말랑 새콤달콤~ 봄 맛이야! 🌸', seasonal: true },
  hwachae: { name: '수박 화채', emoji: '🍉', price: 3, full: 22, energy: 15, desc: '동글동글 수박이 동동 뜬 시원한 화채', line: '시원하고 달콤해~ 여름 최고! 🌻', seasonal: true },
  goguma: { name: '군고구마', emoji: '🍠', price: 3, full: 30, energy: 10, desc: '드럼통에서 노릇노릇 구운 군고구마', line: '앗 뜨거! 호호~ 달달하다 🍂', seasonal: true },
  cocoa: { name: '마시멜로 코코아', emoji: '☕', price: 3, full: 15, energy: 25, desc: '마시멜로를 동동 띄운 따끈한 코코아', line: '몸이 사르르 녹는다~ ⛄', seasonal: true },
};
function foodModel(key) {
  const g = new THREE.Group();
  if (key === 'tteok') {
    add(new THREE.CylinderGeometry(0.42, 0.3, 0.25, 16), 0xffffff, 0, 0.12, 0, g);
    add(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 16), 0xe8452c, 0, 0.24, 0, g, false);
    for (let i = 0; i < 6; i++) {
      const c = add(new THREE.CylinderGeometry(0.06, 0.06, 0.28, 8), 0xff7b5c, Math.cos(i) * 0.2, 0.3, Math.sin(i * 1.7) * 0.2, g, false);
      c.rotation.set(Math.PI / 2, 0, i);
    }
  } else if (key === 'fish') {
    const b = add(new THREE.SphereGeometry(0.32, 16, 12), 0xe0a255, 0, 0.2, 0, g);
    b.scale.set(1.3, 0.8, 0.45);
    const tail = add(new THREE.ConeGeometry(0.22, 0.35, 4), 0xd08e45, -0.5, 0.2, 0, g);
    tail.rotation.z = Math.PI / 2;
    tail.scale.z = 0.4;
    add(new THREE.SphereGeometry(0.04, 6, 6), 0x5a3e34, 0.28, 0.27, 0.13, g, false);
  } else if (key === 'cotton') {
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), 0xfff1df, 0, 0.4, 0, g);
    for (const [x, y, z, r] of [[0, 0.95, 0, 0.32], [0.18, 0.85, 0.1, 0.22], [-0.17, 0.88, -0.05, 0.24], [0, 1.15, 0, 0.2]]) add(new THREE.SphereGeometry(r, 14, 10), 0xffb8d8, x, y, z, g);
  } else if (key === 'mochi') {
    add(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16), 0xffffff, 0, 0.03, 0, g);
    for (const x of [-0.17, 0.17]) {
      add(new THREE.SphereGeometry(0.2, 14, 10), 0xfff6fa, x, 0.2, 0, g).scale.y = 0.8;
      add(new THREE.SphereGeometry(0.09, 10, 8), 0xff4d6d, x, 0.36, 0.05, g, false);
    }
  } else if (key === 'hwachae') {
    add(new THREE.CylinderGeometry(0.42, 0.3, 0.3, 16), 0xe8f6ff, 0, 0.15, 0, g);
    add(new THREE.CylinderGeometry(0.39, 0.39, 0.03, 16), 0xffb3c6, 0, 0.29, 0, g, false);
    for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.08, 8, 6), i % 2 ? 0xff5a6e : 0xffffff, Math.cos(i) * 0.22, 0.32, Math.sin(i) * 0.22, g, false);
  } else if (key === 'goguma') {
    const b = add(new THREE.CapsuleGeometry(0.16, 0.35, 6, 10), 0x8a3f5c, 0, 0.2, 0, g);
    b.rotation.z = Math.PI / 2;
    add(new THREE.SphereGeometry(0.15, 10, 8), 0xffc23d, 0.25, 0.24, 0, g, false).scale.set(0.5, 1, 1);
  } else if (key === 'cocoa') {
    add(new THREE.CylinderGeometry(0.25, 0.22, 0.45, 16), 0xff8fb1, 0, 0.23, 0, g);
    add(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16), 0x8a5a3c, 0, 0.44, 0, g, false);
    add(new THREE.TorusGeometry(0.11, 0.035, 6, 12), 0xff8fb1, 0.28, 0.25, 0, g, false);
    for (const [x, z] of [[0.06, 0.04], [-0.07, -0.03]]) add(new THREE.BoxGeometry(0.1, 0.08, 0.1), 0xffffff, x, 0.48, z, g, false);
  } else {
    add(new THREE.CylinderGeometry(0.4, 0.28, 0.28, 16), 0xb8e6ff, 0, 0.14, 0, g);
    add(new THREE.SphereGeometry(0.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0xfffaf4, 0, 0.28, 0, g);
    add(new THREE.SphereGeometry(0.15, 10, 8), 0x9c4a4a, 0, 0.66, 0, g);
    add(new THREE.SphereGeometry(0.09, 8, 6), 0xff5a6e, 0.18, 0.55, 0.12, g);
  }
  return g;
}

const interactables = [];
function interact(o) { interactables.push(o); return o; }

const stallKeepers = [];
function stall(x, z, rotY, color, foodKey, keeperOpts) {
  const food = FOODS[foodKey];
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
  add(new THREE.BoxGeometry(3.8, 1.1, 1.4), 0xf2d3a8, 0, 0.55, 0, g);
  add(new THREE.BoxGeometry(3.82, 0.6, 0.05), color, 0, 0.6, 0.72, g);
  add(new THREE.BoxGeometry(4, 0.12, 1.6), 0xd69a6a, 0, 1.14, 0, g);
  for (const px of [-1.8, 1.8]) for (const pz of [-0.7, 0.7]) add(new THREE.CylinderGeometry(0.07, 0.07, 2.8, 6), 0xb07a56, px, 1.4, pz, g);
  for (let i = 0; i < 7; i++) {
    const s = add(new THREE.BoxGeometry(4.2 / 7 + 0.01, 0.12, 2.1), i % 2 ? 0xffffff : color, -2.1 + 4.2 / 14 + (i * 4.2) / 7, 2.85, 0.15, g);
    s.rotation.x = 0.18;
  }
  for (let i = 0; i < 7; i++) {
    const s = add(new THREE.ConeGeometry(0.3, 0.3, 3), i % 2 ? 0xffffff : color, -2.1 + 4.2 / 14 + (i * 4.2) / 7, 2.55, 1.2, g, false);
    s.rotation.x = Math.PI;
  }
  const sign = signPlane(`${food.emoji} ${food.name}`, 2.4, { font: 90 });
  sign.position.set(0, 3.5, 0.3);
  g.add(sign);
  const m1 = foodModel(foodKey); m1.position.set(-0.9, 1.2, 0.2); g.add(m1);
  const m2 = foodModel(foodKey); m2.position.set(0.9, 1.2, 0.25); m2.rotation.y = 1; g.add(m2);
  const k = makeCreature(keeperOpts);
  k.root.position.set(0, 0, -1.3);
  g.add(k.root);
  stallKeepers.push(k);
  const front = new THREE.Vector3(0, 0, 2.4).applyAxisAngle(UP, rotY).add(g.position);
  collide(x, z, 2.1);
  collide(x + Math.sin(rotY + Math.PI / 2) * 1.4, z + Math.cos(rotY + Math.PI / 2) * 1.4, 1.3);
  collide(x - Math.sin(rotY + Math.PI / 2) * 1.4, z - Math.cos(rotY + Math.PI / 2) * 1.4, 1.3);
  interact({ x: front.x, z: front.z, r: 2.6, label: `${food.name} 사 먹기`, action: () => openFoodMenu(foodKey), speaker: k });
}
stall(19, -6.5, 0, 0xff8f8f, 'tteok', { color: 0xffe0b8, ears: 'bear' });
stall(28, -6.5, 0, 0xffc46b, 'fish', { color: 0xfff6ee, ears: 'cat', accent: 0xffa3b8 });
stall(37, -6.5, 0, 0xffa6d0, 'cotton', { color: 0xffd6e6, ears: 'bunny', accent: 0xff8fb1 });
stall(46, -6.5, 0, 0x8fd3ff, 'bingsu', { color: 0xe4f2ff, ears: 'bear', accent: 0x9fd0ff });
{
  const posts = [[14, 3.2], [25, 3.2], [36, 3.2], [47, 3.2]].map(([x, z]) => post(x, z, 3.6));
  const postsN = [[14, -3.4], [25, -3.4], [36, -3.4], [47, -3.4]].map(([x, z]) => post(x, z, 3.6));
  for (let i = 0; i < 3; i++) { lanternString(posts[i], posts[i + 1], 8); lanternString(postsN[i], postsN[i + 1], 8); }
  for (let i = 0; i < 4; i++) lanternString(postsN[i], posts[i], 5, 0.4);
  glowLight(22, 3, 0, 0xffb070, 16);
  glowLight(40, 3, 0, 0xffb070, 16);
  // 피크닉 테이블
  const umbrellaMat = toon({ map: stripeTexture('#ff8fb1', '#ffffff', 10) });
  const umbrellaMat2 = toon({ map: stripeTexture('#8fd3ff', '#ffffff', 10) });
  for (const [tx, tz, um2] of [[22, 8.5, 0], [33, 9, 1], [43, 8.5, 0]]) {
    add(new THREE.CylinderGeometry(1.2, 1.2, 0.12, 20), 0xffffff, tx, 1.0, tz);
    add(new THREE.CylinderGeometry(0.12, 0.12, 1, 8), 0xb07a56, tx, 0.5, tz);
    add(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6), 0xb07a56, tx, 1.6, tz);
    add(new THREE.ConeGeometry(2, 0.8, 10), um2 ? umbrellaMat2 : umbrellaMat, tx, 3.4, tz);
    collide(tx, tz, 1.4);
    for (const a of [0.4, 2.5, 4.6]) add(new THREE.CylinderGeometry(0.35, 0.35, 0.5, 12), 0xffd98a, tx + Math.cos(a) * 1.8, 0.25, tz + Math.sin(a) * 1.8);
  }
}

/* =========================================================
   😴 낮잠 언덕 (서쪽)
   ========================================================= */
const HAMMOCK = { x: -35.5, z: 3.5 };
let hammockMesh;
{
  tree(-43, 0.5, 1.9);
  tree(-46, 9, 1.3, 'pink');
  const a = post(-35.5, -0.2, 2.6), b = post(-35.5, 7.2, 2.6);
  const cy = groundY(HAMMOCK.x, HAMMOCK.z) + 1.0;
  hammockMesh = new THREE.Group();
  hammockMesh.position.set(HAMMOCK.x, cy, HAMMOCK.z);
  scene.add(hammockMesh);
  const hm = add(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon({ map: stripeTexture('#ffd98a', '#ff9fbf', 12), side: THREE.DoubleSide }), 0, 0.25, 0, hammockMesh);
  hm.scale.set(0.95, 0.45, 2.9);
  rod(a.clone().setY(a.y - 0.1), new THREE.Vector3(HAMMOCK.x, cy + 0.25, HAMMOCK.z - 2.8), 0.035, 0xfff1df);
  rod(b.clone().setY(b.y - 0.1), new THREE.Vector3(HAMMOCK.x, cy + 0.25, HAMMOCK.z + 2.8), 0.035, 0xfff1df);
  // 베개
  const pillow = add(new THREE.SphereGeometry(0.4, 14, 10), 0xffffff, 0, 0.15, -2.0, hammockMesh);
  pillow.scale.set(1.3, 0.5, 0.8);
  // 돗자리
  const blanketTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#ffffff' : '#ffaec9'; g.fillRect(i * 16, j * 16, 16, 16); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
  })();
  terrainPatch(4, 3, -40.5, 8.5, toon({ map: blanketTex }), 0.05);
  const basket = add(new THREE.CylinderGeometry(0.45, 0.35, 0.45, 12), 0xd69a6a, -41.5, groundY(-41.5, 8) + 0.3, 8);
  add(new THREE.TorusGeometry(0.4, 0.04, 6, 16, Math.PI), 0xb07a56, -41.5, basket.position.y + 0.2, 8, scene, false);
  const sign = signPlane('😴 낮잠 언덕', 2.6, { font: 86, border: '#b8e6ff' });
  const sx = -29.5, sz = -1;
  add(new THREE.CylinderGeometry(0.1, 0.1, 2, 6), 0xb07a56, sx, 1, sz);
  sign.position.set(sx, 2.2, sz + 0.06);
  sign.rotation.y = 0.6;
  scene.add(sign);
  interact({ x: -33.4, z: HAMMOCK.z, r: 2.8, label: '해먹에서 낮잠 자기', action: () => startNap() });
}
// 반딧불이
const fireflyGeo = new THREE.BufferGeometry();
const FIREFLIES = 60;
const fireflyBase = [];
{
  const p = new Float32Array(FIREFLIES * 3);
  for (let i = 0; i < FIREFLIES; i++) {
    const a = Math.random() * Math.PI * 2, d = Math.random() * 16;
    const x = HILL.x + Math.cos(a) * d + 3, z = HILL.z + Math.sin(a) * d;
    fireflyBase.push([x, groundY(x, z) + rr(0.6, 3), z, Math.random() * 10]);
  }
  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(p, 3));
}
const fireflyMat = new THREE.PointsMaterial({ color: 0xeaff8a, size: 0.35, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
scene.add(new THREE.Points(fireflyGeo, fireflyMat));

/* =========================================================
   🛍️ 포근 잡화점 (북동쪽)
   ========================================================= */
const SHOP_ITEMS = [
  { id: 'straw', name: '밀짚모자', emoji: '👒', price: 6, slot: 'hat' },
  { id: 'ribbon', name: '분홍 리본', emoji: '🎀', price: 4, slot: 'hat' },
  { id: 'crown', name: '반짝 왕관', emoji: '👑', price: 12, slot: 'hat' },
  { id: 'flower', name: '꽃 머리핀', emoji: '🌼', price: 3, slot: 'hat' },
  { id: 'glasses', name: '동글 선글라스', emoji: '🕶️', price: 5, slot: 'face' },
  { id: 'balloon', name: '하트 풍선', emoji: '🎈', price: 5, slot: 'hand' },
  { id: 'parasol', name: '레이스 양산', emoji: '⛱️', price: 7, slot: 'hand' },
  // 축제 경품 (가게에서는 팔지 않아요)
  { id: 'fishbag', name: '금붕어 봉지', emoji: '🐠', price: 0, slot: 'hand', prize: true },
  { id: 'starband', name: '별 머리띠', emoji: '⭐', price: 0, slot: 'hat', prize: true },
  { id: 'catmask', name: '고양이 가면', emoji: '😺', price: 0, slot: 'face', prize: true },
  // 계절 축제 한정 (토큰으로 교환)
  { id: 'blossom', name: '벚꽃 화관', emoji: '🌸', price: 0, slot: 'hat', prize: true },
  { id: 'melonhat', name: '수박 모자', emoji: '🍉', price: 0, slot: 'hat', prize: true },
  { id: 'beret', name: '단풍 베레모', emoji: '🍁', price: 0, slot: 'hat', prize: true },
  { id: 'knithat', name: '방울 털모자', emoji: '🧶', price: 0, slot: 'hat', prize: true },
  // 친구와 단짝이 되면 받아요
  { id: 'bffheart', name: '단짝 하트 스티커', emoji: '💗', price: 0, slot: 'face', prize: true },
];
function itemModel(id) {
  const g = new THREE.Group();
  if (id === 'straw') {
    add(new THREE.CylinderGeometry(0.95, 0.95, 0.05, 28), 0xf3d27a, 0, 0, 0, g);
    add(new THREE.CylinderGeometry(0.46, 0.52, 0.38, 22), 0xf3d27a, 0, 0.2, 0, g);
    add(new THREE.CylinderGeometry(0.53, 0.53, 0.1, 22), 0xff6f91, 0, 0.07, 0, g, false);
    g.rotation.x = -0.15;
  } else if (id === 'ribbon') {
    for (const s of [-1, 1]) {
      const c = add(new THREE.ConeGeometry(0.2, 0.42, 4), 0xff7fa8, s * 0.2, 0, 0, g);
      c.rotation.z = (s * Math.PI) / 2;
      c.scale.z = 0.45;
    }
    add(new THREE.SphereGeometry(0.1, 10, 8), 0xff5f90, 0, 0, 0, g);
    g.position.set(0.32, -0.02, 0.15);
    g.rotation.z = -0.4;
  } else if (id === 'crown') {
    add(new THREE.CylinderGeometry(0.36, 0.33, 0.28, 10, 1, true), toon({ color: 0xffd34d, emissive: 0x8a5a00, emissiveIntensity: 0.2, side: THREE.DoubleSide }), 0, 0.08, 0, g);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      add(new THREE.ConeGeometry(0.08, 0.2, 6), 0xffd34d, Math.cos(a) * 0.34, 0.3, Math.sin(a) * 0.34, g, false);
      add(new THREE.SphereGeometry(0.05, 8, 6), i % 2 ? 0xff6f91 : 0x7fd3ff, Math.cos(a) * 0.35, 0.08, Math.sin(a) * 0.35, g, false);
    }
    g.position.y = -0.05;
  } else if (id === 'flower') {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      add(new THREE.SphereGeometry(0.1, 8, 6), 0xffffff, Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0, g, false).scale.z = 0.5;
    }
    add(new THREE.SphereGeometry(0.08, 8, 6), 0xffd166, 0, 0, 0.03, g, false);
    g.position.set(-0.38, -0.12, 0.3);
    g.rotation.y = -0.6;
  } else if (id === 'glasses') {
    for (const s of [-1, 1]) {
      const l = add(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 18), 0x3b2a3f, s * 0.22, 0, 0.02, g, false);
      l.rotation.x = Math.PI / 2;
      const f = add(new THREE.TorusGeometry(0.15, 0.03, 6, 18), 0xff8fb1, s * 0.22, 0, 0.04, g, false);
    }
    add(new THREE.BoxGeometry(0.16, 0.03, 0.03), 0xff8fb1, 0, 0.03, 0.04, g, false);
  } else if (id === 'balloon') {
    const heart = new THREE.Shape();
    heart.moveTo(0, -0.45);
    heart.bezierCurveTo(-0.15, -0.3, -0.5, -0.1, -0.5, 0.15);
    heart.bezierCurveTo(-0.5, 0.42, -0.2, 0.5, 0, 0.3);
    heart.bezierCurveTo(0.2, 0.5, 0.5, 0.42, 0.5, 0.15);
    heart.bezierCurveTo(0.5, -0.1, 0.15, -0.3, 0, -0.45);
    const geo = new THREE.ExtrudeGeometry(heart, { depth: 0.2, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.1, bevelSegments: 4 });
    geo.center();
    const bal = add(geo, toon({ color: 0xff6f91, emissive: 0xff3f70, emissiveIntensity: 0.15 }), 0, 2.2, 0, g);
    bal.name = 'bal';
    rod(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1.75, 0), 0.012, 0xffffff, g);
  } else if (id === 'parasol') {
    add(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), 0xffffff, 0, 0.8, 0, g, false);
    const top = add(new THREE.ConeGeometry(1.1, 0.45, 12), toon({ map: stripeTexture('#ffd6e2', '#ffffff', 12) }), 0, 1.75, 0, g);
    top.castShadow = true;
    add(new THREE.SphereGeometry(0.06, 8, 6), 0xff8fb1, 0, 2.0, 0, g, false);
  } else if (id === 'fishbag') {
    const bag = add(new THREE.SphereGeometry(0.32, 16, 12), new THREE.MeshToonMaterial({ color: 0xcff3ff, transparent: true, opacity: 0.45, gradientMap: gradTex }), 0, -0.15, 0.1, g, false);
    bag.scale.set(1, 1.15, 1);
    const f = add(new THREE.SphereGeometry(0.1, 10, 8), 0xff7a3d, 0, -0.18, 0.1, g, false);
    f.scale.set(1.5, 0.9, 0.7);
    add(new THREE.ConeGeometry(0.07, 0.12, 4), 0xff7a3d, -0.17, -0.18, 0.1, g, false).rotation.z = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.06, 0.1, 0.12, 8), 0xff6f91, 0, 0.2, 0.1, g, false);
  } else if (id === 'starband') {
    const band = add(new THREE.TorusGeometry(0.5, 0.04, 6, 24, Math.PI), 0xff8fb1, 0, -0.1, 0, g, false);
    band.rotation.y = Math.PI / 2;
    const star = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.09 : 0.2;
      i ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    for (const sx of [-0.25, 0.25]) {
      add(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 4), 0xffffff, sx, 0.18, 0, g, false);
      const st = add(new THREE.ExtrudeGeometry(star, { depth: 0.06, bevelEnabled: false }), toon({ color: 0xffd34d, emissive: 0xffb000, emissiveIntensity: 0.3 }), sx, 0.38, -0.03, g, false);
    }
  } else if (id === 'blossom') {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      add(new THREE.SphereGeometry(0.1, 8, 6), i % 2 ? 0xffc4d8 : 0xffffff, Math.cos(a) * 0.48, -0.08, Math.sin(a) * 0.48, g, false);
    }
    for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.06, 6, 4), 0x9fe38a, Math.cos(i * 1.3 + 0.3) * 0.5, -0.08, Math.sin(i * 1.3 + 0.3) * 0.5, g, false);
  } else if (id === 'melonhat') {
    const shell = add(new THREE.SphereGeometry(0.55, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon({ map: melonTex }), 0, -0.12, 0, g);
    shell.scale.y = 0.8;
    add(new THREE.CylinderGeometry(0.56, 0.56, 0.06, 18), 0xff5a6e, 0, -0.12, 0, g, false);
    add(new THREE.CylinderGeometry(0.03, 0.02, 0.2, 5), 0x6a8a3c, 0, 0.36, 0, g, false);
  } else if (id === 'beret') {
    const b = add(new THREE.SphereGeometry(0.55, 18, 10), 0xe8663d, 0.08, 0.05, 0, g);
    b.scale.set(1, 0.32, 1);
    b.rotation.z = -0.2;
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 5), 0x8a3f2c, 0.08, 0.22, 0, g, false);
  } else if (id === 'knithat') {
    const h = add(new THREE.SphereGeometry(0.6, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0xff6f6f, 0, -0.2, 0, g);
    h.scale.y = 1.05;
    add(new THREE.CylinderGeometry(0.62, 0.62, 0.2, 18), 0xffffff, 0, -0.17, 0, g);
    add(new THREE.SphereGeometry(0.17, 12, 10), 0xffffff, 0, 0.45, 0, g);
  } else if (id === 'bffheart') {
    const hs = new THREE.Shape();
    hs.moveTo(0, -0.1);
    hs.bezierCurveTo(-0.03, -0.07, -0.11, -0.02, -0.11, 0.03);
    hs.bezierCurveTo(-0.11, 0.09, -0.04, 0.11, 0, 0.06);
    hs.bezierCurveTo(0.04, 0.11, 0.11, 0.09, 0.11, 0.03);
    hs.bezierCurveTo(0.11, -0.02, 0.03, -0.07, 0, -0.1);
    const h = add(new THREE.ExtrudeGeometry(hs, { depth: 0.03, bevelEnabled: false }), toon({ color: 0xff5f90, emissive: 0xff3f70, emissiveIntensity: 0.25 }), 0.4, -0.16, -0.12, g, false);
    h.rotation.y = 0.65;
  } else if (id === 'catmask') {
    const face = add(new THREE.SphereGeometry(0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), 0xffffff, 0.3, 0.3, 0.02, g, false);
    face.rotation.set(Math.PI / 2, 0, -0.5);
    face.scale.set(1, 0.4, 0.9);
    for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.08, 0.15, 4), 0xffffff, 0.3 + s * 0.15, 0.55, 0.05, g, false).rotation.z = -s * 0.3 - 0.5;
    add(new THREE.SphereGeometry(0.035, 6, 6), 0xff5a6e, 0.33, 0.27, 0.15, g, false);
    for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.05, 8, 6), 0xff8fb1, 0.3 + s * 0.15, 0.22, 0.1, g, false);
  }
  return g;
}
{
  const g = new THREE.Group();
  g.position.set(22, 0, -26);
  scene.add(g);
  add(new THREE.BoxGeometry(10, 4.2, 6), 0xffe0ea, 0, 2.1, 0, g);
  add(new THREE.BoxGeometry(10.4, 0.4, 6.4), 0xffffff, 0, 4.3, 0, g);
  const roof = add(new THREE.CylinderGeometry(0.01, 4.3, 2.8, 4, 1), 0xff9fbf, 0, 5.9, 0, g);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.75, 1, 1.1);
  add(new THREE.BoxGeometry(1.8, 2.6, 0.15), 0xb07a56, 0, 1.3, 3.02, g);
  add(new THREE.BoxGeometry(1.4, 1.6, 0.05), windowMat, 0, 1.6, 3.1, g);
  for (const wx of [-3.2, 3.2]) {
    add(new THREE.BoxGeometry(2.6, 1.8, 0.12), windowMat, wx, 2, 3.02, g);
    add(new THREE.BoxGeometry(2.9, 0.18, 0.4), 0xffffff, wx, 1.05, 3.1, g);
    // 진열 상품
    const it = itemModel(wx < 0 ? 'straw' : 'crown');
    it.position.set(wx, 1.4, 3.3);
    it.scale.setScalar(0.9);
    g.add(it);
  }
  for (let i = 0; i < 10; i++) {
    const s = add(new THREE.BoxGeometry(1.0, 0.1, 1.5), i % 2 ? 0xffffff : 0x9fe3c8, -4.5 + i, 3.55, 3.6, g);
    s.rotation.x = 0.35;
  }
  const sign = signPlane('🛍️ 포근 잡화점', 5, { w: 640, h: 160, font: 80, border: '#9fe3c8' });
  sign.position.set(0, 4.25, 3.5);
  g.add(sign);
  for (const bx of [-5.8, 5.8]) {
    add(new THREE.CylinderGeometry(0.4, 0.32, 0.6, 12), 0xffffff, bx, 0.3, 3.4, g);
    add(new THREE.SphereGeometry(0.55, 12, 10), 0x8bd66f, bx, 0.9, 3.4, g);
  }
  const SX = 22, SZ = -26;
  collide(SX - 3, SZ, 3.4); collide(SX + 3, SZ, 3.4); collide(SX, SZ, 3.2);
  collide(SX - 5.8, SZ + 3.4, 0.6); collide(SX + 5.8, SZ + 3.4, 0.6);
  const keeper = makeCreature({ color: 0xd8f5e8, ears: 'bunny', accent: 0xff9fbf });
  keeper.root.position.set(SX - 2.4, 0, SZ + 4.3);
  keeper.root.rotation.y = 0.3;
  scene.add(keeper.root);
  stallKeepers.push(keeper);
  collide(SX - 2.4, SZ + 4.3, 0.8);
  const ribbon = itemModel('ribbon'); keeper.hatSlot.add(ribbon);
  interact({ x: SX, z: SZ + 5.6, r: 2.8, label: '잡화점 둘러보기', action: () => openShopMenu(), speaker: keeper });
}
