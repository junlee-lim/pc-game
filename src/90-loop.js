/* =========================================================
   메인 루프
   ========================================================= */
const clock = new THREE.Clock();
let camYaw = 0, camYawTarget = 0;
let elapsed = 0, currentInteract = null, stepT = 0, warnT = 6, hudT = 0;
const camTarget = new THREE.Vector3(), camPos = new THREE.Vector3(), lookAt = new THREE.Vector3(0, 0, 0);
const playerVel = new THREE.Vector3();

function resolve(p, r, isPlayer = false) {
  for (let pass = 0; pass < 2; pass++) for (const c of colliders) {
    if (c.off) continue;
    const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + r;
    if (d < m && d > 1e-5) { p.x = c.x + (dx / d) * m; p.z = c.z + (dz / d) * m; }
  }
  if (isPlayer && insideHouse) { clampToRoom(p); return; }
  // 선착장 위는 섬 밖이어도 걸을 수 있어요
  if (Math.abs(p.x - PIER.x) < PIER.w / 2 && p.z > ISLAND_R - 3) {
    p.x = clamp(p.x, PIER.x - PIER.w / 2 + 0.5, PIER.x + PIER.w / 2 - 0.5);
    p.z = Math.min(p.z, PIER.z1 - 0.6);
    return;
  }
  const d = Math.hypot(p.x, p.z), lim = ISLAND_R - 1.8;
  if (d > lim) { p.x *= lim / d; p.z *= lim / d; }
}

let pvy = 0, airborne = false, airTime = 0;

function updatePlayer(dt) {
  let dx = 0, dz = 0;
  if (down('KeyW', 'ArrowUp')) dz -= 1;
  if (down('KeyS', 'ArrowDown')) dz += 1;
  if (down('KeyA', 'ArrowLeft')) dx -= 1;
  if (down('KeyD', 'ArrowRight')) dx += 1;
  const moving = dx !== 0 || dz !== 0;
  const run = down('ShiftLeft', 'ShiftRight');
  let speed = riding ? (run ? 17 : 13) : run ? 9.5 : 5.5;
  if (S.energy < 15) speed *= 0.65;
  const p = player.root.position;
  if (moving) {
    const l = Math.hypot(dx, dz);
    dx /= l; dz /= l;
    // 카메라가 바라보는 방향 기준으로 이동
    // 집 안에서는 카메라가 정면으로 고정되니 회전 각도(camYaw)를 쓰지 않아요
    const yaw = insideHouse ? 0 : camYaw;
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    [dx, dz] = [dx * cy + dz * sy, -dx * sy + dz * cy];
    playerVel.set(dx * speed, 0, dz * speed);
    p.x += playerVel.x * dt;
    p.z += playerVel.z * dt;
    resolve(p, riding ? 0.9 : 0.7, true);
    player.root.rotation.y = lerpAngle(player.root.rotation.y, Math.atan2(dx, dz), damp(riding ? 8 : 14, dt));
    if (!riding) {
      stepT -= dt * (run ? 1.6 : 1);
      if (stepT <= 0) { stepT = 0.32; sfx.step(); }
    }
    S.energy = clamp(S.energy - dt * (riding ? 0.06 : run ? 0.35 : 0.12), 0, 100);
  }
  const gy = groundY(p.x, p.z);
  if (riding) {
    // 점프대를 달려 올라가면 그 속도 그대로 붕~ 날아가요
    if (airborne) {
      airTime += dt;
      pvy -= 20 * dt;
      p.y += pvy * dt;
      if (p.y <= gy) {
        p.y = gy;
        airborne = false;
        if (airTime > 0.35) bikeLanded(airTime);
        pvy = 0;
      }
    } else if (gy < p.y - 0.08 && pvy > 1) {
      airborne = true;
      airTime = 0;
      pvy = pvy * 1.5 + 2.5; // 점프대 끝에서 살짝 더 붕~
      sfx.jump();
    } else {
      pvy = (gy - p.y) / Math.max(dt, 1e-3);
      p.y = gy;
    }
    bikeAnimate(moving, speed, dt);
  } else {
    if (airborne) {
      // 폴짝! (Space 점프)
      airTime += dt;
      pvy -= 24 * dt;
      p.y += pvy * dt;
      if (p.y <= gy) { p.y = gy; airborne = false; pvy = 0; landT = 0.16; sfx.step(); }
    } else {
      pvy = 0;
      p.y = lerp(p.y, gy, damp(20, dt));
    }
    animateCreature(player, moving && !airborne, speed, dt, elapsed);
    if (airborne) {
      player.body.scale.set(0.9, 1.12, 0.9);
      player.feet.forEach((f) => (f.position.z = 0.1));
    } else if (landT > 0) {
      landT -= dt;
      const k = Math.max(landT, 0) / 0.16;
      player.body.scale.set(1 + 0.22 * k, 1 - 0.22 * k, 1 + 0.22 * k);
    }
  }
}

