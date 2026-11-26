/* =========================================================
   🐞 곤충 채집 & 도감
   ========================================================= */
// when: 언제 나오는지, home: 어디에 사는지
const BUGS = [
  { id: 'butterfly', seasons: ['spring', 'summer'], name: '노랑나비', emoji: '🦋', when: () => tod < 1.5 && !isRaining(), home: 'flower', fly: true, hint: '맑은 낮, 꽃밭' },
  { id: 'ladybug', seasons: ['spring', 'summer', 'autumn'], name: '무당벌레', emoji: '🐞', when: () => tod < 1.5 && !isRaining(), home: 'bush', hint: '낮, 풀숲' },
  { id: 'bee', seasons: ['spring', 'summer'], name: '꿀벌', emoji: '🐝', when: () => tod < 1.2 && !isRaining(), home: 'sunflower', fly: true, hint: '낮, 해바라기 미로' },
  { id: 'beetle', seasons: ['summer'], name: '장수풍뎅이', emoji: '🪲', when: () => tod > 1.2, home: 'tree', hint: '저녁~밤, 나무' },
  { id: 'cricket', seasons: ['summer', 'autumn'], name: '귀뚜라미', emoji: '🦗', when: () => tod > 1.5, home: 'grass', hint: '밤, 풀밭' },
  { id: 'firefly', seasons: ['summer'], name: '반딧불이', emoji: '✨', when: () => tod > 1.6 && !isRaining(), home: 'hill', fly: true, hint: '밤, 낮잠 언덕' },
  { id: 'snail', seasons: ['spring', 'summer', 'autumn'], name: '달팽이', emoji: '🐌', when: () => isRaining() || W.afterRain > 0, home: 'grass', hint: '비 오는 날이나 비 온 뒤' },
  { id: 'frog', seasons: ['spring', 'summer'], name: '청개구리', emoji: '🐸', when: () => isRaining(), home: 'pond', hint: '비 오는 날, 호숫가' },
  { id: 'dragonfly', seasons: ['summer', 'autumn'], name: '고추잠자리', emoji: '🔸', when: () => tod > 0.6 && tod < 1.6 && !isRaining(), home: 'grass', fly: true, hint: '노을 질 무렵' },
];
function bugModel(id) {
  const g = new THREE.Group();
  const wingMat = (c) => new THREE.MeshToonMaterial({ color: c, gradientMap: gradTex, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const wings = [];
  const addWings = (c, w, h, y) => {
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group(); pivot.position.y = y; g.add(pivot);
      const wing = new THREE.Mesh(new THREE.CircleGeometry(1, 12), wingMat(c));
      wing.scale.set(w, h, 1); wing.position.x = s * w; wing.rotation.x = -Math.PI / 2;
      pivot.add(wing); pivot.userData.s = s; wings.push(pivot);
    }
  };
  if (id === 'butterfly') { add(new THREE.CapsuleGeometry(0.04, 0.2, 4, 6), 0x5a3e34, 0, 0.1, 0, g, false).rotation.x = Math.PI / 2; addWings(0xffe066, 0.18, 0.15, 0.1); }
  else if (id === 'ladybug') { const b = add(new THREE.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xff4d4d, 0, 0.03, 0, g, false); add(new THREE.SphereGeometry(0.07, 8, 6), 0x2b2b2b, 0, 0.06, 0.14, g, false); for (const [x, z] of [[0.07, 0.02], [-0.07, 0.02], [0.05, -0.08], [-0.05, -0.08]]) add(new THREE.SphereGeometry(0.03, 6, 4), 0x2b2b2b, x, 0.15, z, g, false); }
  else if (id === 'bee') { const b = add(new THREE.SphereGeometry(0.12, 12, 8), toon({ map: stripeTexture('#ffd23f', '#3b2a25', 6) }), 0, 0.1, 0, g, false); b.scale.set(0.9, 0.9, 1.4); b.rotation.y = Math.PI / 2; addWings(0xffffff, 0.09, 0.07, 0.2); }
  else if (id === 'beetle') { const b = add(new THREE.SphereGeometry(0.17, 12, 8), 0x6a3a22, 0, 0.1, 0, g, false); b.scale.set(1, 0.6, 1.4); add(new THREE.ConeGeometry(0.04, 0.22, 6), 0x5a2a12, 0, 0.2, 0.25, g, false).rotation.x = 0.9; }
  else if (id === 'cricket') { const b = add(new THREE.SphereGeometry(0.1, 10, 8), 0x6a5a2a, 0, 0.08, 0, g, false); b.scale.set(1, 0.8, 1.8); for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), 0x6a5a2a, s * 0.05, 0.2, 0.25, g, false).rotation.x = 1; }
  else if (id === 'firefly') { add(new THREE.SphereGeometry(0.08, 8, 6), 0x3b2a25, 0, 0.1, 0, g, false); add(new THREE.SphereGeometry(0.09, 8, 6), toon({ color: 0xeaff8a, emissive: 0xd8ff5a, emissiveIntensity: 1.5 }), 0, 0.08, -0.1, g, false); addWings(0xffffff, 0.07, 0.05, 0.14); }
  else if (id === 'snail') { add(new THREE.TorusGeometry(0.1, 0.07, 8, 16), 0xe0a26b, 0, 0.18, 0, g, false).rotation.y = Math.PI / 2; const b = add(new THREE.CapsuleGeometry(0.06, 0.3, 4, 8), 0xffe6c7, 0, 0.06, 0.05, g, false); b.rotation.x = Math.PI / 2; }
  else if (id === 'frog') { const b = add(new THREE.SphereGeometry(0.18, 12, 10), 0x7fd36a, 0, 0.14, 0, g, false); b.scale.set(1.1, 0.8, 1); for (const s of [-1, 1]) { add(new THREE.SphereGeometry(0.07, 8, 6), 0x7fd36a, s * 0.09, 0.27, 0.08, g, false); add(new THREE.SphereGeometry(0.035, 6, 4), 0x2b2b2b, s * 0.09, 0.29, 0.13, g, false); } }
  else if (id === 'dragonfly') { const b = add(new THREE.CapsuleGeometry(0.03, 0.4, 4, 6), 0xff5a3d, 0, 0.1, -0.05, g, false); b.rotation.x = Math.PI / 2; addWings(0xe8f6ff, 0.22, 0.05, 0.12); }
  g.userData.wings = wings;
  g.scale.setScalar(1.6);
  return g;
}
const SEASON_KO = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' };
BUGS.forEach((b) => (b.hint = `${b.seasons.map((x) => SEASON_KO[x]).join('·')} — ${b.hint}`));
const inSeason = (b) => b.seasons.includes(season().id);
const bugModels = Object.fromEntries(BUGS.map((b) => [b.id, null]));

