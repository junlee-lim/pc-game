/* =========================================================
   🏡 친구 집에 놀러 가기
   하트 1개 이상 친해지면 친구가 집에 초대해 줘요.
   집 안은 내 집처럼 바다 멀리 따로 지어 두었어요.
   ========================================================= */
const FRIEND_HOMES = [
  { name: '모모', emoji: '🐱', house: [-8, 44], room: [380, 300], wall: 0xffe6ee, floor: 0xf2c8d4, accent: 0xff8fb1, accentCss: '#ff8fb1' },
  { name: '콩이', emoji: '🌶️', house: [38, -21], room: [460, 300], wall: 0xfff1d6, floor: 0xe0b98d, accent: 0xff7a5c, accentCss: '#ff7a5c' },
  { name: '보리', emoji: '🐰', house: [-12, -26], room: [300, 380], wall: 0xeaf6ff, floor: 0xd8c4a8, accent: 0x8fb8ff, accentCss: '#8fb8ff' },
  { name: '솜이', emoji: '🐈', house: [11, 30], room: [380, 380], wall: 0xe8f0ff, floor: 0xc9d4ec, accent: 0x9fb8ff, accentCss: '#9fb8ff' },
  { name: '두부', emoji: '🍉', house: [-24, 42], room: [460, 380], wall: 0xf0ffe6, floor: 0xd6c08f, accent: 0x7fcf6b, accentCss: '#7fcf6b' },
];

