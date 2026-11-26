/* =========================================================
   🏝️ 섬 활동 더하기 & 포근섬 특산물 가게
   ========================================================= */
Object.assign(EXTRA_BAG, {
  milk: { name: '신선한 우유', emoji: '🥛' },
  cake: { name: '딸기 케이크', emoji: '🍰' },
});
const hasAll = (needs) => Object.entries(needs).every(([k, n]) => (S.bag[k] || 0) >= n);
const needsText = (needs) => Object.entries(needs).map(([k, n]) => `${EXTRA_BAG[k].emoji}${n}`).join(' · ');
// 모은 재료로 직접 만들어 먹기 / 포장하기
function craftMenu(title, needs, foodKey) {
  const f = FOODS[foodKey];
  openMenu({
    title,
    desc: () => `재료: ${needsText(needs)} &nbsp;|&nbsp; 가방: ${Object.keys(needs).map((k) => `${EXTRA_BAG[k].emoji}×${S.bag[k] || 0}`).join(' ')}<br>${f.emoji} ${f.name} — 포만감 +${f.full} · 기운 +${f.energy}`,
    items: () => [
      { label: `만들어서 바로 먹기`, dim: !hasAll(needs), act: () => {
        if (!hasAll(needs)) { sfx.no(); toast(`재료가 모자라요 (${needsText(needs)})`); return true; }
        for (const [k, n] of Object.entries(needs)) bagAdd(k, -n);
        eat(foodKey, true);
        return false;
      } },
      { label: `만들어서 가방에 담기 🎒`, dim: !hasAll(needs), act: () => {
        if (!hasAll(needs)) { sfx.no(); toast(`재료가 모자라요 (${needsText(needs)})`); return true; }
        for (const [k, n] of Object.entries(needs)) bagAdd(k, -n);
        bagAdd(foodKey); sfx.ok(); toast(`${f.emoji} ${f.name}을(를) 만들어 가방에 담았어요`);
        return true;
      } },
      { label: '그만두기', act: () => false },
    ],
  });
}

/* =========================================================
   🧺 포근섬 특산물 가게 — 다른 섬에서 모은 것을 팔아요
   ========================================================= */
const MARKET_PRICE = { coco: 3, mushroom: 3, berry: 3, milk: 3, jam: 11, cake: 18 };
{
  const MX = -5.6, MZ = 50.4;
  const g = booth(MX, MZ, 0x7fd3c8, '🧺 섬 특산물 가게', { color: 0xc69a6b, ears: 'cat', accent: 0xffd6b0 });
  for (const [x, key] of [[-1.1, 'coco'], [0, 'mushroom'], [1.1, 'berry']]) {
    add(new THREE.CylinderGeometry(0.35, 0.28, 0.3, 12), 0xd69a6a, x, 1.15, 0.1, g);
    const e = EXTRA_BAG[key];
    const col = { coco: 0x8a5a3c, mushroom: 0xff6f6f, berry: 0xff3d5a }[key];
    for (let i = 0; i < 3; i++) add(new THREE.SphereGeometry(0.13, 8, 6), col, x + Math.cos(i * 2) * 0.14, 1.36, 0.1 + Math.sin(i * 2) * 0.14, g, false);
  }
  AVOID.push([MX, MZ, 4]);
  MAP_MARKS.push(['🧺', MX, MZ]);
  ZONE_LABELS.push(['🧺 섬 특산물 가게', MX, 4.6, MZ]);
  interact({ x: MX, z: MZ + 2.4, r: 2.4, label: '🧺 섬 특산물 팔기', action: () => openMarket() });
}
function openMarket() {
  sfx.ok();
  const sellable = () => Object.keys(MARKET_PRICE).filter((k) => (S.bag[k] || 0) > 0);
  const total = () => sellable().reduce((a, k) => a + MARKET_PRICE[k] * S.bag[k], 0);
  openMenu({
    title: '🧺 해달이의 섬 특산물 가게',
    desc: () => `"다른 섬에서 모은 귀한 것들, 섬보다 비싸게 사 줄게!"<br>내 코인 🪙 ${S.coins}`,
    items: () => [
      ...Object.keys(MARKET_PRICE).map((k) => ({
        label: `${EXTRA_BAG[k].emoji} ${EXTRA_BAG[k].name} 팔기`,
        right: `🪙 ${MARKET_PRICE[k]} · 가방에 ${S.bag[k] || 0}개`,
        dim: !(S.bag[k] > 0),
        act: () => {
          if (!(S.bag[k] > 0)) { sfx.no(); toast(`${EXTRA_BAG[k].name}이(가) 없어요. 배를 타고 다른 섬에 가 보세요 🚤`, 3); return true; }
          bagAdd(k, -1); S.coins += MARKET_PRICE[k]; persist(); sfx.coin(); return true;
        },
      })),
      { label: '💰 모두 팔기', right: sellable().length ? `🪙 ${total()}` : '팔 것이 없어요', dim: !sellable().length, act: () => {
        const t = total();
        if (!t) { sfx.no(); return true; }
        for (const k of sellable()) bagAdd(k, -S.bag[k]);
        S.coins += t; persist(); sfx.fanfare();
        toast(`💰 섬 특산물을 모두 팔아서 🪙 ${t}개를 벌었어요!`, 3);
        return true;
      } },
      { label: '그만두기', act: () => false },
    ],
  });
}