let landT = 0;
function tryJump() {
  if (airborne || insideHouse && riding) return;
  airborne = true;
  airTime = 0;
  pvy = riding ? 6.5 : 7.5;
  sfx.hop();
}
playKeyHooks.push((code) => { if (code === 'Space') { tryJump(); return true; } return false; });

function updateNPCs(dt) {
  const pp = player.root.position;
  for (const n of npcs) {
    const r = n.c.root;
    let moving = false;
    if (n.follow) {
      const f = updateFollower(n, dt);
      r.position.y = groundY(r.position.x, r.position.z);
      animateCreature(n.c, f.moving, f.speed || 2.2, dt, elapsed);
      continue;
    }
    if (n.talk > 0) {
      n.talk -= dt;
      r.rotation.y = lerpAngle(r.rotation.y, Math.atan2(pp.x - r.position.x, pp.z - r.position.z), damp(8, dt));
    } else if (n.target) {
      const dx = n.target[0] - r.position.x, dz = n.target[1] - r.position.z, d = Math.hypot(dx, dz);
      if (d < 0.4) { n.target = null; n.wait = rr(2, 6); }
      else {
        const sp = 2.2;
        r.position.x += (dx / d) * sp * dt;
        r.position.z += (dz / d) * sp * dt;
        resolve(r.position, 0.6, false);
        r.rotation.y = lerpAngle(r.rotation.y, Math.atan2(dx, dz), damp(6, dt));
        moving = true;
        n.stuck = (n.stuck || 0) + dt;
        if (n.stuck > 8) { n.target = null; n.wait = 1; }
      }
    } else {
      n.wait -= dt;
      if (n.wait <= 0) {
        n.stuck = 0;
        const a = Math.random() * Math.PI * 2, d = Math.random() * 9;
        n.target = [n.home[0] + Math.cos(a) * d, n.home[1] + Math.sin(a) * d];
      }
    }
    r.position.y = groundY(r.position.x, r.position.z);
    animateCreature(n.c, moving, 2.2, dt, elapsed);
  }
  for (const k of stallKeepers) animateCreature(k, false, 0, dt, elapsed);
}

function updateCoins(dt) {
  const pp = player.root.position;
  for (const c of coins) {
    if (!c.m.visible) {
      c.respawn -= dt;
      if (c.respawn <= 0) {
        const [x, z] = randomFreeSpot();
        c.base = groundY(x, z) + 0.8;
        c.m.position.set(x, c.base, z);
        c.m.visible = true;
      }
      continue;
    }
    c.m.rotation.y += dt * 2.5;
    c.m.position.y = c.base + Math.sin(elapsed * 3 + c.m.position.x) * 0.15;
    if (state === 'play' && Math.hypot(c.m.position.x - pp.x, c.m.position.z - pp.z) < 1.3) {
      c.m.visible = false;
      c.respawn = rr(20, 35);
      S.coins++;
      persist();
      sfx.coin();
      sparkle(c.m.position.x, c.m.position.y, c.m.position.z);
    }
  }
}

