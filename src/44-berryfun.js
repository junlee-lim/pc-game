/* =========================================================
   🍓 딸기섬 — 딸기 바구니 받기 게임 · 딸기 카페
   ========================================================= */
{
  const I = ISL.berry;
  // 딸기 카페
  const [cx, cz] = islPos(I, -13, 13);
  const cafe = booth(cx, cz, 0xff8fb1, '🍰 딸기 카페', { color: 0xffe0ea, ears: 'bunny', accent: 0xff6f91 });
  for (const [x, key] of [[-0.9, 'tanghulu'], [0.9, 'parfait']]) { const m = foodModel(key); m.position.set(x, 1.05, 0.2); cafe.add(m); }
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 18), 0xffffff, cx + s * 2.2, 0.75, cz + 3.4);
    add(new THREE.CylinderGeometry(0.08, 0.1, 0.75, 6), 0xff8fb1, cx + s * 2.2, 0.37, cz + 3.4);
    collide(cx + s * 2.2, cz + 3.4, 0.8);
  }
  interact({
    x: cx, z: cz + 2.4, r: 2.4, label: '🍰 딸기 카페에서 사 먹기',
    action: () => {
      sfx.ok();
      sellMenu('🍰 딸기 카페', '"갓 딴 딸기로 만들었어요~ 🍓"', () => [
        foodItem('tanghulu'), packItem('tanghulu'),
        foodItem('parfait'), packItem('parfait'),
        foodItem('berrymilk'),
      ]);
    },
  });
  I.marks.push(['🍰', cx, cz]);
  ZONE_LABELS.push(['🍰 딸기 카페', cx, 4.6, cz]);

  // 딸기 바구니 받기 놀이판
  const [gx, gz] = islPos(I, 9, 14);
  const stand = new THREE.Group(); stand.position.set(gx, 0, gz); scene.add(stand);
  add(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 6), 0xb07a56, 0, 1.1, 0, stand);
  const sign = signPlane('🧺 딸기 바구니 받기', 3, { w: 640, h: 160, font: 72, border: '#ff8fb1' });
  sign.position.set(0, 2.4, 0.06); stand.add(sign);
  const bk = add(new THREE.CylinderGeometry(0.6, 0.45, 0.5, 14, 1, true), toon({ color: 0xd69a6a, side: THREE.DoubleSide }), 1.4, 0.25, 0.6, stand);
  for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.13, 8, 6), 0xff3d5a, 1.4 + Math.cos(i) * 0.25, 0.48, 0.6 + Math.sin(i) * 0.25, stand, false);
  collide(gx, gz, 0.4);
  collide(gx + 1.4, gz + 0.6, 0.6);
  interact({ x: gx, z: gz + 1.8, r: 2.2, label: '🧺 딸기 바구니 받기 게임', action: () => { sfx.ok(); startMini(basketGame()); } });
  I.marks.push(['🧺', gx, gz]);
  ZONE_LABELS.push(['🧺 바구니 받기', gx, 3.6, gz]);
}

