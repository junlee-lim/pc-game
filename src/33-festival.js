/* =========================================================
   🎠 축제 놀이터 (남동쪽) — 회전목마 · 금붕어 뜨기 · 사격
   ========================================================= */
const FEST = { x: 30, z: 37 };
AVOID.push([FEST.x, FEST.z - 3, 12]);

// 회전목마
const carousel = new THREE.Group();
const horses = [];
{
  carousel.position.set(FEST.x, 0, FEST.z);
  scene.add(carousel);
  add(new THREE.CylinderGeometry(4.6, 4.8, 0.5, 32), 0xfff1df, FEST.x, 0.25, FEST.z);
  const spin = new THREE.Group();
  spin.position.y = 0.5;
  carousel.add(spin);
  carousel.userData.spin = spin;
  add(new THREE.CylinderGeometry(4.3, 4.3, 0.15, 32), 0xffc2d6, 0, 0.08, 0, spin);
  add(new THREE.CylinderGeometry(0.5, 0.5, 4, 14), 0xfff1df, 0, 2, 0, spin);
  const roof = add(new THREE.ConeGeometry(5.2, 1.8, 16), toon({ map: stripeTexture('#ff8fb1', '#fff6ea', 16) }), 0, 4.9, 0, spin);
  roof.castShadow = true;
  add(new THREE.CylinderGeometry(5.2, 5.2, 0.4, 32), 0xffd166, 0, 3.85, 0, spin);
  add(new THREE.SphereGeometry(0.35, 12, 10), 0xffd166, 0, 5.95, 0, spin);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    add(new THREE.SphereGeometry(0.14, 8, 6), lanternMats[i % lanternMats.length], Math.cos(a) * 5.2, 3.6, Math.sin(a) * 5.2, spin, false);
  }
  const horseCols = [0xffffff, 0xffd6e6, 0xd8f0ff, 0xfff1c8, 0xe8dcff, 0xd8f5e8];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const h = new THREE.Group();
    h.position.set(Math.cos(a) * 3.1, 1.2, Math.sin(a) * 3.1);
    h.rotation.y = -a; // 진행 방향(원의 접선)을 보게
    spin.add(h);
    add(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 6), 0xffd166, 0, 0.6, 0, h, false);
    const c = horseCols[i];
    const body = add(new THREE.SphereGeometry(0.5, 16, 12), c, 0, 0, 0, h);
    body.scale.set(0.7, 0.7, 1.3);
    const head = add(new THREE.SphereGeometry(0.32, 14, 10), c, 0, 0.55, 0.62, h);
    head.scale.set(0.8, 1, 1.25);
    add(new THREE.SphereGeometry(0.05, 6, 6), 0x3b2a25, 0.17, 0.62, 0.8, h, false);
    add(new THREE.SphereGeometry(0.05, 6, 6), 0x3b2a25, -0.17, 0.62, 0.8, h, false);
    for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.07, 0.18, 6), c, s * 0.12, 0.88, 0.5, h, false);
    const mane = add(new THREE.SphereGeometry(0.16, 10, 8), pick([0xff8fb1, 0xffb86b, 0x9fb8ff, 0xc3a6ff]), 0, 0.62, 0.3, h, false);
    mane.scale.set(0.6, 1.4, 1.6);
    for (const [lx, lz] of [[-0.2, 0.35], [0.2, 0.35], [-0.2, -0.35], [0.2, -0.35]]) {
      const leg = add(new THREE.CylinderGeometry(0.07, 0.06, 0.55, 6), c, lx, -0.42, lz, h, false);
      leg.rotation.x = lz > 0 ? -0.5 : 0.5;
    }
    add(new THREE.BoxGeometry(0.5, 0.1, 0.5), 0xff6f91, 0, 0.36, -0.05, h, false);
    const seat = new THREE.Object3D();
    seat.position.set(0, 0.25, -0.1);
    h.add(seat);
    horses.push({ h, seat, ph: i * 1.3 });
  }
  collide(FEST.x, FEST.z, 5.2);
}
let carouselSpeed = 0.35;
tickers.push((dt) => {
  const spin = carousel.userData.spin;
  const target = state === 'ride' ? 0.6 : 0.35;
  carouselSpeed = lerp(carouselSpeed, target, damp(1, dt));
  spin.rotation.y -= carouselSpeed * dt;
  for (const h of horses) h.h.position.y = 1.2 + Math.sin(elapsed * 2.2 + h.ph) * 0.35;
});