function updateSky(dt) {
  tod = lerp(tod, todTarget, damp(0.6, dt));
  if (Math.abs(tod - todTarget) < 0.002) tod = todTarget;
  skyMat.uniforms.top.value.copy(sampleColor(TOD.skyTop, tod, tmpC));
  skyMat.uniforms.bottom.value.copy(sampleColor(TOD.skyBottom, tod, tmpC));
  scene.fog.color.copy(sampleColor(TOD.fog, tod, tmpC));
  sun.color.copy(sampleColor(TOD.sunColor, tod, tmpC));
  sun.intensity = sampleNum(TOD.sunI, tod);
  hemi.color.copy(sampleColor(TOD.hemiSky, tod, tmpC));
  hemi.intensity = sampleNum(TOD.hemiI, tod);
  const i = Math.min(Math.floor(tod), 1);
  tmpV.copy(TOD.sunDir[i]).lerp(TOD.sunDir[i + 1], tod - i);
  const night = clamp(tod - 1, 0, 1);
  const glow = clamp((tod - 0.6) / 1.2, 0, 1);
  starMat.opacity = night * 0.95;
  cloudMat.opacity = 1 - night * 0.75;
  moon.material.opacity = night;
  fireflyMat.opacity = night * (0.7 + Math.sin(elapsed * 3) * 0.2);
  windowMat.emissiveIntensity = glow * 1.1;
  lanternMats.forEach((m, k) => (m.emissiveIntensity = 0.15 + glow * (1.1 + Math.sin(elapsed * 2 + k) * 0.15)));
  glowLights.forEach((l) => (l.intensity = glow * 28));
  sea.material.color.setHex(0x7fd3ea).lerp(tmpC.setHex(0x2b3f86), night * 0.8);
  const pp = player.root.position;
  sun.position.copy(pp).add(tmpV);
  sun.target.position.copy(pp);
  sky.position.copy(camera.position);
  stars.position.copy(camera.position);
  const ico = tod < 0.5 ? ['☀️', '맑은 낮'] : tod < 1.5 ? ['🌇', '노을 지는 저녁'] : ['🌙', '여름밤'];
  $('todIco').textContent = ico[0];
  $('todText').textContent = `${ico[1]} · ${season().emoji} ${season().name} ${S.seasonDay}일째`;
}

let modeFov = 45;
function updateCamera(dt) {
  const p = player.root.position;
  if (state === 'title') {
    const a = elapsed * 0.08;
    camPos.set(Math.sin(a) * 58, 30, Math.cos(a) * 58);
    camTarget.set(0, 0, 0);
    camera.position.lerp(camPos, damp(2, dt));
  } else if (state === 'fireworks') {
    camPos.set(p.x + 2, 4.5, p.z + 17);
    camTarget.set(0, 8.5, -46);
    camera.position.lerp(camPos, damp(1.5, dt));
  } else if (state === 'nap') {
    camPos.set(p.x + 6.5, p.y + 5.5, p.z + 2.5);
    camTarget.set(p.x, p.y + 0.5, p.z - 1.0);
    camera.position.lerp(camPos, damp(1.2, dt));
  } else if (modes[state] && modes[state].camera) {
    const c = modes[state].camera(p);
    camPos.copy(c.pos);
    camTarget.copy(c.target);
    camera.position.lerp(camPos, damp(c.speed || 2, dt));
    modeFov = c.fov || 45;
  } else if (insideHouse) {
    houseCamera(p, camPos, camTarget);
    camera.position.lerp(camPos, damp(4, dt));
  } else {
    camPos.set(p.x + Math.sin(camYaw) * 16, p.y + 13, p.z + Math.cos(camYaw) * 16);
    camTarget.set(p.x, p.y + 1.4, p.z);
    camera.position.lerp(camPos, damp(4, dt));
  }
  const fov = state === 'fireworks' ? 60 : modes[state] && modes[state].camera ? modeFov : 45;
  if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = lerp(camera.fov, fov, damp(2, dt)); camera.updateProjectionMatrix(); }
  lookAt.lerp(camTarget, damp(state === 'play' || state === 'menu' ? 6 : (modes[state] && modes[state].camera && modes[state].camera(p).lookSpeed) || 2, dt));
  camera.lookAt(lookAt);
}

