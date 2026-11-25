/* =========================================================
   🏠 내 집 — 바깥 집 + (멀리 떨어진 곳에 있는) 집 안 방
   ========================================================= */
const MYHOUSE = { x: -14, z: 22 };
const ROOM = { x: 300, z: 300, w: 13, d: 9 }; // 집 안은 바다 멀리 따로 지어 두었어요
let insideHouse = false;
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
  { id: 'rug', name: '폭신 러그', emoji: '🟣', price: 4 },
  { id: 'plant', name: '몬스테라 화분', emoji: '🪴', price: 3 },
  { id: 'tank', name: '금붕어 어항', emoji: '🐠', price: 6 },
  { id: 'shelf', name: '책장', emoji: '📚', price: 5 },
  { id: 'lamp', name: '버섯 스탠드', emoji: '🍄', price: 4 },
  { id: 'teddy', name: '커다란 곰인형', emoji: '🧸', price: 7 },
  { id: 'radio', name: '레트로 라디오', emoji: '📻', price: 5 },
];
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
  const F = (id, x, z, build) => { const g = new THREE.Group(); g.position.set(R.x + x, 0, R.z + z); build(g); g.visible = false; scene.add(g); furnitureModels[id] = g; };
  F('rug', 0, 0.5, (g) => { add(new THREE.CylinderGeometry(2.4, 2.4, 0.04, 32), 0xd8c8ff, 0, 0.02, 0, g, false).scale.z = 0.7; add(new THREE.CylinderGeometry(1.6, 1.6, 0.05, 32), 0xffd6e2, 0, 0.03, 0, g, false).scale.z = 0.7; });
  F('plant', -hw + 0.8, hd - 1, (g) => { add(new THREE.CylinderGeometry(0.35, 0.28, 0.6, 12), 0xe58e6b, 0, 0.3, 0, g); for (let i = 0; i < 6; i++) { const l = add(new THREE.SphereGeometry(0.35, 10, 8), 0x5fbf4a, Math.cos(i) * 0.35, 0.95 + (i % 3) * 0.2, Math.sin(i) * 0.35, g); l.scale.set(1, 0.3, 0.7); l.rotation.y = i; } });
  F('tank', -hw + 0.7, 0.6, (g) => { add(new THREE.BoxGeometry(0.9, 0.8, 1.6), 0xd69a6a, 0, 0.4, 0, g); add(new THREE.BoxGeometry(0.8, 0.7, 1.4), new THREE.MeshToonMaterial({ color: 0xbfeeff, transparent: true, opacity: 0.55, gradientMap: gradTex }), 0, 1.15, 0, g, false); for (let i = 0; i < 3; i++) { const f = add(new THREE.SphereGeometry(0.08, 8, 6), 0xff7a3d, 0, 1.1 + i * 0.12, -0.4 + i * 0.4, g, false); f.scale.set(0.6, 0.8, 1.6); f.name = 'fish'; } });
  F('shelf', 0.6, -hd + 0.5, (g) => { add(new THREE.BoxGeometry(2.2, 2.2, 0.6), 0xd69a6a, 0, 1.1, 0, g); for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(0.22, 0.5, 0.45), pick([0xff8fb1, 0x9fd6ff, 0xffd166, 0x9fe3c8, 0xc3a6ff]), -0.85 + i * 0.32, 0.5 + r * 0.68, 0.1, g, false); });
  F('lamp', -hw + 3.1, -hd + 0.6, (g) => { add(new THREE.CylinderGeometry(0.08, 0.12, 1.3, 8), 0xfff1df, 0, 0.65, 0, g); const cap = add(new THREE.SphereGeometry(0.5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon({ color: 0xff6f6f, emissive: 0xffa060, emissiveIntensity: 0.4 }), 0, 1.3, 0, g); cap.scale.y = 0.7; for (let i = 0; i < 4; i++) add(new THREE.SphereGeometry(0.07, 6, 6), 0xffffff, Math.cos(i * 1.6) * 0.35, 1.5, Math.sin(i * 1.6) * 0.35, g, false); });
  F('teddy', -hw + 1.5, -hd + 1.1, (g) => { const t = makeCreature({ color: 0xc69a6b, ears: 'bear', accent: 0xffa3b8, scale: 0.45 }); t.root.position.y = 0.75; t.root.rotation.x = -0.25; g.add(t.root); });
  F('radio', hw - 0.9, 1.6, (g) => { add(new THREE.BoxGeometry(0.55, 0.35, 0.3), 0x9fd6ff, 0, 1.13, 0, g); add(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12), 0xfff1df, 0.12, 1.13, 0.16, g, false).rotation.x = Math.PI / 2; });
  glowLights.push((() => { const l = new THREE.PointLight(0xffc890, 0, 16, 1.2); l.position.set(R.x, 3, R.z); scene.add(l); return l; })());

  interact({ x: bed.position.x + 1.6, z: bed.position.z + 0.8, r: 1.8, label: '침대에서 잠자기 🛏️', action: () => sleepInBed() });
  interact({ x: ward.position.x - 0.2, z: ward.position.z + 1.4, r: 1.6, label: '옷장 열기 👗', action: () => openWardrobe() });
  interact({ x: desk.position.x - 1.3, z: desk.position.z, r: 1.6, label: '가구 카탈로그 보기 📖', action: () => openCatalog() });
  interact({ x: R.x, z: R.z + hd - 0.6, r: 1.6, label: '밖으로 나가기 🚪', action: () => exitHouse() });
  interact({ x: R.x + hw - 0.9 - 1.3, z: R.z + 2.6, get r() { return S.furniture.includes('radio') ? 1.2 : 0; }, label: '라디오 켜기 📻', action: () => { for (let i = 0; i < 8; i++) tone(pick([523, 659, 784, 880, 1047]), 0.35, 'triangle', 0.07, 0, i * 0.18); say(player, '♪ 랄랄라~ 🎶', 2); } });
}
function refreshFurniture() { for (const [id, m] of Object.entries(furnitureModels)) m.visible = S.furniture.includes(id); }
tickers.push(() => {
  const t = furnitureModels.tank;
  if (t.visible) t.children.filter((c) => c.name === 'fish').forEach((f, i) => { f.position.z = Math.sin(elapsed * 0.8 + i * 2) * 0.5; f.position.y = 1.1 + i * 0.12 + Math.sin(elapsed * 1.7 + i) * 0.05; });
});
function clampToRoom(p) {
  p.x = clamp(p.x, ROOM.x - ROOM.w / 2 + 0.7, ROOM.x + ROOM.w / 2 - 0.7);
  p.z = clamp(p.z, ROOM.z - ROOM.d / 2 + 0.7, ROOM.z + ROOM.d / 2 - 0.5);
}
function houseCamera(p, pos, target) {
  pos.set(ROOM.x + (p.x - ROOM.x) * 0.35, 9.5, ROOM.z + 11 + (p.z - ROOM.z) * 0.3);
  target.set(ROOM.x + (p.x - ROOM.x) * 0.5, 0.6, ROOM.z + (p.z - ROOM.z) * 0.4);
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
    player.root.position.set(ROOM.x, 0, ROOM.z + ROOM.d / 2 - 1.2);
    player.root.rotation.set(0, Math.PI, 0);
    houseCamera(player.root.position, camera.position, lookAt);
    say(player, '역시 집이 최고야~ 🏠', 2.5);
  }, 300);
}
function exitHouse() {
  sfx.ok();
  fadeThen(() => {
    insideHouse = false;
    player.root.position.set(MYHOUSE.x, 0, MYHOUSE.z + 3.4);
    player.root.rotation.set(0, 0, 0);
    camera.position.set(MYHOUSE.x + Math.sin(camYaw) * 16, 13, MYHOUSE.z + 3.4 + Math.cos(camYaw) * 16);
    lookAt.set(MYHOUSE.x, 1.4, MYHOUSE.z + 3.4);
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
      ...FURNITURE.map((f) => {
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
            toast(`${f.emoji} ${f.name}이(가) 배달됐어요!`);
            return true;
          },
        };
      }),
      { label: '닫기', act: () => false },
    ],
  });
}