function habitatSpot(home) {
  for (let i = 0; i < 40; i++) {
    let x, z, y = 0;
    if (home === 'tree' && TREES.length) { const t = pick(TREES); const a = rr(0, 6.3); x = t.x + Math.cos(a) * 0.4 * t.s; z = t.z + Math.sin(a) * 0.4 * t.s; y = 0.9 * t.s; return [x, y, z]; }
    if (home === 'sunflower') { x = MAZE_CENTER[0] + rr(-8, 8); z = MAZE_CENTER[1] + rr(-6, 6); y = 1.3; }
    else if (home === 'hill') { const a = rr(0, 6.3), d = rr(2, HILL.r - 2); x = HILL.x + Math.cos(a) * d; z = HILL.z + Math.sin(a) * d; y = 1.2; }
    else if (home === 'pond') { const a = rr(0.4, Math.PI - 0.4) + Math.PI; x = POND.x + Math.cos(a) * (POND.r + 1); z = POND.z + Math.sin(a) * (POND.r + 1); }
    else { const s = randomFreeSpot(); x = s[0]; z = s[1]; y = home === 'flower' ? 0.6 : 0; }
    if (home !== 'sunflower' && colliders.some((c) => Math.hypot(c.x - x, c.z - z) < c.r + 0.4)) continue;
    return [x, groundY(x, z) + y, z];
  }
  return null;
}

