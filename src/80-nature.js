/* =========================================================
   집 · 나무 · 꽃 · 구름
   ========================================================= */
const HOUSES = [
  [-12, -26, 0.4, 0xfff1d6, 0xff9f8f], [38, -21, -0.3, 0xe4f2ff, 0x8fb8ff], [11, 30, -0.2, 0xffe8f0, 0xc39bff],
  [-24, -40, 0.4, 0xeafff0, 0x7fcf9f], [8, 52, -0.1, 0xe4f2ff, 0xffb86b], [-24, 42, 0.3, 0xffe8f0, 0x8fb8ff],
  [-8, 44, 0.1, 0xeafff0, 0xffb86b], [12, 42, -0.2, 0xfff6c8, 0x7fcf9f],
];
HOUSES.forEach(([x, z, r, w, rf]) => house(x, z, r, w, rf));

const avoid = [
  [0, 0, 11], [0, -36, 9], [POND.x, POND.z, POND.r + 2.5], [32, -1, 14], [HAMMOCK.x, HAMMOCK.z, 6], [-41, 8, 4],
  [22, -24, 9], ...HOUSES.map(([x, z]) => [x, z, 5]), [-43, 0.5, 3], [-46, 9, 3], ...AVOID,
  ...RAMPS.map((r) => [r.x + r.dx * 2, r.z + r.dz * 2, 4]),
];
const free = (x, z, m = 0) => avoid.every(([ax, az, ar]) => Math.hypot(x - ax, z - az) > ar + m) && !nearPath(x, z, 3.2) && Math.hypot(x, z) < ISLAND_R - 3;
{
  let placed = 0, tries = 0;
  while (placed < 46 && tries < 3000) {
    tries++;
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * (ISLAND_R - 3);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (!free(x, z) || colliders.some((c) => Math.hypot(c.x - x, c.z - z) < c.r + 2.4)) continue;
    tree(x, z, rr(0.85, 1.3), rand() < 0.2 ? 'pink' : rand() < 0.5 ? 'round' : 'green');
    placed++;
  }
}
// 꽃
{
  const N = 520;
  const geo = new THREE.SphereGeometry(0.14, 8, 6);
  const im = new THREE.InstancedMesh(geo, toon({ color: 0xffffff }), N);
  const stemIm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 4), mat(0x6cbf5d), N);
  const flowerCols = [0xffffff, 0xffd166, 0xff8fb1, 0xc3a6ff, 0x9fd6ff, 0xffb86b].map((c) => new THREE.Color(c));
  const m4 = new THREE.Matrix4();
  let n = 0, tries = 0;
  while (n < N && tries < 8000) {
    tries++;
    const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * (ISLAND_R - 1.5);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (nearPath(x, z, 2.3) || Math.hypot(x, z) < 8.5 || Math.hypot(x - POND.x, z - POND.z) < POND.r + 1.5) continue;
    if (colliders.some((c) => Math.hypot(c.x - x, c.z - z) < c.r + 0.2)) continue;
    const y = groundY(x, z);
    m4.makeTranslation(x, y + 0.32, z);
    im.setMatrixAt(n, m4);
    im.setColorAt(n, flowerCols[Math.floor(Math.random() * flowerCols.length)]);
    m4.makeTranslation(x, y + 0.15, z);
    stemIm.setMatrixAt(n, m4);
    n++;
  }
  im.count = stemIm.count = n;
  scene.add(im, stemIm);
  SEASONAL.flowers.push(im, stemIm);
  // 풀숲
  const bush = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 10, 8), mat(0x86cf6a), 90);
  let k = 0; tries = 0;
  while (k < 90 && tries < 3000) {
    tries++;
    const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * (ISLAND_R - 2);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (!free(x, z, -1.5) || colliders.some((c) => Math.hypot(c.x - x, c.z - z) < c.r + 0.8)) continue;
    const s = rr(0.6, 1.2);
    m4.compose(new THREE.Vector3(x, groundY(x, z) + 0.15 * s, z), new THREE.Quaternion(), new THREE.Vector3(s * 1.3, s * 0.8, s * 1.1));
    bush.setMatrixAt(k++, m4);
  }
  bush.count = k;
  bush.castShadow = true;
  bush.receiveShadow = true;
  scene.add(bush);
  SEASONAL.bushes = bush;
}
// 섬 가장자리 울타리 (남쪽 선착장 입구는 비워둬요)
{
  const R = ISLAND_R - 0.8;
  const pt = (i) => { const a = (i / 120) * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * R, 0.65, Math.sin(a) * R); };
  const gap = (v) => Math.abs(v.x) < 2.6 && v.z > 0;
  for (let i = 0; i < 120; i++) {
    const p = pt(i), q = pt(i + 1);
    if (gap(p)) continue;
    add(new THREE.BoxGeometry(0.22, 0.9, 0.22), 0xfff1df, p.x, 0.45, p.z, scene, false);
    if (!gap(q)) rod(p, q, 0.05, 0xfff1df);
  }
}
// 구름
const clouds = [];
const cloudMat = toon({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25, transparent: true });
{
  const cm = cloudMat;
  for (let i = 0; i < 12; i++) {
    const g = new THREE.Group();
    const n = 3 + Math.floor(rand() * 3);
    for (let j = 0; j < n; j++) add(new THREE.SphereGeometry(rr(2, 3.4), 14, 10), cm, j * 2.6 - n * 1.3, rr(-0.4, 0.8), rr(-1, 1), g, false);
    g.position.set(rr(-120, 120), rr(46, 60), rr(-140, 20));
    g.userData.speed = rr(0.6, 1.4);
    scene.add(g);
    clouds.push(g);
  }
}

