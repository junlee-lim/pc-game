/* =========================================================
   ☁️ 하늘섬 — 별빛섬 우주선을 타고만 갈 수 있어요
   🎁 별빛섬 기념품 가게에서 산 기념품으로 하늘섬을 꾸며요
   ========================================================= */
const SKY = { id: 'sky', name: '하늘섬', emoji: '☁️', sky: true, x: -320, z: 20, y: 150, r: 26, ground: 0xc8f0d8, mapColor: '#dff6e6' };
SKY.marks = [];
ISLANDS.push(SKY);

/* ---------- 기념품 ---------- */
const SOUVENIRS = [
  { id: 'starStatue', name: '별 조각상', emoji: '⭐', price: 6, r: 0.8 },
  { id: 'moonLamp', name: '초승달 램프', emoji: '🌙', price: 5, r: 0.4 },
  { id: 'planet', name: '토성 장식', emoji: '🪐', price: 7, r: 0.8 },
  { id: 'cloudSofa', name: '구름 소파', emoji: '☁️', price: 6, r: 1.2 },
  { id: 'miniRocket', name: '미니 로켓', emoji: '🚀', price: 8, r: 0.7 },
  { id: 'chime', name: '별빛 풍경', emoji: '🎐', price: 4, r: 0.6 },
  { id: 'galaxyTree', name: '은하수 나무', emoji: '🌌', price: 10, r: 0.9 },
  { id: 'scope', name: '작은 망원경', emoji: '🔭', price: 5, r: 0.5 },
];
const skyGlowMats = [];
const glowToon = (color, base = 0.3) => { const m = toon({ color, emissive: color, emissiveIntensity: base }); m.userData.base = base; skyGlowMats.push(m); return m; };
function starShape(r1, r2) {
  const sh = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + Math.PI / 2, r = i % 2 ? r2 : r1; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  return sh;
}
function souvenirModel(id) {
  const g = new THREE.Group();
  if (id === 'starStatue') {
    add(new THREE.CylinderGeometry(0.6, 0.7, 0.6, 16), 0xe9e2f2, 0, 0.3, 0, g);
    const st = add(new THREE.ExtrudeGeometry(starShape(0.9, 0.4), { depth: 0.3, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 }), glowToon(0xffd34d, 0.35), 0, 1.6, -0.15, g);
    st.name = 'spin';
  } else if (id === 'moonLamp') {
    add(new THREE.CylinderGeometry(0.06, 0.1, 2.2, 8), 0xc9d4ff, 0, 1.1, 0, g);
    const moon = add(new THREE.TorusGeometry(0.42, 0.16, 10, 20, Math.PI * 1.3), glowToon(0xfff1a8, 0.6), 0, 2.5, 0, g);
    moon.rotation.z = -0.6;
  } else if (id === 'planet') {
    add(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), 0xffffff, 0, 0.8, 0, g);
    add(new THREE.SphereGeometry(0.55, 18, 14), glowToon(0xffb86b, 0.15), 0, 1.9, 0, g);
    const ring = add(new THREE.TorusGeometry(0.9, 0.08, 6, 32), glowToon(0xc3a6ff, 0.3), 0, 1.9, 0, g, false);
    ring.rotation.x = 1.2;
    add(new THREE.CylinderGeometry(0.5, 0.6, 0.15, 16), 0xe9e2f2, 0, 0.07, 0, g);
  } else if (id === 'cloudSofa') {
    for (const [x, y, z, r] of [[-0.7, 0.45, 0, 0.6], [0, 0.45, 0, 0.65], [0.7, 0.45, 0, 0.6], [-0.4, 0.95, -0.45, 0.55], [0.4, 0.95, -0.45, 0.55], [-1.1, 0.75, 0.1, 0.4], [1.1, 0.75, 0.1, 0.4]]) add(new THREE.SphereGeometry(r, 14, 10), 0xffffff, x, y, z, g);
  } else if (id === 'miniRocket') {
    const r = rocketModel(0.45);
    g.add(r);
  } else if (id === 'chime') {
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), 0xd69a6a, s * 0.8, 1.1, 0, g);
    add(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6), 0xd69a6a, 0, 2.15, 0, g).rotation.z = Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Group(); p.position.set(-0.55 + i * 0.37, 2.1, 0); p.name = 'swing'; g.add(p);
      add(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 4), 0xffffff, 0, -0.3, 0, p, false);
      add(new THREE.ExtrudeGeometry(starShape(0.15, 0.07), { depth: 0.04, bevelEnabled: false }), glowToon(pick([0xffd34d, 0x9fd6ff, 0xff8fb1]), 0.5), 0, -0.68, 0, p, false);
    }
  } else if (id === 'galaxyTree') {
    add(new THREE.CylinderGeometry(0.2, 0.3, 1.8, 8), 0x8a6a9c, 0, 0.9, 0, g);
    for (const [x, y, z, r, c] of [[0, 2.4, 0, 1.1, 0x8f7bff], [0.6, 2.1, 0.3, 0.8, 0x7fb8ff], [-0.6, 2.2, -0.2, 0.8, 0xc39bff], [0, 3.1, 0, 0.7, 0x9fd6ff]]) add(new THREE.SphereGeometry(r, 16, 12), glowToon(c, 0.25), x, y, z, g);
    for (let i = 0; i < 10; i++) add(new THREE.SphereGeometry(0.06, 6, 4), glowToon(0xffffff, 1), Math.cos(i * 2.4) * 1.1, 2.2 + Math.sin(i * 1.7) * 0.8, Math.sin(i * 2.4) * 1.1, g, false);
  } else if (id === 'scope') {
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const l = add(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 5), 0x6a7ab0, Math.cos(a) * 0.3, 0.6, Math.sin(a) * 0.3, g); l.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); }
    const tube = add(new THREE.CylinderGeometry(0.14, 0.2, 1.4, 12), 0xffd166, 0, 1.4, 0.2, g); tube.rotation.x = -0.9;
  }
  return g;
}

