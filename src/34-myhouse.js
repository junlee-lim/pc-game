/* =========================================================
   🏠 내 집 — 바깥 집 + (멀리 떨어진 곳에 있는) 집 안 방
   ========================================================= */
const MYHOUSE = { x: -14, z: 22 };
const ROOM = { x: 300, z: 300, w: 13, d: 9 }; // 집 안은 바다 멀리 따로 지어 두었어요
let insideHouse = false;
// 지금 들어가 있는 방 (내 집 또는 친구 집). exit: 나왔을 때 설 자리
let curRoom = ROOM;
ROOM.exit = { x: MYHOUSE.x, z: MYHOUSE.z + 3.4, rot: 0 };
AVOID.push([MYHOUSE.x, MYHOUSE.z, 6]);
{
  const g = house(MYHOUSE.x, MYHOUSE.z, 0, 0xfff6ea, 0xff8fb1);
  const sign = signPlane('🏠 내 집', 1.8, { font: 90, border: '#ff8fb1' });
  sign.position.set(0, 2.72, 2.1);
  g.add(sign);
  // 우편함 모양 문패와 작은 꽃밭
  add(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 6), 0xb07a56, MYHOUSE.x + 2.6, 0.55, MYHOUSE.z + 3.3);
  add(new THREE.BoxGeometry(0.5, 0.35, 0.35), 0xff8fb1, MYHOUSE.x + 2.6, 1.2, MYHOUSE.z + 3.3);
  for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.2, 8, 6), pick([0xffd166, 0xff8fb1, 0xc3a6ff]), MYHOUSE.x - 2.6 + (i % 3) * 0.4, 0.25, MYHOUSE.z + 2.6 + Math.floor(i / 3) * 0.4, scene, false);
  interact({ x: MYHOUSE.x, z: MYHOUSE.z + 2.9, r: 1.9, label: '내 집에 들어가기 🏠', action: () => enterHouse() });
}
ZONE_LABELS.push(['🏠 내 집', MYHOUSE.x, 6.6, MYHOUSE.z]);
MAP_MARKS.push(['🏠', MYHOUSE.x, MYHOUSE.z]);

