/* =========================================================
   ☁️ 하늘섬 활동 — 구름 양 털 깎기 · 구름 솜사탕 · 연날리기
   ========================================================= */
Object.assign(EXTRA_BAG, { fluff: { name: '구름 솜', emoji: '☁️' } });
MARKET_PRICE.fluff = 5;
FOODS.cloudcandy = { name: '구름 솜사탕', emoji: '🍭', price: 0, full: 10, energy: 30, desc: '하늘섬 구름 솜으로 만든 몽실몽실 솜사탕', line: '입에 넣자마자 스르르~ 몸이 가벼워져! ☁️', island: true };
const skyPos = (lx, lz) => [SKY.x + lx, SKY.z + lz];

/* ---------- 🐑 구름 양 몽글이 ---------- */
const sheep = new THREE.Group();
let sheepT = 0;
{
  const [px, pz] = skyPos(-7, -10);
  // 구름 울타리
  const fenceM = toon({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25 });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    if (Math.abs(a - Math.PI / 2) < 0.4) continue; // 입구
    add(new THREE.SphereGeometry(0.45, 10, 8), fenceM, px + Math.cos(a) * 3.6, SKY.y + 0.35, pz + Math.sin(a) * 3.6, scene, false);
  }
  sheep.position.set(px, SKY.y, pz);
  scene.add(sheep);
  const wool = new THREE.Group(); wool.name = 'wool'; sheep.add(wool);
  for (const [x, y, z, r] of [[0, 0.9, 0, 0.75], [0.45, 1.0, 0.3, 0.5], [-0.45, 1.0, 0.3, 0.5], [0.4, 0.95, -0.4, 0.5], [-0.4, 0.95, -0.4, 0.5], [0, 1.35, 0, 0.5]]) add(new THREE.SphereGeometry(r, 12, 10), 0xffffff, x, y, z, wool);
  const head = add(new THREE.SphereGeometry(0.35, 12, 10), 0x6a5a6a, 0, 1.05, 0.85, sheep);
  head.scale.set(0.9, 1, 1.1);
  for (const s of [-1, 1]) {
    add(new THREE.SphereGeometry(0.06, 6, 6), 0xffffff, s * 0.14, 1.12, 1.15, sheep, false);
    add(new THREE.SphereGeometry(0.12, 8, 6), 0x6a5a6a, s * 0.35, 1.2, 0.8, sheep, false).scale.set(1.4, 0.6, 0.8);
  }
  for (const [lx, lz] of [[-0.3, 0.4], [0.3, 0.4], [-0.3, -0.4], [0.3, -0.4]]) add(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), 0x6a5a6a, lx, 0.25, lz, sheep);
  collide(px, pz, 1.1);
  interact({
    x: px, z: pz + 2.2, r: 2.2,
    get label() { return sheepT > 0 ? `🐑 몽글이 털이 다시 자라는 중 (${Math.ceil(sheepT)}초)` : '🐑 구름 양 몽글이 털 깎기'; },
    action: () => {
      if (sheepT > 0) { say(player, '털이 아직 덜 자랐어~ 조금만 기다리자 🐑', 2); return; }
      sheepT = 40;
      bagAdd('fluff', 2);
      tone(330, 0.3, 'triangle', 0.08, 1.4); tone(300, 0.4, 'triangle', 0.06, 1.2, 0.3);
      sparkle(px, SKY.y + 1.4, pz, new THREE.Color(0xffffff), 30);
      say(player, '☁️ 몽실몽실 구름 솜 2개! "메에~"', 2.2);
    },
  });
  SKY.marks.push(['🐑', px, pz]);
  ZONE_LABELS.push(['🐑 구름 양 몽글이', px, SKY.y + 3, pz]);
}
tickers.push((dt) => {
  sheepT = Math.max(0, sheepT - dt);
  const w = sheep.getObjectByName('wool');
  const s = sheepT > 0 ? 0.6 + 0.4 * (1 - sheepT / 40) : 1; // 털이 점점 다시 자라요
  w.scale.setScalar(s);
  sheep.rotation.y = Math.sin(elapsed * 0.3) * 0.6;
  sheep.position.y = SKY.y + Math.abs(Math.sin(elapsed * 1.5)) * 0.05;
});

