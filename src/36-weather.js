/* =========================================================
   🌧️ 날씨 — 여름 소나기 · 무지개
   ========================================================= */
const W = { rain: 0, raining: false, timer: rr(70, 130), rainbow: 0, rainbowT: 0, afterRain: 0 };
const isRaining = () => W.raining;
const rainbowOn = () => W.rainbowT > 0;

// 빗줄기
const RAIN_N = 1400;
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(RAIN_N * 6);
const rainSeed = Array.from({ length: RAIN_N }, () => [rr(-30, 30), rr(0, 26), rr(-30, 30)]);
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.LineBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0, depthWrite: false });
const rainLines = new THREE.LineSegments(rainGeo, rainMat);
rainLines.frustumCulled = false;
scene.add(rainLines);

// 무지개
const rainbowGroup = new THREE.Group();
{
  const cols = [0xff6b6b, 0xffa94d, 0xffe066, 0x8ce99a, 0x74c0fc, 0x9775fa, 0xe599f7];
  cols.forEach((c, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(90 - i * 2.6, 1.3, 8, 64, Math.PI), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    rainbowGroup.add(m);
  });
  rainbowGroup.position.set(10, -12, -170);
  scene.add(rainbowGroup);
}

// 빗소리 (필터 걸린 잡음을 계속 틀어 두고 크기만 조절)
let rainGain = null;
function ensureRainSound() {
  if (rainGain || !actx) return;
  const src = actx.createBufferSource();
  src.buffer = noiseBuf; src.loop = true;
  const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.6;
  rainGain = actx.createGain(); rainGain.gain.value = 0;
  src.connect(f).connect(rainGain).connect(master);
  src.start();
}
function startRain() {
  if (W.raining) return;
  W.raining = true;
  W.timer = rr(35, 55);
  toast('🌧️ 여름 소나기가 내리기 시작했어요', 3);
  say(player, pick(['앗, 비다! ☔', '소나기다~ 시원하다!']), 2.5);
}
function stopRain() {
  if (!W.raining) return;
  W.raining = false;
  W.timer = rr(120, 220);
  W.afterRain = 70;
  if (tod < 1.4) { W.rainbowT = 30; setTimeout(() => toast('🌈 비가 그치고 무지개가 떴어요! 달팽이랑 개구리가 나왔을지도?', 4), 2500); }
}

// 우산 (비가 오면 자동으로 써요)
const umbrella = (() => {
  const g = new THREE.Group();
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6), 0xffffff, 0, 0.9, 0, g, false);
  const top = add(new THREE.ConeGeometry(1.3, 0.55, 10), toon({ map: stripeTexture('#ffd166', '#ffffff', 10) }), 0, 1.85, 0, g);
  top.castShadow = true;
  g.position.set(0.75, 0.85, 0.15);
  g.rotation.z = 0.15;
  g.visible = false;
  return g;
})();

const rainSky = new THREE.Color(0x8a96a8), rainFog = new THREE.Color(0xa9b3c2);
tickers.push((dt) => {
  if (!umbrella.parent) player.body.add(umbrella);
  if (state === 'fireworks' && W.raining) stopRain();
  if (state === 'play' && !insideHouse) {
    W.timer -= dt;
    if (W.timer <= 0) (W.raining ? stopRain() : tod < 1.6 && season().id !== 'winter' ? startRain() : (W.timer = 60));
  }
  W.rain = lerp(W.rain, W.raining ? 1 : 0, damp(0.7, dt));
  W.rainbowT -= dt;
  W.afterRain -= dt;
  W.rainbow = lerp(W.rainbow, W.rainbowT > 0 ? 1 : 0, damp(0.5, dt));
  const r = W.rain;
  // 하늘을 회색빛으로
  if (r > 0.01) {
    skyMat.uniforms.top.value.lerp(rainSky, r * 0.7);
    skyMat.uniforms.bottom.value.lerp(rainFog, r * 0.6);
    scene.fog.color.lerp(rainFog, r * 0.6);
    sun.intensity *= 1 - r * 0.55;
    hemi.intensity *= 1 - r * 0.25;
  }
  cloudMat.color.setHex(0xffffff).lerp(rainSky, r);
  rainMat.opacity = r * 0.55 * (insideHouse ? 0 : 1);
  rainLines.visible = r > 0.01;
  if (rainLines.visible) {
    const c = camera.position, fall = elapsed * 34;
    for (let i = 0; i < RAIN_N; i++) {
      const [sx, sy, sz] = rainSeed[i];
      const y = ((sy - fall) % 26 + 26) % 26;
      const x = c.x + sx, z = c.z - 10 + sz;
      rainPos[i * 6] = x; rainPos[i * 6 + 1] = y; rainPos[i * 6 + 2] = z;
      rainPos[i * 6 + 3] = x + 0.08; rainPos[i * 6 + 4] = y + 0.9; rainPos[i * 6 + 5] = z;
    }
    rainGeo.attributes.position.needsUpdate = true;
  }
  rainbowGroup.children.forEach((m) => (m.material.opacity = W.rainbow * 0.45));
  rainbowGroup.visible = W.rainbow > 0.01;
  ensureRainSound();
  if (rainGain) rainGain.gain.value = soundOn ? r * 0.12 * (insideHouse ? 0.4 : 1) : 0;
  const wantUmbrella = r > 0.3 && W.raining && !insideHouse && ['play', 'menu'].includes(state) && !riding;
  umbrella.visible = wantUmbrella;
  player.handSlot.visible = !wantUmbrella && state !== 'fishing';
});
