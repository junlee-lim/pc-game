/* =========================================================
   🌻 해바라기 미로 & 수박 찾기 (북서쪽)
   ========================================================= */
const MAZE = {
  x0: -44, z0: -32, cell: 2,
  rows: [
    '#########',
    '#...#...#',
    '#.#.#.#.#',
    '#.#...#..',
    '#.###.#.#',
    '#.....#.#',
    '#########',
  ],
};
const mazeCell = (c, r) => [MAZE.x0 + c * MAZE.cell + MAZE.cell / 2, MAZE.z0 + r * MAZE.cell + MAZE.cell / 2];
const MAZE_CENTER = [MAZE.x0 + (9 * MAZE.cell) / 2, MAZE.z0 + (7 * MAZE.cell) / 2];
AVOID.push([MAZE_CENTER[0], MAZE_CENTER[1], 11]);
{
  // 밭 흙바닥
  const soil = add(new THREE.PlaneGeometry(9 * MAZE.cell + 1, 7 * MAZE.cell + 1), 0xd9c48f, MAZE_CENTER[0], 0.025, MAZE_CENTER[1], scene, false);
  soil.rotation.x = -Math.PI / 2;
  const spots = [];
  MAZE.rows.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch !== '#') return;
    const [cx, cz] = mazeCell(c, r);
    collide(cx, cz, 1.12);
    for (const [ox, oz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) spots.push([cx + ox + rr(-0.15, 0.15), cz + oz + rr(-0.15, 0.15)]);
  }));
  const N = spots.length;
  const stem = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.08, 1, 6), mat(0x6cbf5d), N);
  const petals = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 12), mat(0xffd23f), N);
  const center = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.26, 0.26, 0.1, 12), mat(0x8a5a2c), N);
  const leaf = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 8, 6), mat(0x7fcf6b), N * 2);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), v = new THREE.Vector3();
  spots.forEach(([x, z], i) => {
    const h = rr(1.9, 2.6);
    m4.compose(v.set(x, h / 2, z), q.identity(), sc.set(1, h, 1));
    stem.setMatrixAt(i, m4);
    // 꽃은 남쪽(카메라 쪽)을 보며 살짝 고개를 숙여요
    q.setFromEuler(e.set(Math.PI / 2 - 0.35, rr(-0.4, 0.4), 0, 'YXZ'));
    m4.compose(v.set(x, h + 0.1, z + 0.05), q, sc.set(1, 1, 1));
    petals.setMatrixAt(i, m4);
    m4.compose(v.set(x, h + 0.1, z + 0.1), q, sc.set(1, 1, 1));
    center.setMatrixAt(i, m4);
    for (const s of [0, 1]) {
      m4.compose(v.set(x + (s ? 0.18 : -0.18), h * (s ? 0.45 : 0.6), z), q.setFromEuler(e.set(0, 0, s ? -0.6 : 0.6)), sc.set(1.4, 0.4, 0.7));
      leaf.setMatrixAt(i * 2 + s, m4);
    }
  });
  for (const im of [stem, petals, center, leaf]) { im.castShadow = true; im.receiveShadow = true; scene.add(im); }
  const sign = signPlane('🌻 해바라기 미로', 3.2, { w: 640, h: 160, font: 76, border: '#ffd23f' });
  const [ex, ez] = mazeCell(8, 3);
  add(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 6), 0xb07a56, ex + 2.2, 1.1, ez + 2.4);
  sign.position.set(ex + 2.2, 2.4, ez + 2.46);
  scene.add(sign);
  collide(ex + 2.2, ez + 2.4, 0.3);
}
ZONE_LABELS.push(['🌻 해바라기 미로', MAZE_CENTER[0], 5, MAZE_CENTER[1]]);
MAP_MARKS.push(['🌻', MAZE_CENTER[0], MAZE_CENTER[1]]);

// 수박: 미로의 막다른 길에 숨어 있어요
const MELON_SPOTS = (() => {
  // 입구에서 가장 멀리 떨어진 칸 3곳에 숨겨요
  const key = (c, r) => c + ',' + r;
  const dist = new Map([[key(8, 3), 0]]);
  const queue = [[8, 3]];
  while (queue.length) {
    const [c, r] = queue.shift();
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr;
      if ((MAZE.rows[nr] || '')[nc] !== '.' || dist.has(key(nc, nr))) continue;
      dist.set(key(nc, nr), dist.get(key(c, r)) + 1);
      queue.push([nc, nr]);
    }
  }
  const cells = [...dist.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k.split(',').map(Number));
  const picked = [];
  for (const [c, r] of cells) {
    if (picked.every(([pc, pr]) => Math.abs(pc - c) + Math.abs(pr - r) > 3)) picked.push([c, r]);
    if (picked.length === 3) break;
  }
  return picked.map(([c, r]) => mazeCell(c, r));
})();
const melonTex = (() => {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#5fbf4a'; g.fillRect(0, 0, 128, 64);
  g.strokeStyle = '#2f7a2c'; g.lineWidth = 6;
  for (let i = 0; i < 8; i++) { g.beginPath(); for (let y = 0; y <= 64; y += 4) g.lineTo(i * 16 + Math.sin(y * 0.3) * 3, y); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
function melonModel() {
  const g = new THREE.Group();
  const b = add(new THREE.SphereGeometry(0.45, 18, 14), toon({ map: melonTex }), 0, 0.38, 0, g);
  b.scale.set(1.15, 0.85, 1);
  add(new THREE.CylinderGeometry(0.03, 0.02, 0.15, 5), 0x6a8a3c, 0, 0.78, 0, g, false);
  return g;
}
const melons = MELON_SPOTS.map(([x, z]) => {
  const m = melonModel();
  m.position.set(x, 0, z);
  scene.add(m);
  const melon = { m, respawn: 0 };
  interact({
    x, z, get r() { return m.visible ? 1.6 : 0; },
    label: '수박 줍기 🍉',
    action: () => pickMelon(melon),
  });
  return melon;
});
function pickMelon(melon) {
  sfx.ok();
  openMenu({
    title: '🍉 커다란 수박을 찾았다!',
    desc: () => '동글동글 줄무늬가 선명한 게 아주 잘 익었어요.',
    items: () => [
      { label: '그 자리에서 쪼개 먹기', right: '포만감 +30 · 기운 +10', act: () => {
        melon.m.visible = false; melon.respawn = 60;
        S.full = clamp(S.full + 30, 0, 100); S.energy = clamp(S.energy + 10, 0, 100); persist();
        sfx.eat();
        say(player, '아삭아삭~ 달고 시원해! 🍉', 3);
        return false;
      } },
      { label: '가방에 넣어 가기 🎒', right: '친구 선물용', act: () => {
        melon.m.visible = false; melon.respawn = 60;
        bagAdd('melon');
        toast('🍉 수박을 가방에 넣었어요! 마을 친구에게 선물해 보세요', 3);
        return false;
      } },
      { label: '그냥 두기', act: () => false },
    ],
  });
}
tickers.push((dt) => {
  for (const m of melons) {
    if (!m.m.visible) { m.respawn -= dt; if (m.respawn <= 0) m.m.visible = true; }
  }
});