function updateHUD(dt) {
  $('coins').textContent = S.coins;
  $('fullBar').style.width = S.full + '%';
  $('energyBar').style.width = S.energy + '%';
  // 상호작용 안내
  currentInteract = null;
  if (state === 'play') {
    const p = player.root.position;
    let best = Infinity;
    for (const it of interactables) {
      const d = Math.hypot(it.x - p.x, it.z - p.z);
      if (d < it.r && d < best) { best = d; currentInteract = it; }
    }
  }
  const pr = $('prompt');
  if (currentInteract) {
    pr.querySelector('span').textContent = currentInteract.label;
    pr.classList.remove('hidden');
  } else pr.classList.add('hidden');

  // 말풍선
  const now = performance.now();
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    if (now > b.until) { b.el.remove(); bubbles.splice(i, 1); continue; }
    const wp = b.c.head.getWorldPosition(projV.clone());
    wp.y += 1.15 * b.c.root.scale.y;
    if (b.c === player && state === 'nap') wp.set(player.root.position.x, player.root.position.y + 1.6, player.root.position.z - 1.5);
    const s = toScreen(wp);
    b.el.style.display = s.ok ? '' : 'none';
    b.el.style.left = s.x + 'px';
    b.el.style.top = s.y + 'px';
  }
  // 지역 이름표
  for (const l of labelDefs) {
    const d = camera.position.distanceTo(l.p);
    const s = toScreen(l.p);
    const show = SHOW_HUD_STATES.has(state) && !insideHouse && s.ok && d < 75;
    l.el.style.display = show ? '' : 'none';
    if (show) {
      l.el.style.left = s.x + 'px';
      l.el.style.top = s.y + 'px';
      l.el.style.opacity = clamp((75 - d) / 25, 0, 1);
    }
  }
  $('keys').style.visibility = SHOW_HUD_STATES.has(state) ? '' : 'hidden';
  updateStatusLines();
  if (state !== 'title') drawMinimap();
}

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  if (state === 'play') {
    updatePlayer(dt);
    S.full = clamp(S.full - dt * 0.18, 0, 100);
    warnT -= dt;
    if (warnT <= 0) {
      warnT = 22;
      if (S.full < 20) say(player, pick(['배고파… 꼬르륵 🍢', '먹자골목에서 뭐 좀 먹고 싶다…']), 3);
      else if (S.energy < 20) say(player, pick(['하암… 졸려 😪', '언덕 해먹에서 한숨 자고 싶다…']), 3);
    }
  } else if (state === 'menu') {
    animateCreature(player, false, 0, dt, elapsed);
  } else if (state === 'nap') {
    napTime += dt;
    S.energy = clamp(S.energy + dt * 9, 0, 100);
    player.body.position.y = 0;
    const sway = Math.sin(elapsed * 0.9) * 0.08;
    hammockMesh.rotation.z = sway;
    player.root.rotation.z = sway;
    player.body.scale.set(1, 1, 1 + Math.sin(elapsed * 1.6) * 0.03);
    if (napTime > 5 && !napAdvanced) {
      napAdvanced = true;
      todTarget = todTarget >= 2 ? 0 : todTarget + 1;
      if (todTarget === 0) setTimeout(newDay, 3200);
      toast(todTarget === 0 ? '🌅 상쾌한 아침이 밝았어요' : todTarget === 1 ? '🌇 어느새 노을이 지고 있어요' : '🌙 별이 반짝이는 여름밤이 되었어요', 3);
    }
    zTimer -= dt;
    if (zTimer <= 0) {
      zTimer = 0.9;
      const s = toScreen(new THREE.Vector3(player.root.position.x, player.root.position.y + 0.8, player.root.position.z - 1.8));
      const z = document.createElement('div');
      z.className = 'zzz';
      z.textContent = pick(['Z', 'z', 'Z', '💤']);
      z.style.left = s.x + 'px';
      z.style.top = s.y + 'px';
      $('bubbles').appendChild(z);
      setTimeout(() => z.remove(), 2400);
    }
  } else if (state === 'fireworks') {
    showTime += dt;
    animateCreature(player, false, 0, dt, elapsed);
    player.body.position.y = -0.15;
    nextRocket -= dt;
    if (nextRocket <= 0 && showTime < SHOW_LEN - 4) {
      const finale = showTime > SHOW_LEN - 12;
      const n = finale ? 2 + Math.floor(Math.random() * 3) : Math.random() < 0.25 ? 2 : 1;
      for (let i = 0; i < n; i++) setTimeout(launchRocket, i * 140);
      nextRocket = finale ? rr(0.35, 0.7) : rr(0.9, 1.9);
    }
    if (showTime > SHOW_LEN) endFireworks(false);
  } else if (modes[state]) {
    modes[state].update(dt);
  }
  if (hammockMesh && state !== 'nap') hammockMesh.rotation.z = Math.sin(elapsed * 0.9) * 0.04;
  if (state !== 'nap' && state !== 'fireworks' && player.root.rotation.z !== 0) player.root.rotation.z = 0;

  if (eatTimer > 0) {
    eatTimer -= dt;
    eatModel.position.y = 2.3 + Math.abs(Math.sin(elapsed * 8)) * 0.2;
    eatModel.rotation.y += dt * 2;
    eatModel.scale.setScalar(1.3 * clamp(eatTimer / 0.6, 0, 1));
    if (eatTimer <= 0) { player.root.remove(eatModel); eatModel = null; }
  }
  if (balloonMesh) {
    balloonMesh.rotation.z = Math.sin(elapsed * 1.3) * 0.12;
    balloonMesh.rotation.x = Math.sin(elapsed * 0.9) * 0.08;
  }

  if (state !== 'loading') {
    updateNPCs(dt);
    updateCoins(dt);
  }
  updateParticles(dt);
  updateSky(dt);
  if (state !== 'loading') for (const t of tickers) t(dt);

  // 분수 · 구름 · 반딧불이
  for (const d of fountainDrops) {
    d.t = (d.t + dt * 0.8) % 1;
    const r = d.t * 1.9;
    d.m.position.set(Math.cos(d.a) * r, 2.35 + d.t * 2.2 - d.t * d.t * 3.2, Math.sin(d.a) * r);
  }
  for (const c of clouds) { c.position.x += c.userData.speed * dt; if (c.position.x > 150) c.position.x = -150; }
  if (fireflyMat.opacity > 0.01) {
    const arr = fireflyGeo.attributes.position.array;
    fireflyBase.forEach(([x, y, z, o], i) => {
      arr[i * 3] = x + Math.sin(elapsed * 0.7 + o) * 1.2;
      arr[i * 3 + 1] = y + Math.sin(elapsed * 1.3 + o * 2) * 0.5;
      arr[i * 3 + 2] = z + Math.cos(elapsed * 0.6 + o) * 1.2;
    });
    fireflyGeo.attributes.position.needsUpdate = true;
  }

  if ((state === 'play' || state === 'menu') && !insideHouse) {
    if (state === 'play') {
      if (down('KeyQ')) camYawTarget -= dt * 1.9;
      if (down('KeyR')) camYawTarget += dt * 1.9;
    }
    camYaw = lerp(camYaw, camYawTarget, damp(8, dt));
  }
  updateCamera(dt);
  hudT -= dt;
  updateHUD(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  fwMat.uniforms.uScale.value = innerHeight * 0.5;
});

refreshFurniture();
applySeason();
$('loading').remove();
state = 'title';
window.__game = {
  S, get state() { return state; }, player, startFireworks, startNap, openShopMenu, openFoodMenu,
  setTod: (t) => (tod = todTarget = t), warp: (x, z) => player.root.position.set(x, groundY(x, z), z),
  act: () => currentInteract && currentInteract.action(), get prompt() { return currentInteract && currentInteract.label; },
  peek: (expr) => eval(expr), // 개발용: 콘솔에서 내부 상태 보기
  startRain: () => startRain(), setSeason: (i) => setSeason(i), newDay: () => newDay(), stopRain: () => stopRain(), spawnBugNear: (id) => spawnBugNear(id), enterHouse: () => enterHouse(),
};
requestAnimationFrame(frame);