// 깃발 줄과 등불
{
  const ps = [[19, 26], [41, 26], [41, 47], [19, 46]].map(([x, z]) => post(x, z, 3.8));
  for (let i = 0; i < 4; i++) lanternString(ps[i], ps[(i + 1) % 4], 10, 0.8);
  glowLight(FEST.x, 4, FEST.z - 6, 0xffb070, 18);
  const sign = signPlane('🎠 축제 놀이터', 3.4, { w: 640, h: 160, font: 80, border: '#ffb4c8' });
  sign.position.set(FEST.x, 4.2, FEST.z - 5.3);
  scene.add(sign);
}
ZONE_LABELS.push(['🎠 축제 놀이터', FEST.x, 8, FEST.z]);
MAP_MARKS.push(['🎠', FEST.x, FEST.z]);

// 회전목마 타기
let rideTime = 0;
function startRide() {
  if (S.coins < 3) { sfx.no(); say(player, '회전목마는 3코인이야… 코인을 모아 오자!', 2.5); return; }
  S.coins -= 3; persist();
  state = 'ride';
  rideTime = 0;
  $('prompt').classList.add('hidden');
  sfx.fanfare();
  say(player, '와아~ 신난다! 🎠', 2.5);
  sceneMsg('빙글빙글~ 아무 키나 누르면 내려요');
}
function endRide() {
  state = 'play';
  player.root.position.set(FEST.x, 0, FEST.z - 6.4);
  player.root.rotation.set(0, Math.PI, 0);
  sceneMsg(null);
  say(player, '어지러워… 그래도 또 타고 싶다! 💫', 2.5);
}
const seatPos = new THREE.Vector3(), seatQ = new THREE.Quaternion();
modes.ride = {
  key() { if (rideTime > 1) endRide(); },
  update(dt) {
    rideTime += dt;
    const h = horses[0];
    h.seat.getWorldPosition(seatPos);
    h.seat.getWorldQuaternion(seatQ);
    player.root.position.copy(seatPos);
    player.root.quaternion.copy(seatQ);
    animateCreature(player, false, 0, dt, elapsed);
    player.body.position.y = 0;
    if (Math.random() < dt * 2.5) sfx.chime();
  },
  camera() {
    return { pos: tmpCamPos.set(FEST.x + 3, 6.5, FEST.z + 12), target: tmpCamTarget.set(FEST.x, 1.8, FEST.z), fov: 45, speed: 2 };
  },
  onExit() {},
};
interact({ x: FEST.x, z: FEST.z - 6.2, r: 2.4, label: '회전목마 타기 (🪙 3)', action: () => startRide() });

// 노점 (금붕어 뜨기 · 사격)
function booth(x, z, color, title, keeperOpts) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  scene.add(g);
  add(new THREE.BoxGeometry(3.8, 1.0, 1.4), 0xf2d3a8, 0, 0.5, 0, g);
  add(new THREE.BoxGeometry(3.82, 0.5, 0.05), color, 0, 0.55, 0.72, g);
  for (const px of [-1.8, 1.8]) for (const pz of [-0.7, 0.7]) add(new THREE.CylinderGeometry(0.07, 0.07, 2.8, 6), 0xb07a56, px, 1.4, pz, g);
  for (let i = 0; i < 7; i++) {
    const s = add(new THREE.BoxGeometry(4.2 / 7 + 0.01, 0.12, 2.1), i % 2 ? 0xffffff : color, -2.1 + 4.2 / 14 + (i * 4.2) / 7, 2.85, 0.15, g);
    s.rotation.x = 0.18;
  }
  const sign = signPlane(title, 2.6, { font: 76 });
  sign.position.set(0, 3.5, 0.3);
  g.add(sign);
  const k = makeCreature(keeperOpts);
  k.root.position.set(0, 0, -1.3);
  g.add(k.root);
  stallKeepers.push(k);
  collide(x, z, 2.1); collide(x - 1.4, z, 1.3); collide(x + 1.4, z, 1.3);
  return g;
}
{
  const g = booth(21, 29, 0x8fd3ff, '🐠 금붕어 뜨기', { color: 0xfff1c8, ears: 'cat', accent: 0xffa3b8 });
  const tub = add(new THREE.CylinderGeometry(1.2, 1.1, 0.35, 24), 0x7fc8ff, 0, 1.15, 0.1, g);
  add(new THREE.CylinderGeometry(1.1, 1.1, 0.02, 24), toon({ color: 0xbfeeff, emissive: 0x5fb8e0, emissiveIntensity: 0.25 }), 0, 1.31, 0.1, g, false);
  for (let i = 0; i < 6; i++) {
    const f = add(new THREE.SphereGeometry(0.1, 8, 6), i % 3 ? 0xff7a3d : 0x3b2a3f, Math.cos(i * 1.1) * 0.6, 1.33, 0.1 + Math.sin(i * 1.7) * 0.5, g, false);
    f.scale.set(1.6, 0.6, 0.8);
    f.rotation.y = i;
  }
  interact({ x: 21, z: 31.4, r: 2.4, label: '금붕어 뜨기 한 판 (🪙 4)', action: () => askMini('goldfish') });
}
{
  const g = booth(39, 29, 0xffc46b, '🎯 코르크 사격', { color: 0xe4f2ff, ears: 'bunny', accent: 0x9fb8ff });
  for (const [x, y, c] of [[-1, 1.35, 0xffd166], [0, 1.4, 0xff8fb1], [1, 1.35, 0x9fd6ff]]) add(new THREE.SphereGeometry(0.25, 12, 10), c, x, y, -0.2, g);
  const gun = add(new THREE.BoxGeometry(0.15, 0.15, 0.9), 0x8a5a3c, 0.9, 1.1, 0.4, g);
  gun.rotation.y = 0.4;
  interact({ x: 39, z: 31.4, r: 2.4, label: '코르크 사격 한 판 (🪙 4)', action: () => askMini('shooting') });
}