/* ---------- 🚀 우주선 ---------- */
function rocketModel(s = 1) {
  const g = new THREE.Group();
  add(new THREE.CylinderGeometry(0.85 * s, 0.95 * s, 3.4 * s, 20), 0xfff6ea, 0, 2.4 * s, 0, g);
  add(new THREE.ConeGeometry(0.85 * s, 1.5 * s, 20), 0xff6f91, 0, 4.85 * s, 0, g);
  add(new THREE.SphereGeometry(0.18 * s, 10, 8), 0xffd166, 0, 5.65 * s, 0, g);
  const win = add(new THREE.CylinderGeometry(0.38 * s, 0.38 * s, 0.1 * s, 18), toon({ color: 0x9fd6ff, emissive: 0x6fb8ff, emissiveIntensity: 0.35 }), 0, 3.0 * s, 0.86 * s, g, false);
  win.rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(0.4 * s, 0.07 * s, 8, 20), 0xffd166, 0, 3.0 * s, 0.88 * s, g, false);
  add(new THREE.BoxGeometry(0.7 * s, 1.2 * s, 0.05 * s), 0xffd6e2, 0, 1.5 * s, 0.9 * s, g, false);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const fin = add(new THREE.BoxGeometry(0.12 * s, 1.4 * s, 0.9 * s), 0xff6f91, Math.cos(a) * 1.0 * s, 1.1 * s, Math.sin(a) * 1.0 * s, g);
    fin.rotation.y = -a;
    add(new THREE.CylinderGeometry(0.08 * s, 0.1 * s, 0.7 * s, 6), 0xc9d4ff, Math.cos(a) * 0.75 * s, 0.35 * s, Math.sin(a) * 0.75 * s, g);
  }
  add(new THREE.CylinderGeometry(0.55 * s, 0.7 * s, 0.4 * s, 16), 0x9aa3b8, 0, 0.55 * s, 0, g);
  const flame = add(new THREE.ConeGeometry(0.55 * s, 1.8 * s, 14), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.9 }), 0, -0.4 * s, 0, g, false);
  flame.rotation.x = Math.PI;
  flame.visible = false;
  g.userData.flame = flame;
  return g;
}
function launchPad(x, z) {
  const y = groundY(x, z);
  const pad = add(new THREE.CylinderGeometry(2.6, 2.8, 0.25, 32), toon({ map: stripeTexture('#ffd166', '#5a5a7a', 16) }), x, y + 0.12, z);
  add(new THREE.TorusGeometry(2.6, 0.08, 8, 40), glowToon(0x9fd6ff, 0.6), x, y + 0.26, z, scene, false).rotation.x = Math.PI / 2;
  const r = rocketModel();
  r.position.set(x, y + 0.25, z);
  scene.add(r);
  collide(x, z, 1.6);
  return { x, z, y: y + 0.25, rocket: r };
}

