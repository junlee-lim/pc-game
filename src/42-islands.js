/* =========================================================
   🚤 다른 섬들 — 선착장에서 배를 타고 가요
   🌴 야자수섬 · 🍄 버섯숲섬 · 🔭 별빛섬 · 🍓 딸기섬
   ========================================================= */
Object.assign(EXTRA_BAG, {
  coco: { name: '코코넛', emoji: '🥥' },
  mushroom: { name: '숲 버섯', emoji: '🍄' },
  berry: { name: '딸기', emoji: '🍓' },
  jam: { name: '딸기 잼', emoji: '🫙' },
});
const ISL = {
  palm: { id: 'palm', name: '야자수섬', emoji: '🌴', warm: true, desc: '야자수 그늘, 모래성, 비치볼, 코코넛', x: 150, z: 140, r: 34, ground: 0xf2dca0, side: 0xd9a878, mapColor: '#f2dca0' },
  mush: { id: 'mush', name: '버섯숲섬', emoji: '🍄', desc: '거대한 버섯 숲과 부엉 할머니 (밤엔 버섯이 반짝)', x: -160, z: 120, r: 36, ground: 0x86c46e, side: 0x9a7a5a, mapColor: '#86c46e' },
  star: { id: 'star', name: '별빛섬', emoji: '🔭', desc: '언덕 위 천문대에서 별자리 찾기', x: -150, z: -150, r: 32, ground: 0xb5dfa0, side: 0xc9b08a, mapColor: '#b5dfa0' },
  berry: { id: 'berry', name: '딸기섬', emoji: '🍓', desc: '딸기 농장, 풍차, 딸기 우유', x: 160, z: -140, r: 34, ground: 0x9fd87a, side: 0xd9a878, mapColor: '#9fd87a' },
};
ISL.star.hill = { x: ISL.star.x, z: ISL.star.z - 4, r: 20, h: 5 };
const islPos = (I, lx, lz) => [I.x + lx, I.z + lz];
const boats = [];

/* ---------- 섬 땅 ---------- */
for (const I of Object.values(ISL)) {
  I.groundMesh = add(new THREE.CylinderGeometry(I.r, I.r, 1, 56), toon({ color: I.ground }), I.x, -0.5, I.z, scene, false);
  add(new THREE.CylinderGeometry(I.r + 0.3, I.r - 5, 6, 56), I.side, I.x, -4, I.z, scene, false);
  add(new THREE.CylinderGeometry(I.r + 0.6, I.r + 0.6, 0.5, 56), 0xf6e3b4, I.x, -0.65, I.z, scene, false);
  I.marks = [];
  ISLANDS.push(I);
  ZONE_LABELS.push([`${I.emoji} ${I.name}`, I.x, 12, I.z]);
  // 배가 닿는 곳 (본섬 쪽을 바라보는 해변)
  const a = Math.atan2(-I.z, -I.x), dx = Math.cos(a), dz = Math.sin(a);
  I.arrive = { x: I.x + dx * (I.r - 4), z: I.z + dz * (I.r - 4), rot: Math.atan2(-dx, -dz) };
  const dock = add(new THREE.BoxGeometry(2.4, 0.25, 6), 0xd9a878, I.x + dx * (I.r + 1), 0.15, I.z + dz * (I.r + 1));
  dock.rotation.y = Math.atan2(dx, dz);
  const boatI = makeBoat(0x9fd6ff);
  boatI.position.set(I.x + dx * (I.r + 3.2) + dz * 2.2, -1.55, I.z + dz * (I.r + 3.2) - dx * 2.2);
  boatI.rotation.y = Math.atan2(dx, dz);
  I.marks.push(['🚤', I.x + dx * (I.r - 3), I.z + dz * (I.r - 3)]);
  interact({ x: I.arrive.x + dx * 1.2, z: I.arrive.z + dz * 1.2, r: 2.2, label: '🚤 배 타기 (다른 섬 · 포근섬으로)', action: () => openFerry(I.id) });
}
if (ISL.star.hill) {
  const H = ISL.star.hill, s = H.r * 2 + 2;
  const geo = new THREE.PlaneGeometry(s, s, 48, 48);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + H.x, z = pos.getZ(i) + H.z;
    pos.setY(i, Math.hypot(x - H.x, z - H.z) < H.r ? groundY(x, z) + 0.01 : -0.1);
  }
  geo.computeVertexNormals();
  ISL.star.hillMesh = add(geo, toon({ color: 0xc6e8b0 }), H.x, 0, H.z, scene, false);
}

/* ---------- 배 ---------- */
function makeBoat(color) {
  const g = new THREE.Group();
  const hull = add(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon({ color, side: THREE.DoubleSide }), 0, 0.5, 0, g);
  hull.scale.set(1.4, 0.8, 3);
  add(new THREE.BoxGeometry(2.3, 0.12, 4.6), 0xfff1df, 0, 0.45, 0, g);
  add(new THREE.BoxGeometry(1.6, 1.1, 1.4), 0xffffff, 0, 1.05, -0.6, g);
  add(new THREE.BoxGeometry(1.8, 0.15, 1.6), 0xff8fb1, 0, 1.65, -0.6, g);
  add(new THREE.CylinderGeometry(0.15, 0.15, 0.6, 10), 0xff6f6f, 0, 1.95, -0.6, g);
  for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.22, 0.07, 6, 14), 0xff6f6f, s * 1.38, 0.6, 0.6, g, false).rotation.y = Math.PI / 2;
  scene.add(g);
  boats.push(g);
  return g;
}
// 본섬 선착장 옆 여객선
{
  const b = makeBoat(0xffd166);
  b.position.set(PIER.x - PIER.w / 2 - 1.9, -1.55, 63);
  interact({ x: PIER.x - 0.6, z: 63, r: 1.7, label: '🚤 배 타고 다른 섬 가기', action: () => openFerry('main') });
  MAP_MARKS.push(['🚤', -4, 58]);
}
tickers.push(() => boats.forEach((b, i) => { b.position.y = -1.55 + Math.sin(elapsed * 1.3 + i) * 0.07; b.rotation.z = Math.sin(elapsed * 0.9 + i) * 0.04; }));

