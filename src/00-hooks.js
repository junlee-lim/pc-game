/* =========================================================
   확장 포인트: 각 장소 파일이 여기에 자기 것을 등록해요
   ========================================================= */
const modes = {};        // state 이름 → { key(code), update(dt), camera(p) → {pos, target, fov, speed}, onExit() }
const tickers = [];      // 매 프레임 호출 (dt)
const ZONE_LABELS = [];  // [이름표, x, y, z]
const MAP_MARKS = [];    // [이모지, x, z]  미니맵 아이콘
const AVOID = [];        // [x, z, r]  나무·풀숲을 두지 않을 곳
const TREES = [];        // 나무 위치 (곤충이 사는 곳)
const talkHooks = [];    // (npc) → true 를 돌려주면 기본 대화 대신 처리
// 계절이 바꾸는 것들 (각 파일이 채워 넣어요)
const SEASONAL = { ground: null, hill: null, pondWater: null, bushes: null, flowers: [], petals: null, leaves: [] };
const CREATURES = [];
const ISLANDS = [];        // { id, name, emoji, x, z, r, hill? } — 0번은 포근섬(본섬)
const EXTRA_BAG = {};      // 음식이 아닌 가방 아이템 { key: { name, emoji } }
const HOUSE_GROUPS = [];
const BOUNCE_PADS = [];    // 통통 버섯 { x, z, r, h, m }   // 마을 집들 { g, x, z, rot }     // 겨울 목도리를 두를 동물 친구들
const SHOW_HUD_STATES = new Set(['play', 'menu']);
const playKeyHooks = []; // play 상태에서 눌린 키 (code) → true 면 처리됨