/* ---------- 🍭 구름 솜사탕 기계 ---------- */
{
  const [mx, mz] = skyPos(7, -9);
  const cart = new THREE.Group(); cart.position.set(mx, SKY.y, mz); scene.add(cart);
  add(new THREE.BoxGeometry(2, 1, 1.2), 0xffd6e2, 0, 0.8, 0, cart);
  for (const s of [-1, 1]) { const w = add(new THREE.TorusGeometry(0.3, 0.08, 8, 16), 0xc3a6ff, s * 0.8, 0.3, 0.62, cart); }
  add(new THREE.CylinderGeometry(0.6, 0.35, 0.5, 16, 1, true), toon({ color: 0xe8f6ff, side: THREE.DoubleSide }), 0, 1.55, 0, cart);
  const swirl = add(new THREE.SphereGeometry(0.45, 12, 10), 0xffffff, 0, 1.7, 0, cart);
  swirl.scale.y = 0.6;
  const umb = add(new THREE.ConeGeometry(1.4, 0.5, 12), toon({ map: stripeTexture('#c3a6ff', '#ffffff', 12) }), 0, 2.9, 0, cart);
  add(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), 0xffffff, 0.9, 2, 0, cart);
  collide(mx, mz, 1.2);
  tickers.push((dt) => (swirl.rotation.y += dt * 3));
  interact({ x: mx, z: mz + 1.9, r: 1.9, label: '🍭 구름 솜사탕 만들기 (☁️2)', action: () => craftMenu('🍭 구름 솜사탕 기계', { fluff: 2 }, 'cloudcandy') });
  SKY.marks.push(['🍭', mx, mz]);
  ZONE_LABELS.push(['🍭 솜사탕 기계', mx, SKY.y + 3.6, mz]);
}

