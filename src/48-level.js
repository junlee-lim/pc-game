/* =========================================================
   ⭐ 레벨 — 활동할 때마다 경험치(XP)가 쌓여요
   ========================================================= */
const xpNeed = (lv) => 30 + lv * 20; // 1→2: 50, 2→3: 70 …
const LEVEL_UNLOCKS = {
  2: '🍅 텃밭 토마토 씨앗',
  3: '🔨 집 넓히기 1단계',
  4: '🌽 텃밭 옥수수 씨앗',
  5: '🧑‍🍳 아르바이트 하루 3번',
  6: '🔨 집 넓히기 2단계 · 🎃 텃밭 호박 씨앗',
};
let xpPopT = 0;
function addXP(n, why = '') {
  if (!n) return;
  S.xp += n;
  let up = false;
  while (S.xp >= xpNeed(S.level)) {
    S.xp -= xpNeed(S.level);
    S.level++;
    up = true;
    const lv = S.level, reward = lv * 10;
    S.coins += reward;
    setTimeout(() => {
      sfx.fanfare();
      const p = player.root.position;
      sparkle(p.x, p.y + 2.5, p.z, new THREE.Color(0xffd34d), 50);
      toast(`⭐ 레벨 ${lv}! 축하 보상 🪙 ${reward}${LEVEL_UNLOCKS[lv] ? ` · 새로 열림: ${LEVEL_UNLOCKS[lv]}` : ''}`, 4.5);
      say(player, `레벨 ${lv}! 야호~ ⭐`, 2.4);
    }, 600);
  }
  persist();
  const el = $('xpGain');
  el.textContent = `+${n} XP${why ? ' · ' + why : ''}`;
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
}
function updateLevelHUD() {
  $('lvText').textContent = `Lv.${S.level}`;
  $('xpBar').style.width = `${Math.min(100, (S.xp / xpNeed(S.level)) * 100)}%`;
}
tickers.push(() => updateLevelHUD());
