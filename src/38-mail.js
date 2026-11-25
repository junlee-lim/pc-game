/* =========================================================
   📮 마을 우체통 — 친구들의 부탁 · 선물하기
   ========================================================= */
const MAILBOX = { x: -3.4, z: 7.4 };
const mailFlag = new THREE.Group();
{
  const g = new THREE.Group();
  g.position.set(MAILBOX.x, 0, MAILBOX.z);
  g.rotation.y = -0.5;
  scene.add(g);
  add(new THREE.CylinderGeometry(0.1, 0.12, 1.2, 8), 0xb07a56, 0, 0.6, 0, g);
  const box = add(new THREE.CylinderGeometry(0.42, 0.42, 1.1, 16, 1, false, 0, Math.PI), 0xff6f6f, 0, 1.5, 0, g);
  box.rotation.z = Math.PI / 2;
  add(new THREE.BoxGeometry(1.1, 0.42, 0.84), 0xff6f6f, 0, 1.3, 0, g);
  add(new THREE.BoxGeometry(0.05, 0.5, 0.6), 0xfff1df, 0.56, 1.35, 0, g, false);
  mailFlag.position.set(-0.3, 1.4, 0.45);
  g.add(mailFlag);
  add(new THREE.BoxGeometry(0.04, 0.6, 0.04), 0x6a4c3f, 0, 0.3, 0, mailFlag, false);
  add(new THREE.BoxGeometry(0.3, 0.2, 0.03), 0xffd166, 0.15, 0.5, 0, mailFlag, false);
  collide(MAILBOX.x, MAILBOX.z, 0.8);
}
ZONE_LABELS.push(['📮 우체통', MAILBOX.x, 3.3, MAILBOX.z]);

const BAG_INFO = () => ({ melon: { name: '수박', emoji: '🍉' }, ...Object.fromEntries(Object.entries(FOODS).map(([k, f]) => [k, { name: f.name, emoji: f.emoji }])) });
let pendingLetter = null;
function makeLetter() {
  const npc = pick(npcs).name;
  const kinds = [
    () => { const k = pick(Object.keys(FOODS)); const f = FOODS[k]; return { type: 'food', key: k, text: `먹자골목 ${f.name}이(가) 너무 먹고 싶어… 하나만 포장해서 가져다줄래? ${f.emoji}`, short: `${f.emoji} ${f.name} 포장해서 전해주기` }; },
    () => ({ type: 'melon', key: 'melon', text: '해바라기 미로 어딘가에 수박이 숨어 있대! 하나 가져다줄 수 있어? 🍉', short: '🍉 수박 전해주기' }),
    () => { const f = pick(FISH.filter((x) => !['boot', 'rainbow', 'jelly'].includes(x.id))); return { type: 'fish', key: f.id, base: S.fishDex[f.id] || 0, text: `선착장에서 ${f.emoji} ${f.name}을(를) 낚으면 나한테 보여줘! 꼭 보고 싶어~`, short: `${f.emoji} ${f.name} 낚아서 보여주기` }; },
    () => { const avail = BUGS.filter((b) => b.when()); const b = pick(avail.length ? avail : BUGS); return { type: 'bug', key: b.id, base: S.bugDex[b.id] || 0, text: `${b.emoji} ${b.name}을(를) 잡아서 보여줄래? (${b.hint}에서 볼 수 있대)`, short: `${b.emoji} ${b.name} 잡아서 보여주기` }; },
  ];
  return { npc, reward: Math.floor(rr(6, 10)), ...pick(kinds)() };
}
function questReady(q) {
  if (!q) return false;
  if (q.type === 'food' || q.type === 'melon') return (S.bag[q.key] || 0) > 0;
  if (q.type === 'fish') return (S.fishDex[q.key] || 0) > q.base;
  if (q.type === 'bug') return (S.bugDex[q.key] || 0) > q.base;
  return false;
}
function openMailbox() {
  sfx.ok();
  const q = S.quest;
  if (q) {
    openMenu({
      title: '📮 진행 중인 부탁',
      desc: () => `<b>${q.npc}</b>의 편지: "${q.text}"<br>${questReady(q) ? `✅ 준비 완료! ${q.npc}에게 말을 걸어 전해 주세요.` : '아직 준비가 덜 됐어요.'}`,
      items: () => [
        { label: '알겠어요!', act: () => false },
        { label: '이 부탁은 포기할래요', act: () => { S.quest = null; persist(); toast('부탁을 취소했어요. 우체통에 새 편지가 올 거예요'); return false; } },
      ],
    });
    return;
  }
  if (!pendingLetter) pendingLetter = makeLetter();
  const L = pendingLetter;
  openMenu({
    title: '📮 편지가 왔어요!',
    desc: () => `<b>${L.npc}</b>: "${L.text}"<br>보답: 🪙 ${L.reward}개`,
    items: () => [
      { label: '부탁 들어주기 💌', act: () => { S.quest = L; pendingLetter = null; persist(); sfx.ding(); toast(`💌 ${L.npc}의 부탁을 받았어요!`); return false; } },
      { label: '다른 편지 보기', act: () => { pendingLetter = makeLetter(); setTimeout(openMailbox, 0); return false; } },
      { label: '다음에 할게요', act: () => false },
    ],
  });
}
interact({ x: MAILBOX.x - 0.4, z: MAILBOX.z + 1.6, r: 1.8, label: '우체통 열어 보기 📮', action: () => openMailbox() });
tickers.push(() => { mailFlag.rotation.z = S.quest ? -Math.PI / 2 : Math.sin(elapsed * 3) * 0.1; });

