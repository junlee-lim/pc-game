/* =========================================================
   🌐 온라인 — 같은 서버에 접속한 친구들과 실시간으로 만나요
   - 게임을 서버 주소(https://…)로 열면 자동으로 접속해요
   - 파일로 열었을 땐 주소 뒤에 ?server=wss://서버주소/ws 를 붙이면 접속해요
   - T 채팅 · 채팅창에 "/이름 새이름" 으로 이름 바꾸기
   ========================================================= */
const ON = {
  url: (() => {
    const q = new URLSearchParams(location.search).get('server');
    if (q) return q;
    if (location.protocol === 'https:' || location.protocol === 'http:') return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
    return null;
  })(),
  ws: null, id: 0, connected: false, everConnected: false, retry: 2, peers: new Map(),
  name: save.get('nick', null) || `포근이${Math.floor(100 + Math.random() * 900)}`,
  sendT: 0, beatT: 0, last: '', lastPos: new THREE.Vector3(),
};
save.set('nick', ON.name);
const escHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

// ---------- 화면 요소 (온라인 표시 · 채팅창) ----------
const onBadge = document.createElement('div');
onBadge.id = 'onlineBadge'; onBadge.className = 'card hidden';
document.body.appendChild(onBadge);
const chatBox = document.createElement('input');
chatBox.id = 'chatInput'; chatBox.className = 'card hidden';
chatBox.maxLength = 60; chatBox.autocomplete = 'off'; chatBox.spellcheck = false;
chatBox.placeholder = '하고 싶은 말 (Enter 보내기 · Esc 닫기 · /이름 새이름)';
document.body.appendChild(chatBox);
// 💬 채팅창: 오른쪽 아래에 친구 목록 + 최근 대화가 남아요
// (T 로 채팅을 쓰면 더 많이 보이고 스크롤돼요 · ✕ 로 닫으면 숨겨지고, T 나 온라인 표시를 누르면 다시 보여요)
const chatLog = document.createElement('div');
chatLog.id = 'chatLog'; chatLog.className = 'hidden';
chatLog.innerHTML = '<div class="cl-head"><span class="cl-title">💬 채팅</span><button type="button" class="cl-x" title="채팅창 닫기" aria-label="채팅창 닫기">✕</button></div><div class="cl-friends"></div><div class="cl-msgs"></div>';
document.body.appendChild(chatLog);
const clFriends = chatLog.querySelector('.cl-friends'), clMsgs = chatLog.querySelector('.cl-msgs'), clTitle = chatLog.querySelector('.cl-title');
const LOG_MAX = 50, LOG_SHOW = 6;
const logLines = [];
let chatHidden = save.get('chatHidden', false), unread = 0;
function addLog(name, text, sys = false) {
  const d = new Date();
  logLines.push({ name, text, sys, time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` });
  if (logLines.length > LOG_MAX) logLines.shift();
  if (chatHidden && !sys) { unread++; refreshBadge(); }
  renderLog();
}
function setChatHidden(h) {
  chatHidden = h; save.set('chatHidden', h);
  if (!h) unread = 0;
  renderLog(); refreshBadge();
}
// 친구가 지금 어디 있는지
function peerPlace(p) {
  if (p.hid) return '처음 화면';
  if (p.room) {
    if (p.room === 'home' + ON.id) return '🏠 우리 집';
    if (p.room === 'home' + p.id) return '🏠 자기 집';
    return p.room.startsWith('home') ? '🏠 친구 집' : '🏡 동물 친구 집';
  }
  const I = ISLANDS.find((i) => i.id === p.isl);
  return I ? `${I.emoji} ${I.name}` : '';
}
const lookDot = (look) => `<i class="dot" style="background:#${((look && look.color) ?? 0xfff1df).toString(16).padStart(6, '0')}"></i>`;
let lastFriendsHtml = '';
function renderFriends() {
  const peers = [...ON.peers.values()].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  clTitle.textContent = `💬 채팅 · 👥 ${peers.length + 1}명`;
  const html = `<span class="fr me">${lookDot(player.look)}${escHtml(ON.name)} <small>(나)</small></span>` +
    (peers.length ? peers.map((p) => `<span class="fr">${lookDot(p.c.look)}${escHtml(p.name)} <small>${escHtml(peerPlace(p))}</small></span>`).join('')
      : '<span class="fr none">아직 접속한 친구가 없어요</span>');
  if (html !== lastFriendsHtml) { lastFriendsHtml = html; clFriends.innerHTML = html; }
}
function renderLog() {
  const open = !chatBox.classList.contains('hidden');
  chatLog.classList.toggle('open', open);
  chatLog.classList.toggle('hidden', !ON.url || !ON.everConnected || (chatHidden && !open) || state === 'title' || state === 'loading');
  renderFriends();
  const lines = open ? logLines : logLines.slice(-LOG_SHOW);
  clMsgs.innerHTML = lines.length ? lines.map((l) => l.sys
    ? `<div class="sys"><span class="t">${l.time}</span>${escHtml(l.text)}</div>`
    : `<div><span class="t">${l.time}</span><b class="${l.name === ON.name ? 'me' : ''}">${escHtml(l.name)}</b> ${escHtml(l.text)}</div>`).join('')
    : '<div class="sys">아직 대화가 없어요. <kbd>T</kbd> 를 눌러 말을 걸어 보세요!</div>';
  clMsgs.scrollTop = clMsgs.scrollHeight;
}
// 채팅을 쓰는 중에 창을 눌러도 입력칸이 닫히지 않게 (스크롤은 그대로 돼요)
chatLog.addEventListener('mousedown', (e) => { if (!chatBox.classList.contains('hidden')) e.preventDefault(); });
chatLog.querySelector('.cl-x').addEventListener('click', () => {
  if (!chatBox.classList.contains('hidden')) closeChat();
  setChatHidden(true);
  toast('💬 채팅창을 숨겼어요. T 를 누르거나 오른쪽 아래 온라인 표시를 누르면 다시 보여요', 3);
});
onBadge.addEventListener('click', () => { if (chatHidden) setChatHidden(false); });
function refreshBadge() {
  if (!ON.url) { onBadge.classList.add('hidden'); return; }
  onBadge.classList.toggle('hidden', state === 'title' || state === 'loading');
  onBadge.classList.toggle('clickable', chatHidden);
  const n = ON.peers.size + 1;
  const tail = chatHidden ? (unread ? ` · <b class="new">💬 새 메시지 ${unread}</b>` : ' · 💬 채팅 보기') : '';
  onBadge.innerHTML = ON.connected ? `🌐 온라인 <b>${n}</b>명 · ${escHtml(ON.name)} · <kbd>T</kbd> 채팅${tail}` : '🌐 서버에 연결하는 중…';
}

function openChat(prefill = '') {
  if (state !== 'play') return;
  if (chatHidden) setChatHidden(false);
  keys.clear();
  chatBox.value = prefill;
  chatBox.classList.remove('hidden');
  chatBox.focus();
  renderLog();
}
function closeChat() { chatBox.classList.add('hidden'); chatBox.blur(); keys.clear(); renderLog(); }
chatBox.addEventListener('keydown', (e) => {
  e.stopPropagation(); // 채팅을 쓰는 동안엔 게임 조작을 멈춰요
  if (e.code === 'Escape') { e.preventDefault(); closeChat(); return; }
  if (e.key !== 'Enter' || e.isComposing) return;
  e.preventDefault();
  const text = chatBox.value.trim();
  closeChat();
  if (!text) return;
  const nm = text.match(/^\/(이름|name)\s+(.+)$/i);
  if (nm) { setOnlineName(nm[2]); return; }
  say(player, escHtml(text), 4.5);
  if (ON.connected) addLog(ON.name, text.slice(0, 60));
  netSend({ t: 'chat', text });
  if (!ON.connected) toast(ON.url ? '🌐 아직 서버에 연결되지 않았어요' : '🌐 온라인 서버로 접속해야 친구에게 보여요');
});
chatBox.addEventListener('blur', () => { if (!chatBox.classList.contains('hidden')) closeChat(); });
function setOnlineName(v) {
  const name = String(v).replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 12);
  if (!name) return;
  ON.name = name; save.set('nick', name);
  netSend({ t: 'name', name });
  toast(`🌐 이제 "${name}"(으)로 보여요`);
  refreshBadge();
}
// T: 채팅창 열기. 키 누름 자체를 막아야 채팅창에 't' 가 같이 써지지 않아요 (그래서 게임 키 처리보다 먼저 받아요)
addEventListener('keydown', (e) => {
  if (e.code !== 'KeyT' || e.repeat || e.ctrlKey || e.metaKey || e.altKey || state !== 'play' || helpOpen) return;
  if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
  e.preventDefault();
  e.stopPropagation();
  openChat();
  // 한글 입력기가 켜져 있으면 'ㅅ' 이 남을 수 있어서 한 번 더 지워요
  setTimeout(() => { if (/^[tTㅅ]$/.test(chatBox.value)) chatBox.value = ''; }, 0);
}, true);

// ---------- 다른 친구들 ----------
function makePeer(d) {
  const c = makeCreature({ color: 0xfff1df, ears: 'bear', accent: 0xffa3b8 });
  c.scarf.forEach((m) => (m.visible = season().id === 'winter'));
  c.root.position.set(d.x || 0, d.y || 0, d.z || 0);
  scene.add(c.root);
  const tag = document.createElement('div');
  tag.className = 'name-tag';
  $('labels').appendChild(tag);
  const p = { id: d.id, c, tag, name: '', eqKey: '', tx: c.root.position.x, ty: c.root.position.y, tz: c.root.position.z, tr: 0, mv: false, run: false, isl: 'main', hid: false };
  ON.peers.set(d.id, p);
  applyPeer(p, d);
  return p;
}
function removePeer(id) {
  const p = ON.peers.get(id);
  if (!p) return;
  scene.remove(p.c.root);
  p.tag.remove();
  const i = CREATURES.indexOf(p.c); if (i >= 0) CREATURES.splice(i, 1);
  for (let k = bubbles.length - 1; k >= 0; k--) if (bubbles[k].c === p.c) { bubbles[k].el.remove(); bubbles.splice(k, 1); }
  ON.peers.delete(id);
}
function applyPeer(p, d) {
  if (typeof d.name === 'string' && d.name !== p.name) { p.name = d.name; p.tag.textContent = d.name; }
  if (typeof d.x === 'number') {
    // 배를 타거나 순간 이동하면 바로 그 자리로
    if (Math.hypot(d.x - p.tx, d.z - p.tz) > 12) p.c.root.position.set(d.x, d.y, d.z);
    p.tx = d.x; p.ty = d.y; p.tz = d.z; p.tr = d.r; p.mv = d.mv; p.run = d.run; p.isl = d.isl; p.hid = d.hid; p.room = d.room || '';
  }
  if (d.look) p.c.setLook(validLook(d.look));
  const eqKey = JSON.stringify(d.eq || {});
  if (d.eq && eqKey !== p.eqKey) {
    p.eqKey = eqKey;
    const slots = { hat: p.c.hatSlot, face: p.c.faceSlot, hand: p.c.handSlot };
    for (const g of Object.values(slots)) while (g.children.length) g.remove(g.children[0]);
    for (const [slot, id] of Object.entries(d.eq)) if (slots[slot] && SHOP_ITEMS.some((it) => it.id === id)) slots[slot].add(itemModel(id));
  }
}

// ---------- 서버 연결 ----------
// 지금 있는 방: '' 바깥 · 'home<주인 id>' 온라인 집 · 'npc<x>' 동물 친구 집
function myRoom() {
  if (!insideHouse) return '';
  if (curRoom === ROOM) return 'home' + (roomOwner ? roomOwner.hostId : ON.id);
  return 'npc' + Math.round(curRoom.x);
}
function myState() {
  const p = player.root.position;
  const here = islandAt(insideHouse ? curRoom.exit : p);
  const mv = p.distanceTo(ON.lastPos) > 0.03;
  ON.lastPos.copy(p);
  return { x: p.x, y: p.y, z: p.z, r: player.root.rotation.y, mv, run: down('ShiftLeft', 'ShiftRight'), isl: here.id, hid: state === 'title', room: myRoom(), eq: S.equipped, look: player.look };
}
function netSend(m) { if (ON.connected && ON.ws.readyState === 1) ON.ws.send(JSON.stringify(m)); }
function connectOnline() {
  if (!ON.url) return;
  let ws;
  try { ws = new WebSocket(ON.url); } catch { return; }
  ON.ws = ws;
  ws.onopen = () => {
    ON.connected = true; ON.retry = 2;
    ws.send(JSON.stringify({ t: 'hello', name: ON.name, st: myState() }));
  };
  ws.onmessage = (ev) => {
    let m; try { m = JSON.parse(ev.data); } catch { return; }
    if (m.t === 'welcome') {
      ON.id = m.id;
      for (const id of [...ON.peers.keys()]) removePeer(id);
      m.players.forEach(makePeer);
      if (!ON.everConnected && state !== 'title') toast(`🌐 온라인에 접속했어요! 지금 ${m.players.length + 1}명이 놀고 있어요`, 3);
      ON.everConnected = true;
    } else if (m.t === 'join') {
      makePeer(m);
      if (state !== 'title') toast(`👋 ${m.name}님이 놀러 왔어요`);
      addLog('', `👋 ${m.name}님이 들어왔어요`, true);
    } else if (m.t === 'leave') {
      const p = ON.peers.get(m.id);
      if (p && state !== 'title') toast(`${p.name}님이 집에 갔어요`);
      if (p) addLog('', `${p.name}님이 나갔어요`, true);
      removePeer(m.id);
    } else if (m.t === 'st' || m.t === 'name') {
      const p = ON.peers.get(m.id);
      if (p && m.t === 'name' && m.name !== p.name) addLog('', `${p.name}님이 이름을 ${m.name}(으)로 바꿨어요`, true);
      if (p) applyPeer(p, m);
    } else if (m.t === 'chat' || m.t === 'emo') {
      const p = ON.peers.get(m.id);
      if (p && p.c.root.visible) say(p.c, escHtml(m.t === 'chat' ? m.text : m.e), m.t === 'chat' ? 5 : 2.5, m.t === 'chat' ? escHtml(p.name) : '');
      if (p && m.t === 'chat') addLog(p.name, m.text);
    } else if (m.t === 'gift') onGift(m);
    else if (m.t === 'giftres') onGiftRes(m);
    else if (m.t === 'visit') onVisit(m);
    else if (m.t === 'visitres') onVisitRes(m);
    else if (m.t === 'full') {
      toast('🌐 서버가 꽉 찼어요. 잠시 뒤에 다시 들어올게요', 3);
    }
    refreshBadge();
  };
  ws.onclose = () => {
    if (ON.connected && state !== 'title') toast('🌐 서버와 연결이 끊겼어요. 다시 연결하는 중…', 3);
    ON.connected = false;
    for (const id of [...ON.peers.keys()]) removePeer(id);
    refreshBadge();
    setTimeout(connectOnline, ON.retry * 1000);
    ON.retry = Math.min(ON.retry * 2, 30);
  };
}

tickers.push((dt) => {
  // 내 상태 보내기 (바뀌었으면 초당 10번, 가만히 있으면 2초마다)
  if (ON.connected) {
    ON.sendT -= dt; ON.beatT -= dt;
    if (ON.sendT <= 0) {
      ON.sendT = 0.1;
      const st = myState();
      const key = JSON.stringify(st);
      if (key !== ON.last || ON.beatT <= 0) { ON.last = key; ON.beatT = 2; netSend({ t: 'st', ...st }); }
    }
  }
  // 친구들 움직이기
  const myIsl = islandAt(insideHouse ? curRoom.exit : player.root.position).id;
  const room = myRoom();
  const showTags = SHOW_HUD_STATES.has(state);
  const pp = player.root.position;
  let near = null, nd = 2.2;
  for (const p of ON.peers.values()) {
    // 같은 방(집 안) 이거나, 둘 다 바깥이면 같은 섬에 있을 때 보여요
    const vis = !p.hid && p.room === room && (room !== '' || p.isl === myIsl);
    if (vis) { const d = Math.hypot(p.tx - pp.x, p.tz - pp.z); if (d < nd) { nd = d; near = p; } }
    p.c.root.visible = vis;
    if (!vis) { p.tag.style.display = 'none'; continue; }
    const r = p.c.root;
    const k = damp(10, dt);
    r.position.x = lerp(r.position.x, p.tx, k);
    r.position.y = lerp(r.position.y, p.ty, k);
    r.position.z = lerp(r.position.z, p.tz, k);
    r.rotation.y = lerpAngle(r.rotation.y, p.tr, damp(12, dt));
    animateCreature(p.c, p.mv, p.run ? 9.5 : 5.5, dt, elapsed);
    const wp = p.c.head.getWorldPosition(new THREE.Vector3());
    wp.y += 1.0;
    const s = toScreen(wp);
    const show = showTags && s.ok && camera.position.distanceTo(wp) < 60;
    p.tag.style.display = show ? '' : 'none';
    if (show) { p.tag.style.left = s.x + 'px'; p.tag.style.top = s.y + 'px'; }
  }
  // 겨울엔 친구들도 목도리
  const winter = season().id === 'winter';
  for (const p of ON.peers.values()) if (p.c.scarf[0].visible !== winter) p.c.scarf.forEach((m) => (m.visible = winter));
  ON.near = state === 'play' ? near : null;
  ON.badgeT = (ON.badgeT || 0) - dt;
  if (ON.badgeT <= 0) {
    ON.badgeT = 0.5; refreshBadge();
    const shouldHide = !ON.url || !ON.everConnected || (chatHidden && chatBox.classList.contains('hidden')) || state === 'title' || state === 'loading';
    if (chatLog.classList.contains('hidden') !== shouldHide) renderLog(); else renderFriends(); // 친구 위치는 자주 바뀌어요
  }
});

/* ---------- 💬 친구 가까이에서 E: 선물하기 · 집에 놀러 가기 ---------- */
interact({
  get x() { return ON.near ? ON.near.c.root.position.x : 1e9; },
  get z() { return ON.near ? ON.near.c.root.position.z : 1e9; },
  get r() { return ON.near ? 2.2 : 0; },
  get label() { return ON.near ? `💬 ${ON.near.name}님과 놀기` : ''; },
  action: () => ON.near && openPeerMenu(ON.near),
});
function openPeerMenu(p) {
  sfx.ok();
  const outside = !insideHouse;
  openMenu({
    title: `💬 ${escHtml(p.name)}`,
    desc: () => '무엇을 할까요?',
    items: () => [
      { label: '🎁 선물하기', right: '음식 · 소품', act: () => { setTimeout(() => openGiftMenu(p), 0); return false; } },
      ...(outside ? [{ label: `🏠 ${escHtml(p.name)}님 집에 놀러 가기`, act: () => { requestVisit(p); return false; } }] : []),
      { label: '👋 인사하기', act: () => { say(player, '안녕~ 👋', 2.5); netSend({ t: 'emo', e: '👋' }); return false; } },
      { label: '닫기', act: () => false },
    ],
  });
}

// ---------- 🎁 선물 ----------
const giftPending = new Map(); // gid → { kind, key, name, timer }
let giftSeq = 1;
const giftName = (kind, key) => {
  if (kind === 'item') { const it = SHOP_ITEMS.find((i) => i.id === key); return it ? `${it.emoji} ${it.name}` : null; }
  const info = BAG_INFO()[key];
  return info ? `${info.emoji} ${info.name}` : null;
};
const pendingCount = (kind, key) => [...giftPending.values()].filter((g) => g.kind === kind && g.key === key).length;
function openGiftMenu(p) {
  const list = () => [
    ...Object.entries(S.bag).filter(([k, n]) => n - pendingCount('bag', k) > 0 && giftName('bag', k)).map(([k, n]) => ({ kind: 'bag', key: k, right: `${n - pendingCount('bag', k)}개` })),
    ...S.owned.filter((id) => !pendingCount('item', id) && giftName('item', id)).map((id) => ({ kind: 'item', key: id, right: Object.values(S.equipped).includes(id) ? '착용 중' : '소품' })),
  ];
  openMenu({
    title: `🎁 ${escHtml(p.name)}님에게 선물하기`,
    desc: () => (list().length ? '가방 속 음식이나 갖고 있는 소품을 하나 골라 주세요. 친구가 받으면 내 것에서 빠져요.' : '선물할 게 없어요. 먹자골목에서 포장하거나 잡화점에서 소품을 사 보세요!'),
    items: () => [
      ...list().map((g) => ({ label: giftName(g.kind, g.key), right: g.right, act: () => { sendGift(p, g.kind, g.key); return false; } })),
      { label: '닫기', act: () => false },
    ],
  });
}
function sendGift(p, kind, key) {
  if (!ON.connected || !ON.peers.has(p.id)) { sfx.no(); toast('🌐 친구와 연결되어 있지 않아요'); return; }
  const gid = giftSeq++;
  const name = giftName(kind, key);
  const timer = setTimeout(() => { if (giftPending.delete(gid)) toast(`🎁 ${p.name}님이 대답이 없어요. 선물은 그대로 갖고 있을게요`, 3); }, 8000);
  giftPending.set(gid, { kind, key, name, peer: p.name, timer });
  netSend({ t: 'gift', to: p.id, gid, kind, key });
  say(player, `${name.split(' ')[0]} 이거 받아~ 🎁`, 2.5);
}
function onGiftRes(m) {
  const g = giftPending.get(m.gid);
  if (!g) return;
  giftPending.delete(m.gid); clearTimeout(g.timer);
  if (!m.ok) {
    sfx.no();
    toast(m.why === 'already' ? `🎁 ${g.peer}님은 ${g.name}을(를) 이미 갖고 있대요` : m.why === 'gone' ? `🎁 ${g.peer}님이 떠나서 못 줬어요` : `🎁 ${g.peer}님에게 선물을 못 줬어요`, 3);
    return;
  }
  // 친구가 받았으니 내 것에서 빼요
  if (g.kind === 'bag') bagAdd(g.key, -1);
  else {
    S.owned = S.owned.filter((id) => id !== g.key);
    for (const [slot, id] of Object.entries(S.equipped)) if (id === g.key) S.equipped[slot] = null;
    refreshEquip(); persist();
  }
  sfx.coin();
  addXP(3, '선물');
  toast(`🎁 ${g.peer}님에게 ${g.name}을(를) 선물했어요!`, 3);
  addLog('', `🎁 ${g.peer}님에게 ${g.name}을(를) 선물했어요`, true);
}
function onGift(m) {
  const p = ON.peers.get(m.from);
  const reply = (ok, why = '') => netSend({ t: 'giftres', to: m.from, gid: m.gid, ok, why });
  const name = giftName(m.kind, m.key);
  if (!p || !name) { reply(false, 'bad'); return; }
  if (m.kind === 'item') {
    if (S.owned.includes(m.key)) { reply(false, 'already'); toast(`🎁 ${p.name}님이 ${name}을(를) 주려고 했는데, 이미 갖고 있어요`, 3); return; }
    S.owned.push(m.key); persist();
  } else bagAdd(m.key, 1);
  reply(true);
  sfx.fanfare();
  if (p.c.root.visible) say(p.c, '🎁', 2.5);
  toast(`🎁 ${p.name}님에게 ${name}을(를) 받았어요!${m.kind === 'item' ? ' (옷장에서 입어 보세요)' : ''}`, 3.5);
  addLog('', `🎁 ${p.name}님에게 ${name}을(를) 받았어요`, true);
}

// ---------- 🏠 친구 집에 놀러 가기 ----------
let visitPending = null;
function requestVisit(p) {
  if (!ON.connected) { sfx.no(); toast('🌐 친구와 연결되어 있지 않아요'); return; }
  if (visitPending) return;
  visitPending = { id: p.id, name: p.name, timer: setTimeout(() => { visitPending = null; toast(`🏠 ${p.name}님이 대답이 없어요`, 2.5); }, 8000) };
  netSend({ t: 'visit', to: p.id });
  say(player, '똑똑~ 놀러 가도 돼? 🏠', 2.5);
}
function onVisit(m) {
  const p = ON.peers.get(m.from);
  if (!p) return;
  if (!save.get('doorOpen', true)) { netSend({ t: 'visitres', to: m.from, ok: false, why: 'closed' }); return; }
  netSend({ t: 'visitres', to: m.from, ok: true, house: { houseLv: S.houseLv, furniture: S.furniture, layout: S.layout } });
  sfx.bell();
  toast(`🏠 ${p.name}님이 우리 집에 놀러 와요! (집에 가면 만날 수 있어요)`, 3.5);
  addLog('', `🏠 ${p.name}님이 우리 집에 놀러 왔어요`, true);
}
function onVisitRes(m) {
  const v = visitPending;
  if (!v || v.id !== m.from) return;
  clearTimeout(v.timer); visitPending = null;
  if (!m.ok) { sfx.no(); toast(m.why === 'closed' ? `🏠 ${v.name}님 집 문이 닫혀 있어요` : `🏠 ${v.name}님 집에 갈 수 없어요`, 3); return; }
  if (state !== 'play' || insideHouse) return;
  // 받은 집 정보는 믿지 말고 아는 가구만 골라 써요
  const h = m.house || {};
  const ids = new Set(FURNITURE.map((f) => f.id));
  const layout = {};
  for (const [k, L] of Object.entries(h.layout || {})) if (ids.has(k) && Array.isArray(L)) layout[k] = [clamp(+L[0] || 0, -10, 10), clamp(+L[1] || 0, -6.5, 6.5), +L[2] || 0, !!L[3]];
  const house = { houseLv: clamp(Math.round(+h.houseLv) || 1, 1, 3), furniture: (h.furniture || []).filter((id) => ids.has(id)), layout, name: v.name, hostId: v.id };
  if (riding) setRiding(false);
  sfx.ok();
  fadeThen(() => {
    roomOwner = house;
    applyHouseLevel();
    insideHouse = true;
    curRoom = ROOM;
    player.root.position.set(ROOM.x, 0, ROOM.z + ROOM.d / 2 - 1.2);
    player.root.rotation.set(0, Math.PI, 0);
    houseCamera(player.root.position, camera.position, lookAt);
    say(player, `${v.name}님 집 구경 왔어요~ 🏠`, 3);
    addXP(3, '친구 집 놀러 가기');
  }, 300);
}

connectOnline();