/* ---------- 🔭 별빛섬: 기념품 가게 · 발사대 ---------- */
const PADS = {};
{
  const I = ISL.star;
  const [sx, sz] = islPos(I, -17, 9);
  const shop = booth(sx, sz, 0xc3a6ff, '🎁 별빛 기념품 가게', { color: 0xd8d8e8, ears: 'cat', accent: 0xc3a6ff });
  const s1 = souvenirModel('starStatue'); s1.scale.setScalar(0.4); s1.position.set(-1, 1.0, 0.1); shop.add(s1);
  const s2 = souvenirModel('planet'); s2.scale.setScalar(0.35); s2.position.set(1, 1.0, 0.1); shop.add(s2);
  interact({ x: sx, z: sz + 2.4, r: 2.4, label: '🎁 별빛 기념품 가게 둘러보기', action: () => openSouvenirShop() });
  I.marks.push(['🎁', sx, sz]);
  ZONE_LABELS.push(['🎁 기념품 가게', sx, 4.6, sz]);
  // 우주선 발사대
  const [px, pz] = islPos(I, 21, -12);
  PADS.star = launchPad(px, pz);
  PADS.star.island = I;
  const sign = signPlane('🚀 하늘섬행 우주선', 3, { w: 640, h: 160, font: 72, border: '#9fd6ff' });
  add(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 6), 0xb07a56, px - 3.6, 1.1, pz + 2.6);
  sign.position.set(px - 3.6, 2.4, pz + 2.66); scene.add(sign);
  collide(px - 3.6, pz + 2.6, 0.3);
  interact({ x: px, z: pz + 3.4, r: 2.2, label: '🚀 우주선 타고 하늘섬 가기', action: () => flyRocket('star', 'sky') });
  I.marks.push(['🚀', px, pz]);
  ZONE_LABELS.push(['🚀 우주선', px, 7, pz]);
}
function openSouvenirShop() {
  sfx.ok();
  const helmet = SHOP_ITEMS.find((i) => i.id === 'helmet');
  openMenu({
    title: '🎁 별빛 기념품 가게',
    desc: () => `"하늘섬을 꾸밀 반짝이는 기념품이 가득해요! 사면 하늘섬으로 배달해 드려요"<br>내 코인 🪙 ${S.coins}`,
    items: () => [
      ...SOUVENIRS.map((v) => {
        const owned = S.skyItems.includes(v.id);
        return {
          label: `${v.emoji} ${v.name}`, right: owned ? '✅ 하늘섬에 있어요' : `🪙 ${v.price}`, dim: !owned && S.coins < v.price,
          act: () => {
            if (owned) return true;
            if (S.coins < v.price) { sfx.no(); toast(`코인이 ${v.price - S.coins}개 더 필요해요 🪙`); return true; }
            S.coins -= v.price;
            S.skyItems.push(v.id);
            persist();
            refreshSky();
            sfx.fanfare();
            toast(`${v.emoji} ${v.name}이(가) 하늘섬에 배달됐어요! 🚀 우주선을 타고 꾸미러 가요`, 3.6);
            return true;
          },
        };
      }),
      {
        label: `${helmet.emoji} ${helmet.name} (쓰는 기념품)`, right: S.owned.includes('helmet') ? '✅ 갖고 있어요' : '🪙 9', dim: !S.owned.includes('helmet') && S.coins < 9,
        act: () => {
          if (S.owned.includes('helmet')) return true;
          if (S.coins < 9) { sfx.no(); toast('코인이 모자라요 🪙'); return true; }
          S.coins -= 9; givePrize('helmet', 0); return true;
        },
      },
      { label: '그만두기', act: () => false },
    ],
  });
}