function openFerry(fromId) {
  sfx.ok();
  const dests = [ISLANDS[0], ...Object.values(ISL)].filter((I) => I.id !== fromId);
  openMenu({
    title: '🚤 통통배 선착장',
    desc: () => '어느 섬으로 갈까요? 배는 공짜예요!',
    items: () => [
      ...dests.map((I) => ({ label: `${I.emoji} ${I.name}`, right: I.id === 'main' ? '집이 있는 섬' : I.desc, act: () => { setTimeout(() => travelTo(I), 0); return false; } })),
      { label: '그만두기', act: () => false },
    ],
  });
}
function travelTo(I) {
  tone(220, 0.5, 'triangle', 0.12); tone(220, 0.6, 'triangle', 0.12, 0, 0.6);
  fadeThen(() => {
    const a = I.id === 'main' ? { x: PIER.x, z: 61, rot: Math.PI } : I.arrive;
    player.root.position.set(a.x, groundY(a.x, a.z), a.z);
    player.root.rotation.set(0, a.rot, 0);
    camera.position.set(a.x + Math.sin(camYaw) * 16, 13, a.z + Math.cos(camYaw) * 16);
    lookAt.set(a.x, 1.4, a.z);
    toast(`🚤 통통통~ ${I.emoji} ${I.name}에 도착했어요!`, 3);
    if (follower) say(follower.c, '나도 같이 왔지롱~ 🚤', 2.4, follower.name);
  }, 900);
}

/* ---------- 섬 주민 ---------- */
function resident(I, lx, lz, rot, opts, name, lines, menuFn, hat) {
  const [x, z] = islPos(I, lx, lz);
  const c = makeCreature(opts);
  c.root.position.set(x, groundY(x, z), z);
  c.root.rotation.y = rot;
  scene.add(c.root);
  if (hat) (hat === 'glasses' ? c.faceSlot : c.hatSlot).add(itemModel(hat));
  stallKeepers.push(c);
  collide(x, z, 0.8);
  interact({ x: x + Math.sin(rot) * 1.6, z: z + Math.cos(rot) * 1.6, r: 2.0, label: `${name}에게 말 걸기`, action: () => { sfx.talk(); say(c, pick(lines), 3.2, name); if (menuFn) setTimeout(menuFn, 700); } });
  return c;
}
function sellMenu(title, desc, extra) {
  openMenu({ title, desc: () => `${desc}<br>내 코인 🪙 ${S.coins} · 가방 ${Object.entries(S.bag).filter(([k, n]) => EXTRA_BAG[k] && n).map(([k, n]) => `${EXTRA_BAG[k].emoji}×${n}`).join(' ') || '비어 있음'}`, items: () => [...extra(), { label: '그만두기', act: () => false }] });
}
const foodItem = (key) => ({ label: `${FOODS[key].emoji} ${FOODS[key].name} 사 먹기`, right: `🪙 ${FOODS[key].price}`, dim: S.coins < FOODS[key].price, act: () => { eat(key); return false; } });
const packItem = (key) => ({ label: `${FOODS[key].emoji} 포장해서 가방에 넣기 🎒`, right: `🪙 ${FOODS[key].price}`, dim: S.coins < FOODS[key].price, act: () => { if (S.coins < FOODS[key].price) { sfx.no(); return true; } S.coins -= FOODS[key].price; bagAdd(key); sfx.ok(); toast(`${FOODS[key].emoji} ${FOODS[key].name}을(를) 포장했어요`); return true; } });
const sellItem = (key, price) => ({ label: `${EXTRA_BAG[key].emoji} ${EXTRA_BAG[key].name} 팔기`, right: `개당 🪙 ${price}`, dim: !(S.bag[key] > 0), act: () => { if (!(S.bag[key] > 0)) { sfx.no(); toast(`가방에 ${EXTRA_BAG[key].name}이(가) 없어요`); return true; } bagAdd(key, -1); S.coins += price; persist(); sfx.coin(); return true; } });

/* ---------- 줍기 (코코넛 · 버섯 · 딸기) ---------- */
function pickSpot(x, z, model, key, label, respawn = 40, amount = () => 1) {
  const g = model;
  g.position.set(x, groundY(x, z), z);
  scene.add(g);
  const spot = { g, t: 0 };
  interact({
    x, z, get r() { return g.visible ? 1.6 : 0; }, label,
    action: () => {
      const n = amount();
      g.visible = false; spot.t = respawn;
      bagAdd(key, n);
      sfx.ding();
      sparkle(x, groundY(x, z) + 0.6, z, new THREE.Color(0xfff1a8), 14);
      say(player, `${EXTRA_BAG[key].emoji} ${EXTRA_BAG[key].name} ${n}개 획득!`, 1.8);
    },
  });
  tickers.push((dt) => { if (!g.visible) { spot.t -= dt; if (spot.t <= 0) g.visible = true; } });
  return spot;
}

