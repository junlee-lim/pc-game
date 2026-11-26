/* =========================================================
   💾 저장 코드 — 다른 기기에서 이어 하기
   브라우저에 저장된 진행 상황을 압축해 짧은 글자 코드로 만들고,
   다른 기기에서 그 코드를 붙여 넣으면 그대로 이어져요. (서버 없이 동작)
   ========================================================= */
const SAVE_KEY_PREFIX = 'pogeun:';
const CODE_PREFIX_Z = 'POGEUN1-'; // 압축한 코드
const CODE_PREFIX_RAW = 'POGEUN0-'; // 압축을 못 쓰는 브라우저용

function collectSave() {
  persist();
  const data = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(SAVE_KEY_PREFIX)) data[k.slice(SAVE_KEY_PREFIX.length)] = localStorage.getItem(k);
    }
  } catch {}
  return data;
}
const toB64url = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64url = (str) => {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
};
async function pipeBytes(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}
async function makeSaveCode() {
  const json = JSON.stringify({ v: 1, t: Date.now(), d: collectSave() });
  const bytes = new TextEncoder().encode(json);
  if (typeof CompressionStream === 'function') {
    try { return CODE_PREFIX_Z + toB64url(await pipeBytes(bytes, new CompressionStream('deflate'))); } catch {}
  }
  return CODE_PREFIX_RAW + toB64url(bytes);
}
async function readSaveCode(code) {
  const c = code.replace(/\s+/g, '');
  let bytes;
  if (c.startsWith(CODE_PREFIX_Z)) {
    if (typeof DecompressionStream !== 'function') throw new Error('이 브라우저는 압축된 코드를 읽을 수 없어요');
    bytes = await pipeBytes(fromB64url(c.slice(CODE_PREFIX_Z.length)), new DecompressionStream('deflate'));
  } else if (c.startsWith(CODE_PREFIX_RAW)) {
    bytes = fromB64url(c.slice(CODE_PREFIX_RAW.length));
  } else throw new Error('포근마을 저장 코드가 아니에요');
  const obj = JSON.parse(new TextDecoder().decode(bytes));
  if (!obj || typeof obj.d !== 'object' || !('coins' in obj.d)) throw new Error('코드 내용이 올바르지 않아요');
  return obj;
}
function saveSummary(obj) {
  const g = (k, d) => { try { return JSON.parse(obj.d[k]); } catch { return d; } };
  const se = SEASONS[g('season', 1)] || SEASONS[1];
  const friends = Object.values(g('friends', {})).filter((v) => v >= 100).length;
  const when = new Date(obj.t).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `🪙 ${g('coins', 0)} · 소품 ${g('owned', []).length}개 · 가구 ${g('furniture', []).length}개 · ${se.emoji} ${se.name} ${g('seasonDay', 1)}일째 · 단짝 ${friends}명 (${when} 저장)`;
}

