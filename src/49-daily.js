/* =========================================================
   📋 오늘의 할 일 게시판 — 매일 아침 새 할 일 3개
   ========================================================= */
const DAILY_POOL = [
  { id: 'fish2', ev: 'fish', n: 2, text: '🎣 물고기 2마리 낚기' },
  { id: 'bug1', ev: 'bug', n: 1, text: '🐞 곤충 1마리 잡기' },
  { id: 'talk3', ev: 'talk', n: 3, text: '💬 친구 3명과 이야기하기' },
  { id: 'eat2', ev: 'eat', n: 2, text: '🍢 음식 2번 사 먹기' },
  { id: 'mini1', ev: 'mini', n: 1, text: '🎮 미니게임 1판 하기' },
  { id: 'sell3', ev: 'sell', n: 3, text: '🧺 섬 특산물 3개 팔기' },
  { id: 'water1', ev: 'water', n: 1, text: '🌱 텃밭에 물 주기' },
  { id: 'job1', ev: 'job', n: 1, text: '🧑‍🍳 아르바이트 1번 하기' },
  { id: 'gift1', ev: 'gift', n: 1, text: '🎁 친구에게 선물하기' },
  { id: 'island1', ev: 'island', n: 1, text: '🚤 다른 섬에 다녀오기' },
  { id: 'craft1', ev: 'craft', n: 1, text: '🍳 재료로 직접 만들기 1번' },
];
const DAILY_REWARD = { coins: 12, xp: 15 }, DAILY_BONUS = { coins: 20, xp: 25 };
function ensureDaily() {
  if (S.daily && S.daily.day === S.dayCount) return;
  const pool = [...DAILY_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
  S.daily = { day: S.dayCount, tasks: pool.map((t) => ({ id: t.id, prog: 0, claimed: false })), bonus: false };
  persist();
}
const dailyDef = (id) => DAILY_POOL.find((d) => d.id === id);
function daily(ev, n = 1) {
  ensureDaily();
  let changed = false;
  for (const t of S.daily.tasks) {
    const d = dailyDef(t.id);
    if (d.ev !== ev || t.prog >= d.n) continue;
    t.prog = Math.min(d.n, t.prog + n);
    changed = true;
    if (t.prog >= d.n) setTimeout(() => { sfx.ding(); toast(`📋 할 일 완료! ${d.text} — 게시판에서 보상을 받아요`, 3.2); }, 400);
  }
  if (changed) persist();
}
NEW_DAY_HOOKS.push(() => { ensureDaily(); setTimeout(() => toast('📋 오늘의 할 일이 새로 올라왔어요 (광장 게시판)', 3), 3400); });
// 광장 게시판
{
  const bx = 2.8, bz = 8.8;
  const g = new THREE.Group(); g.position.set(bx, 0, bz); g.rotation.y = 0.2; scene.add(g);
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), 0xb07a56, s * 0.9, 1.1, 0, g);
  add(new THREE.BoxGeometry(2.2, 1.3, 0.12), 0xe8c49a, 0, 1.6, 0, g);
  add(new THREE.BoxGeometry(2.3, 0.15, 0.2), 0xff8fb1, 0, 2.3, 0, g);
  for (let i = 0; i < 3; i++) add(new THREE.BoxGeometry(0.5, 0.6, 0.02), pick([0xffffff, 0xfff6c8, 0xffe0ea]), -0.65 + i * 0.65, 1.6, 0.07, g, false).rotation.z = rr(-0.1, 0.1);
  collide(bx, bz, 1.1);
  AVOID.push([bx, bz, 3]);
  interact({ x: bx, z: bz + 1.8, r: 1.9, label: '📋 오늘의 할 일 게시판', action: () => openDaily() });
  ZONE_LABELS.push(['📋 할 일 게시판', bx, 3.2, bz]);
  MAP_MARKS.push(['📋', bx, bz]);
}
function openDaily() {
  ensureDaily();
  sfx.ok();
  openMenu({
    title: `📋 오늘의 할 일 (${S.season >= 0 ? season().name : ''} ${S.seasonDay}일째)`,
    desc: () => `하나 끝낼 때마다 🪙${DAILY_REWARD.coins} · ⭐${DAILY_REWARD.xp}XP, 셋 다 끝내면 보너스 🪙${DAILY_BONUS.coins} · ⭐${DAILY_BONUS.xp}XP!<br>내일 아침 6시에 새 할 일이 올라와요.`,
    items: () => [
      ...S.daily.tasks.map((t) => {
        const d = dailyDef(t.id), done = t.prog >= d.n;
        return {
          label: `${t.claimed ? '✅' : done ? '🎁' : '⬜'} ${d.text}`,
          right: t.claimed ? '받았어요' : done ? '보상 받기!' : `${t.prog}/${d.n}`,
          dim: !done || t.claimed,
          act: () => {
            if (!done || t.claimed) return true;
            t.claimed = true; S.coins += DAILY_REWARD.coins; persist(); sfx.coin();
            addXP(DAILY_REWARD.xp, '오늘의 할 일');
            return true;
          },
        };
      }),
      {
        label: S.daily.bonus ? '✅ 보너스 받았어요' : '🌟 모두 끝내기 보너스', right: S.daily.bonus ? '' : `${S.daily.tasks.filter((t) => t.claimed).length}/3`,
        dim: S.daily.bonus || !S.daily.tasks.every((t) => t.claimed),
        act: () => {
          if (S.daily.bonus || !S.daily.tasks.every((t) => t.claimed)) return true;
          S.daily.bonus = true; S.coins += DAILY_BONUS.coins; persist(); sfx.fanfare();
          addXP(DAILY_BONUS.xp, '모두 완료!');
          toast(`🌟 오늘 할 일을 모두 끝냈어요! 🪙${DAILY_BONUS.coins}`, 3);
          return true;
        },
      },
      { label: '닫기', act: () => false },
    ],
  });
}