/* ---------- 섬마다 작은 코인 ---------- */
const islCoinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 22).rotateX(Math.PI / 2);
const islCoinMat = toon({ color: 0xffcf3a, emissive: 0xffa000, emissiveIntensity: 0.35 });
const islCoins = [];
// 섬에도 길에 떨어진 동전은 없어요
for (const I of Object.values(ISL)) for (let i = 0; i < 0; i++) {
  const m = new THREE.Mesh(islCoinGeo, islCoinMat);
  m.castShadow = true;
  m.visible = false; // 첫 프레임에 각 섬 위에 놓여요
  scene.add(m);
  islCoins.push({ m, I, t: 0, base: 0 });
}
function placeIslCoin(c) {
  for (let k = 0; k < 40; k++) {
    const a = Math.random() * 6.3, d = Math.sqrt(Math.random()) * (c.I.r - 5);
    const x = c.I.x + Math.cos(a) * d, z = c.I.z + Math.sin(a) * d;
    if (colliders.some((o) => !o.off && Math.hypot(o.x - x, o.z - z) < o.r + 1)) continue;
    c.base = groundY(x, z) + 0.8; c.m.position.set(x, c.base, z); c.m.visible = true; return;
  }
}
tickers.push((dt) => {
  const pp = player.root.position;
  for (const c of islCoins) {
    if (!c.m.visible) { c.t -= dt; if (c.t <= 0) placeIslCoin(c); continue; }
    c.m.rotation.y += dt * 2.5;
    c.m.position.y = c.base + Math.sin(elapsed * 3 + c.m.position.x) * 0.15;
    if (state === 'play' && Math.hypot(c.m.position.x - pp.x, c.m.position.z - pp.z) < 1.3) {
      c.m.visible = false; c.t = rr(25, 40);
      S.coins++; persist(); sfx.coin();
      sparkle(c.m.position.x, c.m.position.y, c.m.position.z);
    }
  }
});

/* =========================================================
   🌴 야자수섬
   ========================================================= */
