/* =========================================================
   📸 사진 모드 (P) — 화면 장식을 숨기고 카메라를 자유롭게 움직여 찍어요
   ========================================================= */
const PH = { yaw: 0, pitch: 0.55, dist: 14, flash: 0 };
function startPhoto() {
  state = 'photo';
  PH.yaw = camYaw; PH.pitch = 0.55; PH.dist = 14;
  document.body.classList.add('photo-mode');
  $('photoHint').classList.remove('hidden');
  sfx.select();
}
function endPhoto() {
  state = 'play';
  document.body.classList.remove('photo-mode');
  $('photoHint').classList.add('hidden');
}
function takePhoto() {
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  const d = new Date(), pad = (n) => String(n).padStart(2, '0');
  const a = document.createElement('a');
  a.href = url;
  a.download = `포근마을-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  tone(1800, 0.05, 'square', 0.08); noise(0.12, 4000, 0.15, 'highpass');
  $('photoFlash').classList.remove('go'); void $('photoFlash').offsetWidth; $('photoFlash').classList.add('go');
}
modes.photo = {
  key(code) {
    if (code === 'Escape' || code === 'KeyP') endPhoto();
    else if (code === 'Space' || code === 'Enter') takePhoto();
  },
  update(dt) {
    if (down('ArrowLeft', 'KeyA')) PH.yaw -= dt * 1.6;
    if (down('ArrowRight', 'KeyD')) PH.yaw += dt * 1.6;
    if (down('ArrowUp', 'KeyW')) PH.pitch = clamp(PH.pitch + dt * 0.9, 0.05, 1.4);
    if (down('ArrowDown', 'KeyS')) PH.pitch = clamp(PH.pitch - dt * 0.9, 0.05, 1.4);
    if (down('KeyQ', 'Minus', 'NumpadSubtract')) PH.dist = clamp(PH.dist + dt * 12, 3, 40);
    if (down('KeyR', 'Equal', 'NumpadAdd')) PH.dist = clamp(PH.dist - dt * 12, 3, 40);
    animateCreature(player, false, 0, dt, elapsed);
  },
  camera(p) {
    const c = Math.cos(PH.pitch) * PH.dist, h = Math.sin(PH.pitch) * PH.dist;
    return { pos: tmpCamPos.set(p.x + Math.sin(PH.yaw) * c, p.y + 1.2 + h, p.z + Math.cos(PH.yaw) * c), target: tmpCamTarget.set(p.x, p.y + 1.2, p.z), fov: 45, speed: 8, lookSpeed: 10 };
  },
};
playKeyHooks.push((code) => { if (code === 'KeyP') { startPhoto(); return true; } return false; });