/* ---------- 미니게임 공통 ---------- */
const miniCtx = $('miniCanvas').getContext('2d');
let mini = null;
function askMini(kind) {
  const info = kind === 'goldfish'
    ? { title: '🐠 금붕어 뜨기', desc: '방향키로 뜰채를 움직이고 <kbd>Space</kbd>로 떠요.<br>종이가 찢어지기 전에 많이 떠 보세요! (5마리 이상이면 특별 경품)' }
    : { title: '🎯 코르크 사격', desc: '방향키로 조준하고 <kbd>Space</kbd>로 쏴요. 코르크는 8발!<br>🦆 1점 · 🧸 2점 · ⭐ 3점 (12점 이상이면 특별 경품)' };
  openMenu({
    title: info.title,
    desc: () => `${info.desc}<br>내 코인 🪙 ${S.coins}`,
    items: () => [
      { label: '한 판 할게요!', right: '🪙 4', dim: S.coins < 4, act: () => {
        if (S.coins < 4) { sfx.no(); toast('코인이 모자라요 🪙'); return true; }
        S.coins -= 4; persist();
        setTimeout(() => startMini(kind === 'goldfish' ? goldfishGame() : shootingGame()), 0);
        return false;
      } },
      { label: '구경만 할래요', act: () => false },
    ],
  });
}
function startMini(game) {
  mini = game;
  state = 'minigame';
  $('miniTitle').textContent = game.title;
  $('mini').classList.remove('hidden');
  $('prompt').classList.add('hidden');
  sfx.ok();
}
function endMini() {
  $('mini').classList.add('hidden');
  state = 'play';
  mini = null;
}
modes.minigame = {
  key(code) {
    if (!mini) return;
    if (mini.result) { if (['Space', 'Enter', 'Escape', 'KeyE'].includes(code)) { mini.result.give(); endMini(); } return; }
    if (code === 'Escape') { mini.finish(); return; }
    mini.key(code);
  },
  update(dt) {
    animateCreature(player, false, 0, dt, elapsed);
    if (!mini) return;
    if (!mini.result) mini.update(dt);
    mini.draw(miniCtx);
    if (mini.result) {
      const g = miniCtx;
      g.fillStyle = 'rgba(255, 248, 236, 0.92)';
      g.beginPath(); g.roundRect(120, 110, 400, 180, 24); g.fill();
      g.fillStyle = '#6a4c3f'; g.textAlign = 'center';
      g.font = '34px Jua, sans-serif'; g.fillText(mini.result.title, 320, 170);
      g.font = '24px Jua, sans-serif'; g.fillText(mini.result.text, 320, 215);
      g.font = '18px Jua, sans-serif'; g.fillStyle = '#9a7d6e'; g.fillText('Space 를 눌러 경품 받기', 320, 260);
    }
    $('miniInfo').innerHTML = mini.info();
  },
};
function givePrize(itemId, fallbackCoins) {
  const it = SHOP_ITEMS.find((i) => i.id === itemId);
  if (it && !S.owned.includes(itemId)) {
    S.owned.push(itemId);
    S.equipped[it.slot] = itemId;
    refreshEquip();
    persist();
    sfx.fanfare();
    toast(`🎁 특별 경품 ${it.emoji} ${it.name}! 바로 착용했어요`, 3.5);
    return;
  }
  S.coins += fallbackCoins; persist();
  sfx.coin();
  toast(`🎁 경품으로 코인 ${fallbackCoins}개를 받았어요!`);
}
function candyPrize() {
  S.full = clamp(S.full + 5, 0, 100); persist();
  toast('🍬 참가상 사탕을 받았어요! 다음엔 더 잘할 수 있어요');
}

