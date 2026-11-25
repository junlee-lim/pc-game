/* =========================================================
   🎣 바닷가 선착장 (남쪽) — 낚시
   ========================================================= */
const FISH = [
  { id: 'minnow', name: '송사리', emoji: '🐟', coins: 1, w: 30, diff: 0.15 },
  { id: 'crab', name: '꽃게', emoji: '🦀', coins: 2, w: 18, diff: 0.35 },
  { id: 'tropical', name: '열대어', emoji: '🐠', coins: 2, w: 18, diff: 0.4 },
  { id: 'starfish', name: '불가사리', emoji: '⭐', coins: 2, w: 10, diff: 0.3 },
  { id: 'puffer', name: '복어', emoji: '🐡', coins: 3, w: 12, diff: 0.55 },
  { id: 'squid', name: '오징어', emoji: '🦑', coins: 3, w: 10, diff: 0.55 },
  { id: 'octopus', name: '문어', emoji: '🐙', coins: 4, w: 7, diff: 0.7 },
  { id: 'boot', name: '낡은 장화', emoji: '👢', coins: 0, w: 8, diff: 0.1 },
  { id: 'jelly', name: '달빛 해파리', emoji: '🪼', coins: 5, w: 9, diff: 0.6, hint: '밤에만 나와요' },
  { id: 'rainbow', name: '무지개 물고기', emoji: '🌈', coins: 10, w: 2, diff: 0.85, hint: '무지개가 뜨면 잘 잡혀요' },
];
function rollFish() {
  const pool = FISH.map((f) => {
    let w = f.w;
    if (f.id === 'jelly') w = tod > 1.5 ? 12 : 0;
    if (f.id === 'rainbow' && rainbowOn()) w *= 5;
    return [f, w];
  });
  let r = Math.random() * pool.reduce((a, [, w]) => a + w, 0);
  for (const [f, w] of pool) { if ((r -= w) <= 0) return f; }
  return FISH[0];
}

// 선착장
{
  const len = PIER.z1 - PIER.z0, cz = (PIER.z0 + PIER.z1) / 2;
  add(new THREE.BoxGeometry(PIER.w, 0.25, len), 0xd9a878, PIER.x, PIER.h - 0.12, cz);
  for (let z = PIER.z0 + 0.5; z < PIER.z1; z += 0.8) add(new THREE.BoxGeometry(PIER.w + 0.02, 0.26, 0.05), 0xc08f63, PIER.x, PIER.h - 0.12, z, scene, false);
  for (let z = PIER.z0 + 3; z <= PIER.z1; z += 3) {
    for (const s of [-1, 1]) {
      const x = PIER.x + s * (PIER.w / 2 + 0.05);
      add(new THREE.CylinderGeometry(0.16, 0.18, 3, 8), 0xb07a56, x, -0.9, Math.min(z, PIER.z1 - 0.2));
    }
  }
  // 끝 난간과 등불
  add(new THREE.BoxGeometry(PIER.w, 0.12, 0.12), 0xb07a56, PIER.x, 1.1, PIER.z1 - 0.1);
  for (const s of [-1, 1]) {
    const x = PIER.x + s * (PIER.w / 2 - 0.1);
    add(new THREE.BoxGeometry(0.15, 1.0, 0.15), 0xb07a56, x, 0.75, PIER.z1 - 0.1);
    add(new THREE.SphereGeometry(0.22, 12, 10), lanternMats[s > 0 ? 0 : 1], x, 1.45, PIER.z1 - 0.1, scene, false).scale.set(1, 1.25, 1);
  }
  glowLight(PIER.x, 2.5, PIER.z1 - 1, 0xffc070, 12);
  const bucket = add(new THREE.CylinderGeometry(0.3, 0.24, 0.45, 12), 0x8fd3ff, 1.0, PIER.h + 0.22, PIER.z1 - 2);
  add(new THREE.TorusGeometry(0.28, 0.025, 6, 16, Math.PI), 0x6a4c3f, 1.0, PIER.h + 0.45, PIER.z1 - 2, scene, false);
  const sign = signPlane('🎣 바닷가 선착장', 3.4, { w: 640, h: 160, font: 76, border: '#8fd3ff' });
  add(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 6), 0xb07a56, 2.6, 1.1, 54.5);
  sign.position.set(2.6, 2.4, 54.56);
  scene.add(sign);
  collide(2.6, 54.5, 0.3);
}
// 작은 배와 낚시하는 고양이
const boat = new THREE.Group();
{
  boat.position.set(4.6, -1.55, 64);
  scene.add(boat);
  const hull = add(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon({ color: 0xff9f8f, side: THREE.DoubleSide }), 0, 0.45, 0, boat);
  hull.scale.set(1.1, 0.7, 2.2);
  add(new THREE.BoxGeometry(1.8, 0.1, 0.4), 0xfff1df, 0, 0.35, 0.3, boat);
  const cat = makeCreature({ color: 0xffe6c7, ears: 'cat', accent: 0xffa3b8, scale: 0.6 });
  cat.root.position.set(0, 0.35, 0.2);
  cat.root.rotation.y = Math.PI / 2;
  boat.add(cat.root);
  cat.hatSlot.add(itemModel('straw'));
  stallKeepers.push(cat);
  rod(new THREE.Vector3(0.4, 1.0, 0.2), new THREE.Vector3(2.4, 2.4, 0.2), 0.025, 0x8a5a3c, boat);
  rod(new THREE.Vector3(2.4, 2.4, 0.2), new THREE.Vector3(2.6, 0.1, 0.2), 0.006, 0xffffff, boat);
}
tickers.push(() => {
  boat.position.y = -1.55 + Math.sin(elapsed * 1.4) * 0.06;
  boat.rotation.z = Math.sin(elapsed * 1.1) * 0.05;
});
ZONE_LABELS.push(['🎣 바닷가 선착장', 0, 4, 58]);
MAP_MARKS.push(['🎣', 0, 56]);