function palm(x, z, s = 1) {
  const y = groundY(x, z);
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rr(0, 6.3);
  scene.add(g);
  let px = 0;
  for (let i = 0; i < 6; i++) {
    add(new THREE.CylinderGeometry((0.2 - i * 0.015) * s, (0.24 - i * 0.015) * s, 0.75 * s, 8), i % 2 ? 0xb07a56 : 0xc08f63, px, (0.35 + i * 0.7) * s, 0, g);
    px += i * 0.04 * s;
  }
  const top = new THREE.Group();
  top.position.set(px, 4.3 * s, 0);
  g.add(top);
  for (let k = 0; k < 7; k++) {
    const arm = new THREE.Group();
    arm.rotation.set(0, (k / 7) * Math.PI * 2, 0);
    top.add(arm);
    const leaf = add(new THREE.SphereGeometry(1, 10, 6), k % 2 ? 0x5fbf4a : 0x7fd36a, 0, -0.3 * s, 1.2 * s, arm);
    leaf.scale.set(0.38 * s, 0.07 * s, 1.35 * s);
    leaf.rotation.x = 0.35;
  }
  for (let k = 0; k < 3; k++) add(new THREE.SphereGeometry(0.2 * s, 10, 8), 0x8a5a3c, Math.cos(k * 2.1) * 0.25 * s, -0.25 * s, Math.sin(k * 2.1) * 0.25 * s, top);
  collide(x, z, 0.5 * s);
  return { x, z };
}
{
  const I = ISL.palm;
  const grass = add(new THREE.CylinderGeometry(15, 15, 0.06, 40), 0xa8e08a, I.x, 0.03, I.z + 2, scene, false);
  I.grass = grass;
  const palms = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + rr(-0.2, 0.2), d = rr(12, I.r - 6);
    const [x, z] = islPos(I, Math.cos(a) * d, Math.sin(a) * d);
    if (Math.hypot(x - I.arrive.x, z - I.arrive.z) < 6) continue;
    palms.push(palm(x, z, rr(0.9, 1.25)));
  }
  // 떨어진 코코넛 줍기
  palms.slice(0, 6).forEach((p, i) => {
    const m = new THREE.Group();
    add(new THREE.SphereGeometry(0.28, 12, 10), 0x8a5a3c, 0, 0.25, 0, m);
    pickSpot(p.x + 1.3, p.z + 0.6, m, 'coco', '🥥 코코넛 줍기', 45);
  });
  // 파라솔 · 비치 타월 · 비치볼
  for (const [lx, lz, c] of [[-9, 10, '#ff8fb1'], [9, 12, '#8fd3ff'], [-2, 18, '#ffd166']]) {
    const [x, z] = islPos(I, lx, lz);
    add(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), 0xffffff, x, 1.3, z);
    add(new THREE.ConeGeometry(1.7, 0.6, 12), toon({ map: stripeTexture(c, '#ffffff', 12) }), x, 2.7, z);
    const towel = add(new THREE.BoxGeometry(1.2, 0.04, 2.2), toon({ map: stripeTexture(c, '#ffffff', 6) }), x + 1.2, 0.03, z + 0.4, scene, false);
    towel.rotation.y = 0.3;
    collide(x, z, 0.4);
  }
  // 모래성 쌓기
  const [sx, sz] = islPos(I, 6, 4);
  const castle = new THREE.Group();
  castle.position.set(sx, 0, sz);
  scene.add(castle);
  const sand = 0xe8c98a;
  const st = [new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group()];
  st.forEach((g) => castle.add(g));
  add(new THREE.CylinderGeometry(1.6, 1.8, 0.6, 20), sand, 0, 0.3, 0, st[0]);
  add(new THREE.CylinderGeometry(1.1, 1.2, 0.6, 16), sand, 0, 0.9, 0, st[1]);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    add(new THREE.CylinderGeometry(0.3, 0.35, 1.0, 10), sand, Math.cos(a) * 1.3, 1.0, Math.sin(a) * 1.3, st[2]);
    add(new THREE.ConeGeometry(0.38, 0.5, 10), sand, Math.cos(a) * 1.3, 1.75, Math.sin(a) * 1.3, st[2]);
  }
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5), 0xffffff, 0, 1.8, 0, st[3]);
  add(new THREE.BoxGeometry(0.02, 0.35, 0.55), 0xff6f91, 0, 2.2, 0.27, st[3]);
  for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.1, 8, 6), pick([0xffffff, 0xffc4d8, 0xffe0a0]), Math.cos(i) * 1.7, 0.6, Math.sin(i * 1.3) * 1.7, st[3], false);
  const pail = add(new THREE.CylinderGeometry(0.3, 0.24, 0.45, 12), 0xff8fb1, -2.2, 0.22, 0.8, castle);
  collide(sx, sz, 1.9);
  const today = () => `${S.season}-${S.seasonDay}`;
  const sandStage = () => (S.sandDay === today() ? S.sandStage || 0 : 0);
  const refreshCastle = () => st.forEach((g, i) => (g.visible = sandStage() > i));
  tickers.push(() => refreshCastle());
  interact({
    x: sx, z: sz + 2.8, get r() { return sandStage() < 4 ? 2.2 : 0; },
    get label() { return ['🏰 모래성 기초 다지기', '🏰 2층 쌓기', '🏰 탑 세우기', '🏰 깃발 꽂고 조개로 꾸미기'][sandStage()] || ''; },
    action: () => {
      if (S.sandDay !== today()) { S.sandDay = today(); S.sandStage = 0; }
      S.sandStage++;
      sfx.ok();
      sparkle(sx, 1.2, sz, new THREE.Color(0xfff1c8), 18);
      if (S.sandStage >= 4) { S.coins += 4; sfx.fanfare(); say(player, '짜잔~ 멋진 모래성 완성! 🏰', 3); toast('🏰 모래성 완성! 🪙 4개 (파도가 밤새 쓸어 가서 내일 또 쌓을 수 있어요)', 3.6); }
      else say(player, pick(['토닥토닥~', '영차영차!', '조심조심…']), 1.6);
      persist();
    },
  });
  ZONE_LABELS.push(['🏰 모래성', sx, 4, sz]);
  // 코코넛 주스 가게
  const [kx, kz] = islPos(I, -6, -2);
  const kiosk = new THREE.Group(); kiosk.position.set(kx, 0, kz); scene.add(kiosk);
  add(new THREE.BoxGeometry(3, 1, 1.3), 0xe8c49a, 0, 0.5, 0, kiosk);
  for (const px of [-1.4, 1.4]) add(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), 0xb07a56, px, 1.3, -0.5, kiosk);
  const thatch = add(new THREE.ConeGeometry(2.6, 1.2, 8), 0xd9b870, 0, 3.0, -0.2, kiosk);
  const ksign = signPlane('🥥 코코넛 주스', 2.2, { font: 76, border: '#ffd166' }); ksign.position.set(0, 1.9, 0.68); kiosk.add(ksign);
  collide(kx, kz, 1.8);
  resident(I, -6, -3.6, 0, { color: 0xffe0b8, ears: 'bunny', accent: 0xff9f8f }, '코코',
    ['어서 와~ 여긴 언제나 따뜻한 섬이야! 🌴', '야자수 아래 떨어진 코코넛은 마음껏 주워 가!', '모래성은 파도가 밤마다 쓸어 가. 매일 새로 쌓아 봐!'],
    () => sellMenu('🥥 코코의 주스 가게', '갓 딴 코코넛으로 만든 주스예요!', () => [foodItem('coconut'), packItem('coconut'), sellItem('coco', 2)]), 'flower');
  I.marks.push(['🏰', sx, sz], ['🥥', kx, kz]);
  ZONE_LABELS.push(['🥥 코코넛 주스', kx, 4.6, kz]);
}

/* =========================================================
   🍄 버섯숲섬
   ========================================================= */
