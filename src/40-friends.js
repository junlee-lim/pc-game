/* =========================================================
   💗 친구 호감도
   이야기하기 · 선물하기 · 부탁 들어주기 · 같이 산책하기로 친해져요.
   하트 5개가 되면 단짝!
   ========================================================= */
const FRIEND_INFO = {
  모모: {
    intro: '장난꾸러기 고양이', fav: 'fish', dislike: 'tteok',
    lines: [
      ['흥, 낯선 얼굴이네? …그래도 반가워.', '난 모모야. 생선… 아니 붕어빵 좋아해!'],
      ['또 왔어? 헤헤, 심심했는데 잘됐다!', '우리 숨바꼭질 할래? 내가 이길걸~'],
      ['너랑 노는 게 제일 재밌어! 😸', '오늘은 어디 가? 나도 데려가~'],
      ['넌 내 제일 친한 친구야. 비밀인데… 사실 나 겁이 많아.', '단짝이랑 보내는 하루는 언제나 반짝반짝해 ✨'],
    ],
  },
  콩이: {
    intro: '먹보 곰돌이', fav: 'tteok', dislike: 'cotton',
    lines: [
      ['어, 안녕! 혹시 먹을 거 있어? 헤헤…', '난 콩이! 매운 거 진짜 좋아해 🌶️'],
      ['떡볶이 냄새 맡았어? 나 지금 배고파~', '먹자골목 아줌마랑 나랑 친해!'],
      ['너랑 먹으면 뭐든 두 배로 맛있어! 😋', '다음엔 같이 먹자골목 가자!'],
      ['내 마지막 떡 하나… 너한테 줄게. 진심이야!', '넌 맛있는 것보다 소중한 친구야 🐻💕'],
    ],
  },
  보리: {
    intro: '수줍은 토끼', fav: 'cotton', dislike: 'tteok',
    lines: [
      ['아, 안녕… (귀가 쫑긋)', '나, 나는 보리야… 잘 부탁해.'],
      ['오늘 구름이 솜사탕 같다… 그치?', '너랑 얘기하면 덜 떨려.'],
      ['네가 오면 귀가 저절로 쫑긋해져 🐰', '같이 구름 구경할래?'],
      ['예전엔 말 거는 것도 무서웠는데… 이젠 네가 제일 편해.', '우리 오래오래 친구 하자 💗'],
    ],
  },
  솜이: {
    intro: '새침한 흰 고양이', fav: 'bingsu', dislike: 'fish',
    lines: [
      ['…뭐야? 털 망가지니까 너무 가까이 오지 마.', '난 솜이. 시원한 게 좋아.'],
      ['흠, 오늘은 좀 봐줄게.', '빙수 먹을 때 팥 많이 넣는 편이야? 나도.'],
      ['너라면… 쓰다듬어도 괜찮아. 조금만!', '오늘 같이 있어 줘서 고마워.'],
      ['다른 애들한텐 비밀이야. 넌 특별해.', '단짝이니까, 내 빙수 한 입 줄게 🍧'],
    ],
  },
  두부: {
    intro: '느긋한 곰', fav: 'melon', dislike: 'bingsu',
    lines: [
      ['하암… 안녕~ 나는 두부야.', '천천히 가도 괜찮아~'],
      ['수박 먹고 낮잠 자는 게 최고지~', '바람 소리 들려? 좋다…'],
      ['너랑 있으면 마음이 말랑말랑해져~', '같이 해먹에 누워 있고 싶다…'],
      ['서두르지 않아도 넌 이미 최고의 친구야.', '오늘도 내 옆에 있어 줘서 고마워~ 🍉'],
    ],
  },
};
const HEART_STEPS = [0, 10, 25, 45, 70, 100];
const friendPts = (name) => S.friends[name] || 0;
const friendLv = (name) => HEART_STEPS.filter((t) => friendPts(name) >= t).length - 1;
const heartsStr = (name) => '❤️'.repeat(friendLv(name)) + '🤍'.repeat(5 - friendLv(name));
const dayKey = () => `${S.season}-${S.seasonDay}-${tod > 1.5 ? 'n' : 'd'}`;
const bagName = (k) => { const i = BAG_INFO()[k]; return i ? `${i.emoji} ${i.name}` : k; };

