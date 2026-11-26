// 🌐 포근마을 온라인 서버
// - 게임 화면(index.html, style.css)을 보여 주고
// - /ws 웹소켓으로 같은 서버에 접속한 친구들의 위치·옷차림·채팅을 서로 전해 줘요.
// 사용법: npm install && npm start  (기본 포트 8080, 환경변수 PORT 로 바꿀 수 있어요)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { WebSocketServer } from 'ws';

const PORT = +process.env.PORT || 8080;
const MAX_PLAYERS = 60;
const FILES = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
};

const http = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  if (path === '/healthz') { res.writeHead(200, { 'content-type': 'text/plain' }); res.end('ok'); return; }
  const f = FILES[path];
  if (!f || req.method !== 'GET') { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('없는 페이지예요'); return; }
  try {
    const body = await readFile(new URL(f[0], import.meta.url));
    res.writeHead(200, { 'content-type': f[1], 'cache-control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(500); res.end();
  }
});

const wss = new WebSocketServer({ server: http, path: '/ws', maxPayload: 2048 });
const players = new Map(); // ws → { id, name, st, lastChat }
let nextId = 1;

// ---------- 들어온 값 다듬기 (믿을 수 없는 값이라 꼭 검사해요) ----------
const num = (v, lim = 1e4) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(-lim, Math.min(lim, Math.round(v * 100) / 100)) : 0);
const str = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, max) : '');
const cleanName = (v) => str(v, 12) || '포근이';
const cleanEq = (eq) => {
  const out = {};
  if (eq && typeof eq === 'object') for (const s of ['hat', 'face', 'hand']) { const id = str(eq[s], 20); if (/^[a-z0-9_]+$/i.test(id)) out[s] = id; }
  return out;
};
const cleanState = (m) => ({
  x: num(m.x), y: num(m.y), z: num(m.z), r: num(m.r, 100),
  mv: !!m.mv, run: !!m.run, isl: str(m.isl, 20), hid: !!m.hid, eq: cleanEq(m.eq),
});
const pub = (p) => ({ id: p.id, name: p.name, ...p.st });

function send(ws, msg) { if (ws.readyState === 1) ws.send(JSON.stringify(msg)); }
function broadcast(msg, except) {
  const s = JSON.stringify(msg);
  for (const ws of players.keys()) if (ws !== except && ws.readyState === 1) ws.send(s);
}

wss.on('connection', (ws) => {
  if (players.size >= MAX_PLAYERS) { send(ws, { t: 'full' }); ws.close(); return; }
  ws.alive = true;
  ws.on('pong', () => (ws.alive = true));
  let me = null;

  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m !== 'object') return;
    if (!me) {
      if (m.t !== 'hello') return;
      me = { id: nextId++, name: cleanName(m.name), st: cleanState(m.st || {}), lastChat: 0, lastSt: 0 };
      players.set(ws, me);
      send(ws, { t: 'welcome', id: me.id, players: [...players.values()].filter((p) => p !== me).map(pub) });
      broadcast({ t: 'join', ...pub(me) }, ws);
      return;
    }
    const now = Date.now();
    if (m.t === 'st') {
      if (now - me.lastSt < 50) return; // 너무 잦은 위치는 버려요 (초당 20번까지)
      me.lastSt = now;
      me.st = cleanState(m);
      broadcast({ t: 'st', id: me.id, ...me.st }, ws);
    } else if (m.t === 'chat') {
      const text = str(m.text, 60);
      if (!text || now - me.lastChat < 800) return;
      me.lastChat = now;
      broadcast({ t: 'chat', id: me.id, text }, ws);
    } else if (m.t === 'emo') {
      const e = str(m.e, 8);
      if (!e || now - me.lastChat < 400) return;
      me.lastChat = now;
      broadcast({ t: 'emo', id: me.id, e }, ws);
    } else if (m.t === 'name') {
      me.name = cleanName(m.name);
      broadcast({ t: 'name', id: me.id, name: me.name });
    }
  });

  ws.on('close', () => {
    if (!me) return;
    players.delete(ws);
    broadcast({ t: 'leave', id: me.id });
  });
});

// 연결이 끊긴 채 남아 있는 손님 정리
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) { ws.terminate(); continue; }
    ws.alive = false;
    ws.ping();
  }
}, 20000);

http.listen(PORT, () => console.log(`🌐 포근마을 서버: http://localhost:${PORT}`));