const shroomMats = [];
function bigShroom(x, z, h, r, cap) {
  const y = groundY(x, z);
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  add(new THREE.CylinderGeometry(r * 0.25, r * 0.33, h, 12), 0xfff1df, 0, h / 2, 0, g);
  const m = toon({ color: cap, emissive: cap, emissiveIntensity: 0 });
  shroomMats.push(m);
  const c = add(new THREE.SphereGeometry(r, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, h - 0.15, 0, g);
  c.scale.y = 0.62;
  add(new THREE.CylinderGeometry(r * 0.98, r * 0.98, 0.08, 22), 0xfff6ea, 0, h - 0.15, 0, g, false);
  for (let i = 0; i < 7; i++) {
    const th = rr(0, 6.3), ph = rr(0.25, 1.2);
    add(new THREE.SphereGeometry(r * 0.13, 8, 6), 0xffffff, Math.sin(ph) * Math.cos(th) * r, h - 0.15 + Math.cos(ph) * r * 0.62, Math.sin(ph) * Math.sin(th) * r, g, false).scale.y = 0.5;
  }
  collide(x, z, r * 0.4);
  return g;
}
{
  const I = ISL.mush;
  const capCols = [0xff6f6f, 0xc3a6ff, 0x8fb8ff, 0xffb36b, 0xff8fb1];
  const spots = [];
  for (let i = 0; i < 14; i++) {
    const a = rr(0, 6.3), d = rr(6, I.r - 5);
    const [x, z] = islPos(I, Math.cos(a) * d, Math.sin(a) * d);
    if (Math.hypot(x - I.arrive.x, z - I.arrive.z) < 7 || Math.hypot(x - I.x, z - I.z - 3) < 7) continue;
    if (spots.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < 5)) continue;
    spots.push([x, z]);
    bigShroom(x, z, rr(2.2, 4.8), rr(1.4, 2.6), pick(capCols));
  }
  for (let i = 0; i < 8; i++) { const a = rr(0, 6.3), d = rr(8, I.r - 4); const [x, z] = islPos(I, Math.cos(a) * d, Math.sin(a) * d); if (!colliders.some((o) => Math.hypot(o.x - x, o.z - z) < o.r + 2.5)) tree(x, z, rr(0.9, 1.2), 'round'); }
  // 작은 버섯 따기
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2, d = rr(8, I.r - 6);
    const [x, z] = islPos(I, Math.cos(a) * d, Math.sin(a) * d);
    if (colliders.some((o) => Math.hypot(o.x - x, o.z - z) < o.r + 0.8)) continue;
    const m = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      add(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 6), 0xfff1df, (k - 1) * 0.22, 0.15, (k % 2) * 0.15, m, false);
      add(new THREE.SphereGeometry(0.18, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), pick([0xff6f6f, 0xffb36b]), (k - 1) * 0.22, 0.28, (k % 2) * 0.15, m, false);
    }
    pickSpot(x, z, m, 'mushroom', '🍄 버섯 따기', 45, () => (Math.random() < 0.3 ? 2 : 1));
  }
  // 부엉 할머니의 버섯 오두막
  const [hx, hz] = islPos(I, 0, 0);
  const hut = new THREE.Group(); hut.position.set(hx, 0, hz); scene.add(hut);
  add(new THREE.CylinderGeometry(2.4, 2.6, 3, 20), 0xfff1df, 0, 1.5, 0, hut);
  const roofM = toon({ color: 0xff6f6f, emissive: 0xff6f6f, emissiveIntensity: 0 }); shroomMats.push(roofM);
  const roof = add(new THREE.SphereGeometry(3.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), roofM, 0, 2.9, 0, hut); roof.scale.y = 0.7;
  for (let i = 0; i < 8; i++) { const th = i * 0.8, ph = 0.4 + (i % 3) * 0.3; add(new THREE.SphereGeometry(0.4, 8, 6), 0xffffff, Math.sin(ph) * Math.cos(th) * 3.6, 2.9 + Math.cos(ph) * 2.5, Math.sin(ph) * Math.sin(th) * 3.6, hut, false).scale.y = 0.5; }
  add(new THREE.BoxGeometry(1.1, 1.8, 0.1), 0x9c6a4c, 0, 0.9, 2.5, hut);
  add(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16), windowMat, 1.4, 1.9, 2.05, hut).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16), windowMat, -1.4, 1.9, 2.05, hut).rotation.x = Math.PI / 2;
  collide(hx, hz, 2.9);
  glowLight(hx, 3, hz + 4, 0xffc070, 14);
  resident(I, 2.2, 4.2, 0.3, { color: 0xc69a6b, ears: 'bear', accent: 0xffd6b0 }, '부엉 할머니',
    ['호호, 버섯숲에 온 걸 환영한단다 🍄', '밤이 되면 버섯들이 반짝반짝 빛나지~', '작은 버섯을 따 오면 내가 사 주마. 수프도 끓여 줄게!'],
    () => sellMenu('🍲 부엉 할머니의 오두막', '"따끈한 수프 한 그릇 하고 가렴~"', () => [foodItem('soup'), packItem('soup'), sellItem('mushroom', 2)]), 'glasses');
  I.marks.push(['🏠', hx, hz]);
  ZONE_LABELS.push(['🍲 부엉 할머니네', hx, 6.5, hz]);
  tickers.push(() => { const glow = clamp((tod - 0.6) / 1.2, 0, 1); shroomMats.forEach((m) => (m.emissiveIntensity = glow * 0.55)); });
}

/* =========================================================
   🔭 별빛섬 — 천문대에서 별자리 찾기
   ========================================================= */