/* =========================================================
   코인
   ========================================================= */
const coinMat = toon({ color: 0xffcf3a, emissive: 0xffa000, emissiveIntensity: 0.35 });
const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 22);
coinGeo.rotateX(Math.PI / 2);
const coins = [];
function randomFreeSpot() {
  for (let i = 0; i < 200; i++) {
    const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * (ISLAND_R - 5);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (colliders.some((c) => Math.hypot(c.x - x, c.z - z) < c.r + 1.2)) continue;
    return [x, z];
  }
  return [3, 9];
}
for (let i = 0; i < 14; i++) {
  const m = new THREE.Mesh(coinGeo, coinMat);
  m.castShadow = true;
  scene.add(m);
  const [x, z] = randomFreeSpot();
  m.position.set(x, groundY(x, z) + 0.8, z);
  coins.push({ m, respawn: 0, base: m.position.y });
}

/* =========================================================
   마을 친구들 (NPC)
   ========================================================= */
const NPC_LINES = [
  '오늘 날씨 정말 포근하다~ ☀️',
  '북쪽 호숫가 데크에서 불꽃놀이를 볼 수 있대! 🎆',
  '붕어빵은 팥이 최고야. 슈크림도 좋지만!',
  '언덕 위 해먹에서 낮잠 자면 기운이 펄펄 나~',
  '반짝이는 코인 봤어? 모으면 잡화점에서 쇼핑할 수 있어!',
  '잡화점 밀짚모자, 너한테 잘 어울릴 것 같아 👒',
  '밤이 되면 언덕에 반딧불이가 날아다녀 ✨',
  '솜사탕 먹으면 기분이 구름처럼 둥실둥실~',
  '바람이 살랑살랑… 산책하기 딱 좋다!',
  '남쪽 선착장에서 낚시해 봤어? 무지개 물고기도 있대! 🌈',
  '해바라기 미로 막다른 길에 수박이 숨어 있대 🍉',
  '온천에 카피바라가 살아. 머리에 유자를 올리고 있어 ♨️',
  '회전목마 타 봤어? 빙글빙글 신나! 🎠',
  '광장 우체통에 편지가 와 있을지도 몰라 📮',
  '자전거 타고 점프대를 달려 봐! 붕~ 날아 🚲',
  '곤충은 살금살금 걸어서 다가가야 잡을 수 있어 🐞',
  '네 집 가구 카탈로그 봤어? 곰인형 진짜 귀엽더라 🧸',
];
const npcs = [
  { name: '모모', opts: { color: 0xffd6e6, ears: 'cat', accent: 0xff8fb1 }, home: [-10, 10] },
  { name: '콩이', opts: { color: 0xfff1c8, ears: 'bear', accent: 0xffb070 }, home: [12, -10] },
  { name: '보리', opts: { color: 0xe0f0ff, ears: 'bunny', accent: 0x9fb8ff }, home: [-14, -28] },
  { name: '솜이', opts: { color: 0xffffff, ears: 'cat', accent: 0xffb4c8 }, home: [6, 24] },
  { name: '두부', opts: { color: 0xe9ffe0, ears: 'bear', accent: 0x9fe3c8 }, home: [-24, 8] },
].map((n) => {
  const c = makeCreature({ ...n.opts, scale: 0.85 });
  c.root.position.set(n.home[0], 0, n.home[1]);
  scene.add(c.root);
  const npc = { ...n, c, target: null, wait: Math.random() * 3, talk: 0 };
  interact({
    get x() { return c.root.position.x; },
    get z() { return c.root.position.z; },
    r: 2.3,
    label: `${n.name}에게 말 걸기`,
    action: () => talkTo(npc),
  });
  return npc;
});