function completeQuest(npc) {
  const q = S.quest;
  if (q.type === 'food' || q.type === 'melon') bagAdd(q.key, -1);
  S.coins += q.reward;
  S.questsDone++;
  S.quest = null;
  persist();
  sfx.fanfare();
  const p = npc.c.root.position;
  sparkle(p.x, p.y + 2, p.z, new THREE.Color(0xff8fb1), 40);
  say(npc.c, pick(['우와, 진짜 고마워! 최고야 💖', '정말? 너무 기뻐! 고마워~ 🥰', '역시 넌 믿음직해! 💕']), 3.4, npc.name);
  toast(`💌 부탁 완료! 🪙 ${q.reward}개를 받았어요 (지금까지 ${S.questsDone}번 도와줬어요)`, 3.5);
}
function giveGift(npc, key) {
  const info = BAG_INFO()[key];
  bagAdd(key, -1);
  S.coins += 2;
  persist();
  sfx.ding();
  const p = npc.c.root.position;
  sparkle(p.x, p.y + 2, p.z, new THREE.Color(0xff8fb1), 24);
  say(npc.c, `${info.emoji} ${info.name}? 나 주는 거야? 고마워~! 💕`, 3.2, npc.name);
  toast(`🎁 ${npc.name}에게 ${info.name}을(를) 선물했어요! 답례로 🪙 2개`);
}
talkHooks.push((npc) => {
  const q = S.quest;
  if (q && q.npc === npc.name) {
    if (questReady(q)) { completeQuest(npc); return true; }
    say(npc.c, `${q.short.replace(/(전해주기|보여주기)$/, '')}… 기다리고 있을게! 😊`, 3, npc.name);
    return true;
  }
  const bagKeys = Object.keys(S.bag).filter((k) => S.bag[k] > 0 && !(q && q.key === k));
  if (!bagKeys.length) return false;
  const info = BAG_INFO();
  openMenu({
    title: `💬 ${npc.name}`,
    desc: () => '무엇을 할까요?',
    items: () => [
      { label: '이야기하기', act: () => { setTimeout(() => npcChat(npc), 0); return false; } },
      ...bagKeys.filter((k) => S.bag[k] > 0).map((k) => ({ label: `${info[k].emoji} ${info[k].name} 선물하기`, right: `가방에 ${S.bag[k]}개`, act: () => { giveGift(npc, k); return false; } })),
      { label: '그만두기', act: () => false },
    ],
  });
  return true;
});

let lastStatus = '';
function updateStatusLines() {
  const q = S.quest;
  const qs = q ? `📮 ${q.npc}: ${q.short}${questReady(q) ? ' ✅' : ''}` : '';
  const info = BAG_INFO();
  const bs = Object.entries(S.bag).filter(([, n]) => n > 0).map(([k, n]) => `${info[k] ? info[k].emoji : '📦'}×${n}`).join(' ');
  const key = qs + '|' + bs + '|' + riding;
  if (key === lastStatus) return;
  lastStatus = key;
  $('questLine').textContent = qs;
  $('questLine').classList.toggle('hidden', !qs);
  $('bagLine').textContent = (bs ? `🎒 ${bs}` : '') + (riding ? '  🚲 자전거 타는 중' : '');
  $('bagLine').classList.toggle('hidden', !bs && !riding);
}
