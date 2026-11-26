/* =========================================================
   🌐 온라인 — 같은 서버에 접속한 친구들과 실시간으로 만나요
   - 게임을 서버 주소(https://…)로 열면 자동으로 접속해요
   - 파일로 열었을 땐 주소 뒤에 ?server=wss://서버주소/ws 를 붙이면 접속해요
   - T 채팅 · 1~4 이모티콘 · 채팅창에 "/이름 새이름" 으로 이름 바꾸기
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
const EMOTES = { Digit1: '👋', Digit2: '❤️', Digit3: '😊', Digit4: '😂' };
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
function refreshBadge() {
  if (!ON.url) { onBadge.classList.add('hidden'); return; }
  onBadge.classList.toggle('hidden', state === 'title' || state === 'loading');
  const n = ON.peers.size + 1;
  onBadge.innerHTML = ON.connected ? `🌐 온라인 <b>${n}</b>명 · ${escHtml(ON.name)} · <kbd>T</kbd> 채팅 <kbd>1</kbd>~<kbd>4</kbd> 이모티콘` : '🌐 서버에 연결하는 중…';
}

function openChat(prefill = '') {
  if (state !== 'play') return;
  keys.clear();
  chatBox.value = prefill;
  chatBox.classList.remove('hidden');
  chatBox.focus();
}
function closeChat() { chatBox.classList.add('hidden'); chatBox.blur(); keys.clear(); }
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
playKeyHooks.push((code) => {
  if (code === 'KeyT') { setTimeout(() => openChat(), 0); return true; } // 바로 열면 't' 글자가 같이 써져요
  if (EMOTES[code]) { say(player, EMOTES[code], 2.5); netSend({ t: 'emo', e: EMOTES[code] }); return true; }
  return false;
});

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
    p.tx = d.x; p.ty = d.y; p.tz = d.z; p.tr = d.r; p.mv = d.mv; p.run = d.run; p.isl = d.isl; p.hid = d.hid;
  }
  const eqKey = JSON.stringify(d.eq || {});
  if (d.eq && eqKey !== p.eqKey) {
    p.eqKey = eqKey;
    const slots = { hat: p.c.hatSlot, face: p.c.faceSlot, hand: p.c.handSlot };
    for (const g of Object.values(slots)) while (g.children.length) g.remove(g.children[0]);
    for (const [slot, id] of Object.entries(d.eq)) if (slots[slot] && SHOP_ITEMS.some((it) => it.id === id)) slots[slot].add(itemModel(id));
  }
}

// ---------- 서버 연결 ----------
function myState() {
  const p = player.root.position;
  const here = islandAt(insideHouse ? curRoom.exit : p);
  const mv = p.distanceTo(ON.lastPos) > 0.03;
  ON.lastPos.copy(p);
  return { x: p.x, y: p.y, z: p.z, r: player.root.rotation.y, mv, run: down('ShiftLeft', 'ShiftRight'), isl: here.id, hid: insideHouse || state === 'title', eq: S.equipped };
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
    } else if (m.t === 'leave') {
      const p = ON.peers.get(m.id);
      if (p && state !== 'title') toast(`${p.name}님이 집에 갔어요`);
      removePeer(m.id);
    } else if (m.t === 'st' || m.t === 'name') {
      const p = ON.peers.get(m.id);
      if (p) applyPeer(p, m);
    } else if (m.t === 'chat' || m.t === 'emo') {
      const p = ON.peers.get(m.id);
      if (p && p.c.root.visible) say(p.c, escHtml(m.t === 'chat' ? m.text : m.e), m.t === 'chat' ? 5 : 2.5, m.t === 'chat' ? escHtml(p.name) : '');
    } else if (m.t === 'full') {
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
  const showTags = SHOW_HUD_STATES.has(state);
  for (const p of ON.peers.values()) {
    const vis = !p.hid && !insideHouse && p.isl === myIsl;
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
  ON.badgeT = (ON.badgeT || 0) - dt;
  if (ON.badgeT <= 0) { ON.badgeT = 0.5; refreshBadge(); }
});
connectOnline();
