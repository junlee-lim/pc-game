/* =========================================================
   UI 헬퍼
   ========================================================= */
let toastTimer = 0;
function toast(text, dur = 2.4) {
  const el = $('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), dur * 1000);
}
const bubbles = [];
function say(creature, text, dur = 2.8, who = '') {
  for (let i = bubbles.length - 1; i >= 0; i--) if (bubbles[i].c === creature) { bubbles[i].el.remove(); bubbles.splice(i, 1); }
  const el = document.createElement('div');
  el.className = 'bubble';
  el.innerHTML = (who ? `<span class="who">${who}</span>` : '') + text;
  $('bubbles').appendChild(el);
  bubbles.push({ c: creature, el, until: performance.now() + dur * 1000 });
}
const labelDefs = [
  ['⛲ 마을 광장', 0, 4.2, 0], ['🎆 불꽃 호숫가', 0, 6, -36], ['🍢 먹자골목', 32, 6, -4],
  ['😴 낮잠 언덕', -38, 7.5, 3.5], ['🛍️ 포근 잡화점', 22, 9.5, -26], ...ZONE_LABELS,
].map(([text, x, y, z]) => {
  const el = document.createElement('div');
  el.className = 'zone-label';
  el.textContent = text;
  $('labels').appendChild(el);
  return { el, p: new THREE.Vector3(x, y, z) };
});
const projV = new THREE.Vector3();
function toScreen(v) {
  projV.copy(v).project(camera);
  return { x: (projV.x * 0.5 + 0.5) * innerWidth, y: (-projV.y * 0.5 + 0.5) * innerHeight, ok: projV.z < 1 };
}

// 메뉴
let menu = null;
function openMenu(m) {
  menu = { index: 0, ...m, prevState: state };
  state = 'menu';
  renderMenu();
  $('menu').classList.remove('hidden');
  $('prompt').classList.add('hidden');
}
function closeMenu() {
  if (!menu) return;
  const m = menu;
  menu = null;
  $('menu').classList.add('hidden');
  if (state === 'menu') state = m.prevState === 'menu' ? 'play' : m.prevState;
  m.onClose && m.onClose();
}
function renderMenu() {
  const items = menu.items();
  menu.index = clamp(menu.index, 0, items.length - 1);
  $('menu').innerHTML = `<h2>${menu.title}</h2>${menu.desc ? `<p class="desc">${menu.desc()}</p>` : ''}<ul>${items
    .map((it, i) => `<li class="${i === menu.index ? 'sel' : ''} ${it.dim ? 'dim' : ''}"><span class="lbl">${it.label}</span><span class="right">${it.right || ''}</span></li>`)
    .join('')}</ul><div class="foot"><kbd>↑</kbd><kbd>↓</kbd> 고르기 · <kbd>Enter</kbd> 선택 · <kbd>Esc</kbd> 닫기</div>`;
  const sel = $('menu').querySelector('li.sel');
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}
function menuKey(code) {
  const items = menu.items();
  if (code === 'ArrowUp' || code === 'KeyW') { menu.index = (menu.index - 1 + items.length) % items.length; sfx.select(); renderMenu(); }
  else if (code === 'ArrowDown' || code === 'KeyS') { menu.index = (menu.index + 1) % items.length; sfx.select(); renderMenu(); }
  else if (code === 'Enter' || code === 'Space' || code === 'KeyE') {
    const keep = items[menu.index].act();
    if (keep && menu) renderMenu(); else closeMenu();
  } else if (code === 'Escape') closeMenu();
}

function openFoodMenu(key) {
  const f = FOODS[key];
  openMenu({
    title: `${f.emoji} ${f.name} 포장마차`,
    desc: () => `${f.desc}<br>포만감 +${f.full} · 기운 +${f.energy} &nbsp;|&nbsp; 내 코인 🪙 ${S.coins}`,
    items: () => [
      { label: `${f.name} 사 먹기`, right: `🪙 ${f.price}`, dim: S.coins < f.price, act: () => { eat(key); return false; } },
      {
        label: `포장해서 가방에 넣기 🎒`, right: `🪙 ${f.price}` + (S.bag[key] ? ` · 가방에 ${S.bag[key]}개` : ''), dim: S.coins < f.price,
        act: () => {
          if (S.coins < f.price) { sfx.no(); toast('코인이 모자라요 🪙'); return true; }
          S.coins -= f.price; bagAdd(key); sfx.ok();
          toast(`${f.emoji} ${f.name}을(를) 포장했어요! 친구에게 선물할 수 있어요`);
          return true;
        },
      },
      { label: '그냥 구경만 할래요', act: () => false },
    ],
  });
}
let eatModel = null, eatTimer = 0;
// free: 직접 만든 음식이라 돈을 내지 않아요
function eat(key, free = false) {
  const f = FOODS[key];
  if (!free && S.coins < f.price) {
    sfx.no();
    say(player, '코인이 모자라… 마을에서 반짝이는 코인을 찾아보자! 🪙', 3);
    return;
  }
  if (!free) S.coins -= f.price;
  S.full = clamp(S.full + f.full, 0, 100);
  S.energy = clamp(S.energy + f.energy, 0, 100);
  persist();
  sfx.ok();
  setTimeout(() => sfx.eat(), 300);
  if (eatModel) player.root.remove(eatModel);
  eatModel = foodModel(key);
  eatModel.position.set(0, 2.3, 0.9);
  eatModel.scale.setScalar(1.3);
  player.root.add(eatModel);
  eatTimer = 2.2;
  say(player, `냠냠! ${f.line}`, 3);
  const wp = player.root.position;
  setTimeout(() => sparkle(wp.x, wp.y + 2.5, wp.z, new THREE.Color(0xff8fb1), 30), 500);
}

function openShopMenu() {
  openMenu({
    title: '🛍️ 포근 잡화점',
    desc: () => `"어서 와요~ 귀여운 소품이 잔뜩 있어요!"<br>내 코인 🪙 ${S.coins}`,
    items: () => [
      ...SHOP_ITEMS.filter((it) => !it.prize).map((it) => {
        const owned = S.owned.includes(it.id);
        const on = S.equipped[it.slot] === it.id;
        return {
          label: `${it.emoji} ${it.name}`,
          right: owned ? (on ? '✅ 착용 중' : '착용하기') : `🪙 ${it.price}`,
          dim: !owned && S.coins < it.price,
          act: () => { shopSelect(it); return true; },
        };
      }),
      { label: '👋 가게 나가기', act: () => { say(player, '또 올게요~!', 2); return false; } },
    ],
  });
}
function shopSelect(it) {
  const owned = S.owned.includes(it.id);
  if (!owned) {
    if (S.coins < it.price) { sfx.no(); toast(`코인이 ${it.price - S.coins}개 더 필요해요 🪙`); return; }
    S.coins -= it.price;
    S.owned.push(it.id);
    S.equipped[it.slot] = it.id;
    sfx.ok();
    toast(`${it.emoji} ${it.name}을(를) 샀어요! 바로 착용했어요`);
    const p = player.root.position;
    sparkle(p.x, p.y + 2.6, p.z, new THREE.Color(0xfff1a8), 30);
  } else if (S.equipped[it.slot] === it.id) {
    S.equipped[it.slot] = null;
    sfx.select();
  } else {
    S.equipped[it.slot] = it.id;
    sfx.ok();
  }
  refreshEquip();
  persist();
}

function talkTo(npc) {
  npc.talk = 3.5;
  npc.target = null;
  sfx.talk();
  for (const h of talkHooks) if (h(npc)) return;
  npcChat(npc);
}
function npcChat(npc) {
  let line = pick(NPC_LINES);
  if (isRaining() && Math.random() < 0.6) line = pick(['비 온다! 우산 챙길걸~ ☔', '비 그치면 무지개가 뜰지도 몰라! 🌈', '비 온 뒤엔 달팽이가 나온대 🐌']);
  if (S.equipped.hat === 'straw' && Math.random() < 0.5) line = '우와, 밀짚모자 진짜 잘 어울린다! 👒';
  if (S.equipped.hand === 'balloon' && Math.random() < 0.4) line = '하트 풍선 귀엽다~ 나도 갖고 싶어 🎈';
  if (tod > 1.5 && Math.random() < 0.5) line = pick(['밤하늘 별 좀 봐… 반짝반짝 ✨', '불꽃놀이 같이 볼래? 호숫가 데크로 가자!', '하암… 슬슬 졸리다~']);
  if (Math.random() < 0.35) line = pick(SEASON_LINES[season().id]);
  if (S.full < 25 && Math.random() < 0.6) line = '배에서 꼬르륵 소리가 나는데? 먹자골목에 가 봐! 🍢';
  say(npc.c, line, 3.6, npc.name);
}

/* =========================================================
   낮잠
   ========================================================= */
let napTime = 0, napAdvanced = false, zTimer = 0;
function startNap() {
  state = 'nap';
  napTime = 0; napAdvanced = false;
  $('nap').classList.add('on');
  $('prompt').classList.add('hidden');
  const cy = hammockMesh.position.y;
  player.root.position.set(HAMMOCK.x, cy + 0.35, HAMMOCK.z + 1.0);
  player.root.rotation.set(0, 0, 0);
  player.body.rotation.set(-Math.PI / 2, 0, 0);
  player.feet.forEach((f) => (f.visible = false));
  sfx.yawn();
  say(player, '하암… 잠깐만 눈 좀 붙일게 💤', 2.5);
}
function endNap() {
  state = 'play';
  $('nap').classList.remove('on');
  player.body.rotation.set(0, 0, 0);
  player.feet.forEach((f) => (f.visible = true));
  player.root.position.set(-33, 0, HAMMOCK.z);
  player.root.rotation.set(0, Math.PI / 2, 0);
  const slept = napTime;
  if (slept > 4) {
    toast(slept > 9 ? '푹 잤다! 몸이 날아갈 것 같아 ✨' : '꿀잠 잤다~ 기운이 났어요!');
    say(player, '으~ 기지개 쭉! 🙆', 2.5);
  } else {
    say(player, '조금 더 잘 걸 그랬나…?', 2.5);
  }
  sfx.ok();
}

/* =========================================================
   불꽃축제
   ========================================================= */
let showTime = 0, nextRocket = 0;
const SHOW_LEN = 48;
function startFireworks() {
  state = 'fireworks';
  showTime = 0;
  nextRocket = tod > 1.6 ? 1.2 : 3.2;
  todTarget = 2;
  $('prompt').classList.add('hidden');
  player.root.position.set(0, 0.5, -30.9);
  player.root.rotation.set(0, Math.PI, 0);
  toast('🎆 밤하늘 불꽃축제가 시작돼요!  (Esc로 그만 보기)', 4);
  say(player, '두근두근… 곧 시작한다! ✨', 3);
}
function endFireworks(early) {
  state = 'play';
  player.root.position.set(0, 0, -28.5);
  toast(early ? '불꽃놀이는 언제든 다시 볼 수 있어요 🎆' : '정말 예뻤다… 오늘 밤 잊지 못할 거야 ✨', 3);
  if (!early) say(player, '최고의 밤이야! 💖', 3);
}
interact({ x: 0, z: -29.3, r: 3.2, label: '데크에 앉아 불꽃놀이 보기', action: () => startFireworks() });

/* =========================================================
   입력
   ========================================================= */
// 왼쪽 아래 조작법 카드 접기/펴기
function setKeysHidden(h) {
  $('keys').classList.toggle('collapsed', h);
  $('keysToggle').textContent = h ? '⌨️ 조작법 보기' : '–';
  $('keysToggle').title = h ? '조작법 펼치기' : '조작법 접기';
  save.set('keysHidden', h);
}
setKeysHidden(save.get('keysHidden', false));
$('keysToggle').addEventListener('click', (e) => {
  setKeysHidden(!$('keys').classList.contains('collapsed'));
  e.currentTarget.blur(); // Space 점프가 버튼을 다시 누르지 않도록
});
const keys = new Set();
let state = 'loading';
let helpOpen = false;
addEventListener('keydown', (e) => {
  const code = e.code;
  // 저장 코드 입력칸에 글자를 쓰는 동안엔 게임 조작을 멈춰요
  if (e.target && e.target.tagName === 'TEXTAREA') {
    if (code === 'Escape' || (code === 'Enter' && !e.shiftKey)) { e.preventDefault(); if (modes[state]) modes[state].key(code); }
    return;
  }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(code)) e.preventDefault();
  if (e.repeat && !['ArrowUp', 'ArrowDown'].includes(code)) { keys.add(code); return; }
  keys.add(code);
  initAudio();
  if (actx && actx.state === 'suspended') actx.resume();

  if (state === 'title') {
    if (code === 'Enter' || code === 'Space') startGame();
    return;
  }
  if (code === 'KeyM') {
    soundOn = !soundOn;
    save.set('sound', soundOn);
    if (master) master.gain.value = soundOn ? 0.55 : 0;
    toast(soundOn ? '🔊 소리 켜짐' : '🔇 소리 꺼짐', 1.4);
    return;
  }
  if (code === 'KeyH') {
    helpOpen = !helpOpen;
    $('help').classList.toggle('hidden', !helpOpen);
    return;
  }
  if (helpOpen) { if (code === 'Escape' || code === 'Enter') { helpOpen = false; $('help').classList.add('hidden'); } return; }

  if (state === 'menu') { menuKey(code); return; }
  if (modes[state]) { modes[state].key(code); return; }
  if (state === 'nap') { if (napTime > 0.8) endNap(); return; }
  if (state === 'fireworks') { if (code === 'Escape' || code === 'KeyE') endFireworks(true); return; }
  if (state === 'play' && playKeyHooks.some((h) => h(code))) return;
  if (state === 'play' && code === 'KeyC') {
    // 가장 가까운 '정면' 각도(0)로 부드럽게 되돌리기
    camYawTarget = Math.round(camYawTarget / (Math.PI * 2)) * Math.PI * 2;
    return;
  }
  if (state === 'play' && (code === 'KeyE' || code === 'Enter') && currentInteract) {
    currentInteract.action();
  }
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
const down = (...c) => c.some((k) => keys.has(k));

function startGame() {
  state = 'play';
  $('title').classList.add('hidden');
  $('hud').classList.remove('hidden');
  sfx.ok();
  setTimeout(() => say(player, '안녕! 오늘은 뭐 하고 놀까? 🌼', 3.5), 600);
  setTimeout(() => toast('H 키를 누르면 도움말을 볼 수 있어요', 3), 4500);
  camera.position.set(player.root.position.x, 30, player.root.position.z + 30);
}

/* =========================================================
   미니맵
   ========================================================= */
const mm = $('minimap').getContext('2d');
// 지도 배경 (크기 N 픽셀로 그려서 크기별로 보관)
const mapBgCache = {};
function mapBg(I, N) {
  const key = I.id + N;
  if (mapBgCache[key]) return mapBgCache[key];
  const cv = document.createElement('canvas');
  cv.width = cv.height = N;
  const g = cv.getContext('2d');
  const R = I.r, s = N / (R * 2 + 10), c = N / 2, k = N / 340;
  const P = (x, z) => [c + (x - I.x) * s, c + (z - I.z) * s];
  g.fillStyle = '#9fd6ff'; g.fillRect(0, 0, N, N);
  g.fillStyle = '#f6e3b4'; g.beginPath(); g.arc(c, c, (R + 0.6) * s, 0, 7); g.fill();
  g.fillStyle = I.mapColor || '#a7e086'; g.beginPath(); g.arc(c, c, R * s, 0, 7); g.fill();
  g.font = `${30 * k}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (I.id === 'main') {
    g.fillStyle = '#bdeb98'; g.beginPath(); g.arc(...P(HILL.x, HILL.z), HILL.r * s, 0, 7); g.fill();
    g.strokeStyle = '#f5dfb6'; g.lineWidth = 4 * s; g.lineCap = 'round';
    for (const [a, b, cc, d] of PATHS) { g.beginPath(); g.moveTo(...P(a, b)); g.lineTo(...P(cc, d)); g.stroke(); }
    g.fillStyle = '#f5dfb6'; g.beginPath(); g.arc(c, c, 8 * s, 0, 7); g.fill();
    g.fillStyle = '#77cdea'; g.beginPath(); g.arc(...P(POND.x, POND.z), POND.r * s, 0, 7); g.fill();
    g.fillStyle = '#ffb4c8';
    for (const [x, z] of HOUSES) { const [px, pz] = P(x, z); g.fillRect(px - 6 * k, pz - 6 * k, 12 * k, 12 * k); }
    g.fillStyle = '#d9a878'; g.fillRect(...P(PIER.x - PIER.w / 2, ISLAND_R), PIER.w * s, (PIER.z1 - ISLAND_R) * s);
    for (const [e, x, z] of [['🎆', 0, -36], ['🍢', 32, -4], ['😴', -38, 3.5], ['🛍️', 22, -26], ['⛲', 0, 0], ...MAP_MARKS]) g.fillText(e, ...P(x, z));
  } else {
    if (I.hill) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(...P(I.hill.x, I.hill.z), I.hill.r * s, 0, 7); g.fill(); }
    for (const [e, x, z] of I.marks || []) g.fillText(e, ...P(x, z));
    g.font = `${26 * k}px Jua, sans-serif`; g.fillStyle = '#6a4c3f';
    g.fillText(`${I.emoji} ${I.name}`, c, N * 0.88);
  }
  mapBgCache[key] = cv;
  return cv;
}
// 둥근 말풍선 모양 글씨표
let mapTagRects = null; // 큰 지도에서 이미 그린 이름표 자리 (겹치지 않게)
function mapTag(g, text, x, y, size, bg = 'rgba(255,248,236,0.92)', fg = '#6a4c3f') {
  g.font = `${size}px Jua, sans-serif`;
  const w = g.measureText(text).width + size * 0.9, h = size * 1.5;
  if (mapTagRects) {
    // 아래 → 위 → 오른쪽 → 왼쪽 순서로 빈자리를 찾고, 없으면 생략해요
    const hit = (cx, cy) => mapTagRects.some((r) => Math.abs(r.x - cx) < (r.w + w) / 2 + 2 && Math.abs(r.y - cy) < (r.h + h) / 2 + 1);
    const tries = [[0, 0], [0, -h * 1.9], [w * 0.6, -h * 0.9], [-w * 0.6, -h * 0.9], [0, h * 1.1]];
    const ok = tries.find(([dx, dy]) => !hit(x + dx, y + dy));
    if (!ok) return;
    x += ok[0]; y += ok[1];
    mapTagRects.push({ x, y, w, h });
  }
  g.fillStyle = bg; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fill();
  g.strokeStyle = '#f1dcc4'; g.lineWidth = Math.max(1.5, size * 0.1); g.stroke();
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y + 1);
}
// 지도 한 장 그리기 (미니맵 · 큰 지도 공용)
function paintMap(g, I, N, big) {
  const R = I.r, s = N / (R * 2 + 10), c = N / 2, k = N / 340;
  const P = (x, z) => [c + (x - I.x) * s, c + (z - I.z) * s];
  g.drawImage(mapBg(I, N), 0, 0);
  // 코인
  g.fillStyle = '#ffd166';
  const coinList = I.id === 'main' ? coins.map((co) => co.m) : islCoins.filter((co) => co.I === I).map((co) => co.m);
  for (const m of coinList) if (m.visible) { g.beginPath(); g.arc(...P(m.position.x, m.position.z), 4 * k, 0, 7); g.fill(); }
  // 큰 지도에는 장소 이름표
  mapTagRects = big ? [] : null;
  const me = insideHouse ? curRoom.exit : player.root.position;
  if (big && islandAt(me) === I) { const [mx, my] = P(me.x, me.z); mapTag(g, insideHouse ? '나 (집 안)' : '나', mx, my + 20 * k, 9 * k, '#ff8fb1', '#ffffff'); }
  if (big) {
    for (const l of labelDefs) if (islandAt(l.p) === I && !/^(🌴|🍄|🔭|🍓|🌼) /.test(l.el.textContent)) { const [x, y] = P(l.p.x, l.p.z); mapTag(g, l.el.textContent, x, y + 16 * k, 10 * k); }
    if (I.id === 'main' && typeof FRIEND_HOMES !== 'undefined') for (const F of FRIEND_HOMES) if (F.R) { const [x, y] = P(F.house[0], F.house[1]); mapTag(g, `${F.emoji} ${F.name}네`, x, y - 12 * k, 9 * k, 'rgba(255,230,238,0.95)'); }
  }
  // 친구들
  for (const n of npcs) {
    if (n.visiting || islandAt(n.c.root.position) !== I) continue;
    const [x, y] = P(n.c.root.position.x, n.c.root.position.z);
    g.fillStyle = '#ffffff'; g.strokeStyle = '#ff8fb1'; g.lineWidth = 1.5 * k;
    g.beginPath(); g.arc(x, y, 5 * k, 0, 7); g.fill(); if (big) g.stroke();
    if (big) mapTag(g, n.name, x, y - 13 * k, 8.5 * k, 'rgba(255,255,255,0.95)');
  }
  // 나
  const pw = me;
  if (islandAt(pw) !== I) { mapTagRects = null; return; }
  const [px, py] = P(pw.x, pw.z), r = player.root.rotation.y;
  const fa = Math.atan2(-Math.cos(camYaw), -Math.sin(camYaw));
  g.fillStyle = 'rgba(255, 255, 255, 0.45)';
  g.beginPath(); g.moveTo(px, py); g.arc(px, py, 46 * k, fa - 0.55, fa + 0.55); g.closePath(); g.fill();
  g.save();
  g.translate(px, py);
  g.rotate(-r);
  g.scale(k, k);
  g.fillStyle = '#ff6f91'; g.strokeStyle = '#fff'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(0, 13); g.lineTo(9, -8); g.lineTo(0, -3); g.lineTo(-9, -8); g.closePath();
  g.fill(); g.stroke();
  g.restore();
  mapTagRects = null;
}
function drawMinimap() {
  const pw = insideHouse ? curRoom.exit : player.root.position;
  paintMap(mm, islandAt(pw), 340, false);
}

/* ---------- 🗺️ 큰 지도 (지도를 누르거나 N 키) ---------- */
const bigCtx = $('bigmapCanvas').getContext('2d');
const BM = { idx: 0 };
function openBigMap() {
  if (!['play'].includes(state)) return;
  const here = islandAt(insideHouse ? curRoom.exit : player.root.position);
  BM.idx = ISLANDS.indexOf(here);
  state = 'bigmap';
  $('prompt').classList.add('hidden');
  $('bigmap').classList.remove('hidden');
  sfx.select();
}
function closeBigMap() {
  $('bigmap').classList.add('hidden');
  if (state === 'bigmap') state = 'play';
}
modes.bigmap = {
  key(code) {
    if (code === 'ArrowLeft' || code === 'KeyA') { BM.idx = (BM.idx - 1 + ISLANDS.length) % ISLANDS.length; sfx.select(); }
    else if (code === 'ArrowRight' || code === 'KeyD') { BM.idx = (BM.idx + 1) % ISLANDS.length; sfx.select(); }
    else if (['Escape', 'KeyN', 'Enter', 'Space', 'KeyE'].includes(code)) closeBigMap();
  },
  update(dt) {
    animateCreature(player, false, 0, dt, elapsed);
    const I = ISLANDS[BM.idx];
    const here = islandAt(insideHouse ? curRoom.exit : player.root.position) === I;
    $('bigmapTitle').innerHTML = `🗺️ ${I.emoji} ${I.name} ${here ? '<span class="here">📍 지금 여기</span>' : ''}`;
    paintMap(bigCtx, I, 760, true);
  },
};
$('minimap').addEventListener('click', () => { initAudio(); openBigMap(); });
$('bigmap').addEventListener('click', (e) => { if (e.target.closest('.bm-arrow')) return; closeBigMap(); });
document.querySelectorAll('.bm-arrow').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); modes.bigmap.key(b.dataset.dir === 'L' ? 'ArrowLeft' : 'ArrowRight'); }));
playKeyHooks.push((code) => { if (code === 'KeyN') { openBigMap(); return true; } return false; });