// 집 안 (앞쪽 벽은 낮게 잘라 인형의 집처럼 들여다봐요)
const FURNITURE = [
  { id: 'rug', name: '폭신 러그', emoji: '🟣', price: 20, r: 0 },
  { id: 'plant', name: '몬스테라 화분', emoji: '🪴', price: 15, r: 0.45 },
  { id: 'tank', name: '금붕어 어항', emoji: '🐠', price: 35, r: 0.8 },
  { id: 'shelf', name: '책장', emoji: '📚', price: 28, r: 1.0 },
  { id: 'lamp', name: '버섯 스탠드', emoji: '🍄', price: 22, r: 0.4 },
  { id: 'teddy', name: '커다란 곰인형', emoji: '🧸', price: 40, r: 0.45 },
  { id: 'radio', name: '레트로 라디오', emoji: '📻', price: 30, r: 0.4 },
  // 계절 축제 한정 (토큰으로 교환)
  { id: 'sakurapot', name: '벚꽃 분재', emoji: '🌸', price: 0, r: 0.5, season: 'spring' },
  { id: 'fan', name: '하늘색 선풍기', emoji: '🌀', price: 0, r: 0.45, season: 'summer' },
  { id: 'pumpkin', name: '호박 랜턴', emoji: '🎃', price: 0, r: 0.5, season: 'autumn' },
  { id: 'xtree', name: '미니 크리스마스 트리', emoji: '🎄', price: 0, r: 0.6, season: 'winter' },
];
const FURN_DEFAULT = {};
const furnColliders = {};
const furnitureModels = {};
{
  const R = ROOM, hw = R.w / 2, hd = R.d / 2;
  const lawn = add(new THREE.CircleGeometry(30, 40), 0x9fdc7c, R.x, -0.02, R.z, scene, false);
  lawn.rotation.x = -Math.PI / 2;
  const woodTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#e8c49a' : '#dfb98d'; g.fillRect(0, i * 16, 128, 16); g.fillStyle = 'rgba(106,76,63,0.25)'; g.fillRect(0, i * 16 + 15, 128, 1); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t;
  })();
  add(new THREE.BoxGeometry(R.w, 0.2, R.d), toon({ map: woodTex }), R.x, -0.1, R.z, scene, false);
  const wall = 0xfff1e6, wallH = 3.4;
  add(new THREE.BoxGeometry(R.w, wallH, 0.3), wall, R.x, wallH / 2, R.z - hd);
  add(new THREE.BoxGeometry(0.3, wallH, R.d), wall, R.x - hw, wallH / 2, R.z);
  add(new THREE.BoxGeometry(0.3, wallH, R.d), wall, R.x + hw, wallH / 2, R.z);
  // 앞쪽 낮은 벽 (가운데는 문)
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(hw - 1, 0.7, 0.3), wall, R.x + s * (hw / 2 + 0.5), 0.35, R.z + hd);
  add(new THREE.BoxGeometry(R.w + 0.3, 0.25, 0.4), 0xff8fb1, R.x, wallH, R.z - hd);
  // 벽지 줄무늬 · 창문
  for (let i = 0; i < 13; i++) add(new THREE.BoxGeometry(0.12, wallH - 0.4, 0.02), 0xffe0ea, R.x - hw + 0.5 + i, wallH / 2, R.z - hd + 0.16, scene, false);
  for (const wx of [-3.5, 3.5]) {
    add(new THREE.BoxGeometry(1.8, 1.4, 0.05), windowMat, R.x + wx, 2.1, R.z - hd + 0.18, scene, false);
    add(new THREE.BoxGeometry(2.0, 0.12, 0.2), 0xffffff, R.x + wx, 1.35, R.z - hd + 0.22, scene, false);
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.45, 1.6, 0.06), 0xffb4c8, R.x + wx + s * 1.05, 2.05, R.z - hd + 0.22, scene, false);
  }
  // 침대
  const bed = new THREE.Group(); bed.position.set(R.x - hw + 1.5, 0, R.z - hd + 1.6); scene.add(bed);
  add(new THREE.BoxGeometry(2.2, 0.5, 3), 0xd69a6a, 0, 0.25, 0, bed);
  add(new THREE.BoxGeometry(2.1, 0.3, 2.9), 0xffffff, 0, 0.62, 0, bed);
  add(new THREE.BoxGeometry(2.12, 0.32, 1.9), 0xb8e6ff, 0, 0.66, 0.5, bed);
  add(new THREE.BoxGeometry(1.2, 0.25, 0.6), 0xffffff, 0, 0.88, -1.05, bed).rotation.x = 0.2;
  add(new THREE.BoxGeometry(2.3, 1.1, 0.15), 0xd69a6a, 0, 0.75, -1.5, bed);
  collide(bed.position.x, bed.position.z - 0.5, 1.2); collide(bed.position.x, bed.position.z + 0.8, 1.2);
  // 옷장
  const ward = new THREE.Group(); ward.position.set(R.x + hw - 1.2, 0, R.z - hd + 0.8); scene.add(ward);
  add(new THREE.BoxGeometry(2, 2.6, 1), 0xffd6e2, 0, 1.3, 0, ward);
  add(new THREE.BoxGeometry(0.02, 2.3, 0.02), 0xd69a9a, 0, 1.3, 0.51, ward, false);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.07, 8, 6), 0xffd166, s * 0.15, 1.4, 0.53, ward, false);
  collide(ward.position.x, ward.position.z, 1.2);
  // 책상과 카탈로그
  const desk = new THREE.Group(); desk.position.set(R.x + hw - 0.9, 0, R.z + 1.2); scene.add(desk);
  add(new THREE.BoxGeometry(1.2, 0.1, 2), 0xe8c49a, 0, 0.9, 0, desk);
  for (const [lx, lz] of [[-0.5, -0.9], [0.5, -0.9], [-0.5, 0.9], [0.5, 0.9]]) add(new THREE.BoxGeometry(0.1, 0.9, 0.1), 0xd69a6a, lx, 0.45, lz, desk);
  const book = add(new THREE.BoxGeometry(0.6, 0.08, 0.8), 0x9fe3c8, 0, 0.99, 0, desk);
  book.rotation.y = 0.3;
  collide(desk.position.x, desk.position.z, 1.1);
  // 가구 (사면 나타나요)
  const F = (id, x, z, build) => {
    const g = new THREE.Group();
    build(g);
    g.visible = false;
    scene.add(g);
    furnitureModels[id] = g;
    FURN_DEFAULT[id] = [x, z, 0];
    const r = FURNITURE.find((f) => f.id === id).r;
    if (r) { const c = { x: 0, z: 0, r, off: true }; colliders.push(c); furnColliders[id] = c; }
  };
  F('rug', 0, 0.5, (g) => { add(new THREE.CylinderGeometry(2.4, 2.4, 0.04, 32), 0xd8c8ff, 0, 0.02, 0, g, false).scale.z = 0.7; add(new THREE.CylinderGeometry(1.6, 1.6, 0.05, 32), 0xffd6e2, 0, 0.03, 0, g, false).scale.z = 0.7; });
  F('plant', -hw + 0.8, hd - 1, (g) => { add(new THREE.CylinderGeometry(0.35, 0.28, 0.6, 12), 0xe58e6b, 0, 0.3, 0, g); for (let i = 0; i < 6; i++) { const l = add(new THREE.SphereGeometry(0.35, 10, 8), 0x5fbf4a, Math.cos(i) * 0.35, 0.95 + (i % 3) * 0.2, Math.sin(i) * 0.35, g); l.scale.set(1, 0.3, 0.7); l.rotation.y = i; } });
  F('tank', -hw + 0.7, 0.6, (g) => { add(new THREE.BoxGeometry(0.9, 0.8, 1.6), 0xd69a6a, 0, 0.4, 0, g); add(new THREE.BoxGeometry(0.8, 0.7, 1.4), new THREE.MeshToonMaterial({ color: 0xbfeeff, transparent: true, opacity: 0.55, gradientMap: gradTex }), 0, 1.15, 0, g, false); for (let i = 0; i < 3; i++) { const f = add(new THREE.SphereGeometry(0.08, 8, 6), 0xff7a3d, 0, 1.1 + i * 0.12, -0.4 + i * 0.4, g, false); f.scale.set(0.6, 0.8, 1.6); f.name = 'fish'; } });
  F('shelf', 0.6, -hd + 0.5, (g) => { add(new THREE.BoxGeometry(2.2, 2.2, 0.6), 0xd69a6a, 0, 1.1, 0, g); for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(0.22, 0.5, 0.45), pick([0xff8fb1, 0x9fd6ff, 0xffd166, 0x9fe3c8, 0xc3a6ff]), -0.85 + i * 0.32, 0.5 + r * 0.68, 0.1, g, false); });
  F('lamp', -hw + 3.1, -hd + 0.6, (g) => { add(new THREE.CylinderGeometry(0.08, 0.12, 1.3, 8), 0xfff1df, 0, 0.65, 0, g); const cap = add(new THREE.SphereGeometry(0.5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon({ color: 0xff6f6f, emissive: 0xffa060, emissiveIntensity: 0.4 }), 0, 1.3, 0, g); cap.scale.y = 0.7; for (let i = 0; i < 4; i++) add(new THREE.SphereGeometry(0.07, 6, 6), 0xffffff, Math.cos(i * 1.6) * 0.35, 1.5, Math.sin(i * 1.6) * 0.35, g, false); });
  F('teddy', -hw + 3.1, -hd + 2.3, (g) => { const t = makeCreature({ color: 0xc69a6b, ears: 'bear', accent: 0xffa3b8, scale: 0.6 }); g.add(t.root); });
  F('radio', hw - 0.7, hd - 1.0, (g) => { add(new THREE.BoxGeometry(0.7, 0.8, 0.5), 0xd69a6a, 0, 0.4, 0, g); add(new THREE.BoxGeometry(0.55, 0.35, 0.3), 0x9fd6ff, 0, 0.98, 0, g); add(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12), 0xfff1df, 0.12, 0.98, 0.16, g, false).rotation.x = Math.PI / 2; });
  F('sakurapot', hw - 0.8, hd - 2.4, (g) => { add(new THREE.CylinderGeometry(0.4, 0.32, 0.4, 12), 0x8fb8ff, 0, 0.2, 0, g); add(new THREE.CylinderGeometry(0.06, 0.1, 0.9, 6), 0x8a5a3c, 0, 0.75, 0, g); for (let i = 0; i < 7; i++) add(new THREE.SphereGeometry(0.28, 10, 8), i % 2 ? 0xffc4d8 : 0xffd6e4, Math.cos(i) * 0.32, 1.2 + (i % 3) * 0.12, Math.sin(i) * 0.32, g); });
  F('fan', -2.2, -hd + 0.9, (g) => { add(new THREE.CylinderGeometry(0.35, 0.4, 0.1, 16), 0xffffff, 0, 0.05, 0, g); add(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), 0xffffff, 0, 0.6, 0, g); const head = new THREE.Group(); head.position.set(0, 1.2, 0.1); head.name = 'fanhead'; g.add(head); const cage = add(new THREE.TorusGeometry(0.38, 0.03, 6, 20), 0x9fd6ff, 0, 0, 0.05, head); for (let i = 0; i < 3; i++) { const b = add(new THREE.BoxGeometry(0.12, 0.34, 0.02), 0x9fd6ff, Math.cos(i * 2.09) * 0.17, Math.sin(i * 2.09) * 0.17, 0.05, head, false); b.rotation.z = i * 2.09 - Math.PI / 2; } add(new THREE.SphereGeometry(0.08, 8, 6), 0xffffff, 0, 0, 0.08, head, false); });
  F('pumpkin', 3.3, -hd + 0.8, (g) => { for (let i = 0; i < 6; i++) { const s = add(new THREE.SphereGeometry(0.3, 12, 10), toon({ color: 0xff8f2c, emissive: 0xff6a00, emissiveIntensity: 0.35 }), Math.cos(i * 1.05) * 0.18, 0.34, Math.sin(i * 1.05) * 0.18, g); s.scale.set(0.7, 1, 0.7); } add(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 6), 0x6a8a3c, 0, 0.72, 0, g, false); for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.07, 0.1, 3), 0x3b2a25, s * 0.13, 0.42, 0.42, g, false).rotation.x = -Math.PI / 2; });
  F('xtree', -1.8, 2.6, (g) => { add(new THREE.CylinderGeometry(0.28, 0.24, 0.35, 10), 0xff6f6f, 0, 0.18, 0, g); for (const [y, r, h] of [[0.7, 0.6, 0.7], [1.15, 0.45, 0.6], [1.55, 0.3, 0.5]]) add(new THREE.ConeGeometry(r, h, 10), 0x4fae6a, 0, y, 0, g); add(new THREE.OctahedronGeometry(0.13, 0), toon({ color: 0xffd34d, emissive: 0xffc000, emissiveIntensity: 0.8 }), 0, 1.9, 0, g, false); for (let i = 0; i < 10; i++) add(new THREE.SphereGeometry(0.05, 6, 4), lanternMats[i % 5], Math.cos(i * 2.3) * (0.5 - i * 0.035), 0.5 + i * 0.11, Math.sin(i * 2.3) * (0.5 - i * 0.035), g, false); });
  glowLights.push((() => { const l = new THREE.PointLight(0xffc890, 0, 16, 1.2); l.position.set(R.x, 3, R.z); scene.add(l); return l; })());

  interact({ x: bed.position.x + 1.6, z: bed.position.z + 0.8, r: 1.8, label: '침대에서 잠자기 🛏️', action: () => sleepInBed() });
  interact({ x: ward.position.x - 0.2, z: ward.position.z + 1.4, r: 1.6, label: '옷장 열기 👗', action: () => openWardrobe() });
  interact({ x: desk.position.x - 1.3, z: desk.position.z, r: 1.6, label: '가구 카탈로그 보기 📖', action: () => openCatalog() });
  interact({ x: R.x, z: R.z + hd - 0.6, r: 1.6, label: '밖으로 나가기 🚪', action: () => exitHouse() });
  interact({ get x() { return furnitureModels.radio.position.x; }, get z() { return furnitureModels.radio.position.z + 0.9; }, get r() { return furnitureModels.radio.visible && state === 'play' ? 1.3 : 0; }, label: '라디오 켜기 📻', action: () => { for (let i = 0; i < 8; i++) tone(pick([523, 659, 784, 880, 1047]), 0.35, 'triangle', 0.07, 0, i * 0.18); say(player, '♪ 랄랄라~ 🎶', 2); } });
}
const furnLayout = (id) => S.layout[id] || [...FURN_DEFAULT[id], 0];
function refreshFurniture() {
  for (const [id, m] of Object.entries(furnitureModels)) {
    const [x, z, rot, stored] = furnLayout(id);
    m.position.set(ROOM.x + x, 0, ROOM.z + z);
    m.rotation.y = rot;
    m.visible = S.furniture.includes(id) && !stored;
    const c = furnColliders[id];
    if (c) { c.x = m.position.x; c.z = m.position.z; c.off = !m.visible; }
  }
}
tickers.push(() => {
  const t = furnitureModels.tank;
  const fan = furnitureModels.fan.getObjectByName('fanhead');
  if (furnitureModels.fan.visible) { fan.rotation.z += 0.3; fan.parent.rotation.y = furnLayout('fan')[2] + Math.sin(elapsed * 0.6) * 0.5; }
  if (t.visible) t.children.filter((c) => c.name === 'fish').forEach((f, i) => { f.position.z = Math.sin(elapsed * 0.8 + i * 2) * 0.5; f.position.y = 1.1 + i * 0.12 + Math.sin(elapsed * 1.7 + i) * 0.05; });
});
function clampToRoom(p) {
  const R = curRoom;
  p.x = clamp(p.x, R.x - R.w / 2 + 0.7, R.x + R.w / 2 - 0.7);
  p.z = clamp(p.z, R.z - R.d / 2 + 0.7, R.z + R.d / 2 - 0.5);
}
function houseCamera(p, pos, target) {
  const R = curRoom;
  pos.set(R.x + (p.x - R.x) * 0.35, 9.5, R.z + 11 + (p.z - R.z) * 0.3);
  target.set(R.x + (p.x - R.x) * 0.5, 0.6, R.z + (p.z - R.z) * 0.4);
}
function fadeThen(fn, hold = 700) {
  $('fade').classList.add('on');
  const prev = state;
  state = 'busy';
  setTimeout(() => { fn(); setTimeout(() => { $('fade').classList.remove('on'); if (state === 'busy') state = prev === 'busy' ? 'play' : prev; }, hold); }, 900);
}
modes.busy = { key() {}, update(dt) { animateCreature(player, false, 0, dt, elapsed); } };
function enterHouse() {
  if (riding) setRiding(false);
  sfx.ok();
  fadeThen(() => {
    insideHouse = true;
    curRoom = ROOM;
    player.root.position.set(ROOM.x, 0, ROOM.z + ROOM.d / 2 - 1.2);
    player.root.rotation.set(0, Math.PI, 0);
    houseCamera(player.root.position, camera.position, lookAt);
    say(player, '역시 집이 최고야~ 🏠', 2.5);
  }, 300);
}
function exitHouse() {
  sfx.ok();
  fadeThen(() => {
    const ex = curRoom.exit;
    if (curRoom.onExit) curRoom.onExit();
    insideHouse = false;
    curRoom = ROOM;
    player.root.position.set(ex.x, 0, ex.z);
    player.root.rotation.set(0, ex.rot || 0, 0);
    camera.position.set(ex.x + Math.sin(camYaw) * 16, 13, ex.z + Math.cos(camYaw) * 16);
    lookAt.set(ex.x, 1.4, ex.z);
  }, 300);
}
function sleepInBed() {
  sfx.yawn();
  say(player, '잘 자~ 💤', 1.5);
  fadeThen(() => {
    const wasNight = tod > 1.5;
    tod = todTarget = wasNight ? 0 : Math.min(2, Math.round(todTarget) + 1);
    S.energy = 100;
    persist();
    if (wasNight) setTimeout(newDay, 3400);
    toast(wasNight ? '☀️ 좋은 아침! 새로운 하루가 밝았어요' : todTarget === 2 ? '🌙 푹 자고 일어나니 밤이 되었어요' : '🌇 한숨 자고 나니 노을이 지고 있어요', 3.2);
    say(player, '으~ 개운하다! 🙆', 2.5);
  }, 1400);
}
function openWardrobe() {
  sfx.ok();
  openMenu({
    title: '👗 내 옷장',
    desc: () => (S.owned.length ? '갖고 있는 소품을 골라 입어 보세요.' : '아직 소품이 없어요. 잡화점이나 축제 경품으로 모아 보세요!'),
    items: () => [
      ...SHOP_ITEMS.filter((it) => S.owned.includes(it.id)).map((it) => ({
        label: `${it.emoji} ${it.name}`,
        right: S.equipped[it.slot] === it.id ? '✅ 착용 중' : '입기',
        act: () => { S.equipped[it.slot] = S.equipped[it.slot] === it.id ? null : it.id; refreshEquip(); persist(); sfx.select(); return true; },
      })),
      { label: '🧺 모두 벗기', act: () => { S.equipped = {}; refreshEquip(); persist(); return true; } },
      { label: '닫기', act: () => false },
    ],
  });
}
function openCatalog() {
  sfx.ok();
  openMenu({
    title: '📖 포근 가구 카탈로그',
    desc: () => `사면 바로 집에 배달돼요! &nbsp;|&nbsp; 내 코인 🪙 ${S.coins}`,
    items: () => [
      ...FURNITURE.filter((f) => !f.season).map((f) => {
        const owned = S.furniture.includes(f.id);
        return {
          label: `${f.emoji} ${f.name}`,
          right: owned ? '✅ 우리 집에 있어요' : `🪙 ${f.price}`,
          dim: !owned && S.coins < f.price,
          act: () => {
            if (owned) return true;
            if (S.coins < f.price) { sfx.no(); toast(`코인이 ${f.price - S.coins}개 더 필요해요 🪙`); return true; }
            S.coins -= f.price;
            S.furniture.push(f.id);
            persist();
            refreshFurniture();
            sfx.fanfare();
            const m = furnitureModels[f.id].position;
            sparkle(m.x, 1.2, m.z, new THREE.Color(0xfff1a8), 30);
            toast(`${f.emoji} ${f.name}이(가) 배달됐어요! 🛋️ 가구 배치하기로 옮길 수 있어요`);
            return true;
          },
        };
      }),
      { label: '🛋️ 가구 배치하기', right: '자유롭게 옮기기 (F)', act: () => { setTimeout(startDecorate, 0); return false; } },
      { label: '닫기', act: () => false },
    ],
  });
}