function addFriendship(npc, n) {
  const before = friendLv(npc.name);
  S.friends[npc.name] = clamp(friendPts(npc.name) + n, 0, 100);
  persist();
  const after = friendLv(npc.name);
  const p = npc.c.root.position;
  if (n >= 4) sparkle(p.x, p.y + 2.2, p.z, new THREE.Color(0xff8fb1), 10 + n);
  if (after > before) setTimeout(() => friendLevelUp(npc, after), 1200);
}
function friendLevelUp(npc, lv) {
  const name = npc.name, info = FRIEND_INFO[name];
  sfx.fanfare();
  const p = npc.c.root.position;
  sparkle(p.x, p.y + 2.2, p.z, new THREE.Color(0xff6f91), 50);
  let msg = `💗 ${name}와 더 친해졌어요! ${heartsStr(name)}`;
  if (lv === 2) {
    S.favKnown[name] = true;
    S.coins += 5;
    msg += ` · ${name}는 ${bagName(info.fav)}을(를) 제일 좋아한대요 (+5🪙)`;
  } else if (lv === 3) {
    msg += ' · 이제 "같이 산책하자"로 함께 걸을 수 있어요!';
  } else if (lv === 4) {
    S.coins += 10;
    msg += ` · ${name}가 고맙다며 🪙 10개를 줬어요`;
  } else if (lv === 5) {
    if (!S.owned.includes('bffheart')) {
      S.owned.push('bffheart');
      S.equipped.face = 'bffheart';
      refreshEquip();
      msg = `🎉 ${name}와 단짝이 되었어요! 💗 단짝 하트 스티커를 받았어요`;
    } else {
      S.coins += 10;
      msg = `🎉 ${name}와 단짝이 되었어요! (+10🪙)`;
    }
  }
  persist();
  toast(msg, 4.5);
  say(npc.c, ['', '우리 좀 친해진 것 같아! 😊', '있잖아… 너 좋은 친구야!', '같이 산책 갈래? 🚶', '너한테 고마운 게 많아 💕', '이제 우린 단짝이야! 💗💗'][lv], 3.5, npc.name);
}

// 친구다운 한마디
function friendLine(npc) {
  const info = FRIEND_INFO[npc.name];
  if (!info || Math.random() < 0.4) { npcChat(npc); return; }
  const tier = [0, 0, 1, 2, 2, 3][friendLv(npc.name)];
  say(npc.c, pick(info.lines[tier]), 3.6, npc.name);
}
function chatWith(npc) {
  friendLine(npc);
  if (S.friendDay[npc.name] !== dayKey()) {
    S.friendDay[npc.name] = dayKey();
    addFriendship(npc, 4);
  }
}
function giveGiftTo(npc, key) {
  const info = FRIEND_INFO[npc.name];
  bagAdd(key, -1);
  const seasonal = (FOODS[key] && (FOODS[key].seasonal || FOODS[key].island)) || !!EXTRA_BAG[key];
  const firstToday = S.giftDay[npc.name] !== dayKey();
  S.giftDay[npc.name] = dayKey();
  let pts, line;
  if (key === info.fav) {
    pts = 15; S.favKnown[npc.name] = true;
    line = `꺄아! ${bagName(key)}! 내가 세상에서 제일 좋아하는 거야!! 💖`;
    sfx.fanfare();
  } else if (key === info.dislike) {
    pts = 2;
    line = `아… ${bagName(key)}… 고, 고마워… (별로 안 좋아하나 봐요)`;
    sfx.select();
  } else {
    pts = seasonal ? 11 : 8;
    line = seasonal ? (EXTRA_BAG[key] ? `${bagName(key)}! 다른 섬에서 가져온 거야? 신기하다~ 고마워 ✨` : `${bagName(key)}! 여기선 쉽게 못 먹는 거잖아! 고마워 ✨`) : `${bagName(key)}? 나 주는 거야? 고마워~ 💕`;
    sfx.ding();
  }
  if (!firstToday) { pts = Math.min(pts, 3); line += ' (오늘 벌써 선물 받았는데…!)'; }
  S.coins += 1;
  persist();
  say(npc.c, line, 3.6, npc.name);
  addFriendship(npc, pts);
}

/* ---------- 같이 산책하기 ---------- */
let follower = null;
function setFollower(npc) {
  if (follower) { follower.follow = false; follower.target = null; follower.wait = 2; }
  follower = npc;
  if (npc) {
    npc.follow = true;
    npc.walkT = 0;
    say(npc.c, pick(['좋아! 어디 갈까? 🚶', '같이 가자~!', '두근두근, 산책이다!']), 2.6, npc.name);
    toast(`🚶 ${npc.name}와 함께 걷는 중이에요. 다시 말을 걸면 헤어질 수 있어요`, 3.4);
  }
}
const followV = new THREE.Vector3();
function updateFollower(n, dt) {
  const r = n.c.root, pp = player.root.position;
  if (insideHouse || ['fishing', 'bath', 'ride', 'nap'].includes(state)) return { moving: false };
  // 너무 멀어지면 (순간이동 등) 플레이어 뒤로 따라와요
  const ang = player.root.rotation.y;
  followV.set(pp.x - Math.sin(ang) * 1.8 + Math.cos(ang) * 0.9, 0, pp.z - Math.cos(ang) * 1.8 - Math.sin(ang) * 0.9);
  const dx = followV.x - r.position.x, dz = followV.z - r.position.z, d = Math.hypot(dx, dz);
  if (d > 30) { r.position.copy(followV); return { moving: false }; }
  if (d < 0.5) {
    r.rotation.y = lerpAngle(r.rotation.y, Math.atan2(pp.x - r.position.x, pp.z - r.position.z), damp(6, dt));
    return { moving: false };
  }
  const sp = Math.min(d * 3, riding ? 14 : 10);
  r.position.x += (dx / d) * sp * dt;
  r.position.z += (dz / d) * sp * dt;
  resolve(r.position, 0.6, false);
  r.rotation.y = lerpAngle(r.rotation.y, Math.atan2(dx, dz), damp(8, dt));
  // 함께 걸은 시간만큼 조금씩 친해져요
  n.walkT = (n.walkT || 0) + dt;
  if (n.walkT > 45) {
    n.walkT = 0;
    addFriendship(n, 2);
    say(n.c, pick(['같이 걸으니까 좋다~', '헤헤, 재밌다!', '다음엔 어디 갈까?', '바람이 시원해~']), 2.4, n.name);
  }
  return { moving: true, speed: sp };
}