function friendRoomShell(F) {
  const R = { x: F.room[0], z: F.room[1], w: 12, d: 8.5 };
  const hw = R.w / 2, hd = R.d / 2, wallH = 3.2;
  const lawn = add(new THREE.CircleGeometry(30, 40), 0x9fdc7c, R.x, -0.02, R.z, scene, false);
  lawn.rotation.x = -Math.PI / 2;
  add(new THREE.BoxGeometry(R.w, 0.2, R.d), F.floor, R.x, -0.1, R.z, scene, false);
  add(new THREE.BoxGeometry(R.w, wallH, 0.3), F.wall, R.x, wallH / 2, R.z - hd);
  add(new THREE.BoxGeometry(0.3, wallH, R.d), F.wall, R.x - hw, wallH / 2, R.z);
  add(new THREE.BoxGeometry(0.3, wallH, R.d), F.wall, R.x + hw, wallH / 2, R.z);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(hw - 1, 0.7, 0.3), F.wall, R.x + s * (hw / 2 + 0.5), 0.35, R.z + hd);
  add(new THREE.BoxGeometry(R.w + 0.3, 0.25, 0.4), F.accent, R.x, wallH, R.z - hd);
  for (const wx of [-3.2, 3.2]) {
    add(new THREE.BoxGeometry(1.6, 1.2, 0.05), windowMat, R.x + wx, 2.0, R.z - hd + 0.18, scene, false);
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.4, 1.4, 0.06), F.accent, R.x + wx + s * 0.95, 1.95, R.z - hd + 0.22, scene, false);
  }
  // 함께 차 마시는 테이블
  const t = new THREE.Group(); t.position.set(R.x - 0.5, 0, R.z + 1.4); scene.add(t);
  add(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 20), 0xffffff, 0, 0.55, 0, t);
  add(new THREE.CylinderGeometry(0.1, 0.15, 0.55, 8), 0xd69a6a, 0, 0.27, 0, t);
  add(new THREE.SphereGeometry(0.2, 12, 10), F.accent, 0, 0.75, 0, t).scale.y = 0.8;
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 5), F.accent, 0.22, 0.75, 0, t, false).rotation.z = -1;
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.09, 0.07, 0.12, 10), 0xffffff, s * 0.45, 0.65, 0.25, t, false);
    add(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 14), F.accent, s * 1.3, 0.1, 0, t);
  }
  collide(t.position.x, t.position.z, 1.0);
  glowLights.push((() => { const l = new THREE.PointLight(0xffc890, 0, 16, 1.2); l.position.set(R.x, 3, R.z); scene.add(l); return l; })());
  R.tea = t.position;
  return R;
}
const room = (R, build) => { const g = new THREE.Group(); g.position.set(R.x, 0, R.z); scene.add(g); build(g); return g; };
const rc = (R, lx, lz, r) => collide(R.x + lx, R.z + lz, r);
const FRIEND_DECOR = {
  모모(R) {
    room(R, (g) => {
      // 캣타워
      for (const [x, z] of [[-4.6, -3], [-3.6, -3]]) add(new THREE.CylinderGeometry(0.12, 0.12, 2.6, 8), 0xe8c49a, x, 1.3, z, g);
      for (const [y, r] of [[0.8, 0.8], [1.7, 0.7], [2.6, 0.6]]) add(new THREE.CylinderGeometry(r, r, 0.15, 16), 0xffd6e2, -4.1, y, -3, g);
      add(new THREE.SphereGeometry(0.45, 12, 10), 0xffffff, -4.1, 2.85, -3, g).scale.y = 0.5;
      // 털실 공
      for (const [x, z, c] of [[-2.6, -1.6, 0xff8fb1], [-2.1, -1.2, 0x9fd6ff], [-2.9, -0.8, 0xffd166]]) {
        add(new THREE.SphereGeometry(0.22, 12, 10), c, x, 0.22, z, g);
        add(new THREE.TorusGeometry(0.22, 0.025, 6, 16), 0xffffff, x, 0.22, z, g, false).rotation.y = rr(0, 3);
      }
      // 생선 모양 러그
      const rug = add(new THREE.CylinderGeometry(1.6, 1.6, 0.04, 24), 0xbfe3ff, 1.5, 0.02, -1.2, g, false); rug.scale.z = 0.55;
      const tail = add(new THREE.ConeGeometry(0.7, 0.9, 3), 0xbfe3ff, 3.4, 0.02, -1.2, g, false); tail.rotation.set(Math.PI / 2, 0, Math.PI / 2); tail.scale.z = 0.05;
      // 고양이 침대
      add(new THREE.TorusGeometry(0.6, 0.22, 10, 20), 0xff8fb1, 4.4, 0.22, -2.8, g).rotation.x = Math.PI / 2;
      add(new THREE.CylinderGeometry(0.55, 0.55, 0.15, 16), 0xffffff, 4.4, 0.1, -2.8, g);
      // 생선 그림 액자
      add(new THREE.BoxGeometry(1.4, 0.9, 0.05), 0xffffff, 0, 2.1, -4.05, g, false);
      const f = add(new THREE.SphereGeometry(0.28, 10, 8), 0x8fb8ff, 0, 2.1, -4.0, g, false); f.scale.set(1.5, 0.8, 0.2);
    });
    rc(R, -4.1, -3, 0.9); rc(R, 4.4, -2.8, 0.8);
  },
  콩이(R) {
    room(R, (g) => {
      add(new THREE.BoxGeometry(4.2, 1.0, 1.0), 0xfff6ea, 2.8, 0.5, -3.6, g);
      add(new THREE.BoxGeometry(4.3, 0.1, 1.1), 0xd69a6a, 2.8, 1.05, -3.6, g);
      add(new THREE.CylinderGeometry(0.4, 0.35, 0.45, 16), 0x6a6a7a, 2.0, 1.3, -3.6, g);
      add(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 16), 0xe8452c, 2.0, 1.52, -3.6, g, false);
      add(new THREE.BoxGeometry(1.1, 2.4, 0.9), 0xffffff, 5.2, 1.2, -3.5, g);
      add(new THREE.BoxGeometry(0.06, 0.6, 0.05), 0x9fb8ff, 4.8, 1.6, -3.03, g, false);
      // 식탁과 떡볶이
      add(new THREE.BoxGeometry(2.2, 0.1, 1.3), 0xe8c49a, -3, 0.8, -2.2, g);
      for (const [x, z] of [[-3.9, -2.7], [-2.1, -2.7], [-3.9, -1.7], [-2.1, -1.7]]) add(new THREE.BoxGeometry(0.1, 0.8, 0.1), 0xd69a6a, x, 0.4, z, g);
      const plate = foodModel('tteok'); plate.position.set(-3, 0.85, -2.2); g.add(plate);
      const fish = foodModel('fish'); fish.position.set(-2.4, 0.85, -2.0); g.add(fish);
      // 고추 줄
      for (let i = 0; i < 9; i++) { const c = add(new THREE.ConeGeometry(0.08, 0.35, 6), 0xe8452c, -4.5 + i * 0.35, 2.5 - Math.sin((i / 8) * Math.PI) * 0.3, -4.05, g, false); c.rotation.z = Math.PI; }
    });
    rc(R, 2.8, -3.6, 1.2); rc(R, 0.9, -3.6, 0.6); rc(R, 5.2, -3.5, 0.7); rc(R, -3, -2.2, 1.2);
  },
  보리(R) {
    room(R, (g) => {
      for (const x of [-4, -1.6]) {
        add(new THREE.BoxGeometry(2.2, 2.4, 0.6), 0xe8c49a, x, 1.2, -3.8, g);
        for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(0.22, 0.5, 0.45), pick([0x8fb8ff, 0xffffff, 0xc3a6ff, 0xffd6e2]), x - 0.85 + i * 0.32, 0.5 + r * 0.72, -3.7, g, false);
      }
      // 구름 러그
      for (const [x, z, r] of [[2, -1, 1.2], [3, -0.7, 1.0], [1.1, -0.6, 0.9], [2.6, -1.7, 0.9]]) add(new THREE.CylinderGeometry(r, r, 0.04, 20), 0xffffff, x, 0.02, z, g, false);
      // 당근 쿠션
      for (const [x, z] of [[1.4, 0.1], [3.4, 0.2]]) {
        const c = add(new THREE.ConeGeometry(0.4, 1.0, 12), 0xff9f43, x, 0.25, z, g); c.rotation.z = Math.PI / 2;
        add(new THREE.ConeGeometry(0.15, 0.4, 6), 0x5fbf4a, x - 0.6, 0.3, z, g, false).rotation.z = Math.PI / 2;
      }
      // 책상과 스탠드
      add(new THREE.BoxGeometry(1.6, 0.1, 0.9), 0xffffff, 4.6, 0.9, -3.4, g);
      for (const [x, z] of [[3.9, -3.7], [5.3, -3.7], [3.9, -3.1], [5.3, -3.1]]) add(new THREE.BoxGeometry(0.08, 0.9, 0.08), 0xd69a6a, x, 0.45, z, g);
      add(new THREE.SphereGeometry(0.25, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon({ color: 0xc3a6ff, emissive: 0xffc070, emissiveIntensity: 0.4 }), 5, 1.35, -3.5, g);
      for (const [x, z] of [[-5.3, 3.2], [5.3, 3.3]]) { add(new THREE.CylinderGeometry(0.3, 0.25, 0.5, 10), 0xe58e6b, x, 0.25, z, g); add(new THREE.SphereGeometry(0.45, 10, 8), 0x7fcf6b, x, 0.85, z, g); }
    });
    rc(R, -4, -3.8, 1.1); rc(R, -1.6, -3.8, 1.1); rc(R, 4.6, -3.4, 0.9);
  },
  솜이(R) {
    room(R, (g) => {
      // 동그란 소파
      add(new THREE.CylinderGeometry(1.3, 1.3, 0.45, 24), 0x9fb8ff, -3.4, 0.25, -2.4, g);
      const back = add(new THREE.TorusGeometry(1.25, 0.25, 10, 24, Math.PI), 0x8fa8f0, -3.4, 0.55, -2.4, g); back.rotation.x = -Math.PI / 2; back.rotation.z = Math.PI;
      for (const x of [-3.8, -3.0]) add(new THREE.SphereGeometry(0.25, 10, 8), 0xffffff, x, 0.65, -2.2, g).scale.y = 0.7;
      // 화장대와 거울
      add(new THREE.BoxGeometry(1.8, 0.9, 0.7), 0xffffff, 4, 0.45, -3.6, g);
      const mirror = add(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 24), toon({ color: 0xdff4ff, emissive: 0xbfe3ff, emissiveIntensity: 0.4 }), 4, 1.7, -3.9, g, false); mirror.rotation.x = Math.PI / 2;
      add(new THREE.TorusGeometry(0.62, 0.06, 8, 24), 0xffd166, 4, 1.7, -3.88, g, false);
      // 빙수 냉장고
      add(new THREE.BoxGeometry(0.9, 1.4, 0.7), 0xe8f6ff, 5.3, 0.7, -1.5, g);
      const bs = foodModel('bingsu'); bs.position.set(5.3, 1.42, -1.5); g.add(bs);
      // 스탠드 조명
      add(new THREE.CylinderGeometry(0.05, 0.08, 2.2, 8), 0xffd166, -5.3, 1.1, 2.8, g);
      add(new THREE.ConeGeometry(0.4, 0.5, 14, 1, true), toon({ color: 0xffffff, emissive: 0xffe0a0, emissiveIntensity: 0.5, side: THREE.DoubleSide }), -5.3, 2.3, 2.8, g);
      const rug = add(new THREE.CylinderGeometry(1.8, 1.8, 0.04, 28), 0xd8e4ff, 1.6, 0.02, -1.4, g, false);
    });
    rc(R, -3.4, -2.4, 1.4); rc(R, 4, -3.6, 1.0); rc(R, 5.3, -1.5, 0.6); rc(R, -5.3, 2.8, 0.4);
  },
  두부(R) {
    room(R, (g) => {
      add(new THREE.BoxGeometry(2.6, 0.5, 3.2), 0xd69a6a, -3.8, 0.25, -2.4, g);
      add(new THREE.BoxGeometry(2.5, 0.35, 3.1), 0xfff6ea, -3.8, 0.65, -2.4, g);
      add(new THREE.BoxGeometry(2.52, 0.37, 2.0), 0x9fe3c8, -3.8, 0.7, -1.8, g);
      for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.35, 10, 8), pick([0xffffff, 0xffd6e2, 0xfff1c8, 0xd8f5e8]), -4.7 + i * 0.45, 1.0, -3.6 + (i % 2) * 0.2, g).scale.set(1, 0.6, 0.7);
      // 수박 빈백
      const bean = add(new THREE.SphereGeometry(1, 20, 14), toon({ map: melonTex }), 2.4, 0.5, -1.6, g); bean.scale.set(1.1, 0.55, 1.1);
      add(new THREE.CylinderGeometry(1.05, 1.05, 0.06, 20), 0xff5a6e, 2.4, 0.78, -1.6, g, false);
      // 벽시계
      add(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 20), 0xffffff, 1, 2.3, -4.05, g, false).rotation.x = Math.PI / 2;
      add(new THREE.BoxGeometry(0.04, 0.35, 0.02), 0x3b2a25, 1, 2.4, -4.0, g, false);
      add(new THREE.BoxGeometry(0.25, 0.04, 0.02), 0x3b2a25, 1.1, 2.3, -4.0, g, false);
      for (const [x, z] of [[5.2, -3.5], [5.2, 3.2], [-5.3, 3.2]]) { add(new THREE.CylinderGeometry(0.3, 0.25, 0.5, 10), 0xe58e6b, x, 0.25, z, g); add(new THREE.SphereGeometry(0.5, 10, 8), 0x6cbf5d, x, 0.9, z, g); }
    });
    rc(R, -3.8, -2.4, 1.6); rc(R, 2.4, -1.6, 1.0);
  },
};

