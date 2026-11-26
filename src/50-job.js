/* =========================================================
   🧑‍🍳 아르바이트 — 먹자골목 포장마차에서 주문 받기
   손님이 말한 음식의 숫자 키(1~4)를 눌러 내주세요!
   ========================================================= */
const JOB_FOODS = ['tteok', 'fish', 'cotton', 'bingsu'];
const jobLimit = () => (S.level >= 5 ? 3 : 2);
const jobsLeft = () => jobLimit() - (S.jobDay === S.dayCount ? S.jobN : 0);
{
  const jx = 12, jz = -5.8;
  const g = new THREE.Group(); g.position.set(jx, 0, jz); scene.add(g);
  add(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 6), 0xb07a56, 0, 1.1, 0, g);
  const sign = signPlane('🧑‍🍳 아르바이트 구함', 3, { w: 640, h: 160, font: 70, border: '#ff8f8f' });
  sign.position.set(0, 2.4, 0.06); g.add(sign);
  collide(jx, jz, 0.4);
  AVOID.push([jx, jz, 2]);
  MAP_MARKS.push(['🧑‍🍳', jx, jz - 1]);
  interact({
    x: jx, z: jz + 1.7, r: 1.9,
    get label() { return `🧑‍🍳 포장마차 아르바이트 (오늘 ${Math.max(0, jobsLeft())}번 남음)`; },
    action: () => askJob(),
  });
}
function askJob() {
  sfx.ok();
  openMenu({
    title: '🧑‍🍳 포장마차 아르바이트',
    desc: () => `손님이 원하는 음식 번호를 눌러 내주세요!<br><kbd>1</kbd> 🌶️ 떡볶이 · <kbd>2</kbd> 🐟 붕어빵 · <kbd>3</kbd> 🍭 솜사탕 · <kbd>4</kbd> 🍧 빙수<br>손님 한 명에 🪙3 + 빨리 내주면 팁! (하루 ${jobLimit()}번까지 · 오늘 ${Math.max(0, jobsLeft())}번 남음)`,
    items: () => [
      { label: '일 시작하기!', dim: jobsLeft() <= 0, act: () => {
        if (jobsLeft() <= 0) { sfx.no(); toast('오늘 아르바이트는 끝났어요. 내일 또 와 주세요!'); return true; }
        if (S.jobDay !== S.dayCount) { S.jobDay = S.dayCount; S.jobN = 0; }
        S.jobN++; persist();
        setTimeout(() => startMini(jobGame()), 0);
        return false;
      } },
      { label: '다음에 할게요', act: () => false },
    ],
  });
}
function jobGame() {
  const W = 640, H = 400;
  const faces = ['🐱', '🐻', '🐰', '🐶', '🦊', '🐼', '🐹'];
  const g = { noGeneric: true, title: '🧑‍🍳 포장마차 아르바이트', time: 40, queue: [], served: 0, tips: 0, miss: 0, result: null, msg: '어서 오세요~!', spawn: 0.5, shake: 0 };
  const newCustomer = () => ({ face: pick(faces), want: pick(JOB_FOODS), patience: rr(7, 10), max: 0, x: W + 60 });
  g.finish = () => {
    const pay = g.served * 3 + g.tips;
    g.result = {
      title: `손님 ${g.served}명! ${g.served >= 12 ? '최고의 알바생 🏆' : g.served >= 7 ? '수고했어요~' : '내일은 더 잘할 거예요'}`,
      text: `일당 🪙${g.served * 3} + 팁 🪙${g.tips} = 🪙${pay}`,
      give: () => { S.coins += pay; persist(); sfx.coin(); addXP(5 + g.served * 2, '아르바이트'); daily('job'); toast(`🧑‍🍳 아르바이트 끝! 🪙${pay}를 받았어요`, 3); },
    };
  };
  g.key = (code) => {
    const m = code.match(/^(Digit|Numpad)([1-4])$/);
    if (!m) return;
    const c = g.queue[0];
    if (!c || c.x > 140) return;
    const food = JOB_FOODS[+m[2] - 1];
    if (food === c.want) {
      g.served++;
      const tip = c.patience / c.max > 0.6 ? 2 : c.patience / c.max > 0.3 ? 1 : 0;
      g.tips += tip;
      g.msg = tip ? `${FOODS[food].emoji} 맛있게 드세요! (팁 +${tip})` : `${FOODS[food].emoji} 맛있게 드세요!`;
      g.queue.shift();
      sfx.ding();
    } else {
      c.patience -= 2; g.miss++; g.shake = 0.3;
      g.msg = `앗, ${FOODS[food].name}이(가) 아니에요!`;
      sfx.no();
    }
  };
  g.update = (dt) => {
    g.time -= dt;
    if (g.time <= 0) { g.time = 0; g.finish(); return; }
    g.shake -= dt;
    g.spawn -= dt;
    if (g.spawn <= 0 && g.queue.length < 4) { const c = newCustomer(); c.max = c.patience; g.queue.push(c); g.spawn = rr(1.6, 3.2) * (0.7 + (g.time / 40) * 0.3); }
    g.queue.forEach((c, i) => {
      const tx = 90 + i * 130;
      c.x += (tx - c.x) * Math.min(1, dt * 4);
      if (i === 0 && c.x < 140) c.patience -= dt;
    });
    if (g.queue[0] && g.queue[0].patience <= 0) { g.queue.shift(); g.msg = '손님이 화나서 가 버렸어요… 😿'; sfx.no(); }
  };
  g.draw = (c) => {
    c.fillStyle = '#ffe9c9'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#ff8f8f'; c.fillRect(i * 80, 0, 80, 44); }
    c.fillStyle = '#d69a6a'; c.fillRect(0, 250, W, 30); c.fillStyle = '#c08f63'; c.fillRect(0, 280, W, 120);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    g.queue.forEach((cu, i) => {
      const sx = cu.x + (i === 0 && g.shake > 0 ? Math.sin(g.shake * 60) * 5 : 0);
      c.font = '62px sans-serif'; c.fillText(cu.face, sx, 200);
      // 말풍선
      c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(sx - 34, 92, 68, 58, 16); c.fill();
      c.beginPath(); c.moveTo(sx - 8, 150); c.lineTo(sx + 8, 150); c.lineTo(sx, 162); c.fill();
      c.font = '34px sans-serif'; c.fillText(FOODS[cu.want].emoji, sx, 121);
      // 인내심
      const k = Math.max(0, cu.patience / cu.max);
      c.fillStyle = '#eeeeee'; c.fillRect(sx - 34, 240, 68, 8);
      c.fillStyle = k > 0.5 ? '#7fd36a' : k > 0.25 ? '#ffd166' : '#ff6f6f'; c.fillRect(sx - 34, 240, 68 * k, 8);
    });
    JOB_FOODS.forEach((f, i) => {
      const x = 110 + i * 140;
      c.fillStyle = '#fff8ec'; c.beginPath(); c.roundRect(x - 52, 300, 104, 74, 16); c.fill();
      c.font = '34px sans-serif'; c.fillText(FOODS[f].emoji, x, 328);
      c.fillStyle = '#6a4c3f'; c.font = '17px Jua, sans-serif'; c.fillText(`${i + 1}  ${FOODS[f].name}`, x, 360);
    });
    c.fillStyle = '#6a4c3f'; c.font = '22px Jua, sans-serif'; c.fillText(g.msg, W / 2, 68);
  };
  g.info = () => `⏱ ${Math.ceil(g.time)}초 · 손님 ${g.served}명 · 팁 🪙${g.tips} · <kbd>1</kbd>~<kbd>4</kbd> 음식 내주기 · <kbd>Esc</kbd> 그만하기`;
  return g;
}