// 🧺 하늘에서 떨어지는 딸기를 바구니로 받아요 (애벌레는 피해요!)
function basketGame() {
  const W = 640, H = 400, BY = 340;
  const g = { title: '🧺 딸기 바구니 받기', x: W / 2, items: [], spawn: 0.3, time: 30, score: 0, result: null, msg: '←→ 로 바구니를 움직여요. 🐛 애벌레는 피해요!', flash: 0 };
  g.finish = () => {
    const n = g.score;
    const reward = n >= 25 ? [6, 3] : n >= 15 ? [4, 2] : n >= 6 ? [2, 1] : [0, 1];
    g.result = {
      title: n >= 25 ? `${n}점! 딸기 수확왕 👑` : `${n}점!`,
      text: `보상: ${reward[0] ? `코인 ${reward[0]}개 + ` : ''}딸기 ${reward[1]}개`,
      give: () => { S.coins += reward[0]; bagAdd('berry', reward[1]); persist(); sfx.coin(); toast(`🎁 ${reward[0] ? `코인 ${reward[0]}개와 ` : ''}딸기 ${reward[1]}개를 받았어요!`); },
    };
  };
  g.key = () => {};
  g.update = (dt) => {
    g.time -= dt;
    if (g.time <= 0) { g.time = 0; g.finish(); return; }
    const sp = 460;
    if (down('ArrowLeft', 'KeyA')) g.x -= sp * dt;
    if (down('ArrowRight', 'KeyD')) g.x += sp * dt;
    g.x = clamp(g.x, 50, W - 50);
    g.flash -= dt;
    g.spawn -= dt;
    if (g.spawn <= 0) {
      // 시간이 갈수록 빨라져요
      const hurry = 1 - g.time / 30;
      g.spawn = rr(0.35, 0.7) * (1 - hurry * 0.4);
      const r = Math.random();
      g.items.push({ x: rr(30, W - 30), y: -20, vy: rr(150, 210) * (1 + hurry * 0.6), type: r < 0.12 ? 'gold' : r < 0.3 ? 'bug' : 'berry', rot: rr(-0.4, 0.4) });
    }
    for (let i = g.items.length - 1; i >= 0; i--) {
      const it = g.items[i];
      it.y += it.vy * dt;
      if (it.y > BY - 24 && it.y < BY + 10 && Math.abs(it.x - g.x) < 56) {
        if (it.type === 'bug') { g.score = Math.max(0, g.score - 2); g.flash = 0.3; g.msg = '으악, 애벌레! (-2)'; sfx.no(); }
        else { const p = it.type === 'gold' ? 3 : 1; g.score += p; g.msg = it.type === 'gold' ? '✨ 황금 딸기! (+3)' : '쏙! (+1)'; sfx.pop(); }
        g.items.splice(i, 1);
      } else if (it.y > H + 30) g.items.splice(i, 1);
    }
  };
  g.draw = (c) => {
    const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#bfe6ff'); sky.addColorStop(1, '#fff0f5');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    c.fillStyle = '#9fd87a'; c.fillRect(0, 300, W, 100);
    for (let i = 0; i < 8; i++) { c.fillStyle = '#5fbf4a'; c.beginPath(); c.ellipse(40 + i * 80, 320, 28, 12, 0, 0, 7); c.fill(); }
    if (g.flash > 0) { c.fillStyle = 'rgba(255,90,110,0.18)'; c.fillRect(0, 0, W, H); }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const it of g.items) {
      c.save(); c.translate(it.x, it.y); c.rotate(it.rot);
      if (it.type === 'gold') { c.fillStyle = 'rgba(255,214,90,0.55)'; c.beginPath(); c.arc(0, 0, 24, 0, 7); c.fill(); }
      c.font = '34px sans-serif'; c.fillText(it.type === 'bug' ? '🐛' : '🍓', 0, 0);
      c.restore();
    }
    // 바구니
    c.fillStyle = '#d69a6a'; c.strokeStyle = '#8a5a3c'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(g.x - 52, BY - 20); c.lineTo(g.x + 52, BY - 20); c.lineTo(g.x + 40, BY + 22); c.lineTo(g.x - 40, BY + 22); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(138,90,60,0.5)'; c.lineWidth = 2;
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(g.x + i * 18, BY - 20); c.lineTo(g.x + i * 14, BY + 22); c.stroke(); }
    c.fillStyle = '#6a4c3f'; c.font = '22px Jua, sans-serif'; c.fillText(g.msg, W / 2, 28);
  };
  g.info = () => `⏱ ${Math.ceil(g.time)}초 · 🍓 ${g.score}점 · <kbd>←</kbd><kbd>→</kbd> 움직이기 · <kbd>Esc</kbd> 그만하기`;
  return g;
}