for (const F of FRIEND_HOMES) {
  const hg = HOUSE_GROUPS.find((h) => h.x === F.house[0] && h.z === F.house[1]);
  if (!hg) continue;
  const R = friendRoomShell(F);
  FRIEND_DECOR[F.name](R);
  F.R = R;
  const rot = hg.rot;
  R.exit = { x: hg.x + Math.sin(rot) * 3.4, z: hg.z + Math.cos(rot) * 3.4, rot };
  const sign = signPlane(`${F.emoji} ${F.name}네 집`, 1.9, { font: 80, border: F.accentCss });
  sign.position.set(0, 2.72, 2.1);
  hg.g.add(sign);
  const npcOf = () => npcs.find((n) => n.name === F.name);
  interact({
    x: hg.x + Math.sin(rot) * 2.9, z: hg.z + Math.cos(rot) * 2.9, r: 1.9,
    get label() { return friendLv(F.name) >= 1 ? `${F.name}네 집 놀러 가기 🏡` : `🔒 ${F.name}네 집 (❤️1개면 초대받아요)`; },
    action: () => visitFriend(F, npcOf()),
  });
  // 안에서: 나가기 · 차 마시기
  interact({ x: R.x, z: R.z + R.d / 2 - 0.6, r: 1.6, label: '밖으로 나가기 🚪', action: () => exitHouse() });
  interact({ x: R.tea.x + 1.6, z: R.tea.z + 0.6, r: 1.5, label: `🍵 ${F.name}와 차 마시기`, action: () => teaTime(F, npcOf()) });
}