/* ---------- 🪁 연날리기 ---------- */
{
  const [kx, kz] = skyPos(-2, -4);
  const post = add(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6), 0xb07a56, kx, SKY.y + 0.9, kz);
  // 하늘 높이 떠 있는 연 (장식)
  const kite = new THREE.Group(); kite.position.set(kx + 4, SKY.y + 12, kz - 6); scene.add(kite);
  const k = add(new THREE.CylinderGeometry(1, 1, 0.06, 4), toon({ color: 0xff8fb1, side: THREE.DoubleSide }), 0, 0, 0, kite);
  k.rotation.x = Math.PI / 2; k.scale.set(0.8, 1, 1.2);
  for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.3, 0.12, 0.02), pick([0xffd166, 0x9fd6ff, 0xc3a6ff]), 0, -1.4 - i * 0.45, 0, kite, false).rotation.z = 0.5 * (i % 2 ? 1 : -1);
  const lineGeo2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(kx, SKY.y + 1.8, kz), kite.position.clone()]);
  scene.add(new THREE.Line(lineGeo2, new THREE.LineBasicMaterial({ color: 0xffffff })));
  tickers.push(() => { kite.rotation.z = Math.sin(elapsed * 1.2) * 0.25; kite.position.y = SKY.y + 12 + Math.sin(elapsed * 0.8) * 0.6; const a = lineGeo2.attributes.position.array; a[4] = kite.position.y; lineGeo2.attributes.position.needsUpdate = true; });
  collide(kx, kz, 0.3);
  interact({ x: kx, z: kz + 1.8, r: 2, label: '🪁 연날리기', action: () => { sfx.ok(); startMini(kiteGame()); } });
  SKY.marks.push(['🪁', kx, kz]);
  ZONE_LABELS.push(['🪁 연날리기', kx, SKY.y + 3, kz]);
}
// 🪁 바람 길(반짝이는 띠)을 따라 연을 띄워요. ↑ 당기기, ↓ 풀기
function kiteGame() {
  const W = 640, H = 400;
  const g = { title: '🪁 구름 위 연날리기', y: 250, vy: 0, band: 180, bandV: 0, time: 30, score: 0, gust: 0, result: null, msg: '반짝이는 바람 길 안에 연을 두세요! ↑ 당기기 · ↓ 풀기' };
  g.finish = () => {
    const n = Math.floor(g.score);
    const reward = n >= 22 ? 12 : n >= 15 ? 7 : n >= 8 ? 3 : 0;
    g.result = {
      title: n >= 22 ? `${n}점! 바람의 친구 🌬️` : `${n}점!`,
      text: reward ? `보상: 코인 ${reward}개 + 구름 솜 1개` : '참가상: 구름 솜 1개',
      give: () => { S.coins += reward; bagAdd('fluff', 1); persist(); sfx.coin(); toast(reward ? `🎁 코인 ${reward}개와 구름 솜을 받았어요!` : '☁️ 구름 솜 1개를 받았어요'); },
    };
  };
  g.key = () => {};
  g.update = (dt) => {
    g.time -= dt;
    if (g.time <= 0) { g.time = 0; g.finish(); return; }
    // 바람 길은 천천히 오르내려요
    g.bandV += rr(-140, 140) * dt;
    g.bandV = clamp(g.bandV * 0.99, -70, 70);
    g.band = clamp(g.band + g.bandV * dt, 90, 300);
    if (g.band <= 90 || g.band >= 300) g.bandV *= -1;
    // 가끔 돌풍
    g.gust -= dt;
    if (g.gust <= 0) { g.gust = rr(2.5, 5); g.vy += rr(-160, 160); g.msg = '휘잉~ 돌풍이다!'; }
    if (down('ArrowUp', 'KeyW')) g.vy -= 340 * dt;
    if (down('ArrowDown', 'KeyS')) g.vy += 340 * dt;
    g.vy += 40 * dt; // 연은 살짝씩 내려와요
    g.vy *= 0.97;
    g.y = clamp(g.y + g.vy * dt, 40, 360);
    const inBand = Math.abs(g.y - g.band) < 36;
    if (inBand) { g.score += dt; if (Math.random() < dt * 2) g.msg = '좋아요~ 바람을 탔어요!'; }
  };
  g.draw = (c) => {
    const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#7ec8ff'); sky.addColorStop(1, '#e6f5ff');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 6; i++) { const x = ((i * 140 + elapsed * 30) % (W + 120)) - 60; c.beginPath(); c.ellipse(x, 60 + (i % 3) * 110, 50, 18, 0, 0, 7); c.fill(); }
    // 바람 길
    const inBand = Math.abs(g.y - g.band) < 36;
    c.fillStyle = inBand ? 'rgba(159, 227, 200, 0.45)' : 'rgba(255, 241, 168, 0.35)';
    c.fillRect(0, g.band - 36, W, 72);
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.setLineDash([10, 10]); c.lineWidth = 2;
    for (const dy of [-36, 36]) { c.beginPath(); c.moveTo(0, g.band + dy); c.lineTo(W, g.band + dy); c.stroke(); }
    c.setLineDash([]);
    // 연줄과 연
    const kx = 420, ky = g.y;
    c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.moveTo(120, 390); c.quadraticCurveTo(260, 300, kx, ky); c.stroke();
    c.save(); c.translate(kx, ky); c.rotate(Math.sin(elapsed * 3) * 0.2);
    c.fillStyle = '#ff8fb1'; c.beginPath(); c.moveTo(0, -30); c.lineTo(22, 0); c.lineTo(0, 34); c.lineTo(-22, 0); c.closePath(); c.fill();
    c.strokeStyle = '#ffffff'; c.beginPath(); c.moveTo(0, -30); c.lineTo(0, 34); c.moveTo(-22, 0); c.lineTo(22, 0); c.stroke();
    c.restore();
    for (let i = 0; i < 4; i++) { c.fillStyle = ['#ffd166', '#9fd6ff', '#c3a6ff', '#ffd166'][i]; c.fillRect(kx - 6 + Math.sin(elapsed * 4 + i) * 6, ky + 40 + i * 14, 12, 6); }
    c.font = '40px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🐻', 110, 370);
    c.fillStyle = '#6a4c3f'; c.font = '22px Jua, sans-serif'; c.fillText(g.msg, W / 2, 28);
  };
  g.info = () => `⏱ ${Math.ceil(g.time)}초 · 🌬️ ${Math.floor(g.score)}점 · <kbd>↑</kbd> 당기기 <kbd>↓</kbd> 풀기 · <kbd>Esc</kbd> 그만하기`;
  return g;
}
