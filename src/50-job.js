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
    desc: () => `손님이 원하는 음식 번호를 눌러 내주세요!<br><kbd>1</kbd> 🌶️ 떡볶이 · <kbd>2</kbd> 🐟 붕어빵 · <kbd>3</kbd> 🍭 솜사탕 · <kbd>4</kbd> 🍧 빙수<br>묶음 주문은 <b>왼쪽부터 순서대로</b>! 틀리면 처음부터 다시 + 팁 -1<br>줄 선 손님도 지쳐요. 화난 손님이 3명이면 그날은 끝! 👑 VIP는 급하지만 두 배를 줘요<br>손님 한 명에 🪙3 (묶음은 더) + 빨리 내주면 팁! (하루 ${jobLimit()}번까지 · 오늘 ${Math.max(0, jobsLeft())}번 남음)`,
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
  const W = 640, H = 400, DUR = 45, MAX_ANGRY = 3;
  const faces = ['🐱', '🐻', '🐰', '🐶', '🦊', '🐼', '🐹'];
  const g = { noGeneric: true, title: '🧑‍🍳 포장마차 아르바이트', time: DUR, queue: [], served: 0, wage: 0, tips: 0, miss: 0, angry: 0, combo: 0, fired: false, result: null, msg: '어서 오세요~! 오늘은 손님이 많아요!', spawn: 0.4, shake: 0 };
  // 0 → 1 : 시간이 갈수록 바빠져요
  const rush = () => 1 - g.time / DUR;
  const newCustomer = () => {
    const r = rush();
    // 주문 개수: 처음엔 1개, 점점 2~3개 묶음 주문이 늘어나요
    const n = Math.random() < 0.15 + r * 0.55 ? (Math.random() < r * 0.6 ? 3 : 2) : 1;
    const want = Array.from({ length: n }, () => pick(JOB_FOODS));
    const vip = Math.random() < 0.08 + r * 0.12;
    let patience = (rr(4.5, 6) + (n - 1) * 1.8) * (1 - r * 0.3);
    if (vip) patience *= 0.65;
    return { face: vip ? '👑' : pick(faces), vip, want, got: 0, patience, max: patience, x: W + 60 };
  };
  g.finish = () => {
    const pay = Math.max(0, g.wage + g.tips);
    const title = g.fired ? '사장님: "오늘은 그만 들어가 봐요…" 😿'
      : g.served >= 18 ? `손님 ${g.served}명! 전설의 알바생 🏆`
      : g.served >= 12 ? `손님 ${g.served}명! 수고했어요~`
      : `손님 ${g.served}명… 내일은 더 잘할 거예요`;
    g.result = {
      title,
      text: `일당 🪙${g.wage} + 팁 🪙${g.tips} = 🪙${pay}${g.angry ? ` (화난 손님 ${g.angry}명)` : ''}`,
      give: () => { S.coins += pay; persist(); sfx.coin(); addXP(5 + g.served * 2, '아르바이트'); daily('job'); toast(`🧑‍🍳 아르바이트 끝! 🪙${pay}를 받았어요`, 3); },
    };
  };
  const leaveAngry = () => {
    g.queue.shift(); g.angry++; g.combo = 0; sfx.no();
    if (g.angry >= MAX_ANGRY) { g.fired = true; g.msg = '손님이 너무 많이 화났어요!'; g.finish(); return; }
    g.msg = `손님이 화나서 가 버렸어요… 😿 (${g.angry}/${MAX_ANGRY})`;
  };
  g.key = (code) => {
    const m = code.match(/^(Digit|Numpad)([1-4])$/);
    if (!m) return;
    const c = g.queue[0];
    if (!c || c.x > 140) return;
    const food = JOB_FOODS[+m[2] - 1];
    if (food === c.want[c.got]) {
      c.got++;
      sfx.ding();
      if (c.got < c.want.length) { g.msg = `${FOODS[food].emoji} 그리고요…?`; return; }
      g.served++; g.combo++;
      const base = (c.vip ? 6 : 3) + (c.want.length - 1);
      const k = c.patience / c.max;
      const tip = (k > 0.6 ? 1 : 0) + (g.combo >= 5 ? 1 : 0);
      g.wage += base; g.tips += tip;
      g.msg = `${c.vip ? '👑 ' : ''}맛있게 드세요! 🪙${base}${tip ? ` + 팁 ${tip}` : ''}${g.combo >= 3 ? ` · ${g.combo}연속!` : ''}`;
      g.queue.shift();
    } else {
      // 틀리면 처음부터 다시 + 인내심 깎이고 팁에서 벌금
      c.patience -= 2.5; c.got = 0; g.miss++; g.combo = 0; g.shake = 0.3;
      g.tips = Math.max(0, g.tips - 1);
      g.msg = `앗, ${FOODS[food].name}이(가) 아니에요! 처음부터 다시~ (팁 -1)`;
      sfx.no();
      if (c.patience <= 0) leaveAngry();
    }
  };
  g.update = (dt) => {
    g.time -= dt;
    if (g.time <= 0) { g.time = 0; g.finish(); return; }
    g.shake -= dt;
    g.spawn -= dt;
    if (g.spawn <= 0 && g.queue.length < 5) { g.queue.push(newCustomer()); g.spawn = rr(1.9, 3.0) * (1 - rush() * 0.4); }
    g.queue.forEach((c, i) => {
      const tx = 90 + i * 130;
      c.x += (tx - c.x) * Math.min(1, dt * 4);
      // 줄 서 있는 손님도 조금씩 지쳐요
      if (c.x < 600) c.patience -= dt * (i === 0 ? 1 : 0.35);
    });
    if (g.queue[0] && g.queue[0].patience <= 0) leaveAngry();
    else {
      const j = g.queue.findIndex((c, i) => i > 0 && c.patience <= 0);
      if (j > 0) { g.queue.splice(j, 1); g.queue.unshift({ patience: 0 }); leaveAngry(); }
    }
  };
  g.draw = (c) => {
    c.fillStyle = '#ffe9c9'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#ff8f8f'; c.fillRect(i * 80, 0, 80, 44); }
    c.fillStyle = '#d69a6a'; c.fillRect(0, 250, W, 30); c.fillStyle = '#c08f63'; c.fillRect(0, 280, W, 120);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    g.queue.forEach((cu, i) => {
      const sx = cu.x + (i === 0 && g.shake > 0 ? Math.sin(g.shake * 60) * 5 : 0);
      c.font = '62px sans-serif'; c.fillText(cu.face, sx, 200);
      // 말풍선 (묶음 주문은 순서대로!)
      const n = cu.want.length, step = n === 1 ? 0 : n === 2 ? 36 : 30, bw = n === 1 ? 68 : n === 2 ? 104 : 120;
      c.fillStyle = cu.vip ? '#fff4c2' : '#ffffff'; c.beginPath(); c.roundRect(sx - bw / 2, 92, bw, 58, 16); c.fill();
      c.beginPath(); c.moveTo(sx - 8, 150); c.lineTo(sx + 8, 150); c.lineTo(sx, 162); c.fill();
      c.font = n === 1 ? '34px sans-serif' : '28px sans-serif';
      cu.want.forEach((f, k) => {
        const fx = sx + (k - (n - 1) / 2) * step;
        c.globalAlpha = k < cu.got ? 0.25 : 1;
        c.fillText(FOODS[f].emoji, fx, 121);
        c.globalAlpha = 1;
        if (k < cu.got) { c.fillStyle = '#3aa35a'; c.font = 'bold 22px sans-serif'; c.fillText('✓', fx, 121); c.font = '28px sans-serif'; c.fillStyle = cu.vip ? '#fff4c2' : '#ffffff'; }
      });
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
    c.font = '22px sans-serif'; c.textAlign = 'right';
    c.fillText('😡'.repeat(g.angry) + '·'.repeat(MAX_ANGRY - g.angry), W - 14, 268);
    c.textAlign = 'center';
  };
  g.info = () => `⏱ ${Math.ceil(g.time)}초 · 손님 ${g.served}명 · 🪙${g.wage + g.tips} · 화난 손님 ${g.angry}/${MAX_ANGRY} · <kbd>1</kbd>~<kbd>4</kbd> 음식 내주기 (묶음 주문은 순서대로!) · <kbd>Esc</kbd> 그만하기`;
  return g;
}