// 동시에 6마리까지 마을 어딘가에 나타나요
const bugSlots = Array.from({ length: 6 }, () => ({ bug: null, m: null, base: new THREE.Vector3(), cool: rr(1, 6), flee: 0, ph: rr(0, 9) }));
function spawnBug(slot, forceId) {
  const cands = forceId ? BUGS.filter((b) => b.id === forceId) : BUGS.filter((b) => b.when() && inSeason(b) && !bugSlots.some((s) => s.bug === b && s !== slot));
  if (!cands.length) { slot.cool = 5; return; }
  const bug = pick(cands);
  const spot = habitatSpot(bug.home);
  if (!spot) { slot.cool = 3; return; }
  if (slot.m) scene.remove(slot.m);
  slot.bug = bug;
  slot.m = bugModel(bug.id);
  slot.base.set(...spot);
  slot.m.position.copy(slot.base);
  slot.flee = 0;
  scene.add(slot.m);
}
function despawnBug(slot, cool = rr(6, 14)) {
  slot.forced = false;
  if (slot.m) scene.remove(slot.m);
  slot.m = null; slot.bug = null; slot.cool = cool;
}
function spawnBugNear(id) {
  const s = bugSlots[0];
  spawnBug(s, id);
  s.forced = true;
  const p = player.root.position;
  s.base.set(p.x + 2, groundY(p.x + 2, p.z) + (s.bug.fly ? 0.8 : 0), p.z);
}
bugSlots.forEach((slot) => {
  interact({
    get x() { return slot.m ? slot.m.position.x : 9999; },
    get z() { return slot.m ? slot.m.position.z : 9999; },
    get r() { return slot.m && slot.flee <= 0 && !insideHouse ? 1.9 : 0; },
    get label() { return slot.bug ? `${slot.bug.emoji} ${slot.bug.name} 잡기 (살금살금…)` : ''; },
    action: () => catchBug(slot),
  });
});
function catchBug(slot) {
  const bug = slot.bug;
  if (!bug) return;
  const n = (S.bugDex[bug.id] || 0) + 1;
  S.bugDex[bug.id] = n;
  const p = slot.m.position;
  sparkle(p.x, p.y + 0.3, p.z, new THREE.Color(0xfff1a8), 20);
  despawnBug(slot);
  if (n === 1) {
    S.coins += 3;
    sfx.fanfare();
    toast(`📖 새로운 곤충! ${bug.emoji} ${bug.name}을(를) 도감에 기록했어요 (+3🪙)`, 3.5);
  } else sfx.ding();
  persist();
  addXP(5 + (n === 1 ? 10 : 0), '곤충 채집');
  daily('bug');
  say(player, `${bug.emoji} ${bug.name} 잡았다! ${n > 1 ? `(${n}마리째)` : ''}`, 2.4);
  setTimeout(() => say(player, '잘 가~ 놓아줄게 👋', 1.6), 2500);
}
tickers.push((dt) => {
  const pp = player.root.position;
  const loud = down('ShiftLeft', 'ShiftRight') || riding;
  for (const s of bugSlots) {
    if (!s.m) { if (state === 'play') { s.cool -= dt; if (s.cool <= 0) spawnBug(s); } continue; }
    if ((!s.bug.when() || !inSeason(s.bug)) && s.flee <= 0 && !s.forced) { despawnBug(s, 2); continue; }
    s.ph += dt;
    const d = Math.hypot(s.m.position.x - pp.x, s.m.position.z - pp.z);
    // 뛰거나 자전거로 다가가면 깜짝 놀라 도망가요
    if (s.flee <= 0 && loud && d < 4.5 && state === 'play') {
      s.flee = 1.6;
      say(player, pick(['앗, 도망갔다!', '살금살금 걸어야 하는데…']), 1.6);
    }
    if (s.flee > 0) {
      s.flee -= dt;
      s.m.position.y += dt * 4;
      s.m.position.x += (s.m.position.x - pp.x) * dt;
      s.m.position.z += (s.m.position.z - pp.z) * dt;
      if (s.flee <= 0) despawnBug(s);
      continue;
    }
    const b = s.bug, m = s.m;
    if (b.fly) {
      m.position.set(s.base.x + Math.sin(s.ph * 0.7) * 1.2, s.base.y + 0.4 + Math.sin(s.ph * 2.1) * 0.25, s.base.z + Math.cos(s.ph * 0.5) * 1.2);
      m.rotation.y = s.ph * 0.7 + Math.PI / 2;
    } else {
      m.position.x = s.base.x + Math.sin(s.ph * 0.25) * 0.5;
      m.position.z = s.base.z + Math.cos(s.ph * 0.2) * 0.5;
      m.rotation.y = s.ph * 0.25;
      if (b.id === 'frog' || b.id === 'cricket') m.position.y = s.base.y + Math.max(0, Math.sin(s.ph * 3)) * 0.3;
    }
    for (const w of m.userData.wings) w.rotation.z = w.userData.s * Math.sin(s.ph * (b.id === 'butterfly' ? 10 : 40)) * 0.8;
  }
});

// 도감 (G)
function openDex() {
  sfx.ok();
  const bugN = BUGS.filter((b) => S.bugDex[b.id]).length, fishN = FISH.filter((f) => S.fishDex[f.id]).length;
  openMenu({
    title: '📖 포근마을 도감',
    desc: () => `곤충 ${bugN}/${BUGS.length} · 별자리 ${CONSTELLATIONS.filter((c) => S.stars[c.id]).length}/${CONSTELLATIONS.length} · 물고기 ${fishN}/${FISH.length} — 새로 찾을 때마다 코인을 받아요!`,
    items: () => [
      ...BUGS.map((b) => ({ label: S.bugDex[b.id] ? `${b.emoji} ${b.name}` : '❔ ???', right: S.bugDex[b.id] ? `×${S.bugDex[b.id]}` : `힌트: ${b.hint}`, dim: !S.bugDex[b.id], act: () => true })),
      ...CONSTELLATIONS.map((c) => ({ label: S.stars[c.id] ? `${c.emoji} ${c.name}` : '❔ ???', right: S.stars[c.id] ? '✨ 찾았어요' : '힌트: 🔭 별빛섬 천문대 (밤)', dim: !S.stars[c.id], act: () => true })),
      ...FISH.map((f) => ({ label: S.fishDex[f.id] ? `${f.emoji} ${f.name}` : '❔ ???', right: S.fishDex[f.id] ? `×${S.fishDex[f.id]}` : `힌트: ${f.hint || '선착장 낚시'}`, dim: !S.fishDex[f.id], act: () => true })),
      { label: '닫기', act: () => false },
    ],
  });
}
playKeyHooks.push((code) => { if (code === 'KeyG') { openDex(); return true; } return false; });
