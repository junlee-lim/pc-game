/* =========================================================
   ♨️ 포근 온천 (남서쪽)
   ========================================================= */
const ONSEN = { x: -40, z: 28, r: 4.2 };
AVOID.push([ONSEN.x, ONSEN.z, 9]);
{
  // 물
  const water = add(new THREE.CircleGeometry(ONSEN.r, 40), toon({ color: 0x8fe3e0, emissive: 0x4fb8c0, emissiveIntensity: 0.25 }), ONSEN.x, 0.12, ONSEN.z, scene, false);
  water.rotation.x = -Math.PI / 2;
  // 바위 둘레
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const r = add(new THREE.DodecahedronGeometry(rr(0.55, 0.8), 0), pick([0xc9c2d6, 0xb8b0c8, 0xd8d2e2]), ONSEN.x + Math.cos(a) * (ONSEN.r + 0.3), 0.25, ONSEN.z + Math.sin(a) * (ONSEN.r + 0.3));
    r.rotation.set(rr(0, 3), rr(0, 3), 0);
    r.scale.y = 0.7;
  }
  collide(ONSEN.x, ONSEN.z, ONSEN.r + 0.6);
  // 뒤쪽 대나무 울타리
  for (let i = -9; i <= 9; i++) {
    const a = -Math.PI / 2 + (i / 9) * 1.3;
    const x = ONSEN.x + Math.cos(a) * (ONSEN.r + 1.8), z = ONSEN.z + Math.sin(a) * (ONSEN.r + 1.8);
    add(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 8), 0x9fcf6a, x, 1.2, z);
  }
  // 나무 통과 바가지
  for (const [x, z] of [[ONSEN.x + 4.6, ONSEN.z + 3.3], [ONSEN.x + 5.2, ONSEN.z + 2.6]]) {
    add(new THREE.CylinderGeometry(0.32, 0.28, 0.45, 12), 0xe8c9a0, x, 0.23, z);
  }
  add(new THREE.CylinderGeometry(0.32, 0.28, 0.45, 12), 0xe8c9a0, ONSEN.x + 4.9, 0.68, ONSEN.z + 2.95);
  collide(ONSEN.x + 4.9, ONSEN.z + 2.95, 0.7);
  // 수건 걸이
  const tr = new THREE.Group();
  tr.position.set(ONSEN.x - 5.4, 0, ONSEN.z + 2.2);
  tr.rotation.y = 0.6;
  scene.add(tr);
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6), 0xb07a56, s * 0.8, 0.8, 0, tr);
  add(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 6), 0xb07a56, 0, 1.5, 0, tr).rotation.z = Math.PI / 2;
  for (const [x, c] of [[-0.4, 0xffd6e2], [0.35, 0xb8e6ff]]) add(new THREE.BoxGeometry(0.55, 0.9, 0.06), c, x, 1.1, 0, tr);
  collide(tr.position.x, tr.position.z, 0.9);
  // 노렌 걸린 간판
  const sign = signPlane('♨️ 포근 온천', 3, { font: 84, border: '#8fe3e0' });
  add(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 6), 0xb07a56, ONSEN.x + 5.6, 1.1, ONSEN.z - 1.5);
  sign.position.set(ONSEN.x + 5.6, 2.4, ONSEN.z - 1.44);
  sign.rotation.y = -0.4;
  scene.add(sign);
  collide(ONSEN.x + 5.6, ONSEN.z - 1.5, 0.3);
  glowLight(ONSEN.x, 3, ONSEN.z, 0xffc070, 12);
  for (const a of [-2.2, -1.0]) {
    const x = ONSEN.x + Math.cos(a) * (ONSEN.r + 1.2), z = ONSEN.z + Math.sin(a) * (ONSEN.r + 1.2);
    add(new THREE.BoxGeometry(0.4, 0.9, 0.4), 0xc9c2d6, x, 0.45, z);
    add(new THREE.BoxGeometry(0.5, 0.5, 0.5), lanternMats[1], x, 1.1, z, scene, false);
  }
}
// 온천을 즐기는 카피바라 친구 (머리에 유자!)
const capy = makeCreature({ color: 0xc69a6b, ears: 'bear', accent: 0xffa3b8, scale: 0.8 });
{
  capy.root.position.set(ONSEN.x - 1.6, -0.75, ONSEN.z - 0.8);
  capy.root.rotation.y = 0.5;
  scene.add(capy.root);
  add(new THREE.SphereGeometry(0.22, 12, 10), 0xffc23d, 0, 0.05, 0, capy.hatSlot);
  add(new THREE.SphereGeometry(0.06, 6, 6), 0x6cbf5d, 0.05, 0.25, 0, capy.hatSlot, false);
  stallKeepers.push(capy);
}
ZONE_LABELS.push(['♨️ 포근 온천', ONSEN.x, 5, ONSEN.z]);
MAP_MARKS.push(['♨️', ONSEN.x, ONSEN.z]);

