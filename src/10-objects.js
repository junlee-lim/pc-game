/* =========================================================
   재사용 오브젝트
   ========================================================= */
const windowMat = toon({ color: 0xfff3c4, emissive: 0xffbf5e, emissiveIntensity: 0 });
const lanternColors = [0xff8fb1, 0xffd166, 0x9fe3ff, 0xc3a6ff, 0xa8f0c0];
const lanternMats = lanternColors.map((c) => toon({ color: c, emissive: c, emissiveIntensity: 0.2 }));
const glowLights = [];
function glowLight(x, y, z, color = 0xffc070, dist = 16) {
  const l = new THREE.PointLight(color, 0, dist, 1.4);
  l.position.set(x, y, z);
  scene.add(l);
  glowLights.push(l);
}

function tree(x, z, s = 1, kind = 'green') {
  const y = groundY(x, z);
  const g = new THREE.Group();
  g.position.set(x, y, z);
  scene.add(g);
  add(new THREE.CylinderGeometry(0.22 * s, 0.34 * s, 1.8 * s, 8), 0xb07a56, 0, 0.9 * s, 0, g);
  const palette = kind === 'pink' ? [0xffbcd4, 0xffa9c6, 0xffd0e0] : kind === 'round' ? [0x7fcf6b, 0x93db78, 0x6cbf5d] : [0x8bd66f, 0x76c460, 0xa2e283];
  const blobs = [[0, 2.5, 0, 1.25], [0.7, 2.15, 0.35, 0.95], [-0.65, 2.25, -0.3, 0.95], [0.1, 3.2, -0.1, 0.85]];
  blobs.forEach(([bx, by, bz, br], i) => add(new THREE.SphereGeometry(br * s, 16, 12), palette[i % 3], bx * s, by * s, bz * s, g));
  collide(x, z, 0.75 * s);
  TREES.push({ x, z, s });
  return g;
}

function house(x, z, rotY, wall, roof) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
  add(new THREE.BoxGeometry(4.2, 3, 4), wall, 0, 1.5, 0, g);
  const r = add(new THREE.ConeGeometry(3.7, 2.4, 4), roof, 0, 4.2, 0, g);
  r.rotation.y = Math.PI / 4;
  add(new THREE.BoxGeometry(0.6, 1.4, 0.6), 0xd8a58a, 1.1, 4.6, -0.6, g);
  add(new THREE.BoxGeometry(1.1, 1.8, 0.12), 0x9c6a4c, 0, 0.9, 2.04, g);
  add(new THREE.SphereGeometry(0.08, 8, 6), 0xffd166, 0.35, 0.9, 2.12, g);
  for (const wx of [-1.4, 1.4]) {
    add(new THREE.BoxGeometry(0.85, 0.85, 0.1), windowMat, wx, 1.9, 2.03, g);
    add(new THREE.BoxGeometry(1.05, 0.12, 0.2), 0xffffff, wx, 1.42, 2.06, g);
  }
  add(new THREE.BoxGeometry(0.1, 0.85, 0.85), windowMat, 2.13, 1.9, 0, g);
  add(new THREE.BoxGeometry(0.1, 0.85, 0.85), windowMat, -2.13, 1.9, 0, g);
  // 화분
  for (const px of [-1.4, 1.4]) {
    add(new THREE.CylinderGeometry(0.25, 0.2, 0.35, 10), 0xe58e6b, px, 0.18, 2.4, g);
    add(new THREE.SphereGeometry(0.28, 10, 8), pick([0xff8fb1, 0xffd166, 0xc3a6ff]), px, 0.48, 2.4, g);
  }
  collide(x, z, 3.0);
  return g;
}

function lanternString(a, b, n, sag = 0.7) {
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    pts.push(new THREE.Vector3(lerp(a.x, b.x, t), lerp(a.y, b.y, t) - sag * (1 - (2 * t - 1) ** 2), lerp(a.z, b.z, t)));
  }
  for (let i = 0; i < 16; i++) rod(pts[i], pts[i + 1], 0.025, 0x6a4c3f);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const p = new THREE.Vector3(lerp(a.x, b.x, t), lerp(a.y, b.y, t) - sag * (1 - (2 * t - 1) ** 2) - 0.25, lerp(a.z, b.z, t));
    const m = add(new THREE.SphereGeometry(0.22, 12, 10), lanternMats[i % lanternMats.length], p.x, p.y, p.z, scene, false);
    m.scale.set(1, 1.25, 1);
  }
}
function post(x, z, h = 3.2) {
  const y = groundY(x, z);
  add(new THREE.CylinderGeometry(0.12, 0.15, h, 8), 0xb07a56, x, y + h / 2, z);
  collide(x, z, 0.3);
  return new THREE.Vector3(x, y + h, z);
}
function bench(x, z, rotY) {
  const g = new THREE.Group();
  g.position.set(x, groundY(x, z), z);
  g.rotation.y = rotY;
  scene.add(g);
  add(new THREE.BoxGeometry(2.2, 0.15, 0.7), 0xd69a6a, 0, 0.55, 0, g);
  add(new THREE.BoxGeometry(2.2, 0.5, 0.12), 0xd69a6a, 0, 0.95, -0.3, g);
  for (const lx of [-0.9, 0.9]) add(new THREE.BoxGeometry(0.15, 0.55, 0.6), 0x9c6a4c, lx, 0.27, 0, g);
  collide(x, z, 1.0);
}