/* =========================================================
   🌴 야자수섬 — 코코넛 깨기 · 비치볼 · 해변 의자
   ========================================================= */
{
  const I = ISL.palm;
  // 코코넛 깨는 납작 바위
  const [rx, rz] = islPos(I, 2, 12);
  const rock = add(new THREE.DodecahedronGeometry(0.9, 0), 0xc9c2d6, rx, 0.35, rz);
  rock.scale.set(1.3, 0.45, 1.1);
  add(new THREE.SphereGeometry(0.28, 10, 8), 0x8a5a3c, rx + 0.3, 0.75, rz, scene);
  collide(rx, rz, 1.1);
  interact({ x: rx, z: rz + 1.9, r: 1.8, label: '🥥 코코넛 깨서 주스 만들기 (🥥1)', action: () => craftMenu('🥥 코코넛 깨기', { coco: 1 }, 'coconut') });
  ZONE_LABELS.push(['🥥 코코넛 바위', rx, 2.6, rz]);
  // 비치볼 네트
  const [nx, nz] = islPos(I, 4, -11);
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), 0xffffff, nx + s * 3, 1.3, nz);
  const net = add(new THREE.BoxGeometry(6, 0.8, 0.04), toon({ color: 0xffffff, transparent: true, opacity: 0.7 }), nx, 2.1, nz, scene, false);
  const ball = add(new THREE.SphereGeometry(0.35, 14, 10), toon({ map: stripeTexture('#ff6f91', '#ffffff', 6) }), nx + 1, 0.35, nz + 1.5);
  collide(nx - 3, nz, 0.3); collide(nx + 3, nz, 0.3);
  interact({ x: nx, z: nz + 2.2, r: 2.4, label: '🏐 비치볼 통통 튕기기', action: () => { sfx.ok(); startMini(ballGame()); } });
  ZONE_LABELS.push(['🏐 비치볼', nx, 3.6, nz]);
  I.marks.push(['🏐', nx, nz], ['🪨', rx, rz]);
  // 해변 의자
  const [cx, cz] = islPos(I, -12, 2);
  for (const s of [0, 1]) {
    const ch = new THREE.Group(); ch.position.set(cx + s * 1.8, 0, cz); ch.rotation.y = Math.PI; scene.add(ch);
    add(new THREE.BoxGeometry(1, 0.1, 1.8), toon({ map: stripeTexture(s ? '#8fd3ff' : '#ffd166', '#ffffff', 6) }), 0, 0.45, 0.2, ch);
    const back = add(new THREE.BoxGeometry(1, 0.1, 1), toon({ map: stripeTexture(s ? '#8fd3ff' : '#ffd166', '#ffffff', 6) }), 0, 0.85, -0.9, ch); back.rotation.x = -0.9;
    for (const [lx, lz] of [[-0.45, -0.5], [0.45, -0.5], [-0.45, 0.9], [0.45, 0.9]]) add(new THREE.BoxGeometry(0.06, 0.45, 0.06), 0xb07a56, lx, 0.22, lz, ch);
    collide(cx + s * 1.8, cz, 0.7);
  }
  interact({ x: cx + 0.9, z: cz - 2, r: 2, label: '🏖️ 해변 의자에서 쉬기', action: () => startRest(cx, cz) });
  I.marks.push(['🏖️', cx, cz]);
}
// 해변 의자에서 쉬기
let restT = 0, restAt = null;
function startRest(cx, cz) {
  state = 'rest'; restT = 0; restAt = { x: cx, z: cz };
  player.root.position.set(cx, 0.45, cz + 0.1);
  player.root.rotation.set(0, Math.PI, 0);
  player.body.rotation.x = -0.6;
  player.feet.forEach((f) => (f.visible = false));
  $('prompt').classList.add('hidden');
  say(player, '파도 소리… 스르르 💤', 2.5);
  sceneMsg('철썩철썩~ 파도 소리를 들으며 쉬는 중 · 아무 키나 누르면 일어나요');
}
modes.rest = {
  key() {
    if (restT < 0.8) return;
    state = 'play';
    player.body.rotation.x = 0;
    player.feet.forEach((f) => (f.visible = true));
    player.root.position.set(restAt.x + 0.9, 0, restAt.z - 2);
    sceneMsg(null);
    toast('🏖️ 푹 쉬었더니 기운이 났어요!');
  },
  update(dt) {
    restT += dt;
    S.energy = clamp(S.energy + dt * 10, 0, 100);
    if (Math.random() < dt * 0.5) noise(1.2, 700, 0.05, 'lowpass', 200);
  },
  camera(p) { return { pos: tmpCamPos.set(p.x + 3, 3.2, p.z + 4.5), target: tmpCamTarget.set(p.x - 4, 0.5, p.z - 10), fov: 50, speed: 1.5 }; },
};
// 🏐 비치볼 통통 튕기기 미니게임
function ballGame() {
  const W = 640, H = 400, GY = 330;
  const g = { title: '🏐 비치볼 통통 튕기기', x: W / 2, bx: W / 2, by: 60, vx: rr(-80, 80), vy: 0, hits: 0, result: null, msg: '방향키로 움직여서 공을 머리로 튕겨요!' };
  g.finish = () => {
    const n = g.hits;
    if (n >= 20) g.result = { title: `${n}번! 비치볼 챔피언 🏆`, text: '보상: 코인 8개', give: () => { S.coins += 8; persist(); sfx.coin(); toast('🎁 코인 8개를 받았어요!'); } };
    else if (n >= 10) g.result = { title: `${n}번! 대단해요`, text: '보상: 코인 4개', give: () => { S.coins += 4; persist(); sfx.coin(); toast('🎁 코인 4개를 받았어요!'); } };
    else if (n >= 5) g.result = { title: `${n}번 튕겼어요!`, text: '보상: 코인 2개', give: () => { S.coins += 2; persist(); sfx.coin(); toast('🎁 코인 2개를 받았어요!'); } };
    else g.result = { title: `${n}번… 🥲`, text: '참가상: 코코넛 하나', give: () => { bagAdd('coco'); toast('🥥 코코가 코코넛 하나를 줬어요'); } };
  };
  g.key = () => {};
  g.update = (dt) => {
    const sp = 400;
    if (down('ArrowLeft', 'KeyA')) g.x -= sp * dt;
    if (down('ArrowRight', 'KeyD')) g.x += sp * dt;
    g.x = clamp(g.x, 40, W - 40);
    g.vy += 520 * dt;
    g.bx += g.vx * dt; g.by += g.vy * dt;
    if (g.bx < 20 || g.bx > W - 20) { g.vx *= -1; g.bx = clamp(g.bx, 20, W - 20); }
    if (g.vy > 0 && g.by > GY - 62 && g.by < GY - 30 && Math.abs(g.bx - g.x) < 46) {
      g.vy = -rr(440, 520);
      g.vx = clamp((g.bx - g.x) * 5 + rr(-70, 70), -260, 260);
      g.by = GY - 62;
      g.hits++;
      sfx.pop();
      g.msg = g.hits % 5 === 0 ? `${g.hits}번째! 코코: "멋져~!" 🐰` : '통!';
    }
    if (g.by > H + 20) { sfx.no(); g.finish(); }
  };
  g.draw = (c) => {
    const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#8fd3ff'); sky.addColorStop(1, '#dff4ff');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    c.fillStyle = '#5fc3e4'; c.fillRect(0, 230, W, 50);
    c.fillStyle = '#f2dca0'; c.fillRect(0, 280, W, 120);
    c.font = '46px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('🌴', 60, 220); c.fillText('🌴', 590, 210); c.fillText('🐰', 560, 300);
    // 나 (동글 곰돌이)
    c.fillStyle = '#fff1df'; c.strokeStyle = '#5a3e34'; c.lineWidth = 3;
    for (const s of [-1, 1]) { c.beginPath(); c.arc(g.x + s * 22, GY - 48, 10, 0, 7); c.fill(); c.stroke(); }
    c.beginPath(); c.arc(g.x, GY - 22, 30, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#3b2a25'; for (const s of [-1, 1]) { c.beginPath(); c.arc(g.x + s * 10, GY - 24, 3.5, 0, 7); c.fill(); }
    c.fillStyle = '#ffa3b8'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(g.x + s * 18, GY - 15, 6, 4, 0, 0, 7); c.fill(); }
    // 공
    c.save(); c.translate(g.bx, g.by); c.rotate(g.bx / 30);
    for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#ff6f91'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 18, (i * Math.PI) / 3, ((i + 1) * Math.PI) / 3); c.fill(); }
    c.restore();
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.ellipse(g.bx, GY + 8, 16, 5, 0, 0, 7); c.fill();
    c.fillStyle = '#6a4c3f'; c.font = '22px Jua, sans-serif'; c.fillText(g.msg, W / 2, 30);
  };
  g.info = () => `🏐 ${g.hits}번 · <kbd>←</kbd><kbd>→</kbd> 움직이기 · <kbd>Esc</kbd> 그만하기`;
  return g;
}

