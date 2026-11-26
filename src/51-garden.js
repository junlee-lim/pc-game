/* =========================================================
   🌱 내 텃밭 — 내 집 옆. 씨앗을 심고 매일 물을 주면 하루에 한 단계씩 자라요
   ========================================================= */
const CROPS = [
  { id: 'carrot', name: '당근', emoji: '🥕', seed: 6, days: 2, sell: 20, lv: 1, color: 0xff9f43 },
  { id: 'tomato', name: '토마토', emoji: '🍅', seed: 10, days: 3, sell: 34, lv: 2, color: 0xff4d4d },
  { id: 'corn', name: '옥수수', emoji: '🌽', seed: 14, days: 4, sell: 50, lv: 4, color: 0xffd23f },
  { id: 'gourd', name: '호박', emoji: '🎃', seed: 20, days: 5, sell: 78, lv: 6, color: 0xff8f2c },
];
for (const c of CROPS) { EXTRA_BAG[c.id] = { name: c.name, emoji: c.emoji }; MARKET_PRICE[c.id] = c.sell; }
const GARDEN = { x: -21.5, z: 25.5 };
AVOID.push([GARDEN.x, GARDEN.z, 5]);
const plots = [];
{
  // 울타리와 팻말
  for (let i = 0; i <= 6; i++) for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.14, 0.7, 0.14), 0xfff1df, GARDEN.x - 3.4 + i * 1.13, 0.35, GARDEN.z + s * 2.6, scene, false);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(6.9, 0.08, 0.06), 0xfff1df, GARDEN.x, 0.55, GARDEN.z + s * 2.6, scene, false);
  const sign = signPlane('🌱 내 텃밭', 2, { font: 88, border: '#7fcf6b' });
  add(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6), 0xb07a56, GARDEN.x + 4.2, 0.9, GARDEN.z + 2.6);
  sign.position.set(GARDEN.x + 4.2, 2, GARDEN.z + 2.66); scene.add(sign);
  collide(GARDEN.x + 4.2, GARDEN.z + 2.6, 0.3);
  const can = add(new THREE.CylinderGeometry(0.25, 0.3, 0.45, 12), 0x8fd3ff, GARDEN.x + 4.1, 0.22, GARDEN.z + 1.6);
  MAP_MARKS.push(['🌱', GARDEN.x, GARDEN.z]);
  ZONE_LABELS.push(['🌱 내 텃밭', GARDEN.x, 3, GARDEN.z]);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    const i = r * 3 + c;
    const x = GARDEN.x - 2.2 + c * 2.2, z = GARDEN.z - 1.1 + r * 2.2;
    const soil = add(new THREE.BoxGeometry(1.7, 0.22, 1.7), toon({ color: 0xa0714c }), x, 0.11, z, scene, false);
    const sprout = new THREE.Group(); sprout.position.set(x, 0.22, z); scene.add(sprout);
    for (let k = 0; k < 3; k++) { const l = add(new THREE.SphereGeometry(0.2, 8, 6), 0x6cbf5d, Math.cos(k * 2.1) * 0.15, 0.25, Math.sin(k * 2.1) * 0.15, sprout); l.scale.set(0.6, 1.4, 0.6); }
    const fruit = new THREE.Group(); fruit.position.set(x, 0.22, z); scene.add(fruit);
    const fm = toon({ color: 0xffffff });
    for (let k = 0; k < 3; k++) add(new THREE.SphereGeometry(0.2, 10, 8), fm, Math.cos(k * 2.1 + 0.5) * 0.35, 0.65, Math.sin(k * 2.1 + 0.5) * 0.35, fruit, false);
    plots.push({ i, x, z, soil, sprout, fruit, fm });
    interact({ x, z: z + 1.25, get r() { return 1.05; }, get label() { return plotLabel(i); }, action: () => plotAction(i) });
  }
}
const cropOf = (p) => p && CROPS.find((c) => c.id === p.crop);
function plotLabel(i) {
  const p = S.garden[i];
  if (!p) return '🌱 빈 밭 — 씨앗 심기';
  const c = cropOf(p);
  if (p.stage >= c.days) return `${c.emoji} ${c.name} 수확하기!`;
  if (p.water === S.dayCount) return `${c.emoji} ${c.name} 자라는 중 (오늘 물 줬어요 · ${c.days - p.stage}일 남음)`;
  return `💧 ${c.emoji} ${c.name}에 물 주기 (${c.days - p.stage}일 남음)`;
}
function plotAction(i) {
  const p = S.garden[i];
  if (!p) return openSeedMenu(i);
  const c = cropOf(p);
  if (p.stage >= c.days) {
    const n = Math.random() < 0.3 ? 2 : 1;
    bagAdd(c.id, n);
    S.garden[i] = null;
    persist();
    sfx.fanfare();
    sparkle(plots[i].x, 1, plots[i].z, new THREE.Color(c.color), 24);
    say(player, `${c.emoji} ${c.name} ${n}개 수확! 직접 키우니까 뿌듯해~`, 2.6);
    addXP(8 + c.days * 2, '수확');
    daily('harvest');
    return;
  }
  if (p.water === S.dayCount) { say(player, '오늘은 벌써 물을 줬어. 내일 또 주자 💧', 2); return; }
  p.water = S.dayCount;
  persist();
  sfx.splash();
  sparkle(plots[i].x, 0.6, plots[i].z, new THREE.Color(0x9fd6ff), 16);
  say(player, '쪼르르~ 쑥쑥 자라라! 💧', 1.8);
  addXP(2, '물 주기');
  daily('water');
}
function openSeedMenu(i) {
  sfx.ok();
  openMenu({
    title: '🌱 어떤 씨앗을 심을까요?',
    desc: () => `매일 물을 주면 하루에 한 단계씩 자라요. 다 자라면 수확해서 포근섬 특산물 가게에 팔 수 있어요.<br>내 코인 🪙 ${S.coins} · 레벨 ${S.level}`,
    items: () => [
      ...CROPS.map((c) => ({
        label: `${c.emoji} ${c.name} 씨앗`,
        right: S.level < c.lv ? `🔒 Lv.${c.lv}` : `🪙${c.seed} · ${c.days}일 · 판매 🪙${c.sell}`,
        dim: S.level < c.lv || S.coins < c.seed,
        act: () => {
          if (S.level < c.lv) { sfx.no(); toast(`레벨 ${c.lv}이 되면 심을 수 있어요 ⭐`); return true; }
          if (S.coins < c.seed) { sfx.no(); toast('코인이 모자라요 🪙'); return true; }
          S.coins -= c.seed;
          S.garden[i] = { crop: c.id, stage: 0, water: S.dayCount };
          persist();
          sfx.ok();
          toast(`${c.emoji} ${c.name} 씨앗을 심고 물도 줬어요! 내일부터 매일 물을 주세요 💧`, 3.4);
          daily('water');
          return false;
        },
      })),
      { label: '그만두기', act: () => false },
    ],
  });
}
// 아침마다: 어제 물을 받은 작물은 한 단계 자라요
NEW_DAY_HOOKS.push(() => {
  let grew = 0, thirsty = 0;
  for (const p of S.garden) {
    if (!p) continue;
    const c = cropOf(p);
    if (p.stage >= c.days) continue;
    if (p.water === S.dayCount - 1) { p.stage++; grew++; } else thirsty++;
  }
  if (grew || thirsty) setTimeout(() => toast(grew ? `🌱 텃밭 작물이 쑥 자랐어요!${thirsty ? ' (물을 못 받은 작물은 그대로예요)' : ''}` : '🌱 텃밭 작물이 목말라해요. 물을 주세요 💧', 3.2), 6000);
});
tickers.push(() => {
  plots.forEach((pl, i) => {
    const p = S.garden[i];
    const c = cropOf(p);
    pl.soil.material.color.setHex(p && p.water === S.dayCount ? 0x7a5236 : 0xa0714c);
    pl.sprout.visible = !!p;
    pl.fruit.visible = !!p && p.stage >= c.days;
    if (p) {
      const k = Math.min(1, (p.stage + 1) / (c.days + 1));
      pl.sprout.scale.set(0.5 + k, 0.4 + k * 1.2, 0.5 + k);
      if (pl.fruit.visible) { pl.fm.color.setHex(c.color); pl.fruit.position.y = 0.22 + Math.abs(Math.sin(elapsed * 2 + i)) * 0.05; }
    }
  });
});
