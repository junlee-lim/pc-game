/* =========================================================
   🏠 월세 & 🔨 집 넓히기
   5일마다 아침에 월세가 나가요. 집이 넓을수록 월세도 올라요.
   ========================================================= */
const HOUSE_LEVELS = [
  null,
  { w: 13, d: 9, rent: 25, name: '아담한 방' },
  { w: 17, d: 11, rent: 45, name: '넓은 방', cost: 250, lv: 3 },
  { w: 21, d: 13, rent: 70, name: '커다란 방', cost: 600, lv: 6 },
];
const RENT_EVERY = 5;
function applyHouseLevel() {
  const H = HOUSE_LEVELS[roomData().houseLv] || HOUSE_LEVELS[1];
  ROOM.w = H.w; ROOM.d = H.d;
  roomShellBuild();
  refreshFurniture();
}
const rentDaysLeft = () => S.rentDue - S.dayCount;
NEW_DAY_HOOKS.push(() => {
  if (S.rentDue === null) S.rentDue = S.dayCount + RENT_EVERY;
  if (S.dayCount < S.rentDue) {
    if (rentDaysLeft() === 1) setTimeout(() => toast(`🏠 내일 아침에 월세 🪙${HOUSE_LEVELS[S.houseLv].rent}이(가) 나가요`, 3.4), 7500);
    return;
  }
  const rent = HOUSE_LEVELS[S.houseLv].rent;
  S.coins -= rent;
  S.rentDue = S.dayCount + RENT_EVERY;
  persist();
  setTimeout(() => {
    sfx.bell();
    toast(`🏠 월세 🪙${rent}이(가) 나갔어요. 다음 월세는 ${RENT_EVERY}일 뒤예요${S.coins < 0 ? ' (코인이 모자라 마이너스가 됐어요!)' : ''}`, 4.5);
  }, 9000);
});
function openExpand() {
  const next = HOUSE_LEVELS[S.houseLv + 1];
  sfx.ok();
  if (!next) { toast('🏠 이미 가장 넓은 집이에요!'); return; }
  openMenu({
    title: '🔨 집 넓히기',
    desc: () => `지금: ${HOUSE_LEVELS[S.houseLv].name} (월세 🪙${HOUSE_LEVELS[S.houseLv].rent})<br>다음: <b>${next.name}</b> — 공사비 🪙${next.cost} · 월세 🪙${next.rent} · 레벨 ${next.lv} 필요<br>내 코인 🪙 ${S.coins} · 레벨 ${S.level}`,
    items: () => [
      { label: `🔨 ${next.name}으로 넓히기`, right: S.level < next.lv ? `🔒 Lv.${next.lv}` : `🪙${next.cost}`, dim: S.level < next.lv || S.coins < next.cost, act: () => {
        if (S.level < next.lv) { sfx.no(); toast(`레벨 ${next.lv}이 되면 넓힐 수 있어요 ⭐`); return true; }
        if (S.coins < next.cost) { sfx.no(); toast(`코인이 ${next.cost - S.coins}개 더 필요해요 🪙`); return true; }
        S.coins -= next.cost;
        S.houseLv++;
        persist();
        setTimeout(() => fadeThen(() => {
          applyHouseLevel();
          if (insideHouse && curRoom === ROOM && !roomOwner) { player.root.position.set(ROOM.x, 0, ROOM.z + ROOM.d / 2 - 1.2); houseCamera(player.root.position, camera.position, lookAt); }
          sfx.fanfare();
          addXP(30, '집 넓히기');
          toast(`🏠 뚝딱뚝딱~ ${next.name}이 되었어요! 가구를 넓게 배치해 보세요 (F)`, 4);
        }, 1200), 0);
        return false;
      } },
      { label: '다음에 할게요', act: () => false },
    ],
  });
}