function visitFriend(F, npc) {
  if (friendLv(F.name) < 1) {
    sfx.no();
    say(player, '똑똑… 아직은 문이 잠겨 있어.', 2);
    toast(`🔒 ${F.name}와 조금 더 친해지면 집에 초대해 줄 거예요 (❤️1개 필요 · K 친구 수첩)`, 3.6);
    return;
  }
  if (riding) setRiding(false);
  sfx.ok();
  fadeThen(() => {
    insideHouse = true;
    curRoom = F.R;
    player.root.position.set(F.R.x, 0, F.R.z + F.R.d / 2 - 1.2);
    player.root.rotation.set(0, Math.PI, 0);
    houseCamera(player.root.position, camera.position, lookAt);
    if (npc) {
      npc.visiting = true;
      npc.c.root.position.set(F.R.x + 1.6, 0, F.R.z + 0.2);
      const lv = friendLv(F.name);
      setTimeout(() => say(npc.c, lv >= 4 ? pick(['와아~ 와 줬구나! 보고 싶었어 💕', '어서 와! 우리 집은 네 집이나 마찬가지야 💗']) : lv >= 2 ? pick(['어서 와~ 편하게 앉아!', '헤헤, 우리 집 어때?']) : pick(['어, 어서 와… 좀 어질러져 있지?', '놀러 와 줘서 고마워!']), 3, F.name), 500);
      if (!S.visited[F.name]) {
        S.visited[F.name] = 1;
        persist();
        setTimeout(() => { addFriendship(npc, 5); addXP(5, '첫 방문'); toast(`🏡 ${F.name}네 집에 처음 놀러 왔어요! 호감도가 올랐어요`, 3.2); }, 1300);
      }
    }
    F.R.onExit = () => {
      if (!npc) return;
      npc.visiting = false;
      npc.c.root.position.set(F.R.exit.x + 1.2, 0, F.R.exit.z + 0.6);
      npc.target = null;
      npc.wait = 2;
    };
  }, 300);
}
function teaTime(F, npc) {
  const key = F.name + '_tea';
  if (S.visited[key] === dayKey()) {
    say(npc ? npc.c : player, '차는 아까 마셨잖아~ 배가 출렁출렁해 😆', 2.6, npc ? F.name : '');
    return;
  }
  S.visited[key] = dayKey();
  S.energy = clamp(S.energy + 15, 0, 100);
  S.full = clamp(S.full + 5, 0, 100);
  persist();
  sfx.ding();
  const t = F.R.tea;
  sparkle(t.x, 1.2, t.z, new THREE.Color(0xfff1c8), 20);
  say(player, '후~ 따뜻하다… 🍵', 2.2);
  if (npc) {
    setTimeout(() => say(npc.c, pick(['같이 마시니까 더 맛있다!', '이 차는 내가 제일 아끼는 거야~', '다음에도 또 놀러 와 💕']), 3, F.name), 1200);
    addFriendship(npc, 6);
  }
}