/* =========================================================
   🍄 버섯숲섬 — 수프 끓이기 · 통통 버섯
   ========================================================= */
{
  const I = ISL.mush;
  // 마당의 큰 솥
  const [px, pz] = islPos(I, -4, 5);
  const pot = new THREE.Group(); pot.position.set(px, 0, pz); scene.add(pot);
  add(new THREE.SphereGeometry(0.9, 18, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon({ color: 0x3b3b4a, side: THREE.DoubleSide }), 0, 1.0, 0, pot);
  add(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 18), toon({ color: 0xc9a45c, emissive: 0xffa030, emissiveIntensity: 0.15 }), 0, 0.95, 0, pot, false);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; add(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 5), 0x3b3b4a, Math.cos(a) * 0.6, 0.25, Math.sin(a) * 0.6, pot); }
  const fire = add(new THREE.ConeGeometry(0.35, 0.5, 8), toon({ color: 0xff9f43, emissive: 0xff6a00, emissiveIntensity: 0.9 }), 0, 0.25, 0, pot, false);
  collide(px, pz, 1.1);
  tickers.push(() => { fire.scale.y = 1 + Math.sin(elapsed * 12) * 0.2; if (Math.random() < 0.08) sparkle(px, 1.1, pz, new THREE.Color(0xffffff), 1); });
  interact({ x: px, z: pz + 2, r: 1.9, label: '🍲 버섯 수프 끓이기 (🍄3)', action: () => craftMenu('🍲 큰 솥에 버섯 수프 끓이기', { mushroom: 3 }, 'soup') });
  ZONE_LABELS.push(['🍲 큰 솥', px, 2.8, pz]);
  I.marks.push(['🍲', px, pz]);
  // 통통 버섯 트램펄린 (위에 올라가면 높이 튀어 올라요)
  const padCols = [0xff8fb1, 0x7fd3c8, 0xc3a6ff];
  let made = 0;
  for (let k = 0; k < 60 && made < 3; k++) {
    const a = rr(0, 6.3), d = rr(9, I.r - 8);
    const [x, z] = islPos(I, Math.cos(a) * d, Math.sin(a) * d);
    if (colliders.some((o) => Math.hypot(o.x - x, o.z - z) < o.r + 2.6) || BOUNCE_PADS.some((b) => Math.hypot(b.x - x, b.z - z) < 8)) continue;
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    add(new THREE.CylinderGeometry(0.35, 0.45, 0.5, 10), 0xfff1df, 0, 0.25, 0, g);
    const cap = add(new THREE.SphereGeometry(1.6, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), padCols[made], 0, 0.45, 0, g);
    cap.scale.y = 0.28;
    for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.16, 8, 6), 0xffffff, Math.cos(i * 1.3) * 0.9, 0.78, Math.sin(i * 1.3) * 0.9, g, false).scale.y = 0.4;
    // 높이 떠 있는 반짝 포자 (튀어 올라서 잡으면 코인!)
    const spore = add(new THREE.OctahedronGeometry(0.3, 0), toon({ color: 0xfff1a8, emissive: 0xffd34d, emissiveIntensity: 0.8 }), x, 3.6, z, scene, false);
    BOUNCE_PADS.push({ x, z, r: 1.4, h: 0.85, g, spore, sporeT: 0, squash: 0 });
    ZONE_LABELS.push(['🍄 통통 버섯', x, 2.2, z]);
    I.marks.push(['🌀', x, z]);
    made++;
  }
  tickers.push((dt) => {
    const p = player.root.position;
    for (const b of BOUNCE_PADS) {
      b.squash = Math.max(0, b.squash - dt);
      b.g.scale.set(1 + b.squash * 0.6, 1 - b.squash * 1.6, 1 + b.squash * 0.6);
      if (!b.spore.visible) { b.sporeT -= dt; if (b.sporeT <= 0) b.spore.visible = true; continue; }
      b.spore.rotation.y += dt * 2;
      b.spore.position.y = 3.6 + Math.sin(elapsed * 2 + b.x) * 0.2;
      if (state === 'play' && Math.hypot(p.x - b.x, p.z - b.z) < 1.4 && Math.abs(p.y + 1.2 - b.spore.position.y) < 1.2) {
        b.spore.visible = false; b.sporeT = 20;
        S.coins += 1; persist(); sfx.coin();
        sparkle(b.x, b.spore.position.y, b.z, new THREE.Color(0xfff1a8), 20);
        say(player, '반짝 포자 잡았다! ✨', 1.5);
      }
    }
  });
}