/* ---------- 금붕어 뜨기 ---------- */
function goldfishGame() {
  const W = 640, H = 400, cx = 320, cy = 205, rx = 285, ry = 170;
  const fish = Array.from({ length: 9 }, (_, i) => {
    const a = rr(0, 6.3), d = rr(0, 0.7);
    return { x: cx + Math.cos(a) * rx * d, y: cy + Math.sin(a) * ry * d, a: rr(0, 6.3), sp: rr(40, 70), big: i < 2, col: i < 2 ? '#3b2a3f' : pick(['#ff7a3d', '#ff5a4a', '#ff9f5a', '#ffffff']), turn: 0, alive: true, flee: 0 };
  });
  const g = { title: '🐠 금붕어 뜨기', x: cx, y: cy, paper: 100, caught: 0, points: 0, time: 30, scoop: 0, result: null, msg: '' };
  g.finish = () => {
    const n = g.points;
    if (n >= 5) g.result = { title: `${g.caught}마리 성공! 🎉`, text: '특별 경품: 금붕어 봉지', give: () => givePrize('fishbag', 7) };
    else if (n >= 3) g.result = { title: `${g.caught}마리 성공!`, text: '경품: 코인 4개', give: () => { S.coins += 4; persist(); sfx.coin(); toast('🎁 코인 4개를 받았어요!'); } };
    else if (n >= 1) g.result = { title: `${g.caught}마리 성공!`, text: '경품: 코인 2개', give: () => { S.coins += 2; persist(); sfx.coin(); toast('🎁 코인 2개를 받았어요!'); } };
    else g.result = { title: '아쉬워요… 🥲', text: '참가상: 달콤한 사탕', give: candyPrize };
  };
  g.key = (code) => {
    if ((code === 'Space' || code === 'KeyE' || code === 'Enter') && g.scoop <= 0) {
      g.scoop = 0.35;
      sfx.splash();
      let target = null;
      for (const f of fish) if (f.alive && Math.hypot(f.x - g.x, f.y - g.y) < (f.big ? 30 : 36)) { target = f; break; }
      g.paper -= target ? (target.big ? rr(30, 42) : rr(18, 28)) : rr(8, 14);
      if (target) {
        target.alive = false;
        g.caught++;
        g.points += target.big ? 2 : 1;
        sfx.ding();
        g.msg = target.big ? '까만 데메킨! (2점)' : '퐁! 금붕어를 떴어요';
      } else g.msg = '첨벙… 놓쳤어요';
      if (g.paper <= 0) { g.paper = 0; g.msg = '앗, 종이가 찢어졌어요!'; setTimeout(() => !g.result && g.finish(), 500); }
      if (fish.every((f) => !f.alive)) setTimeout(() => !g.result && g.finish(), 500);
    }
  };
  g.update = (dt) => {
    g.time -= dt;
    if (g.time <= 0) { g.time = 0; g.finish(); return; }
    g.scoop -= dt;
    const sp = 330;
    if (down('ArrowLeft', 'KeyA')) g.x -= sp * dt;
    if (down('ArrowRight', 'KeyD')) g.x += sp * dt;
    if (down('ArrowUp', 'KeyW')) g.y -= sp * dt;
    if (down('ArrowDown', 'KeyS')) g.y += sp * dt;
    g.x = clamp(g.x, 50, W - 50); g.y = clamp(g.y, 50, H - 40);
    for (const f of fish) {
      if (!f.alive) continue;
      const d = Math.hypot(f.x - g.x, f.y - g.y);
      if (d < 85 && f.flee <= 0 && Math.random() < dt * 1.6) { f.flee = 0.6; f.a = Math.atan2(f.y - g.y, f.x - g.x) + rr(-0.5, 0.5); }
      f.flee -= dt;
      f.turn += rr(-3, 3) * dt;
      f.turn *= 0.97;
      f.a += f.turn * dt;
      const v = f.flee > 0 ? f.sp * 3 : f.sp;
      f.x += Math.cos(f.a) * v * dt;
      f.y += Math.sin(f.a) * v * dt;
      const ex = (f.x - cx) / (rx - 30), ey = (f.y - cy) / (ry - 25);
      if (ex * ex + ey * ey > 1) { f.a = Math.atan2(cy - f.y, cx - f.x) + rr(-0.6, 0.6); f.x -= Math.cos(f.a) * -4; f.y -= Math.sin(f.a) * -4; }
    }
  };
  g.draw = (c) => {
    c.fillStyle = '#ffe7c2'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#4fa8e0'; c.beginPath(); c.ellipse(cx, cy, rx + 12, ry + 12, 0, 0, 7); c.fill();
    const gr = c.createRadialGradient(cx, cy - 40, 20, cx, cy, rx);
    gr.addColorStop(0, '#d7f4ff'); gr.addColorStop(1, '#8fd3ff');
    c.fillStyle = gr; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.fill();
    for (const f of fish) {
      if (!f.alive) continue;
      c.save(); c.translate(f.x, f.y); c.rotate(f.a);
      const s = f.big ? 1.35 : 1;
      c.fillStyle = f.col;
      c.beginPath(); c.moveTo(-14 * s, 0); c.lineTo(-28 * s, -10 * s + Math.sin(elapsed * 14) * 3); c.lineTo(-28 * s, 10 * s + Math.sin(elapsed * 14) * 3); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(0, 0, 17 * s, 9 * s, 0, 0, 7); c.fill();
      c.fillStyle = f.big ? '#fff' : '#3b2a25'; c.beginPath(); c.arc(9 * s, -3 * s, 2.4 * s, 0, 7); c.fill();
      c.restore();
    }
    // 뜰채
    const lift = g.scoop > 0 ? Math.sin((g.scoop / 0.35) * Math.PI) * 10 : 0;
    c.save(); c.translate(g.x, g.y - lift);
    c.strokeStyle = '#ff8fb1'; c.lineWidth = 7;
    c.beginPath(); c.moveTo(30, 26); c.lineTo(80, 80); c.stroke();
    c.fillStyle = `rgba(255,255,255,${0.25 + (g.paper / 100) * 0.45})`;
    c.beginPath(); c.arc(0, 0, 36, 0, 7); c.fill();
    c.strokeStyle = '#ff6f91'; c.lineWidth = 6; c.stroke();
    if (g.paper < 50) { c.strokeStyle = 'rgba(106,76,63,0.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-20, -10); c.lineTo(5, 8); c.lineTo(18, -4); c.stroke(); }
    c.restore();
    c.fillStyle = '#6a4c3f'; c.font = '22px Jua, sans-serif'; c.textAlign = 'center';
    if (g.msg) c.fillText(g.msg, cx, 32);
  };
  g.info = () => `⏱ ${Math.ceil(g.time)}초 · 🐠 ${g.caught}마리 · 종이 ${'▮'.repeat(Math.ceil(g.paper / 20))}${'▯'.repeat(5 - Math.ceil(g.paper / 20))} · <kbd>Esc</kbd> 그만하기`;
  return g;
}

/* ---------- 코르크 사격 ---------- */
function shootingGame() {
  const W = 640, H = 400;
  const rows = [
    { y: 110, dir: 1, sp: 90, kind: '🦆', pts: 1, r: 30 },
    { y: 210, dir: -1, sp: 130, kind: '🧸', pts: 2, r: 28 },
    { y: 300, dir: 1, sp: 190, kind: '⭐', pts: 3, r: 22 },
  ];
  const targets = [];
  rows.forEach((row, ri) => { for (let i = 0; i < 4; i++) targets.push({ row: ri, x: i * 170 + ri * 50, down: 0 }); });
  const g = { title: '🎯 코르크 사격', x: W / 2, y: H / 2, corks: 8, score: 0, result: null, flash: 0, shots: [], msg: '', endT: -1 };
  g.finish = () => {
    const n = g.score;
    if (n >= 12) g.result = { title: `${n}점! 명사수 🎉`, text: '특별 경품: 별 머리띠', give: () => givePrize('starband', 7) };
    else if (n >= 8) g.result = { title: `${n}점! 잘했어요`, text: '경품: 고양이 가면', give: () => givePrize('catmask', 4) };
    else if (n >= 4) g.result = { title: `${n}점!`, text: '경품: 코인 3개', give: () => { S.coins += 3; persist(); sfx.coin(); toast('🎁 코인 3개를 받았어요!'); } };
    else g.result = { title: `${n}점… 🥲`, text: '참가상: 달콤한 사탕', give: candyPrize };
  };
  g.key = (code) => {
    if ((code === 'Space' || code === 'KeyE' || code === 'Enter') && g.corks > 0 && g.flash <= 0) {
      g.corks--;
      g.flash = 0.18;
      sfx.pop();
      let hit = null;
      for (const t of targets) {
        const row = rows[t.row];
        if (t.down <= 0 && Math.hypot(t.x - g.x, row.y - g.y) < row.r) { hit = t; break; }
      }
      g.shots.push({ x: g.x, y: g.y, t: 0.4 });
      if (hit) {
        hit.down = 2.5;
        g.score += rows[hit.row].pts;
        g.msg = `${rows[hit.row].kind} 명중! +${rows[hit.row].pts}`;
        sfx.ding();
      } else g.msg = '빗나갔어요~';
      if (g.corks === 0) g.endT = 0.9;
    }
  };
  g.update = (dt) => {
    const sp = 420;
    if (down('ArrowLeft', 'KeyA')) g.x -= sp * dt;
    if (down('ArrowRight', 'KeyD')) g.x += sp * dt;
    if (down('ArrowUp', 'KeyW')) g.y -= sp * dt;
    if (down('ArrowDown', 'KeyS')) g.y += sp * dt;
    g.x = clamp(g.x, 10, W - 10); g.y = clamp(g.y, 10, H - 10);
    g.flash -= dt;
    for (const t of targets) {
      const row = rows[t.row];
      t.x += row.dir * row.sp * dt;
      if (t.x > W + 40) t.x -= W + 80;
      if (t.x < -40) t.x += W + 80;
      t.down -= dt;
    }
    for (const s of g.shots) s.t -= dt;
    g.shots = g.shots.filter((s) => s.t > 0);
    if (g.endT > 0) { g.endT -= dt; if (g.endT <= 0) g.finish(); }
  };
  g.draw = (c) => {
    for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#ff8f8f' : '#ffd6d6'; c.fillRect(i * 40, 0, 40, H); }
    rows.forEach((row) => { c.fillStyle = '#b07a56'; c.fillRect(0, row.y + row.r + 4, W, 12); });
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const t of targets) {
      const row = rows[t.row];
      c.save(); c.translate(t.x, row.y);
      if (t.down > 0) { c.scale(1, 0.25); c.translate(0, row.r * 2); c.globalAlpha = 0.5; }
      c.fillStyle = '#fff8ec'; c.beginPath(); c.arc(0, 0, row.r + 6, 0, 7); c.fill();
      c.strokeStyle = '#6a4c3f'; c.lineWidth = 3; c.stroke();
      c.font = `${row.r * 1.4}px sans-serif`; c.fillText(row.kind, 0, 3);
      c.restore();
    }
    for (const s of g.shots) { c.fillStyle = `rgba(255,255,255,${s.t * 2})`; c.beginPath(); c.arc(s.x, s.y, 14 - s.t * 20, 0, 7); c.fill(); }
    c.strokeStyle = g.flash > 0 ? '#ffd166' : '#3b2a25'; c.lineWidth = 3;
    c.beginPath(); c.arc(g.x, g.y, 18, 0, 7); c.moveTo(g.x - 28, g.y); c.lineTo(g.x + 28, g.y); c.moveTo(g.x, g.y - 28); c.lineTo(g.x, g.y + 28); c.stroke();
    c.textBaseline = 'alphabetic';
    c.fillStyle = '#6a4c3f'; c.font = '22px Jua, sans-serif';
    if (g.msg) c.fillText(g.msg, W / 2, 34);
  };
  g.info = () => `🎯 ${g.score}점 · 코르크 ${'●'.repeat(g.corks)}${'○'.repeat(8 - g.corks)} · <kbd>Esc</kbd> 그만하기`;
  return g;
}
