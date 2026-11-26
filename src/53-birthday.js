/* =========================================================
   🎂 친구 생일 — 생일날엔 고깔모자를 쓰고 있어요
   생일에 선물하면 호감도가 두 배로 올라요
   ========================================================= */
const FRIEND_BDAY = { 모모: [0, 2], 콩이: [1, 3], 보리: [2, 1], 솜이: [3, 2], 두부: [1, 1] }; // [계절, 날]
const bdayText = (name) => { const [s, d] = FRIEND_BDAY[name]; return `${SEASONS[s].emoji} ${SEASONS[s].name} ${d}일`; };
const isBirthday = (name) => { const b = FRIEND_BDAY[name]; return !!b && b[0] === S.season && b[1] === S.seasonDay; };
const partyHats = {};
function refreshBirthdays() {
  for (const n of npcs) {
    if (!partyHats[n.name]) {
      const g = new THREE.Group();
      const hat = add(new THREE.ConeGeometry(0.32, 0.7, 14), toon({ map: stripeTexture('#ff8fb1', '#ffd166', 8) }), 0, 0.3, 0, g);
      add(new THREE.SphereGeometry(0.1, 8, 6), 0xffffff, 0, 0.68, 0, g, false);
      g.rotation.z = 0.15;
      n.c.hatSlot.add(g);
      partyHats[n.name] = g;
    }
    partyHats[n.name].visible = isBirthday(n.name);
  }
}
NEW_DAY_HOOKS.push(() => {
  refreshBirthdays();
  const b = npcs.find((n) => isBirthday(n.name));
  if (b) setTimeout(() => { sfx.fanfare(); toast(`🎂 오늘은 ${b.name}의 생일이에요! 선물을 주면 아주 기뻐할 거예요`, 4.5); }, 4800);
});