/* ---------- 화면 ---------- */
const SC = { mode: null, pending: null };
function showSaveBox(mode) {
  SC.mode = mode;
  SC.pending = null;
  state = 'savecode';
  $('prompt').classList.add('hidden');
  $('savebox').classList.remove('hidden');
  const ta = $('saveText');
  if (mode === 'export') {
    $('saveTitle').textContent = '💾 저장 코드';
    $('saveDesc').innerHTML = '이 코드를 복사해서 다른 기기의 포근마을에서 <kbd>Esc</kbd> → <b>저장 코드 불러오기</b>에 붙여 넣으면 이어서 할 수 있어요.';
    ta.readOnly = true;
    ta.value = '코드를 만드는 중…';
    $('saveFoot').innerHTML = '<kbd>Ctrl</kbd>+<kbd>C</kbd> 복사 · <kbd>Esc</kbd> 닫기';
    makeSaveCode().then((code) => {
      if (SC.mode !== 'export') return;
      ta.value = code;
      ta.focus();
      ta.select();
      const ok = () => { $('saveFoot').innerHTML = '<span class="ok">✅ 클립보드에 복사했어요!</span> · <kbd>Esc</kbd> 닫기'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(ok, () => {});
    });
  } else {
    $('saveTitle').textContent = '📥 저장 코드 불러오기';
    $('saveDesc').innerHTML = '다른 기기에서 만든 저장 코드를 붙여 넣어 주세요 (<kbd>Ctrl</kbd>+<kbd>V</kbd>).<br>⚠️ 지금 이 기기의 진행 상황은 코드의 내용으로 바뀌어요.';
    ta.readOnly = false;
    ta.value = '';
    $('saveFoot').innerHTML = '<kbd>Enter</kbd> 확인 · <kbd>Esc</kbd> 취소';
    setTimeout(() => ta.focus(), 0);
  }
  sfx.ok();
}
function closeSaveBox() {
  SC.mode = null;
  $('saveText').blur();
  $('savebox').classList.add('hidden');
  state = 'play';
}
async function confirmImport() {
  const foot = $('saveFoot');
  if (SC.pending) {
    // 두 번째 Enter: 실제로 덮어쓰고 새로 불러와요
    try {
      for (const k of Object.keys(collectSave())) localStorage.removeItem(SAVE_KEY_PREFIX + k);
      for (const [k, v] of Object.entries(SC.pending.d)) localStorage.setItem(SAVE_KEY_PREFIX + k, v);
    } catch {
      foot.innerHTML = '<span class="err">이 브라우저에 저장할 수 없어요 (사생활 보호 모드인지 확인해 주세요)</span>';
      return;
    }
    persist = () => {}; // 새로고침 전에 옛 데이터로 덮어쓰지 않도록
    sfx.fanfare();
    foot.innerHTML = '<span class="ok">✅ 불러왔어요! 마을을 다시 여는 중…</span>';
    setTimeout(() => location.reload(), 700);
    return;
  }
  try {
    const obj = await readSaveCode($('saveText').value);
    SC.pending = obj;
    $('saveText').readOnly = true;
    foot.innerHTML = `${saveSummary(obj)}<br>이 데이터로 이어 할까요? <kbd>Enter</kbd> 한 번 더 · <kbd>Esc</kbd> 취소`;
    sfx.ding();
  } catch (err) {
    sfx.no();
    foot.innerHTML = `<span class="err">${err && err.message && /[가-힣]/.test(err.message) ? err.message : '코드를 읽을 수 없어요. 빠짐없이 복사했는지 확인해 주세요'}</span> · <kbd>Enter</kbd> 다시 확인 · <kbd>Esc</kbd> 취소`;
  }
}
modes.savecode = {
  key(code) {
    if (code === 'Escape') { closeSaveBox(); return; }
    if (code === 'Enter') { if (SC.mode === 'import') confirmImport(); else closeSaveBox(); }
  },
  update(dt) { animateCreature(player, false, 0, dt, elapsed); },
};

/* ---------- Esc 메뉴 ---------- */
function openPauseMenu() {
  sfx.ok();
  openMenu({
    title: '🌼 포근마을 메뉴',
    desc: () => '진행 상황은 이 브라우저에 자동으로 저장돼요. 다른 기기에서 이어 하려면 저장 코드를 옮겨 주세요.',
    items: () => [
      ...(ON.url ? [{ label: '🌐 온라인 이름 바꾸기', right: escHtml(ON.name), act: () => { setTimeout(() => openChat('/이름 '), 0); return false; } }] : []),
      { label: '💾 저장 코드 만들기', right: '다른 기기로 옮기기', act: () => { setTimeout(() => showSaveBox('export'), 0); return false; } },
      { label: '📥 저장 코드 불러오기', right: '다른 기기에서 이어 하기', act: () => { setTimeout(() => showSaveBox('import'), 0); return false; } },
      { label: soundOn ? '🔊 소리 끄기' : '🔇 소리 켜기', act: () => {
        soundOn = !soundOn; save.set('sound', soundOn);
        if (master) master.gain.value = soundOn ? 0.55 : 0;
        return true;
      } },
      { label: '❓ 도움말 보기', act: () => { setTimeout(() => { helpOpen = true; $('help').classList.remove('hidden'); }, 0); return false; } },
      { label: '🔄 처음부터 다시 하기', act: () => { setTimeout(confirmReset, 0); return false; } },
      { label: '닫기', act: () => false },
    ],
  });
}
function confirmReset() {
  openMenu({
    title: '🔄 처음부터 다시 할까요?',
    desc: () => '코인, 아이템, 가구, 도감, 친구 호감도가 모두 사라져요.<br>혹시 모르니 먼저 저장 코드를 만들어 두면 나중에 되돌릴 수 있어요.',
    items: () => [
      { label: '아니요, 계속할래요', act: () => false },
      { label: '네, 처음부터 할래요', act: () => {
        try { for (const k of Object.keys(collectSave())) if (k !== 'sound') localStorage.removeItem(SAVE_KEY_PREFIX + k); } catch {}
        persist = () => {};
        location.reload();
        return false;
      } },
    ],
  });
}
playKeyHooks.push((code) => { if (code === 'Escape') { openPauseMenu(); return true; } return false; });