// 낚싯대 · 찌 · 낚싯줄
const fishRod = new THREE.Group();
{
  const r = rod(new THREE.Vector3(0.65, 1.0, 0.3), new THREE.Vector3(0.9, 2.9, 2.3), 0.035, 0x8a5a3c, fishRod);
  r.castShadow = true;
  add(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 10), 0x6a4c3f, 0.7, 1.1, 0.45, fishRod, false).rotation.z = Math.PI / 2;
}
const ROD_TIP = new THREE.Vector3(0.9, 2.9, 2.3);
const bobber = new THREE.Group();
add(new THREE.SphereGeometry(0.24, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0xff5a6e, 0, 0, 0, bobber, false);
add(new THREE.SphereGeometry(0.24, 12, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), 0xffffff, 0, 0, 0, bobber, false);
bobber.visible = false;
scene.add(bobber);
const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
const fishLine = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
fishLine.frustumCulled = false;
fishLine.visible = false;
scene.add(fishLine);

const F = { phase: 'cast', t: 0, wait: 0, fish: null, zone: [0, 0], speed: 2, start: new THREE.Vector3(), target: new THREE.Vector3() };
const waterColor = new THREE.Color(0x9fdcff);
function startFishing() {
  state = 'fishing';
  const p = player.root.position;
  p.set(PIER.x, PIER.h, PIER.z1 - 1.2);
  player.root.rotation.set(0, 0, 0);
  player.handSlot.visible = false;
  player.root.add(fishRod);
  castLine();
  $('prompt').classList.add('hidden');
  sceneMsg('<kbd>Space</kbd> 찌가 쏙! 들어가면 당기기 · <kbd>Esc</kbd> 그만하기');
}
function castLine() {
  F.phase = 'cast';
  F.t = 0;
  F.start.copy(ROD_TIP);
  player.root.localToWorld(F.start);
  F.target.set(PIER.x + rr(-2, 2), -1.55, PIER.z1 + rr(3.5, 5.5));
  bobber.visible = fishLine.visible = true;
  sfx.whistle();
}
function endFishing() {
  state = 'play';
  player.root.remove(fishRod);
  player.handSlot.visible = true;
  bobber.visible = fishLine.visible = false;
  $('reel').classList.add('hidden');
  sceneMsg(null);
}
function setReelUI() {
  const z = $('reel').querySelector('.reel-zone');
  z.style.left = F.zone[0] * 100 + '%';
  z.style.width = (F.zone[1] - F.zone[0]) * 100 + '%';
}
modes.fishing = {
  key(code) {
    if (code === 'Escape') { endFishing(); return; }
    if (code !== 'Space' && code !== 'KeyE' && code !== 'Enter') return;
    if (F.phase === 'wait' || F.phase === 'cast') {
      say(player, pick(['아직이야… 조용히 기다리자 🤫', '찌가 움직일 때까지 기다려요~']), 1.6);
    } else if (F.phase === 'bite') {
      F.phase = 'reel';
      F.t = 0;
      F.fish = rollFish();
      const w = lerp(0.36, 0.13, F.fish.diff);
      const a = rr(0.08, 0.92 - w);
      F.zone = [a, a + w];
      F.speed = 2.0 + F.fish.diff * 3.2;
      setReelUI();
      $('reel').classList.remove('hidden');
      sfx.select();
    } else if (F.phase === 'reel') {
      const m = (Math.sin(F.t * F.speed - Math.PI / 2) + 1) / 2;
      $('reel').classList.add('hidden');
      const fish = F.fish;
      if (m >= F.zone[0] && m <= F.zone[1]) {
        S.fishDex[fish.id] = (S.fishDex[fish.id] || 0) + 1;
        const first = S.fishDex[fish.id] === 1;
        S.coins += fish.coins + (first ? 2 : 0);
        persist();
        fish.coins ? sfx.fanfare() : sfx.no();
        say(player, fish.id === 'boot' ? '👢 …낡은 장화잖아! 하하' : `${fish.emoji} ${fish.name}을(를) 낚았다! (+${fish.coins + (first ? 2 : 0)}🪙)`, 3);
        if (first) toast(`📖 새로운 물고기! ${fish.emoji} ${fish.name} 도감에 기록했어요 (G)`, 3.2);
        sparkle(bobber.position.x, -1.2, bobber.position.z, waterColor, 30);
      } else {
        sfx.no();
        say(player, pick(['앗, 도망갔다! 🫧', '아깝다~ 다음엔 꼭!']), 2.4);
      }
      F.phase = 'result';
      F.t = 0;
    }
  },
  update(dt) {
    F.t += dt;
    animateCreature(player, false, 0, dt, elapsed);
    const tip = ROD_TIP.clone();
    fishRod.localToWorld(tip);
    if (F.phase === 'cast') {
      const k = Math.min(F.t / 0.7, 1);
      bobber.position.lerpVectors(F.start, F.target, k);
      bobber.position.y += Math.sin(k * Math.PI) * 3;
      if (k >= 1) { F.phase = 'wait'; F.wait = rr(2, 6); F.t = 0; sfx.splash(); }
    } else if (F.phase === 'wait') {
      bobber.position.y = -1.55 + Math.sin(elapsed * 2.4) * 0.05;
      if (F.t > F.wait) { F.phase = 'bite'; F.t = 0; sfx.bite(); say(player, '❗', 1); sparkle(bobber.position.x, -1.4, bobber.position.z, waterColor, 12); }
    } else if (F.phase === 'bite') {
      bobber.position.y = -1.75 + Math.sin(F.t * 30) * 0.08;
      if (F.t > 1.0) {
        say(player, '너무 늦었다… 미끼만 먹고 갔어 🐟', 2.2);
        F.phase = 'wait'; F.wait = rr(2.5, 6); F.t = 0;
      }
    } else if (F.phase === 'reel') {
      const m = (Math.sin(F.t * F.speed - Math.PI / 2) + 1) / 2;
      $('reel').querySelector('.reel-mark').style.left = m * 100 + '%';
      bobber.position.y = -1.6 + Math.sin(F.t * 18) * 0.06;
    } else if (F.phase === 'result') {
      bobber.position.lerp(tip, damp(4, dt));
      if (F.t > 1.6) castLine();
    }
    const arr = lineGeo.attributes.position.array;
    arr[0] = tip.x; arr[1] = tip.y; arr[2] = tip.z;
    arr[3] = bobber.position.x; arr[4] = bobber.position.y + 0.12; arr[5] = bobber.position.z;
    lineGeo.attributes.position.needsUpdate = true;
  },
  camera(p) {
    return { pos: tmpCamPos.set(p.x - 4.6, p.y + 3.4, p.z - 4.2), target: tmpCamTarget.set(p.x + 0.8, -1, p.z + 5), fov: 50 };
  },
};
const tmpCamPos = new THREE.Vector3(), tmpCamTarget = new THREE.Vector3();
interact({ x: PIER.x, z: PIER.z1 - 1.4, r: 2.2, label: '낚싯대 드리우기 🎣', action: () => startFishing() });

function sceneMsg(html) {
  const el = $('scene-msg');
  if (!html) { el.classList.add('hidden'); return; }
  el.innerHTML = html;
  el.classList.remove('hidden');
}