const CONSTELLATIONS = [
  { id: 'cat', name: '고양이자리', emoji: '🐱', lines: [[[-0.6, -0.4], [-0.6, 0.3], [-0.45, 0.8], [-0.15, 0.4], [0.15, 0.4], [0.45, 0.8], [0.6, 0.3], [0.6, -0.4], [-0.6, -0.4]]] },
  { id: 'fish', name: '붕어빵자리', emoji: '🐟', lines: [[[-0.9, 0], [-0.4, 0.4], [0.3, 0.35], [0.7, 0], [0.3, -0.35], [-0.4, -0.4], [-0.9, 0]], [[0.7, 0], [1.0, 0.35], [1.0, -0.35], [0.7, 0]]] },
  { id: 'heart', name: '하트자리', emoji: '💗', lines: [Array.from({ length: 13 }, (_, i) => { const t = (i / 12) * Math.PI * 2; return [(16 * Math.sin(t) ** 3) / 18, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 18]; })] },
  { id: 'crown', name: '왕관자리', emoji: '👑', lines: [[[-0.8, -0.4], [-0.8, 0.4], [-0.4, 0], [0, 0.65], [0.4, 0], [0.8, 0.4], [0.8, -0.4], [-0.8, -0.4]]] },
  { id: 'bunny', name: '토끼자리', emoji: '🐰', lines: [[[-0.35, -0.6], [-0.45, 0.05], [-0.4, 0.9], [-0.15, 0.15], [0.15, 0.15], [0.4, 0.9], [0.45, 0.05], [0.35, -0.6], [-0.35, -0.6]]] },
  { id: 'umbrella', name: '우산자리', emoji: '☂️', lines: [[[-0.8, 0.1], [-0.55, 0.5], [0, 0.7], [0.55, 0.5], [0.8, 0.1], [-0.8, 0.1]], [[0, 0.1], [0, -0.6], [0.2, -0.75]]] },
  { id: 'melon', name: '수박자리', emoji: '🍉', lines: [[[-0.8, 0.3], [0.8, 0.3], [0, -0.7], [-0.8, 0.3]], [[-0.25, 0.05], [0.25, 0.05]]] },
  { id: 'hammock', name: '해먹자리', emoji: '😴', lines: [[[-0.9, -0.6], [-0.9, 0.5]], [[-0.9, 0.4], [-0.4, 0.05], [0.4, 0.05], [0.9, 0.4]], [[0.9, 0.5], [0.9, -0.6]]] },
];
let obsTop = new THREE.Vector3();
{
  const I = ISL.star, H = I.hill;
  const top = groundY(H.x, H.z);
  const obs = new THREE.Group(); obs.position.set(H.x, top - 0.1, H.z); scene.add(obs);
  add(new THREE.CylinderGeometry(3, 3.2, 3.2, 24), 0xfaf6ff, 0, 1.6, 0, obs);
  const dome = add(new THREE.SphereGeometry(3.05, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), 0xc9d4ff, 0, 3.2, 0, obs);
  add(new THREE.BoxGeometry(0.9, 2.8, 0.2), 0x6a7ab0, 0, 4.4, 1.9, obs).rotation.x = -0.6;
  const tube = add(new THREE.CylinderGeometry(0.32, 0.4, 3.2, 14), 0xffd166, 0, 5.0, 1.4, obs);
  tube.rotation.x = -0.7;
  add(new THREE.BoxGeometry(1.2, 2, 0.15), 0x8a6a9c, 0, 1, 3.1, obs);
  add(new THREE.SphereGeometry(0.08, 6, 6), 0xffd166, 0.35, 1, 3.2, obs, false);
  collide(H.x, H.z, 3.5);
  obsTop.set(H.x, top + 6.2, H.z + 1.5);
  const sign = signPlane('🔭 별빛 천문대', 3, { w: 640, h: 160, font: 76, border: '#c3a6ff' });
  sign.position.set(H.x + 3.6, top + 2.2, H.z + 3.8); sign.rotation.y = -0.4; scene.add(sign);
  add(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 6), 0xb07a56, H.x + 3.6, groundY(H.x + 3.6, H.z + 3.7) + 1.1, H.z + 3.7);
  // 언덕 길 가로등
  for (let i = 0; i < 4; i++) {
    const a = I.arrive, t = (i + 1) / 5;
    const x = lerp(a.x, H.x, t) + 1.8, z = lerp(a.z, H.z + 4, t);
    const y = groundY(x, z);
    add(new THREE.CylinderGeometry(0.08, 0.1, 2.4, 6), 0x6a7ab0, x, y + 1.2, z);
    add(new THREE.SphereGeometry(0.28, 10, 8), lanternMats[2], x, y + 2.5, z, scene, false);
    collide(x, z, 0.3);
  }
  for (let i = 0; i < 10; i++) { const a = rr(0, 6.3), d = rr(H.r + 2, I.r - 4); const [x, z] = islPos(I, Math.cos(a) * d, Math.sin(a) * d); if (Math.hypot(x - I.arrive.x, z - I.arrive.z) > 7 && !colliders.some((o) => Math.hypot(o.x - x, o.z - z) < o.r + 2.5)) tree(x, z, rr(0.8, 1.1), i % 3 ? 'green' : 'pink'); }
  resident(I, 3.2, 5.6, 0.4, { color: 0xd8d8e8, ears: 'cat', accent: 0xc3a6ff }, '별님 박사',
    ['밤하늘엔 우리 마을을 닮은 별자리가 숨어 있단다 ✨', '천문대 망원경은 밤에만 별이 보여요. 낮이면 기다려 볼까?', '별자리를 모두 찾으면… 하늘이 친구가 된 기분일 거야.'], null, 'glasses');
  interact({ x: H.x, z: H.z + 4.6, r: 2.0, label: '🔭 망원경으로 별자리 찾기', action: () => startStargaze() });
  I.marks.push(['🔭', H.x, H.z]);
  ZONE_LABELS.push(['🔭 별빛 천문대', H.x, top + 8, H.z]);
}
const SG = { group: null, c: null, t: 0, announced: false };
const sgDir = new THREE.Vector3(0.55, 0.62, -0.56).normalize(); // 달을 피해 동쪽 하늘
function buildConstellation(c) {
  if (SG.group) scene.remove(SG.group);
  const g = new THREE.Group();
  const Rv = new THREE.Vector3().crossVectors(sgDir, UP).normalize();
  const Uv = new THREE.Vector3().crossVectors(Rv, sgDir).normalize();
  const P = ([x, y]) => sgDir.clone().multiplyScalar(240).addScaledVector(Rv, x * 78).addScaledVector(Uv, y * 78);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const starPts = [];
  for (const pl of c.lines) {
    const pts = pl.map(P);
    starPts.push(...pts);
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }
  const sp = new THREE.Points(new THREE.BufferGeometry().setFromPoints(starPts), new THREE.PointsMaterial({ color: 0xffffff, size: 7, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  g.add(sp);
  g.userData = { lineMat, starMat: sp.material };
  scene.add(g);
  SG.group = g; SG.c = c; SG.t = 0; SG.announced = false;
}
function nextConstellation() {
  const todo = CONSTELLATIONS.filter((c) => !S.stars[c.id] && c !== SG.c);
  buildConstellation(pick(todo.length ? todo : CONSTELLATIONS.filter((c) => c !== SG.c)));
}
function startStargaze() {
  if (tod < 1.5) {
    openMenu({
      title: '🔭 아직 낮이에요',
      desc: () => '별은 밤에만 보여요. 천문대에서 밤이 될 때까지 기다릴까요?',
      items: () => [
        { label: '🌙 밤까지 기다리기', act: () => { setTimeout(() => fadeThen(() => { tod = todTarget = 2; toast('🌙 별이 총총한 밤이 되었어요', 2.6); setTimeout(startStargaze, 1200); }, 1000), 0); return false; } },
        { label: '그냥 둘러볼래요', act: () => false },
      ],
    });
    return;
  }
  state = 'stargaze';
  $('prompt').classList.add('hidden');
  nextConstellation();
  sfx.ok();
  sceneMsg('🔭 반짝이는 별을 이어 보는 중… · <kbd>Space</kbd> 다른 별자리 찾기 · <kbd>Esc</kbd> 그만 보기');
}
function endStargaze() {
  state = 'play';
  if (SG.group) { scene.remove(SG.group); SG.group = null; }
  sceneMsg(null);
  const n = CONSTELLATIONS.filter((c) => S.stars[c.id]).length;
  toast(`✨ 지금까지 찾은 별자리 ${n}/${CONSTELLATIONS.length}개 (도감 G에서 볼 수 있어요)`, 3);
}
modes.stargaze = {
  key(code) {
    if (code === 'Escape' || code === 'KeyE') endStargaze();
    else if ((code === 'Space' || code === 'Enter') && SG.announced) { sfx.select(); nextConstellation(); }
  },
  update(dt) {
    animateCreature(player, false, 0, dt, elapsed);
    SG.t += dt;
    if (SG.group) {
      SG.group.position.copy(camera.position);
      SG.group.userData.starMat.opacity = clamp(SG.t / 0.8, 0, 1);
      SG.group.userData.lineMat.opacity = clamp((SG.t - 0.8) / 1.5, 0, 0.9);
    }
    if (!SG.announced && SG.t > 2.4) {
      SG.announced = true;
      const c = SG.c;
      if (!S.stars[c.id]) {
        S.stars[c.id] = 1; S.coins += 3; persist();
        sfx.fanfare();
        toast(`✨ 새 별자리 발견! ${c.emoji} ${c.name} (+3🪙)`, 3.4);
      } else { sfx.chime(); toast(`${c.emoji} ${c.name}… 또 만났네! 반가워`, 2.6); }
    }
  },
  camera() {
    return { pos: tmpCamPos.copy(obsTop), target: tmpCamTarget.copy(obsTop).addScaledVector(sgDir, 50), fov: 62, speed: 2, lookSpeed: 3 };
  },
};

/* =========================================================
   🍓 딸기섬
   ========================================================= */
{
  const I = ISL.berry;
  // 밭
  const [fx, fz] = islPos(I, -2, 4);
  const field = add(new THREE.BoxGeometry(14, 0.06, 7), 0xb88a5c, fx, 0.03, fz, scene, false);
  const plants = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
    const x = fx - 5.6 + c * 2.8, z = fz - 1.7 + r * 3.4;
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    for (let k = 0; k < 4; k++) add(new THREE.SphereGeometry(0.42, 10, 8), 0x5fbf4a, Math.cos(k * 1.6) * 0.35, 0.3, Math.sin(k * 1.6) * 0.35, g).scale.y = 0.55;
    const berries = new THREE.Group(); g.add(berries);
    for (let k = 0; k < 5; k++) { const b = add(new THREE.SphereGeometry(0.13, 8, 6), 0xff3d5a, Math.cos(k * 1.3) * 0.5, 0.42, Math.sin(k * 1.3) * 0.5, berries, false); b.scale.y = 1.25; }
    const flowers = new THREE.Group(); g.add(flowers);
    for (let k = 0; k < 3; k++) add(new THREE.SphereGeometry(0.08, 6, 4), 0xffffff, Math.cos(k * 2.1) * 0.3, 0.55, Math.sin(k * 2.1) * 0.3, flowers, false);
    const p = { berries, flowers, t: 0 };
    plants.push(p);
    interact({
      x, z, get r() { return p.t <= 0 ? 1.3 : 0; }, label: '🍓 딸기 따기',
      action: () => { const n = Math.random() < 0.35 ? 2 : 1; bagAdd('berry', n); p.t = 35; sfx.ding(); sparkle(x, 0.8, z, new THREE.Color(0xff8fb1), 14); say(player, `🍓 딸기 ${n}개 땄다! 새콤달콤~`, 1.8); },
    });
  }
  tickers.push((dt) => plants.forEach((p) => { if (p.t > 0) p.t -= dt; p.berries.visible = p.t <= 0; p.flowers.visible = p.t > 0; }));
  // 울타리
  for (let i = 0; i <= 8; i++) for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.15, 0.8, 0.15), 0xffffff, fx - 7.6 + i * 1.9, 0.4, fz + s * 4, scene, false);
  }
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(15.4, 0.1, 0.08), 0xffffff, fx, 0.6, fz + s * 4, scene, false);
  // 빨간 헛간
  const [bx, bz] = islPos(I, -8, -9);
  const barn = new THREE.Group(); barn.position.set(bx, 0, bz); barn.rotation.y = 0.3; scene.add(barn);
  add(new THREE.BoxGeometry(6, 4, 5), 0xe85d5d, 0, 2, 0, barn);
  const br = add(new THREE.CylinderGeometry(0.01, 3.6, 2.6, 4), 0x8a4a3c, 0, 5.3, 0, barn); br.rotation.y = Math.PI / 4; br.scale.set(1.25, 1, 1);
  add(new THREE.BoxGeometry(2.4, 2.8, 0.1), 0xffffff, 0, 1.4, 2.52, barn);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.15, 3.4, 0.05), 0xe85d5d, 0, 1.4, 2.58, barn).rotation.z = s * 0.7;
  collide(bx, bz, 3.6);
  // 풍차
  const [wx, wz] = islPos(I, 9, -9);
  add(new THREE.CylinderGeometry(1.1, 1.8, 6, 12), 0xfff1df, wx, 3, wz);
  add(new THREE.ConeGeometry(1.5, 1.6, 12), 0xff8fb1, wx, 6.8, wz);
  const blades = new THREE.Group(); blades.position.set(wx, 5.4, wz + 1.4); scene.add(blades);
  for (let i = 0; i < 4; i++) { const b = add(new THREE.BoxGeometry(0.6, 3.6, 0.08), i % 2 ? 0xffffff : 0xffd6e2, 0, 1.9, 0, new THREE.Group(), true); const arm = new THREE.Group(); arm.rotation.z = (i * Math.PI) / 2; arm.add(b); blades.add(arm); }
  add(new THREE.SphereGeometry(0.3, 10, 8), 0xffd166, 0, 0, 0.1, blades, false);
  collide(wx, wz, 1.9);
  tickers.push((dt) => (blades.rotation.z += dt * 0.8));
  resident(I, 6, 0, -0.5, { color: 0xffe0b8, ears: 'bear', accent: 0xff8fb1 }, '딸기 아저씨',
    ['허허, 딸기섬에 잘 왔구나! 🍓', '밭에서 빨갛게 익은 딸기는 마음대로 따 가렴. 금방 또 열려!', '딸기 3개를 가져오면 달콤한 잼을 만들어 주마~'],
    () => sellMenu('🍓 딸기 아저씨의 농장 가게', '"딸기는 사랑이란다~"', () => [
      foodItem('berrymilk'), packItem('berrymilk'),
      { label: '🫙 딸기 잼 만들기', right: '🍓 3개', dim: !((S.bag.berry || 0) >= 3), act: () => { if ((S.bag.berry || 0) < 3) { sfx.no(); toast('딸기가 3개 필요해요 🍓'); return true; } bagAdd('berry', -3); bagAdd('jam'); sfx.fanfare(); toast('🫙 딸기 잼 완성! 친구에게 선물하면 좋아할 거예요'); return true; } },
      { label: '🍼 딸기 우유 직접 만들기', right: '🍓1 · 🥛1', dim: !((S.bag.berry || 0) >= 1 && (S.bag.milk || 0) >= 1), act: () => { setTimeout(() => craftMenu('🍼 딸기 우유 만들기', { berry: 1, milk: 1 }, 'berrymilk'), 0); return false; } },
      { label: '🍰 딸기 케이크 굽기', right: '🍓2 · 🥛1 · 🫙1', dim: !((S.bag.berry || 0) >= 2 && (S.bag.milk || 0) >= 1 && (S.bag.jam || 0) >= 1), act: () => {
        if (!((S.bag.berry || 0) >= 2 && (S.bag.milk || 0) >= 1 && (S.bag.jam || 0) >= 1)) { sfx.no(); toast('딸기 2개, 우유 1개, 딸기 잼 1개가 필요해요 (우유는 젖소 음매에게서!)', 3.2); return true; }
        bagAdd('berry', -2); bagAdd('milk', -1); bagAdd('jam', -1); bagAdd('cake'); sfx.fanfare();
        sparkle(player.root.position.x, 2, player.root.position.z, new THREE.Color(0xffc4d8), 30);
        toast('🍰 폭신폭신 딸기 케이크 완성! 포근섬 특산물 가게에서 비싸게 팔거나 친구에게 선물해요', 4); return true;
      } },
      sellItem('berry', 2), sellItem('jam', 9),
    ]), 'straw');
  I.marks.push(['🍓', fx, fz], ['🏚️', bx, bz], ['🌬️', wx, wz]);
  ZONE_LABELS.push(['🍓 딸기밭', fx, 3.5, fz]);
}