/* ---------- ☁️ 하늘섬 만들기 ---------- */
{
  const { x, z, y, r } = SKY;
  SKY.groundMesh = add(new THREE.CylinderGeometry(r, r, 1, 56), toon({ color: SKY.ground }), x, y - 0.5, z, scene, false);
  SKY.warm = true;
  // 떠 있는 섬 아랫부분 (거꾸로 된 바위산)
  add(new THREE.ConeGeometry(r - 0.5, 22, 40), 0xb8a8d8, x, y - 12.2, z, scene, false).rotation.x = Math.PI;
  add(new THREE.ConeGeometry(r * 0.5, 14, 24), 0xa898c8, x + 6, y - 16, z - 4, scene, false).rotation.x = Math.PI;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    add(new THREE.OctahedronGeometry(rr(0.6, 1.2), 0), glowToon(pick([0x9fd6ff, 0xc3a6ff, 0xffc4d8]), 0.4), x + Math.cos(a) * (r - 4), y - rr(3, 8), z + Math.sin(a) * (r - 4), scene, false);
  }
  // 가장자리 구름 울타리와 아래 구름 바다
  const cloudM = toon({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 });
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const c = add(new THREE.SphereGeometry(rr(1.2, 1.9), 12, 10), cloudM, x + Math.cos(a) * (r + 0.6), y + 0.2, z + Math.sin(a) * (r + 0.6), scene, false);
    c.scale.y = 0.6;
  }
  for (let i = 0; i < 40; i++) {
    const a = rr(0, 6.3), d = rr(r + 6, r + 60);
    const c = add(new THREE.SphereGeometry(rr(4, 9), 12, 10), cloudM, x + Math.cos(a) * d, y - rr(8, 20), z + Math.sin(a) * d, scene, false);
    c.scale.y = 0.45;
  }
  // 무지개 아치 입구
  const cols = [0xff9b9b, 0xffc98a, 0xfff1a8, 0xa8f0c0, 0x9fd6ff, 0xc3a6ff];
  cols.forEach((c, i) => { const t = add(new THREE.TorusGeometry(4 - i * 0.28, 0.14, 8, 32, Math.PI), c, x, y, z + 12, scene, false); });
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.4; tree(x + Math.cos(a) * (r - 4), z + Math.sin(a) * (r - 4), rr(0.8, 1.1), 'pink'); }
  const sign = signPlane('☁️ 하늘섬', 2.6, { font: 86, border: '#9fd6ff' });
  sign.position.set(x - 4.5, y + 2.2, z + 13); scene.add(sign);
  add(new THREE.CylinderGeometry(0.1, 0.1, 2, 6), 0xb07a56, x - 4.5, y + 1, z + 12.95);
  collide(x - 4.5, z + 12.95, 0.3);
  // 꾸미기 안내판
  const deco = signPlane('🛠️ 하늘섬 꾸미기', 2.6, { w: 640, h: 160, font: 72, border: '#ff8fb1' });
  deco.position.set(x + 4.5, y + 2.2, z + 13); scene.add(deco);
  add(new THREE.CylinderGeometry(0.1, 0.1, 2, 6), 0xb07a56, x + 4.5, y + 1, z + 12.95);
  collide(x + 4.5, z + 12.95, 0.3);
  interact({ x: x + 4.5, z: z + 14.6, r: 1.8, label: '🛠️ 기념품으로 하늘섬 꾸미기 (F)', action: () => startSkyDeco() });
  // 돌아가는 우주선
  PADS.sky = launchPad(x, z - 17);
  PADS.sky.island = SKY;
  interact({ x, z: z - 13.6, r: 2.0, label: '🚀 우주선 타고 별빛섬으로 돌아가기', action: () => flyRocket('sky', 'star') });
  SKY.marks.push(['🚀', x, z - 17], ['🛠️', x + 4.5, z + 13], ['🌈', x, z + 12]);
  ZONE_LABELS.push(['☁️ 하늘섬', x, y + 10, z]);
  glowLight(x, y + 4, z, 0xffd6a0, 22);
}
// 기념품 배치
const skyModels = {}, skyCols = {};
const SKY_SLOTS = [[-8, -4], [8, -4], [-12, 4], [12, 4], [-7, 9], [7, 9], [0, 2], [-14, -6]];
SOUVENIRS.forEach((v, i) => {
  const m = souvenirModel(v.id);
  m.scale.setScalar(1.35);
  m.visible = false;
  scene.add(m);
  skyModels[v.id] = m;
  const c = { x: 0, z: 0, r: v.r * 1.35, off: true };
  colliders.push(c);
  skyCols[v.id] = c;
  v.slot = SKY_SLOTS[i % SKY_SLOTS.length];
});
const skyLayout = (id) => S.skyLayout[id] || [...SOUVENIRS.find((v) => v.id === id).slot, 0, 0];
function refreshSky() {
  for (const v of SOUVENIRS) {
    const m = skyModels[v.id], [lx, lz, rot, stored] = skyLayout(v.id);
    m.position.set(SKY.x + lx, SKY.y, SKY.z + lz);
    m.rotation.y = rot;
    m.visible = S.skyItems.includes(v.id) && !stored;
    const c = skyCols[v.id];
    c.x = m.position.x; c.z = m.position.z; c.off = !m.visible;
  }
}
tickers.push((dt) => {
  const glow = clamp((tod - 0.6) / 1.2, 0, 1);
  for (const m of skyGlowMats) m.emissiveIntensity = m.userData.base + glow * 0.6;
  const st = skyModels.starStatue.getObjectByName('spin');
  if (st) st.rotation.y += dt;
  skyModels.chime.children.filter((c) => c.name === 'swing').forEach((p, i) => (p.rotation.z = Math.sin(elapsed * 1.6 + i) * 0.25));
  skyModels.planet.children[2].rotation.z += dt * 0.5;
});

