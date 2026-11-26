/* =========================================================
   🕐 마을 시계 — 시간이 저절로 흘러요 (현실 1초 = 마을 1.5분)
   아침 6시가 되면 새로운 하루가 시작돼요.
   ========================================================= */
const CLOCK_SPEED = 1.5;
// 시간 → 하늘 단계 (0 낮 · 1 노을 · 2 밤)
function todFromClock(m) {
  const h = m / 60;
  if (h >= 6.5 && h < 16.5) return 0;
  if (h >= 16.5 && h < 18) return (h - 16.5) / 1.5;
  if (h >= 18 && h < 19.5) return 1 + (h - 18) / 1.5;
  if (h >= 4.5 && h < 6.5) return 2 - (h - 4.5);
  return 2;
}
function clockText(m = S.clock) {
  const h = Math.floor(m / 60) % 24, mm = Math.floor(m % 60);
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(mm).padStart(2, '0')}`;
}
// 시간을 앞으로 돌려요. 아침 6시를 지날 때마다 새 하루
function advanceClock(min) {
  let t = S.clock;
  const end = t + min;
  let b = Math.floor((t - 360) / 1440) * 1440 + 360 + 1440;
  if (b - 1440 > t) b -= 1440;
  while (b <= end) { newDay(); b += 1440; }
  S.clock = ((end % 1440) + 1440) % 1440;
  todTarget = todFromClock(S.clock);
}
function advanceClockTo(min) {
  const diff = (((min - S.clock) % 1440) + 1440) % 1440;
  advanceClock(diff || 1440);
}
function ensureNight() { const h = S.clock / 60; if (!(h >= 19.5 || h < 4.5)) advanceClockTo(20 * 60); }
// 낮잠 · 침대: 다음 단계(낮→노을→밤→아침)로
function skipToNextPhase() {
  const h = S.clock / 60;
  if (h >= 6.5 && h < 16.5) { advanceClockTo(17 * 60 + 15); return 1; }
  if (h >= 16.5 && h < 19.5) { advanceClockTo(20 * 60); return 2; }
  advanceClockTo(7 * 60);
  return 0;
}
let clockSaveT = 0;
const CLOCK_PAUSED = new Set(['title', 'menu', 'busy', 'savecode', 'bigmap', 'loading']);
tickers.push((dt) => {
  if (CLOCK_PAUSED.has(state) || helpOpen) return;
  advanceClock(dt * CLOCK_SPEED);
  clockSaveT -= dt;
  if (clockSaveT <= 0) { clockSaveT = 5; save.set('clock', S.clock); }
});