/* ---------- 🛋️ 가구 자유 배치 모드 ---------- */
const decoRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 8, 32), new THREE.MeshBasicMaterial({ color: 0xff6f91 }));
decoRing.rotation.x = Math.PI / 2;
decoRing.visible = false;
scene.add(decoRing);
const DECO = { list: [], idx: 0 };
function startDecorate() {
  DECO.list = FURNITURE.filter((f) => S.furniture.includes(f.id));
  if (!DECO.list.length) { sfx.no(); toast('아직 가구가 없어요. 책상 위 카탈로그에서 가구를 사 보세요 📖', 3); return; }
  DECO.idx = clamp(DECO.idx, 0, DECO.list.length - 1);
  // 처음 배치하는 가구는 기본 자리를 저장해 둬요
  for (const f of DECO.list) if (!S.layout[f.id]) S.layout[f.id] = furnLayout(f.id);
  state = 'decorate';
  $('prompt').classList.add('hidden');
  decoRing.visible = true;
  player.root.visible = false;
  sfx.ok();
  updateDecoMsg();
}
function endDecorate() {
  state = 'play';
  decoRing.visible = false;
  player.root.visible = true;
  sceneMsg(null);
  $('scene-msg').classList.remove('panel');
  refreshFurniture();
  persist();
  sfx.ok();
  toast('🏠 가구 배치를 저장했어요!');
}
function updateDecoMsg() {
  const f = DECO.list[DECO.idx];
  const stored = S.layout[f.id][3];
  $('scene-msg').classList.add('panel');
  sceneMsg(`🛋️ <b>${f.emoji} ${f.name}</b> (${DECO.idx + 1}/${DECO.list.length})${stored ? ' · 📦 보관 중' : ''}<br>` +
    `<kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> 옮기기 · <kbd>Q</kbd><kbd>R</kbd> 돌리기 · <kbd>Tab</kbd> 다음 가구 · <kbd>P</kbd> 넣기/꺼내기 · <kbd>Enter</kbd> 완료`);
}
modes.decorate = {
  key(code) {
    const f = DECO.list[DECO.idx], L = S.layout[f.id];
    if (code === 'Tab' || code === 'BracketRight') { DECO.idx = (DECO.idx + 1) % DECO.list.length; sfx.select(); }
    else if (code === 'BracketLeft') { DECO.idx = (DECO.idx - 1 + DECO.list.length) % DECO.list.length; sfx.select(); }
    else if (code === 'KeyQ') { L[2] += Math.PI / 4; sfx.select(); }
    else if (code === 'KeyR') { L[2] -= Math.PI / 4; sfx.select(); }
    else if (code === 'KeyP') { L[3] = L[3] ? 0 : 1; sfx.pop(); }
    else if (code === 'Enter' || code === 'Escape' || code === 'KeyF') { endDecorate(); return; }
    else return;
    refreshFurniture();
    updateDecoMsg();
  },
  update(dt) {
    animateCreature(player, false, 0, dt, elapsed);
    const f = DECO.list[DECO.idx], L = S.layout[f.id];
    let dx = 0, dz = 0;
    if (down('ArrowLeft', 'KeyA')) dx -= 1;
    if (down('ArrowRight', 'KeyD')) dx += 1;
    if (down('ArrowUp', 'KeyW')) dz -= 1;
    if (down('ArrowDown', 'KeyS')) dz += 1;
    if (dx || dz) {
      const hw = ROOM.w / 2 - 0.6, hd = ROOM.d / 2 - 0.6;
      L[0] = clamp(L[0] + dx * 3 * dt, -hw, hw);
      L[1] = clamp(L[1] + dz * 3 * dt, -hd, hd);
      refreshFurniture();
    }
    const m = furnitureModels[f.id];
    // 고른 가구는 살짝 들어 올려 반짝반짝
    for (const g of Object.values(furnitureModels)) g.position.y = 0;
    m.position.y = L[3] ? 0 : 0.15 + Math.abs(Math.sin(elapsed * 4)) * 0.1;
    if (L[3]) m.visible = true; // 보관 중인 가구도 고르는 동안엔 보여 줘요
    decoRing.position.set(ROOM.x + L[0], 0.05, ROOM.z + L[1]);
    const r = Math.max(0.6, f.r || 1.8);
    decoRing.scale.setScalar(r * (1.1 + Math.sin(elapsed * 5) * 0.05));
    decoRing.material.color.setHex(L[3] ? 0xb0b0b0 : 0xff6f91);
  },
  camera() {
    return { pos: tmpCamPos.set(ROOM.x, 15, ROOM.z + 9.5), target: tmpCamTarget.set(ROOM.x, 0, ROOM.z + 0.6), fov: 52, speed: 3 };
  },
};
playKeyHooks.push((code) => {
  if (code !== 'KeyF' || !insideHouse || curRoom !== ROOM) return false;
  startDecorate();
  return true;
});
