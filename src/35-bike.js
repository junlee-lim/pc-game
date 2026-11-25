/* =========================================================
   🚲 자전거 대여소 & 점프대
   ========================================================= */
const BIKE_STAND = { x: -11, z: -6 };
let riding = false;
function bikeModel(color = 0xff8fb1) {
  const g = new THREE.Group();
  const wheels = [];
  for (const z of [-0.72, 0.72]) {
    const w = new THREE.Group();
    w.position.set(0, 0.45, z);
    g.add(w);
    const tire = add(new THREE.TorusGeometry(0.4, 0.07, 8, 24), 0x4a3a3a, 0, 0, 0, w);
    tire.rotation.y = Math.PI / 2;
    for (let i = 0; i < 3; i++) add(new THREE.BoxGeometry(0.03, 0.76, 0.03), 0xdddddd, 0, 0, 0, w, false).rotation.x = (i * Math.PI) / 3;
    wheels.push(w);
  }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const fm = mat(color);
  for (const [a, b] of [[V(0, 0.45, -0.72), V(0, 0.95, -0.15)], [V(0, 0.95, -0.15), V(0, 0.95, 0.5)], [V(0, 0.45, 0.72), V(0, 1.25, 0.55)], [V(0, 0.45, -0.72), V(0, 0.55, 0.05)], [V(0, 0.55, 0.05), V(0, 0.95, -0.15)], [V(0, 0.55, 0.05), V(0, 0.95, 0.5)]]) rod(a, b, 0.05, fm, g).castShadow = true;
  add(new THREE.BoxGeometry(0.28, 0.08, 0.42), 0x6a4c3f, 0, 1.0, -0.2, g);
  rod(V(-0.35, 1.25, 0.55), V(0.35, 1.25, 0.55), 0.035, 0xdddddd, g);
  // 앞 바구니와 꽃
  const basket = add(new THREE.BoxGeometry(0.5, 0.3, 0.35), 0xe8c49a, 0, 1.05, 0.88, g);
  for (let i = 0; i < 3; i++) add(new THREE.SphereGeometry(0.08, 8, 6), pick([0xff8fb1, 0xffd166, 0xffffff]), -0.12 + i * 0.12, 1.25, 0.88, g, false);
  g.userData.wheels = wheels;
  return g;
}
const myBike = bikeModel(0x9fd6ff);
{
  const g = new THREE.Group();
  g.position.set(BIKE_STAND.x, 0, BIKE_STAND.z);
  scene.add(g);
  add(new THREE.BoxGeometry(4.4, 0.12, 2.2), 0xe9e2f2, 0, 0.06, 0, g);
  for (const px of [-2, 2]) add(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), 0xb07a56, px, 1.3, -0.9, g);
  const roof = add(new THREE.BoxGeometry(4.6, 0.12, 1.8), toon({ map: stripeTexture('#9fe3c8', '#ffffff', 10) }), 0, 2.6, -0.3, g);
  roof.rotation.x = 0.15;
  for (const [x, c] of [[-1.2, 0xff8fb1], [0, 0xffd166], [1.2, 0x9fe3c8]]) {
    const b = bikeModel(c);
    b.position.set(x, 0, -0.2);
    b.rotation.y = 0.15;
    b.scale.setScalar(0.95);
    g.add(b);
  }
  const sign = signPlane('🚲 자전거 대여소', 3, { w: 640, h: 160, font: 76, border: '#9fe3c8' });
  sign.position.set(0, 3.15, -0.2);
  g.add(sign);
  collide(BIKE_STAND.x - 1.2, BIKE_STAND.z - 0.3, 1.1);
  collide(BIKE_STAND.x + 1.2, BIKE_STAND.z - 0.3, 1.1);
  collide(BIKE_STAND.x, BIKE_STAND.z - 0.3, 1.0);
  interact({
    x: BIKE_STAND.x, z: BIKE_STAND.z + 1.8, r: 2.2,
    get label() { return S.bikeRented ? '자전거 반납하기' : '자전거 빌리기 (무료)'; },
    action: () => {
      if (!S.bikeRented) {
        S.bikeRented = true; persist();
        setRiding(true);
        toast('🚲 자전거를 빌렸어요! B 키로 타고 내릴 수 있어요. 점프대도 찾아보세요!', 4);
      } else {
        S.bikeRented = false; persist();
        setRiding(false);
        toast('자전거를 반납했어요. 또 타러 와요~');
      }
      sfx.bell();
    },
  });
}
ZONE_LABELS.push(['🚲 자전거 대여소', BIKE_STAND.x, 4.4, BIKE_STAND.z]);
MAP_MARKS.push(['🚲', BIKE_STAND.x, BIKE_STAND.z]);
AVOID.push([BIKE_STAND.x, BIKE_STAND.z, 4]);

// 점프대
{
  const tex = stripeTexture('#ffd166', '#ff8fb1', 6);
  for (const r of RAMPS) {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0); sh.lineTo(r.len, 0); sh.lineTo(r.len, r.h); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: r.w, bevelEnabled: false });
    geo.translate(0, 0, -r.w / 2);
    const m = add(geo, toon({ map: tex }), r.x, 0.01, r.z);
    m.rotation.y = Math.atan2(-r.dz, r.dx);
  }
}

function setRiding(on) {
  if (on === riding) return;
  riding = on;
  if (on) {
    player.root.add(myBike);
    player.feet.forEach((f) => (f.visible = false));
    sfx.bell();
  } else {
    player.root.remove(myBike);
    player.feet.forEach((f) => (f.visible = true));
    player.body.position.y = 0;
    airborne = false;
    player.root.position.y = groundY(player.root.position.x, player.root.position.z);
  }
}
function bikeAnimate(moving, speed, dt) {
  const spin = moving ? (speed / 0.45) * dt : 0;
  for (const w of myBike.userData.wheels) w.rotation.x += spin;
  player.body.position.y = 0.42 + (moving && !airborne ? Math.abs(Math.sin(elapsed * 10)) * 0.04 : 0);
  player.body.rotation.z = 0;
  const br = airborne ? 0 : Math.sin(elapsed * 2.2) * 0.02;
  player.body.scale.set(1 + br, 1 - br, 1 + br);
}
function bikeLanded(t) {
  sfx.land();
  player.body.scale.set(1.25, 0.75, 1.25);
  const p = player.root.position;
  sparkle(p.x, p.y + 0.3, p.z, new THREE.Color(0xfff1a8), 16);
  if (t > 0.55) say(player, pick(['야호~! 🚲', '날았다!! ✨', '우와아~ 신난다!']), 1.8);
}
playKeyHooks.push((code) => {
  if (code !== 'KeyB') return false;
  if (insideHouse) { say(player, '집 안에서는 자전거를 탈 수 없어요~', 2); return true; }
  if (!S.bikeRented) { toast('🚲 광장 옆 자전거 대여소에서 먼저 빌려 주세요'); return true; }
  if (airborne) return true;
  setRiding(!riding);
  return true;
});
tickers.push(() => {
  // 다른 활동을 시작하면 자전거에서 내려요
  if (riding && !['play', 'menu'].includes(state)) setRiding(false);
});