/* ---------- 대화 메뉴 ---------- */
talkHooks.push((npc) => {
  const lv = friendLv(npc.name);
  const bagKeys = Object.keys(S.bag).filter((k) => S.bag[k] > 0 && !(S.quest && S.quest.key === k && S.quest.npc !== npc.name));
  const canWalk = lv >= 3;
  if (!bagKeys.length && !canWalk && follower !== npc) { chatWith(npc); return true; }
  const info = FRIEND_INFO[npc.name];
  openMenu({
    title: `💬 ${npc.name} ${heartsStr(npc.name)}`,
    desc: () => `${info.intro} · 좋아하는 것: ${S.favKnown[npc.name] ? bagName(info.fav) : '???'}`,
    items: () => [
      { label: '이야기하기', act: () => { setTimeout(() => chatWith(npc), 0); return false; } },
      ...bagKeys.filter((k) => S.bag[k] > 0).map((k) => ({
        label: `${bagName(k)} 선물하기`, right: `가방에 ${S.bag[k]}개`,
        act: () => { setTimeout(() => giveGiftTo(npc, k), 0); return false; },
      })),
      ...(follower === npc
        ? [{ label: '👋 이제 헤어지자', act: () => { say(npc.c, '오늘 즐거웠어! 또 같이 걷자~', 2.6, npc.name); setFollower(null); return false; } }]
        : canWalk ? [{ label: '🚶 같이 산책하자', right: follower ? `(${follower.name}와는 헤어져요)` : '', act: () => { setTimeout(() => setFollower(npc), 0); return false; } }] : []),
      { label: '그만두기', act: () => false },
    ],
  });
  return true;
});

/* ---------- 반가운 인사 ---------- */
tickers.push((dt) => {
  if (state !== 'play' || insideHouse) return;
  const pp = player.root.position;
  for (const n of npcs) {
    n.greetCool = (n.greetCool || 0) - dt;
    const d = Math.hypot(n.c.root.position.x - pp.x, n.c.root.position.z - pp.z);
    if (n.follow || friendLv(n.name) < 2) continue;
    if (d < 4.5 && n.greetCool <= 0) {
      n.greetCool = 40;
      n.hop = 0.5;
      say(n.c, friendLv(n.name) >= 4 ? pick(['💗', '와아, 왔구나! 💕', '보고 싶었어!']) : pick(['안녕~! 👋', '어, 너다!', '😊']), 2, n.name);
    }
    if (n.hop > 0) { n.hop -= dt; n.c.body.position.y = Math.sin((n.hop / 0.5) * Math.PI) * 0.5; }
  }
});

/* ---------- 친구 수첩 (K) ---------- */
function openFriendBook() {
  sfx.ok();
  const best = npcs.filter((n) => friendLv(n.name) >= 5).length;
  openMenu({
    title: '📒 친구 수첩',
    desc: () => `하루에 한 번 이야기하기, 선물, 부탁, 산책으로 친해져요. 단짝 ${best}/${npcs.length}<br>하트 2: 좋아하는 것 알기 · 하트 3: 같이 산책 · 하트 5: 단짝!`,
    items: () => [
      ...npcs.map((n) => {
        const info = FRIEND_INFO[n.name];
        return {
          label: `${n.name} <span style="font-size:14px;color:#9a7d6e">${info.intro}${S.favKnown[n.name] ? ` · 좋아함 ${bagName(info.fav)}` : ''}${n.follow ? ' · 🚶 산책 중' : ''}</span>`,
          right: heartsStr(n.name),
          act: () => true,
        };
      }),
      { label: '닫기', act: () => false },
    ],
  });
}
playKeyHooks.push((code) => { if (code === 'KeyK') { openFriendBook(); return true; } return false; });