/* ---------- 🛠️ 하늘섬 꾸미기 모드 ---------- */
const skyRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 8, 32), new THREE.MeshBasicMaterial({ color: 0xff6f91 }));
skyRing.rotation.x = Math.PI / 2;
skyRing.visible = false;
scene.add(skyRing);
const SD = { list: [], idx: 0 };
function startSkyDeco() {
  SD.list = SOUVENIRS.filter((v) => S.skyItems.includes(v.id));
  if (!SD.list.length) { sfx.no(); toast('🎁 아직 기념품이 없어요. 별빛섬 기념품 가게에서 사 오세요!', 3.4); return; }
  for (const v of SD.list) if (!S.skyLayout[v.id]) S.skyLayout[v.id] = skyLayout(v.id);
  SD.idx = clamp(SD.idx, 0, SD.list.length - 1);
  state = 'skydeco';
  skyRing.visible = true;
  $('prompt').classList.add('hidden');
  sfx.ok();
  updateSkyDecoMsg();
}
function updateSkyDecoMsg() {
  const v = SD.list[SD.idx];
  $('scene-msg').classList.add('panel');
  sceneMsg(`🛠️ <b>${v.emoji} ${v.name}</b> (${SD.idx + 1}/${SD.list.length})${S.skyLayout[v.id][3] ? ' · 📦 보관 중' : ''}<br>` +
    '<kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> 옮기기 · <kbd>Q</kbd><kbd>R</kbd> 돌리기 · <kbd>Tab</kbd> 다음 기념품 · <kbd>P</kbd> 넣기/꺼내기 · <kbd>Enter</kbd> 완료');
}
modes.skydeco = {
  key(code) {
    const v = SD.list[SD.idx], L = S.skyLayout[v.id];
    if (code === 'Tab' || code === 'BracketRight') { SD.idx = (SD.idx + 1) % SD.list.length; sfx.select(); }
    else if (code === 'BracketLeft') { SD.idx = (SD.idx - 1 + SD.list.length) % SD.list.length; sfx.select(); }
    else if (code === 'KeyQ') { L[2] += Math.PI / 4; sfx.select(); }
    else if (code === 'KeyR') { L[2] -= Math.PI / 4; sfx.select(); }
    else if (code === 'KeyP') { L[3] = L[3] ? 0 : 1; sfx.pop(); }
    else if (code === 'Enter' || code === 'Escape' || code === 'KeyF') {
      state = 'play'; skyRing.visible = false; sceneMsg(null); $('scene-msg').classList.remove('panel');
      for (const m of Object.values(skyModels)) m.position.y = SKY.y;
      refreshSky(); persist(); sfx.ok(); toast('☁️ 하늘섬 꾸미기를 저장했어요!');
      return;
    } else return;
    refreshSky();
    updateSkyDecoMsg();
  },
  update(dt) {
    animateCreature(player, false, 0, dt, elapsed);
    const v = SD.list[SD.idx], L = S.skyLayout[v.id];
    let dx = 0, dz = 0;
    if (down('ArrowLeft', 'KeyA')) dx -= 1;
    if (down('ArrowRight', 'KeyD')) dx += 1;
    if (down('ArrowUp', 'KeyW')) dz -= 1;
    if (down('ArrowDown', 'KeyS')) dz += 1;
    if (dx || dz) {
      L[0] += dx * 5 * dt; L[1] += dz * 5 * dt;
      const d = Math.hypot(L[0], L[1]), lim = SKY.r - 2.5;
      if (d > lim) { L[0] *= lim / d; L[1] *= lim / d; }
      refreshSky();
    }
    for (const m of Object.values(skyModels)) m.position.y = SKY.y;
    const m = skyModels[v.id];
    if (L[3]) m.visible = true;
    m.position.y = SKY.y + (L[3] ? 0 : 0.2 + Math.abs(Math.sin(elapsed * 4)) * 0.15);
    skyRing.position.set(SKY.x + L[0], SKY.y + 0.08, SKY.z + L[1]);
    skyRing.scale.setScalar(Math.max(0.8, v.r + 0.4) * (1.1 + Math.sin(elapsed * 5) * 0.05));
    skyRing.material.color.setHex(L[3] ? 0xb0b0b0 : 0xff6f91);
  },
  camera() {
    return { pos: tmpCamPos.set(SKY.x, SKY.y + 26, SKY.z + 22), target: tmpCamTarget.set(SKY.x, SKY.y, SKY.z - 0.5), fov: 50, speed: 3 };
  },
};
playKeyHooks.push((code) => {
  if (code !== 'KeyF' || insideHouse || islandAt(player.root.position) !== SKY) return false;
  startSkyDeco();
  return true;
});