// 김 (부드러운 연기 입자)
const steamTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const STEAM_N = 40;
const steamGeo = new THREE.BufferGeometry();
steamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(STEAM_N * 3), 3));
const steam = new THREE.Points(steamGeo, new THREE.PointsMaterial({ map: steamTex, size: 2.2, transparent: true, opacity: 0.45, depthWrite: false }));
steam.frustumCulled = false;
scene.add(steam);
const steamP = Array.from({ length: STEAM_N }, () => ({ a: rr(0, 6.3), d: rr(0, ONSEN.r - 0.5), t: rr(0, 1) }));
tickers.push((dt) => {
  const arr = steamGeo.attributes.position.array;
  steamP.forEach((s, i) => {
    s.t += dt * 0.25;
    if (s.t > 1) { s.t = 0; s.a = rr(0, 6.3); s.d = rr(0, ONSEN.r - 0.5); }
    arr[i * 3] = ONSEN.x + Math.cos(s.a) * s.d + Math.sin(s.t * 6 + i) * 0.3;
    arr[i * 3 + 1] = 0.3 + s.t * 3.2;
    arr[i * 3 + 2] = ONSEN.z + Math.sin(s.a) * s.d;
  });
  steamGeo.attributes.position.needsUpdate = true;
  capy.root.position.y = -0.75 + Math.sin(elapsed * 1.2) * 0.03;
});

// 온천욕
const towel = (() => {
  const g = new THREE.Group();
  const t = add(new THREE.BoxGeometry(0.7, 0.14, 0.5), 0xffffff, 0, 0.02, 0, g);
  t.rotation.y = 0.3;
  return g;
})();
let bathTime = 0;
function startBath() {
  state = 'bath';
  bathTime = 0;
  player.root.position.set(ONSEN.x + 0.8, -0.85, ONSEN.z + 0.6);
  player.root.rotation.set(0, -0.2, 0);
  player.hatSlot.visible = false;
  player.head.add(towel);
  towel.position.set(0, 0.62, 0);
  $('prompt').classList.add('hidden');
  sfx.splash();
  say(player, '하아~ 뜨끈뜨끈하다… ♨️', 3);
  sceneMsg('따끈한 온천에서 기운이 차오르고 있어요 · 아무 키나 누르면 나가요');
}
function endBath() {
  state = 'play';
  player.head.remove(towel);
  player.hatSlot.visible = true;
  player.root.position.set(ONSEN.x + 6.2, 0, ONSEN.z + 1.2);
  player.root.rotation.set(0, Math.PI / 2, 0);
  sceneMsg(null);
  if (bathTime > 4) { toast('온천욕 최고! 피로가 싹 풀렸어요 ✨'); say(player, '몸이 사르르 녹았어~ 😊', 2.5); }
  sfx.ok();
}
modes.bath = {
  key() { if (bathTime > 0.8) endBath(); },
  update(dt) {
    bathTime += dt;
    S.energy = clamp(S.energy + dt * 12, 0, 100);
    animateCreature(player, false, 0, dt, elapsed);
    player.root.position.y = -0.85 + Math.sin(elapsed * 1.3) * 0.03;
    if (Math.random() < dt * 0.6) sfx.chime();
  },
  camera(p) {
    return { pos: tmpCamPos.set(p.x + 1.5, 3.6, p.z + 7.5), target: tmpCamTarget.set(p.x - 0.8, 0.8, p.z - 0.5), fov: 45, speed: 1.5 };
  },
};
interact({ x: ONSEN.x + 5.4, z: ONSEN.z + 0.8, r: 2.4, label: '온천에 몸 담그기 ♨️', action: () => startBath() });