/* =========================================================
   캐릭터 (귀여운 동글이)
   ========================================================= */
const outlineMat = new THREE.MeshBasicMaterial({ color: 0x5a3e34, side: THREE.BackSide });
function withOutline(m, s = 1.06) {
  const o = new THREE.Mesh(m.geometry, outlineMat);
  o.scale.setScalar(s);
  m.add(o);
  return m;
}
function makeCreature({ color = 0xfff1df, ears = 'bear', accent = 0xffb4c8, scale = 1 } = {}) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const base = mat(color);
  const b = withOutline(add(new THREE.SphereGeometry(0.72, 24, 18), base, 0, 0.78, 0, body));
  b.scale.set(1, 0.92, 0.95);
  add(new THREE.SphereGeometry(0.42, 18, 14), 0xffffff, 0, 0.72, 0.42, body).scale.set(1, 0.95, 0.5);
  const head = new THREE.Group();
  head.position.set(0, 1.78, 0);
  body.add(head);
  withOutline(add(new THREE.SphereGeometry(0.66, 26, 20), base, 0, 0, 0, head), 1.05);
  // 귀
  const earGeo = ears === 'cat' ? new THREE.ConeGeometry(0.2, 0.38, 12) : new THREE.SphereGeometry(0.2, 14, 12);
  for (const s of [-1, 1]) {
    let e;
    if (ears === 'bunny') {
      e = add(new THREE.SphereGeometry(0.16, 14, 12), base, s * 0.24, 0.72, -0.05, head);
      e.scale.set(0.8, 2.4, 0.6);
      e.rotation.z = -s * 0.15;
      add(new THREE.SphereGeometry(0.09, 10, 8), accent, s * 0.24, 0.72, 0.03, head).scale.set(0.8, 2.6, 0.3);
    } else if (ears === 'cat') {
      e = add(earGeo, base, s * 0.36, 0.56, -0.02, head);
      e.rotation.z = -s * 0.35;
    } else {
      e = add(earGeo, base, s * 0.42, 0.5, -0.05, head);
      add(new THREE.SphereGeometry(0.11, 10, 8), accent, s * 0.42, 0.5, 0.08, head).scale.z = 0.4;
    }
    withOutline(e, 1.08);
    // 눈
    const eye = add(new THREE.SphereGeometry(0.085, 12, 10), 0x3b2a25, s * 0.23, 0.04, 0.6, head, false);
    eye.scale.set(1, 1.25, 0.5);
    add(new THREE.SphereGeometry(0.03, 8, 6), 0xffffff, s * 0.23 + 0.025, 0.08, 0.645, head, false);
    // 볼터치
    add(new THREE.SphereGeometry(0.11, 12, 8), accent, s * 0.39, -0.12, 0.5, head, false).scale.set(1, 0.6, 0.35);
    // 팔·발
    add(new THREE.SphereGeometry(0.19, 12, 10), base, s * 0.7, 0.85, 0.12, body);
  }
  add(new THREE.SphereGeometry(0.045, 8, 6), 0x3b2a25, 0, -0.1, 0.645, head, false).scale.set(1.3, 0.7, 0.5);
  const feet = [-1, 1].map((s) => {
    const f = add(new THREE.SphereGeometry(0.22, 12, 10), base, s * 0.3, 0.12, 0.1, root);
    f.scale.set(1, 0.6, 1.3);
    return f;
  });
  if (ears === 'cat') add(new THREE.SphereGeometry(0.16, 10, 8), base, 0, 0.55, -0.72, body);
  if (ears === 'bunny') add(new THREE.SphereGeometry(0.2, 10, 8), 0xffffff, 0, 0.5, -0.68, body);
  const hatSlot = new THREE.Group(); hatSlot.position.set(0, 0.55, 0); head.add(hatSlot);
  const faceSlot = new THREE.Group(); faceSlot.position.set(0, 0.04, 0.62); head.add(faceSlot);
  const handSlot = new THREE.Group(); handSlot.position.set(0.75, 0.85, 0.15); body.add(handSlot);
  root.scale.setScalar(scale);
  return { root, body, head, feet, hatSlot, faceSlot, handSlot, phase: Math.random() * 10 };
}
function animateCreature(c, moving, speed, dt, t) {
  if (moving) {
    c.phase += dt * speed * 2.4;
    c.body.position.y = Math.abs(Math.sin(c.phase)) * 0.18;
    c.body.rotation.z = Math.sin(c.phase) * 0.06;
    c.feet[0].position.z = 0.1 + Math.sin(c.phase) * 0.22;
    c.feet[1].position.z = 0.1 - Math.sin(c.phase) * 0.22;
    c.body.scale.set(1, 1, 1);
  } else {
    const br = Math.sin(t * 2.2 + c.phase) * 0.025;
    c.body.position.y = lerp(c.body.position.y, 0, damp(10, dt));
    c.body.rotation.z = lerp(c.body.rotation.z, 0, damp(10, dt));
    c.body.scale.set(1 + br, 1 - br, 1 + br);
    c.feet[0].position.z = lerp(c.feet[0].position.z, 0.1, damp(10, dt));
    c.feet[1].position.z = lerp(c.feet[1].position.z, 0.1, damp(10, dt));
  }
}