/* =========================================================
   🔭 별빛섬 — 별똥별에 소원 빌기
   ========================================================= */
const WISH_MAX = 3;
const wishDir = new THREE.Vector3(-0.35, 0.7, -0.62).normalize();
let wishSpot = null;
{
  const I = ISL.star;
  const [bx, bz] = islPos(I, 9, 8);
  const y = groundY(bx, bz);
  const g = new THREE.Group(); g.position.set(bx, y, bz); g.rotation.y = 0.4; scene.add(g);
  add(new THREE.BoxGeometry(2.2, 0.15, 0.7), 0xd69a6a, 0, 0.55, 0, g);
  add(new THREE.BoxGeometry(2.2, 0.5, 0.12), 0xd69a6a, 0, 0.95, -0.3, g);
  for (const lx of [-0.9, 0.9]) add(new THREE.BoxGeometry(0.15, 0.55, 0.6), 0x9c6a4c, lx, 0.27, 0, g);
  add(new THREE.OctahedronGeometry(0.25, 0), toon({ color: 0xfff1a8, emissive: 0xffd34d, emissiveIntensity: 0.6 }), 0, 1.6, -0.3, g, false);
  collide(bx, bz, 1.1);
  wishSpot = { x: bx, y, z: bz };
  interact({ x: bx + 0.8, z: bz + 1.6, r: 1.9, label: '🌠 언덕 벤치에서 별똥별에 소원 빌기', action: () => startWish() });
  ZONE_LABELS.push(['🌠 소원 벤치', bx, y + 2.6, bz]);
  I.marks.push(['🌠', bx, bz]);
}
const WISH = { t: 0, next: 1.5, stars: [], group: new THREE.Group() };
WISH.group.visible = false;
scene.add(WISH.group);
const wishToday = () => (S.wishDay === dayKey() ? S.wishN : 0);
function startWish() {
  if (tod < 1.5) {
    openMenu({
      title: '🌠 아직 낮이에요',
      desc: () => '별똥별은 밤하늘에서만 보여요. 벤치에 앉아 밤까지 기다릴까요?',
      items: () => [
        { label: '🌙 밤까지 기다리기', act: () => { setTimeout(() => fadeThen(() => { tod = todTarget = 2; toast('🌙 별이 총총한 밤이 되었어요', 2.4); setTimeout(startWish, 1200); }, 1000), 0); return false; } },
        { label: '그냥 둘러볼래요', act: () => false },
      ],
    });
    return;
  }
  state = 'wish';
  WISH.t = 0; WISH.next = 1.2;
  WISH.group.visible = true;
  player.root.position.set(wishSpot.x, wishSpot.y + 0.3, wishSpot.z + 0.2);
  player.root.rotation.set(0, Math.PI + 0.4, 0);
  $('prompt').classList.add('hidden');
  sceneMsg(`🌠 별똥별이 지나갈 때 <kbd>Space</kbd>! 오늘 밤 남은 소원 ${WISH_MAX - wishToday()}개 · <kbd>Esc</kbd> 그만하기`);
}
function endWish() {
  state = 'play';
  WISH.group.visible = false;
  for (const s of WISH.stars) WISH.group.remove(s.line);
  WISH.stars = [];
  sceneMsg(null);
}
function makeWish() {
  if (wishToday() >= WISH_MAX) { say(player, '오늘 밤 소원은 다 빌었어. 내일 또 오자 🌙', 2.4); return; }
  if (S.wishDay !== dayKey()) { S.wishDay = dayKey(); S.wishN = 0; }
  S.wishN++;
  const gifts = [
    () => { S.coins += 4; return '🪙 코인 4개가 하늘에서 떨어졌어요!'; },
    () => { S.energy = 100; S.full = clamp(S.full + 20, 0, 100); return '⚡ 몸이 가뿐해졌어요! 기운이 가득!'; },
    () => { addToken(2); return `${season().token.emoji} ${season().token.name} 2개가 반짝 나타났어요!`; },
    () => { const n = pick(npcs); addFriendship(n, 5); return `💗 ${n.name}와 더 친해지는 소원이 이루어졌어요!`; },
  ];
  const msg = pick(gifts)();
  persist();
  sfx.wish();
  sparkle(player.root.position.x, player.root.position.y + 2.5, player.root.position.z, new THREE.Color(0xfff1a8), 30);
  toast(`🌠 소원을 빌었어요… ${msg}`, 3.6);
  sceneMsg(`🌠 별똥별이 지나갈 때 <kbd>Space</kbd>! 오늘 밤 남은 소원 ${WISH_MAX - wishToday()}개 · <kbd>Esc</kbd> 그만하기`);
}
modes.wish = {
  key(code) {
    if (code === 'Escape' || code === 'KeyE') { endWish(); return; }
    if (code !== 'Space' && code !== 'Enter') return;
    const live = WISH.stars.find((s) => s.life > 0.15 && !s.caught);
    if (live) { live.caught = true; makeWish(); }
    else say(player, pick(['앗, 아직이야…', '하늘을 잘 보자!']), 1.2);
  },
  update(dt) {
    animateCreature(player, false, 0, dt, elapsed);
    player.body.position.y = -0.15;
    WISH.group.position.copy(camera.position);
    WISH.next -= dt;
    if (WISH.next <= 0 && wishToday() < WISH_MAX) {
      WISH.next = rr(1.8, 4);
      const Rv = new THREE.Vector3().crossVectors(wishDir, UP).normalize();
      const Uv = new THREE.Vector3().crossVectors(Rv, wishDir).normalize();
      const start = wishDir.clone().multiplyScalar(220).addScaledVector(Rv, rr(-90, 20)).addScaledVector(Uv, rr(10, 60));
      const vel = Rv.clone().multiplyScalar(rr(110, 150)).addScaledVector(Uv, -rr(50, 80));
      const geo = new THREE.BufferGeometry().setFromPoints([start, start.clone()]);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xfff6c8, transparent: true, opacity: 1, fog: false, depthWrite: false }));
      WISH.group.add(line);
      WISH.stars.push({ line, head: start.clone(), vel, life: 1.3, max: 1.3, caught: false });
      tone(2093, 0.4, 'sine', 0.03, 0.6);
    }
    for (let i = WISH.stars.length - 1; i >= 0; i--) {
      const s = WISH.stars[i];
      s.life -= dt;
      s.head.addScaledVector(s.vel, dt);
      const tail = s.head.clone().addScaledVector(s.vel, -0.22);
      const arr = s.line.geometry.attributes.position.array;
      arr[0] = s.head.x; arr[1] = s.head.y; arr[2] = s.head.z; arr[3] = tail.x; arr[4] = tail.y; arr[5] = tail.z;
      s.line.geometry.attributes.position.needsUpdate = true;
      s.line.material.opacity = clamp(s.life / s.max, 0, 1) * (s.caught ? 0.5 : 1);
      if (s.life <= 0) { WISH.group.remove(s.line); WISH.stars.splice(i, 1); }
    }
  },
  camera(p) {
    return { pos: tmpCamPos.set(p.x + 1.5, p.y + 2.6, p.z + 4), target: tmpCamTarget.set(p.x, p.y + 1.6, p.z).addScaledVector(wishDir, 40), fov: 62, speed: 2, lookSpeed: 3 };
  },
};