/* ---------- 🚀 우주선 비행 장면 ---------- */
const RK = { t: 0, from: null, to: null, landed: false, said: {} };
function flyRocket(fromId, toId) {
  RK.from = PADS[fromId]; RK.to = PADS[toId]; RK.t = 0; RK.landed = false; RK.said = {};
  if (riding) setRiding(false);
  state = 'rocket';
  player.root.visible = false;
  $('prompt').classList.add('hidden');
  sfx.ok();
  say(player, toId === 'sky' ? '하늘섬으로 출발~! 🚀' : '별빛섬으로 돌아가자! 🚀', 1.4);
}
const rkPos = new THREE.Vector3();
const flameCol = new THREE.Color(0xffb347), smokeCol = new THREE.Color(0xfff1d6);
modes.rocket = {
  key() {},
  update(dt) {
    const t = (RK.t += dt);
    const F = RK.from, T = RK.to;
    const once = (k, fn) => { if (!RK.said[k]) { RK.said[k] = 1; fn(); } };
    if (t < 1.8) {
      // 카운트다운
      const n = 3 - Math.floor(t / 0.6);
      once('c' + n, () => { sceneMsg(`🚀 발사 준비… <b style="font-size:30px">${n}</b>`); tone(660 + (3 - n) * 110, 0.15, 'square', 0.05); });
      F.rocket.position.set(F.x + Math.sin(t * 60) * 0.03 * t, F.y, F.z);
      if (Math.random() < 0.6) spark(F.x + rr(-1, 1), F.y + 0.2, F.z + rr(-1, 1), rr(-2, 2), rr(0.5, 2), rr(-2, 2), 0.8, smokeCol, 0.9, 1.5, -0.5);
    } else if (t < 4.6) {
      // 발사! 하늘로 쭉
      once('go', () => { sceneMsg('🚀 슝~~~! 구름을 뚫고 하늘로!'); noise(2.8, 500, 0.45, 'lowpass', 90); tone(180, 2.6, 'sawtooth', 0.04, 4); });
      const k = t - 1.8;
      F.rocket.position.set(F.x + Math.sin(t * 40) * 0.04, F.y + 6 * k * k, F.z);
      F.rocket.userData.flame.visible = true;
      F.rocket.userData.flame.scale.set(1, 1 + Math.sin(t * 50) * 0.25, 1);
      const p = F.rocket.position;
      for (let i = 0; i < 3; i++) spark(p.x + rr(-0.3, 0.3), p.y - 0.6, p.z + rr(-0.3, 0.3), rr(-1.5, 1.5), -rr(6, 12), rr(-1.5, 1.5), rr(0.4, 0.8), i ? flameCol : smokeCol, 1.0, 1.2, 0);
      if (t > 3.6) once('fade', () => { $('fade').classList.add('white', 'on'); });
    } else if (t < 4.9) {
      // 하얀 구름 속에서 장소를 바꿔요
      once('swap', () => {
        F.rocket.position.set(F.x, F.y, F.z);
        F.rocket.userData.flame.visible = false;
        T.rocket.position.set(T.x, T.y + 55, T.z);
        T.rocket.userData.flame.visible = true;
        camera.position.set(T.x + 10, T.y + 40, T.z + 13);
        lookAt.set(T.x, T.y + 45, T.z);
        if (T.island === SKY) refreshSky();
      });
    } else if (t < 8.0) {
      once('in', () => { $('fade').classList.remove('on'); sceneMsg(T.island === SKY ? '☁️ 구름 위 하늘섬이 보여요!' : '🔭 별빛섬에 다시 내려가요~'); });
      // 사뿐히 착륙
      const k = clamp((t - 4.9) / 2.8, 0, 1), e = 1 - Math.pow(1 - k, 3);
      T.rocket.position.set(T.x, T.y + 55 * (1 - e), T.z);
      T.rocket.userData.flame.scale.set(1, 0.6 + (1 - k) * 0.6, 1);
      const p = T.rocket.position;
      if (Math.random() < 0.7) spark(p.x + rr(-0.3, 0.3), p.y - 0.6, p.z + rr(-0.3, 0.3), rr(-1, 1), -rr(3, 6), rr(-1, 1), 0.5, flameCol, 0.9, 1.2, 0);
      if (k >= 1) once('land', () => {
        T.rocket.userData.flame.visible = false;
        sfx.land();
        for (let i = 0; i < 30; i++) { const a = rr(0, 6.3); spark(T.x + Math.cos(a), T.y + 0.3, T.z + Math.sin(a), Math.cos(a) * 4, rr(0.5, 1.5), Math.sin(a) * 4, 0.9, smokeCol, 1.0, 2, -0.5); }
      });
    } else {
      $('fade').classList.remove('white');
      sceneMsg(null);
      state = 'play';
      player.root.visible = true;
      // 우주선 앞(카메라 쪽)으로 내려요
      player.root.position.set(T.x, groundY(T.x, T.z + 3.6), T.z + 3.6);
      player.root.rotation.set(0, 0, 0);
      camera.position.set(T.x, T.y + 13, T.z + 19.6);
      lookAt.set(T.x, T.y + 1.4, T.z + 3.6);
      sfx.fanfare();
      toast(T.island === SKY ? '☁️ 하늘섬에 도착했어요! 🛠️ 안내판(F)에서 기념품으로 꾸밀 수 있어요' : '🔭 별빛섬에 돌아왔어요!', 4);
      if (follower) { follower.c.root.position.set(T.x + 1.5, groundY(T.x, T.z + 4), T.z + 4); say(follower.c, '우와, 진짜 날았어! 🚀', 2.4, follower.name); }
    }
  },
  camera() {
    const t = RK.t;
    if (t < 4.6) {
      const r = RK.from.rocket.position;
      return { pos: tmpCamPos.set(RK.from.x + 11, RK.from.y + 4 + (r.y - RK.from.y) * 0.75, RK.from.z + 13), target: tmpCamTarget.set(r.x, r.y + 2.5, r.z), fov: 55, speed: 3, lookSpeed: 6 };
    }
    const r = RK.to.rocket.position;
    return { pos: tmpCamPos.set(RK.to.x + 10, RK.to.y + 5 + (r.y - RK.to.y) * 0.6, RK.to.z + 13), target: tmpCamTarget.set(r.x, r.y + 2.5, r.z), fov: 55, speed: 3, lookSpeed: 6 };
  },
};
