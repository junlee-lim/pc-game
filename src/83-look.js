/* =========================================================
   🐻 내 모습 바꾸기 — 몸 색 · 귀 모양 · 볼터치 색
   (온라인에서는 다른 사람에게도 이 모습으로 보여요)
   ========================================================= */
const LOOK_COLORS = [
  [0xfff1df, '크림'], [0xc69a6b, '코코아'], [0xffd6e2, '딸기우유'], [0xcde8ff, '하늘'],
  [0xd8f5e8, '민트'], [0xfff3b0, '바나나'], [0xe6dcff, '라벤더'], [0xd9d4d0, '구름 회색'], [0x8a8a92, '먹구름'],
];
const LOOK_EARS = [['bear', '🐻 곰'], ['cat', '🐱 고양이'], ['bunny', '🐰 토끼']];
const LOOK_ACCENTS = [[0xffa3b8, '분홍'], [0xffb37a, '살구'], [0xff7f7f, '빨강'], [0xc3a6ff, '보라'], [0x8fc8ff, '파랑']];
const DEFAULT_LOOK = { color: 0xfff1df, ears: 'bear', accent: 0xffa3b8 };
// 저장된 값이나 다른 사람이 보낸 값이 목록에 없으면 기본값으로
function validLook(l) {
  const ok = (list, v) => list.some((o) => o[0] === v);
  return l && typeof l === 'object' ? {
    color: ok(LOOK_COLORS, l.color) ? l.color : DEFAULT_LOOK.color,
    ears: ok(LOOK_EARS, l.ears) ? l.ears : DEFAULT_LOOK.ears,
    accent: ok(LOOK_ACCENTS, l.accent) ? l.accent : DEFAULT_LOOK.accent,
  } : { ...DEFAULT_LOOK };
}
player.setLook(validLook(S.look));

function openLookMenu(first = false) {
  if (state !== 'play') return;
  sfx.ok();
  const before = { ...player.look };
  const cur = { ...player.look };
  const idx = (list, v) => Math.max(0, list.findIndex((o) => o[0] === v));
  const step = (list, key, d) => { cur[key] = list[(idx(list, cur[key]) + d + list.length) % list.length][0]; player.setLook(cur); };
  const row = (emoji, title, list, key) => ({
    label: `${emoji} ${title}`,
    right: `◀ ${list[idx(list, cur[key])][1]} ▶`,
    prev: () => step(list, key, -1), next: () => step(list, key, 1),
    act: () => { step(list, key, 1); sfx.select(); return true; },
  });
  let saved = false;
  $('menu').classList.add('side');
  openMenu({
    title: first ? '🐻 반가워요! 내 모습을 골라 볼까요?' : '🐻 내 모습 바꾸기',
    desc: () => `<kbd>←</kbd><kbd>→</kbd> 또는 <kbd>Enter</kbd> 로 바꿔 보세요.${ON.url ? ' 온라인 친구들에게도 이 모습으로 보여요!' : ''}`,
    items: () => [
      row('🎨', '몸 색', LOOK_COLORS, 'color'),
      row('👂', '귀 모양', LOOK_EARS, 'ears'),
      row('🌸', '볼터치', LOOK_ACCENTS, 'accent'),
      { label: '🎲 아무거나!', act: () => { cur.color = pick(LOOK_COLORS)[0]; cur.ears = pick(LOOK_EARS)[0]; cur.accent = pick(LOOK_ACCENTS)[0]; player.setLook(cur); sfx.select(); return true; } },
      { label: '✅ 이걸로 할래요', act: () => {
        saved = true;
        S.look = { ...cur }; persist(); sfx.fanfare();
        const p = player.root.position;
        sparkle(p.x, p.y + 1.5, p.z, new THREE.Color(0xfff1a8), 24);
        setTimeout(() => say(player, first ? '안녕! 오늘은 뭐 하고 놀까? 🌼' : '짠~ 어때요? ✨', 3), 300);
        return false;
      } },
    ],
    onClose: () => {
      $('menu').classList.remove('side');
      if (saved) return;
      // 그냥 닫으면 원래 모습으로 (처음이면 기본 모습으로 정해요)
      player.setLook(before);
      if (first) { S.look = { ...before }; persist(); }
    },
  });
}