/* =========================================================
   🍓 딸기섬 — 젖소 음매에게서 우유 짜기
   ========================================================= */
{
  const I = ISL.berry;
  const [cx, cz] = islPos(I, 12, 5);
  const cow = new THREE.Group(); cow.position.set(cx, 0, cz); cow.rotation.y = -0.6; scene.add(cow);
  const spots = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#3b2a25'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(rr(0, 128), rr(0, 128), rr(10, 22), rr(8, 16), rr(0, 3), 0, 7); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const body = add(new THREE.SphereGeometry(1, 18, 12), toon({ map: spots }), 0, 1.2, 0, cow); body.scale.set(0.8, 0.75, 1.3);
  const head = add(new THREE.SphereGeometry(0.5, 14, 10), 0xffffff, 0, 1.6, 1.3, cow); head.scale.set(0.9, 0.85, 1);
  add(new THREE.SphereGeometry(0.3, 12, 8), 0xffc4d8, 0, 1.45, 1.72, cow).scale.set(1.1, 0.7, 0.6);
  for (const s of [-1, 1]) {
    add(new THREE.SphereGeometry(0.06, 6, 6), 0x3b2a25, s * 0.2, 1.75, 1.72, cow, false);
    add(new THREE.ConeGeometry(0.07, 0.25, 6), 0xfff1c8, s * 0.25, 2.05, 1.2, cow, false).rotation.z = -s * 0.4;
    add(new THREE.SphereGeometry(0.14, 8, 6), 0xffffff, s * 0.45, 1.85, 1.15, cow, false).scale.set(1.4, 0.6, 0.6);
  }
  for (const [lx, lz] of [[-0.45, 0.7], [0.45, 0.7], [-0.45, -0.7], [0.45, -0.7]]) add(new THREE.CylinderGeometry(0.15, 0.13, 0.75, 8), 0xffffff, lx, 0.38, lz, cow);
  add(new THREE.SphereGeometry(0.15, 8, 6), 0xffd166, 0, 1.15, 1.6, cow, false);
  collide(cx, cz, 1.5);
  const bucket = add(new THREE.CylinderGeometry(0.3, 0.24, 0.45, 12), 0x9fd6ff, cx - 1.6, 0.22, cz + 0.8);
  let milkT = 0;
  tickers.push((dt) => { milkT = Math.max(0, milkT - dt); cow.rotation.y = -0.6 + Math.sin(elapsed * 0.4) * 0.15; head.rotation.x = Math.sin(elapsed * 1.3) * 0.05; });
  interact({
    x: cx - 1.4, z: cz + 2, r: 2.1,
    get label() { return milkT > 0 ? `🐮 음매가 쉬는 중이에요 (${Math.ceil(milkT)}초)` : '🐮 젖소 음매에게서 우유 짜기'; },
    action: () => {
      if (milkT > 0) { say(player, '음매가 조금 쉬어야 한대~ 🐮', 1.8); return; }
      milkT = 30;
      bagAdd('milk');
      tone(180, 0.6, 'sawtooth', 0.04, 0.8);
      sparkle(cx, 1.5, cz, new THREE.Color(0xffffff), 16);
      say(player, '🥛 신선한 우유 한 병! "음매~"', 2);
    },
  });
  ZONE_LABELS.push(['🐮 젖소 음매', cx, 3.4, cz]);
  I.marks.push(['🐮', cx, cz]);
}
