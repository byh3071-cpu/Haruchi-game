/* 프로/기본 버전: body에 클래스 추가 (프로 전용 CSS/JS 분기용) */
if (window.IS_PRO) document.body?.classList.add('app-tier-pro');

/* 프레임 스킨 매핑 (이미지 경로는 실제 파일명에 맞게 준비되어 있어야 함) */
/* 현재 페이지 기준으로 경로 계산 (iframe에서도 정상 작동) */
function getAssetPath(relativePath) {
  try {
    return new URL(relativePath, window.location.href).href;
  } catch (e) {
    // URL 생성 실패 시 상대 경로 반환
    const base = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    return base + relativePath.replace(/^\.\//, '');
  }
}
const FRAME_THEMES = {
  classic: getAssetPath('./assets/scene/frame.png'),
  black: getAssetPath('./assets/scene/new_frame_black.png'),
  white: getAssetPath('./assets/scene/new_frame_white.png'),
  haruchi1: getAssetPath('./assets/scene/new_frame_haruchi_skin.png'),
  haruchi2: getAssetPath('./assets/scene/new_frame_haruchi_skin2.png')
};

/* 프로는 기본으로 하루치 컬러 스킨 1을 사용, 기본 버전은 기존 프레임 유지 */
const DEFAULT_FRAME_THEME = window.IS_PRO ? 'haruchi1' : 'classic';
let currentFrameTheme = (function () {
  try {
    return localStorage.getItem('haruchi_frame_theme') || DEFAULT_FRAME_THEME;
  } catch (e) {
    return DEFAULT_FRAME_THEME;
  }
})();
let frameSkinPickerInitialized = false;

/* 스킨별 버튼 이름 매핑 */
const BUTTON_LABELS = {
  black: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
  white: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
  haruchi1: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
  haruchi2: ['A', 'B', 'C', 'D'],
  classic: ['A', 'B', 'C', ''] // 기본 스킨은 D 버튼 없음
};

function applyFrameTheme(theme) {
  if (!FRAME_THEMES[theme]) theme = DEFAULT_FRAME_THEME;
  currentFrameTheme = theme;
  const img = document.getElementById('frameImg');
  if (img) {
    img.src = FRAME_THEMES[theme];
    img.style.width = '100%';
    img.style.height = 'auto';

    // 이미지 로드 실패 시 기본 프레임으로 폴백
    img.onerror = function () {
      console.warn('프레임 이미지 로드 실패:', FRAME_THEMES[theme]);
      this.src = getAssetPath('./assets/scene/frame.png');
    };
  }
  document.body.setAttribute('data-frame-theme', theme);
  try {
    localStorage.setItem('haruchi_frame_theme', theme);
  } catch (e) { }

  // 스킨별 버튼 이름 설정
  const labels = BUTTON_LABELS[theme] || BUTTON_LABELS.classic;
  const btnA = document.querySelector('.btn-a');
  const btnB = document.querySelector('.btn-b');
  const btnC = document.querySelector('.btn-c');
  const btnD = document.querySelector('.btn-d');

  if (btnA && labels[0]) btnA.title = labels[0];
  if (btnB && labels[1]) btnB.title = labels[1];
  if (btnC && labels[2]) btnC.title = labels[2];
  if (btnD && labels[3]) btnD.title = labels[3];

  const buttons = document.querySelectorAll('.frame-skin-btn');
  buttons.forEach(function (btn) {
    const t = btn.getAttribute('data-frame-theme');
    if (t === theme) btn.classList.add('is-active');
    else btn.classList.remove('is-active');
  });
}

/* 페이지 로드 시 프레임 이미지 초기화 */
function initFrameImage() {
  const img = document.getElementById('frameImg');
  if (img) {
    // src가 비어있거나 기본값이면 테마 적용
    if (!img.src || img.src.endsWith('/') || img.src === window.location.href) {
      applyFrameTheme(currentFrameTheme);
    }
  }
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    initFrameImage();
    initFrameSkinPicker();
  });
} else {
  // 이미 로드됨
  setTimeout(function () {
    initFrameImage();
    initFrameSkinPicker();
  }, 0);
}

function toggleFrameSettingsPanel(event) {
  if (!window.IS_PRO) return; // 프로가 아니면 동작 차단
  const panel = document.getElementById('frameSettingsPanel');
  if (!panel) return;
  if (event) event.stopPropagation();
  panel.classList.toggle('is-open');
}

/* 프레임 스킨 선택 패널 초기화 (오른쪽 상단 하루치 로고 클릭) */
function initFrameSkinPicker() {
  const panel = document.getElementById('frameSettingsPanel');
  const logo = document.getElementById('deviceLogo');
  if (!panel || !logo) return;
  if (frameSkinPickerInitialized) {
    applyFrameTheme(currentFrameTheme);
    return;
  }

  // 패널 내 버튼 클릭 → 스킨 변경 (data-frame-theme 속성이 있는 버튼만)
  panel.addEventListener('click', function (e) {
    const target = e.target.closest('.frame-skin-btn');
    if (!target) return;
    const theme = target.getAttribute('data-frame-theme');
    // data-frame-theme 속성이 있는 버튼만 스킨 변경 처리
    if (theme) {
      applyFrameTheme(theme);
    }
    // 그 외 버튼(그루밍 조정 등)은 onclick 핸들러가 처리하도록 이벤트 전파 허용
  });

  // 로고 클릭 → 패널 토글 (프로 버전에서만 동작)
  if (window.IS_PRO) {
    logo.style.cursor = 'pointer';
    logo.title = '스킨 설정';
    logo.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('is-open');
    });
  } else {
    logo.style.cursor = 'default';
    logo.title = '';
  }

  // 바깥 클릭 시 패널 닫기
  document.addEventListener('click', function (e) {
    if (!panel.classList.contains('is-open')) return;
    const isInside = panel.contains(e.target) || logo.contains(e.target);
    if (!isInside) panel.classList.remove('is-open');
  });
  frameSkinPickerInitialized = true;

  // 초기 테마 적용
  applyFrameTheme(currentFrameTheme);
}

/* ========== 노션 연동 로직 (전부 여기서 관리) ==========
 * [감지] head의 즉시실행: ?notion=1 또는 iframe 임베드 시 html.notion-embed 추가
 * [스타일] html.notion-embed: 배경 투명, 패널 여백 검정, 썸네일 미로딩
 * [진입] 노션 모드: startGame() 즉시 호출 → 오프닝 생략, 바로 게임
 * [XP] fetchAndApplyNotionXP(): /api/game?action=getXp 호출 → delta만 적용
 * [API] api/game.js: 노션 API 연동 (하루치 페이지 Rollup/XP로그 DB 합산)
 * [동기화] notion-sync/index.js: 소스 DB 완료 항목 → XP 로그 생성 (cron 실행)
 * 환경변수: NOTION_SETUP.md 참고
 * ======================================================== */
/* 노션 모드 감지: ?notion=1 파라미터 또는 iframe 임베드 */
const NOTION_ENABLED = typeof window !== 'undefined' && (
  document.documentElement.classList.contains('notion-embed') ||
  location.search.includes('notion=1') ||
  window.self !== window.top
);

/* 노션 모드가 감지되었지만 클래스가 없으면 추가 */
if (NOTION_ENABLED && !document.documentElement.classList.contains('notion-embed')) {
  document.documentElement.classList.add('notion-embed');
}

const hamster = document.getElementById('hamster');
const uiLevel = document.getElementById('uiLevel');

/* 첫 터치 시 오프닝 재생 (브라우저: 사용자 제스처일 때만 play 가능) */
function unmuteOpening() {
  var o = document.getElementById('openingBgm');
  var h = document.querySelector('.start-tap-hint');
  if (!o) return;
  o.muted = false;
  o.volume = 0.6;
  o.currentTime = 0;
  o.play().catch(function () { });
  if (h) h.classList.add('hidden');
}
/* 게임 시작: 오프닝 중지 → 게임 BGM 재생, 화면 전환 */
function startGame() {
  var opening = document.getElementById('openingBgm');
  var gameBgm = document.getElementById('gameBgm');
  if (opening) opening.pause();
  if (gameBgm) {
    gameBgm.volume = 0.6;
    gameBgm.currentTime = 0;
    gameBgm.play().catch(function () { });
  }
  var startScreen = document.getElementById('startScreen');
  var deviceWrapper = document.getElementById('deviceWrapper');
  startScreen.classList.add('hidden');
  deviceWrapper.style.display = 'flex';
  document.body.classList.add('opening-closed');
  setTimeout(function () {
    startScreen.style.display = 'none';
  }, 650);
  initFrameSkinPicker();
}
/* C 버튼: BGM 음소거 토글 */
function toggleBgmMute() {
  var g = document.getElementById('gameBgm');
  if (g) {
    g.muted = !g.muted;
    if (g.muted) log("🔇 BGM 음소거");
    else log("🔊 BGM 재생");
  }
}
const uiExp = document.getElementById('uiExp');
const expText = document.getElementById('expText');
const uiLog = document.getElementById('uiLog');

/* 로그 히스토리 (팝업용, 최대 200개) - category: 할일/루틴/운동/독서/SNS/목표보너스 | 밥먹기/물마시기/쓰다듬기 | 레벨업 | 기타 */
let logHistory = [];
const LOG_CATEGORY_TASK = ['할일', '루틴', '운동', '독서', '책', 'SNS', '목표보너스', '수동기록', '출석보너스'];
const LOG_CATEGORY_CLICK = ['밥먹기', '물마시기', '쓰다듬기'];

/* 일일 밥/물 횟수 (10회 이상 시 과다 반응), 밥 먹은 뒤 집 클릭 시 full_and_sleep */
const DAILY_EAT_DRINK_KEY = 'hamsterDailyEatDrink';
const MANUAL_TASK_KEY = 'hamsterManualTaskDaily';
const MANUAL_TASK_DAILY_LIMIT = 10;
const MANUAL_TASK_XP_CAP = 50;
const ATTENDANCE_REWARD_KEY = 'hamsterAttendanceRewardDate';
/* 스킨 & 쿠폰 - 응애 하루치 사전예약 한정 해금 */
const SKIN_KEY = 'hamsterSkin';
const COUPON_FOR_BABY = ['HELLO_BABY_HARUCHI']; /* 사전예약 마스터 키 (메일로 발송) */
/* 연속 출석 보상: 매일 10 XP + 마일스톤 (7일 50, 14일 100, 21일 150, 30일 300) */
const ATTENDANCE_DAILY_XP = 10;
const ATTENDANCE_MILESTONES = { 7: 50, 14: 100, 21: 150, 30: 300 };
const MAX_EAT_BEFORE_THROWUP = 10;
const MAX_DRINK_BEFORE_STOP = 10;
const JUST_ATE_WINDOW_MS = 15000; /* 밥 먹은 뒤 이 시간 안에 집 클릭 시 full_and_sleep */
let justAteAt = 0;

const EAT_DRINK_COOLDOWN_MS = 60000; /* 1분 쿨다운 */
function getDailyEatDrink() {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  try {
    const raw = localStorage.getItem(DAILY_EAT_DRINK_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.date === today) {
      return {
        date: today,
        eat: parsed.eat || 0,
        drink: parsed.drink || 0,
        eatCooldownUntil: parsed.eatCooldownUntil || 0,
        drinkCooldownUntil: parsed.drinkCooldownUntil || 0
      };
    }
  } catch (_) { }
  return { date: today, eat: 0, drink: 0, eatCooldownUntil: 0, drinkCooldownUntil: 0 };
}
function saveDailyEatDrink(obj) {
  localStorage.setItem(DAILY_EAT_DRINK_KEY, JSON.stringify(obj));
}

function getDailyManualTaskCount() {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  try {
    const raw = localStorage.getItem(MANUAL_TASK_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.date === today) return parsed.count || 0;
  } catch (_) { }
  return 0;
}
function saveDailyManualTaskCount(count) {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  localStorage.setItem(MANUAL_TASK_KEY, JSON.stringify({ date: today, count }));
}

/* 스킨 시스템 - 응애 하루치 해금 스킨 */
function getHamsterSkin() {
  try {
    const s = localStorage.getItem(SKIN_KEY);
    return (s === 'baby') ? 'baby' : 'normal';
  } catch (_) { return 'normal'; }
}
function setHamsterSkin(skin) {
  localStorage.setItem(SKIN_KEY, skin === 'baby' ? 'baby' : 'normal');
}
function getBaseHamsterSrc() {
  return getHamsterSkin() === 'baby'
    ? './assets/hamster/baby Haruchi.png'
    : './assets/hamster/normal.png';
}
function applyCoupon(code) {
  const raw = String(code || '').trim();
  const c = raw.toUpperCase();
  const valid = COUPON_FOR_BABY.some(k =>
    k.toUpperCase() === c || k === raw
  );
  if (valid) {
    setHamsterSkin('baby');
    const h = document.getElementById('hamster');
    if (h && !h.classList.contains('sleeping') && !h.classList.contains('drinking')) {
      h.src = getBaseHamsterSrc();
    }
    return { success: true, msg: '🎉 응애 하루치 스킨이 해금되었어요!' };
  }
  return { success: false, msg: '유효하지 않은 쿠폰이에요.' };
}
function submitCoupon() {
  const input = document.getElementById('couponInput');
  const code = input ? input.value.trim() : '';
  if (!code) {
    log('📌 쿠폰 번호를 입력해 주세요.', { kind: 'system' });
    return;
  }
  const result = applyCoupon(code);
  log(result.msg, { kind: result.success ? 'important' : 'system' });
  if (result.success) {
    if (input) input.value = '';
    showStats(false);
  }
}

function getMaxExp(level) {
  if (level <= 10) return 100;
  if (level <= 30) return 300;
  return 500;
}

function calculateLevelAndExp(totalExp) {
  let level = 1;
  let exp = totalExp;
  while (true) {
    const required = getMaxExp(level);
    if (exp >= required) {
      exp -= required;
      level++;
    } else {
      break;
    }
  }
  return { level, exp };
}

/* [수정] 시작 레벨 1, 경험치 0으로 초기화 */
let game = {
  level: 1,
  exp: 0,
  isBusy: false,
  lastActionTime: Date.now(), // 마지막 액션 시간 추적
  lastSadTime: 0, // 마지막 sad 표시 시간 (중복 방지)
  lastAngryTime: 0, // 마지막 angry 표시 시간 (중복 방지)
  lastGroomingTime: 0 // 마지막 그루밍 표시 시간 (중복 방지)
};

/* 통계 데이터 */
let stats = {
  totalActions: 0,
  totalExp: 0,
  playDays: new Set(),
  firstPlayDate: null,
  lastActionDate: null,
  consecutiveDays: 0
};

/* 일일 목표 데이터 */
let dailyGoal = {
  date: null,
  target: 5, // 기본 목표: 5개
  completed: 0,
  achieved: false // 오늘 목표 달성 여부
};


/* 노션 XP 불러오기 (?notion=1 모드 전용) - 악용 방지: 증가분만 적용 */
async function fetchAndApplyNotionXP() {
  if (!NOTION_ENABLED) return;
  try {
    const base = window.location.origin;
    const res = await fetch(base + '/api/game?action=getXp');
    const data = await res.json();
    const notionTotal = parseInt(data.totalExp, 10) || 0;
    if (notionTotal <= 0) return;
    const delta = Math.max(0, notionTotal - stats.totalExp);
    if (delta > 0) {
      stats.totalExp += delta;
      const prevLevel = game.level;
      const calc = calculateLevelAndExp(stats.totalExp);
      game.level = calc.level;
      game.exp = calc.exp;
      saveStats();
      updateUI();
      if (game.level > prevLevel) {
        logLevelUp(`⭐ 노션 동기화! LV.${game.level} ⭐`);
        showLevelUpEffect();
      } else {
        log(`📥 노션에서 +${delta} XP 불러옴`, { category: '노션동기화', xp: delta });
      }
    }
  } catch (e) {
    console.warn('노션 XP 불러오기 실패:', e);
  }
}

/* 노션 완료 로그 불러오기 - 시스템 로그에 할일/루틴/운동/독서/SNS 완료 기록 표시 */
async function fetchAndMergeNotionLogs() {
  if (!NOTION_ENABLED) return;
  try {
    const base = window.location.origin;
    const res = await fetch(base + '/api/game?action=getLogs');
    const data = await res.json();
    const logs = data.logs || [];
    const seen = new Set(logHistory.map(e => `${e.msg}|${e.date || ''}`));
    for (const l of logs) {
      const msg = l.xp > 0 ? `${l.title} +${l.xp} XP` : l.title;
      const key = `${msg}|${l.date || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      addToLogHistory(msg, 'normal', l.type, l.xp, l.date);
    }
  } catch (e) {
    console.warn('노션 로그 불러오기 실패:', e);
  }
}

/* 통계 초기화 - 로컬 경험치(물/밥/쓰다듬기 등)로 레벨·EXP 복원 */
function initStats() {
  const saved = localStorage.getItem('hamsterStats');
  if (saved) {
    const parsed = JSON.parse(saved);
    stats = {
      totalActions: parsed.totalActions || 0,
      totalExp: parsed.totalExp || 0,
      playDays: new Set(parsed.playDays || []),
      firstPlayDate: parsed.firstPlayDate || null,
      lastActionDate: parsed.lastActionDate || null,
      consecutiveDays: parsed.consecutiveDays || 0
    };
    /* 저장된 총 경험치로 레벨/EXP 복원 */
    if (stats.totalExp > 0) {
      const calc = calculateLevelAndExp(stats.totalExp);
      game.level = calc.level;
      game.exp = calc.exp;
    }
  }

  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  if (!stats.firstPlayDate) {
    stats.firstPlayDate = today;
  }
  stats.playDays.add(today);
  saveStats();
}

/* 일일 목표 초기화 */
function initDailyGoal() {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  const saved = localStorage.getItem('hamsterDailyGoal');

  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.date === today) {
      // 같은 날이면 복원
      dailyGoal = {
        date: parsed.date,
        target: parsed.target || 5,
        completed: parsed.completed || 0,
        achieved: parsed.achieved || false
      };
    } else {
      // 새 날이면 리셋
      dailyGoal = {
        date: today,
        target: parsed.target || 5, // 목표는 유지
        completed: 0,
        achieved: false
      };
      saveDailyGoal();
    }
  } else {
    dailyGoal = {
      date: today,
      target: 5,
      completed: 0,
      achieved: false
    };
    saveDailyGoal();
  }

  updateGoalUI();
}

/* 일일 목표 저장 */
function saveDailyGoal() {
  localStorage.setItem('hamsterDailyGoal', JSON.stringify(dailyGoal));
}

/* 목표 UI 업데이트 */
function updateGoalUI() {
  const goalProgress = document.getElementById('goalProgress');
  const goalPercent = document.getElementById('goalPercent');

  if (goalProgress && goalPercent) {
    const percent = dailyGoal.target > 0
      ? Math.min(Math.floor((dailyGoal.completed / dailyGoal.target) * 100), 100)
      : 0;

    // 더 간결한 표시: "3/5 60%"
    goalProgress.textContent = `${dailyGoal.completed}/${dailyGoal.target}`;
    goalPercent.textContent = `${percent}%`;

    // 목표 달성 시 색상 변경
    if (dailyGoal.achieved || dailyGoal.completed >= dailyGoal.target) {
      goalProgress.style.color = '#ffcc00';
      goalPercent.style.color = '#ffcc00';
    } else {
      goalProgress.style.color = '#ffffff';
      goalPercent.style.color = '#ffffff';
    }
  }
}

/* 통계 저장 */
function saveStats() {
  localStorage.setItem('hamsterStats', JSON.stringify({
    ...stats,
    playDays: Array.from(stats.playDays)
  }));
}

/* 연속 출석 보상 (오늘 1회만) */
function applyAttendanceReward() {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  try {
    const last = localStorage.getItem(ATTENDANCE_REWARD_KEY);
    if (last === today) return;
  } catch (_) { }
  if (stats.consecutiveDays < 1) return;

  let xp = ATTENDANCE_DAILY_XP;
  const bonus = ATTENDANCE_MILESTONES[stats.consecutiveDays];
  if (bonus) xp += bonus;

  stats.totalExp += xp;
  game.exp += xp;
  while (game.exp >= getMaxExp(game.level)) {
    game.exp -= getMaxExp(game.level);
    game.level++;
    logLevelUp(`⭐ LEVEL UP! LV.${game.level} ⭐`);
    showLevelUpEffect();
  }
  saveStats();
  localStorage.setItem(ATTENDANCE_REWARD_KEY, today);

  const msg = bonus
    ? `📅 연속 ${stats.consecutiveDays}일 출석! +${xp} XP (보너스 +${bonus})`
    : `📅 연속 ${stats.consecutiveDays}일 출석! +${xp} XP`;
  log(msg, { category: '출석보너스', xp });
  updateUI();
  updateGoalUI();
}

/* 통계 업데이트 (액션 시) - countsTowardGoal: 할일/루틴/독서/책형/운동/SNS만 true, 물·밥·쓰다듬기는 false */
function updateStats(expGained, countsTowardGoal = false) {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

  stats.totalActions++;
  stats.totalExp += expGained;
  stats.playDays.add(today);

  // 연속 플레이 일수 계산
  if (stats.lastActionDate) {
    const lastDate = new Date(stats.lastActionDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      stats.consecutiveDays++;
    } else if (diffDays > 1) {
      stats.consecutiveDays = 1;
    }
  } else {
    stats.consecutiveDays = 1;
  }

  stats.lastActionDate = today;
  saveStats();

  /* 연속 출석 보상: 오늘 첫 액션 시 1회만 (10 XP + 마일스톤) */
  applyAttendanceReward();

  // 일일 목표: 할일/루틴/독서세션/책형/운동/SNS만 카운트 (물·밥·쓰다듬기 제외)
  if (expGained > 0 && countsTowardGoal) {
    if (dailyGoal.date !== today) {
      dailyGoal = {
        date: today,
        target: dailyGoal.target,
        completed: 0,
        achieved: false
      };
    }

    dailyGoal.completed++;
    saveDailyGoal();

    if (!dailyGoal.achieved && dailyGoal.completed >= dailyGoal.target) {
      dailyGoal.achieved = true;
      saveDailyGoal();
      showGoalAchievedEffect();
      const bonusExp = Math.floor(expGained * 0.5);
      log(`🎯 목표 달성! 보너스 +${bonusExp} EXP`, { category: '목표보너스', xp: bonusExp });
      game.exp += bonusExp;
      while (game.exp >= getMaxExp(game.level)) {
        game.exp -= getMaxExp(game.level);
        game.level++;
        logLevelUp(`⭐ LEVEL UP! LV.${game.level} ⭐`);
        showLevelUpEffect();
      }
      updateUI();
    }

    updateGoalUI();
  }
}

/* 저장된 throw up/stop drink/throw up 2/full_and_sleep 위치·크기 적용 (localStorage) */
function loadSavedImagePositions() {
  const root = document.documentElement;
  try {
    let raw = localStorage.getItem('hamsterBtnTestAdjust');
    if (raw) {
      const o = JSON.parse(raw);
      if (o.left != null) root.style.setProperty('--btn-test-left', String(o.left).includes('%') ? o.left : o.left + '%');
      if (o.top != null) root.style.setProperty('--btn-test-top', String(o.top).includes('%') ? o.top : o.top + '%');
      if (o.width != null) root.style.setProperty('--btn-test-width', String(o.width).includes('px') ? o.width : o.width + 'px');
      if (o.height != null) root.style.setProperty('--btn-test-height', String(o.height).includes('px') ? o.height : o.height + 'px');
    }
    raw = localStorage.getItem('hamsterBtnTestStopDrinkAdjust');
    if (raw) {
      const o = JSON.parse(raw);
      if (o.left != null) root.style.setProperty('--btn-test-stopdrink-left', String(o.left).includes('%') ? o.left : o.left + '%');
      if (o.top != null) root.style.setProperty('--btn-test-stopdrink-top', String(o.top).includes('%') ? o.top : o.top + '%');
      if (o.width != null) root.style.setProperty('--btn-test-stopdrink-width', String(o.width).includes('px') ? o.width : o.width + 'px');
      if (o.height != null) root.style.setProperty('--btn-test-stopdrink-height', String(o.height).includes('px') ? o.height : o.height + 'px');
    }
    raw = localStorage.getItem('hamsterBtnTestThrowUp2Adjust');
    if (raw) {
      const o = JSON.parse(raw);
      if (o.left != null) root.style.setProperty('--btn-test-throwup2-left', String(o.left).includes('%') ? o.left : o.left + '%');
      if (o.top != null) root.style.setProperty('--btn-test-throwup2-top', String(o.top).includes('%') ? o.top : o.top + '%');
      if (o.width != null) root.style.setProperty('--btn-test-throwup2-width', String(o.width).includes('px') ? o.width : o.width + 'px');
      if (o.height != null) root.style.setProperty('--btn-test-throwup2-height', String(o.height).includes('px') ? o.height : o.height + 'px');
    }
    raw = localStorage.getItem('hamsterFullAndSleepAdjust');
    if (raw) {
      const o = JSON.parse(raw);
      if (o.left != null) root.style.setProperty('--full-and-sleep-left', String(o.left).includes('%') ? o.left : o.left + '%');
      if (o.top != null) root.style.setProperty('--full-and-sleep-top', String(o.top).includes('%') ? o.top : o.top + '%');
      if (o.width != null) root.style.setProperty('--full-and-sleep-width', String(o.width).includes('px') ? o.width : o.width + 'px');
      if (o.height != null) root.style.setProperty('--full-and-sleep-height', String(o.height).includes('px') ? o.height : o.height + 'px');
    }
    /* 로고 위치: :root CSS 변수 사용 */
  } catch (_) { }
}

function init() {
  initStats();
  initDailyGoal();
  const h = document.getElementById('hamster');
  if (h) h.src = getBaseHamsterSrc();
  updateUI();
  if (NOTION_ENABLED) {
    fetchAndApplyNotionXP();
    fetchAndMergeNotionLogs(); /* 노션 완료 로그 → 시스템 로그 */
    setInterval(fetchAndMergeNotionLogs, 60000); /* 60초마다 새 완료 로그 갱신 */
    setInterval(fetchAndApplyNotionXP, 60000); /* 60초마다 XP 자동 갱신 */
  }
  fitScale();
  window.addEventListener('resize', fitScale);
  loadSavedImagePositions();

  /* 초기 로그 히스토리 (팝업용) */
  if (logHistory.length === 0) {
    logHistory = [
      { msg: '시스템 가동..', kind: 'normal', category: null, xp: null, date: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'short' }) },
      { msg: '하루치가 기다려요!', kind: 'normal', category: null, xp: null, date: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'short' }) }
    ];
  }

  // sad 이미지 랜덤 표시 체크 시작
  startSadCheckTimer();

  // 그루밍 애니메이션 체크 시작
  startGroomingCheckTimer();
}

function fitScale() {
  const device = document.getElementById('device');
  const scaleWrapper = document.getElementById('scaleWrapper');
  const fw = 673, fh = 673;
  const pad = 20;
  const embedScale = 1.0; /* 게임 화면 배율 (1.0 = 기본, 줄이려면 0.9 등) */
  let scale = Math.min(
    (window.innerWidth - pad) / fw,
    (window.innerHeight - pad) / fh
  );
  scale = Math.min(scale * embedScale, 1.2); /* 최대 1.2배까지 */
  scaleWrapper.style.width = (fw * scale) + 'px';
  scaleWrapper.style.height = (fh * scale) + 'px';
  device.style.transform = `scale(${scale})`;
  window.currentScale = scale;
}

function handleBtn(btn) {
  if (game.isBusy) {
    const lastEmotionTime = Math.max(game.lastSadTime, game.lastAngryTime);
    if (Math.random() < 0.05 && Date.now() - lastEmotionTime > 10000) {
      showSadOrAngryRandomly();
    }
    return;
  }
  if (btn === 'A') {
    log("하루치 그루밍 중 ...");
    showGroomingAnimation();
  } else if (btn === 'B') {
    showButtAction();
  } else if (btn === 'C') {
    toggleBgmMute();
  } else if (btn === 'D') {
    // D 버튼 기능 (추후 확장 가능)
    log("버튼 D 클릭");
  }
}

/* 하루치 클릭 핸들러 (쓰다듬기) */
function handleHamsterClick() {
  if (game.isBusy) {
    // 버튼이 안 눌러질 때 가끔씩 sad/angry 표시 (5% 확률, 70% sad, 30% angry)
    const lastEmotionTime = Math.max(game.lastSadTime, game.lastAngryTime);
    if (Math.random() < 0.05 && Date.now() - lastEmotionTime > 10000) {
      showSadOrAngryRandomly();
    }
    return;
  }
  game.isBusy = true;
  game.lastActionTime = Date.now(); // 액션 시간 업데이트
  log("쓰담쓰담.. 기분 최고! +5", { category: '쓰다듬기', xp: 5 });
  changeAction('./assets/hamster/happy.png', 2000);
  showExpParticle(5);
  addExp(5);
  updateStats(5, false);  /* 쓰다듬기: 목표 미포함 */
  showSmartFeedback(); /* 똑똑한 잔소리 */
}

/* 집 클릭 핸들러 - 밥 먹은 뒤 일정 시간 안에 클릭 시 full_and_sleep (밥 먹고 자면 기분 좋다) */
function handleHouseClick() {
  if (game.isBusy) {
    const lastEmotionTime = Math.max(game.lastSadTime, game.lastAngryTime);
    if (Math.random() < 0.05 && Date.now() - lastEmotionTime > 10000) {
      showSadOrAngryRandomly();
    }
    return;
  }
  game.isBusy = true;
  game.lastActionTime = Date.now();
  const useFullAndSleep = justAteAt > 0 && (Date.now() - justAteAt) < JUST_ATE_WINDOW_MS;
  justAteAt = 0;
  if (useFullAndSleep) {
    log("밥 먹고 잠들었어요.. 기분 좋아요 😴");
    changeSleepAction(5000, 'assets/hamster/overfed/full_and_sleep.png', 'full-and-sleep-adjust');
  } else {
    log("집에 들어가서 잠자기... Zzz +0");
    changeSleepAction(5000);
  }
  addExp(0);
}

/* 그릇 클릭 - 10회 시 throw up, 1분 쿨다운 중 시 stop drink, 1분 후 다시 활성화 */
function handleBowlClick() {
  if (game.isBusy) {
    const lastEmotionTime = Math.max(game.lastSadTime, game.lastAngryTime);
    if (Math.random() < 0.05 && Date.now() - lastEmotionTime > 10000) {
      showSadOrAngryRandomly();
    }
    return;
  }
  const daily = getDailyEatDrink();
  const now = Date.now();
  if (daily.eat >= MAX_EAT_BEFORE_THROWUP) {
    if (daily.eatCooldownUntil && now > daily.eatCooldownUntil) {
      daily.eat = 0;
      daily.eatCooldownUntil = 0;
      saveDailyEatDrink(daily);
    } else if (daily.eatCooldownUntil && now <= daily.eatCooldownUntil) {
      game.isBusy = true;
      log("잠깐만요, 더 이상 못 먹어요! 😣");
      hamster.classList.add('btn-test-stopdrink');
      hamster.src = 'assets/hamster/overfed/stop drink.png';
      hamster.classList.remove('bounce', 'sleeping');
      hamster.onerror = function () {
        hamster.src = getBaseHamsterSrc();
        hamster.classList.add('bounce');
        hamster.classList.remove('btn-test-stopdrink');
        game.isBusy = false;
        hamster.onerror = null;
      };
      setTimeout(() => {
        hamster.src = getBaseHamsterSrc();
        hamster.classList.add('bounce');
        hamster.classList.remove('btn-test-stopdrink');
        hamster.onerror = null;
        game.isBusy = false;
      }, 2500);
      return;
    } else {
      game.isBusy = true;
      log("너무 많이 먹었어요! 😵");
      hamster.classList.add('btn-test-adjust');
      changeAction('assets/hamster/overfed/throw up.png', 2500);
      daily.eatCooldownUntil = now + EAT_DRINK_COOLDOWN_MS;
      saveDailyEatDrink(daily);
      setTimeout(() => { hamster.classList.remove('btn-test-adjust'); game.isBusy = false; }, 2500);
      return;
    }
  }
  game.isBusy = true;
  game.lastActionTime = Date.now();
  daily.eat++;
  saveDailyEatDrink(daily);
  justAteAt = Date.now();

  const eatMessages = [
    "냠냠! 해바라기씨 맛있다 +10",
    "냠냠! 해바라기씨 맛있다 야르~ +10",
    "하루치 두쫀쿠 먹고 싶다 +10",
    "야미~ 야미~ 야미야미야미 +10"
  ];
  const randomMessage = eatMessages[Math.floor(Math.random() * eatMessages.length)];
  log(randomMessage, { category: '밥먹기', xp: 10 });

  changeAction('./assets/hamster/eat.png', 2000);
  showExpParticle(10);
  addExp(10);
  updateStats(10, false);
  showSmartFeedback(); /* 똑똑한 잔소리 */
}

/* 물 급수통 클릭 - 10회 시 throw up 2, 1분 쿨다운 중 시 stop drink, 1분 후 다시 활성화 */
function handleWaterBottleClick() {
  if (game.isBusy) {
    const lastEmotionTime = Math.max(game.lastSadTime, game.lastAngryTime);
    if (Math.random() < 0.05 && Date.now() - lastEmotionTime > 10000) {
      showSadOrAngryRandomly();
    }
    return;
  }
  const daily = getDailyEatDrink();
  const now = Date.now();
  if (daily.drink >= MAX_DRINK_BEFORE_STOP) {
    if (daily.drinkCooldownUntil && now > daily.drinkCooldownUntil) {
      daily.drink = 0;
      daily.drinkCooldownUntil = 0;
      saveDailyEatDrink(daily);
    } else if (daily.drinkCooldownUntil && now <= daily.drinkCooldownUntil) {
      game.isBusy = true;
      log("물 더 이상 마시기 싫어요! 😣");
      hamster.classList.add('btn-test-stopdrink');
      hamster.src = 'assets/hamster/overfed/stop drink.png';
      hamster.classList.remove('bounce', 'sleeping', 'drinking');
      hamster.onerror = function () {
        hamster.src = getBaseHamsterSrc();
        hamster.classList.add('bounce');
        hamster.classList.remove('btn-test-stopdrink');
        game.isBusy = false;
        hamster.onerror = null;
      };
      setTimeout(() => {
        hamster.src = getBaseHamsterSrc();
        hamster.classList.add('bounce');
        hamster.classList.remove('btn-test-stopdrink');
        hamster.onerror = null;
        game.isBusy = false;
      }, 2500);
      return;
    } else {
      game.isBusy = true;
      log("물 너무 많이 마셨어요! 😵");
      hamster.classList.add('btn-test-throwup2');
      hamster.src = 'assets/hamster/overfed/throw up 2.png';
      hamster.classList.remove('bounce', 'sleeping', 'drinking');
      hamster.onerror = function () {
        hamster.src = getBaseHamsterSrc();
        hamster.classList.add('bounce');
        hamster.classList.remove('btn-test-throwup2');
        game.isBusy = false;
        hamster.onerror = null;
      };
      daily.drinkCooldownUntil = now + EAT_DRINK_COOLDOWN_MS;
      saveDailyEatDrink(daily);
      setTimeout(() => {
        hamster.src = getBaseHamsterSrc();
        hamster.classList.add('bounce');
        hamster.classList.remove('btn-test-throwup2');
        hamster.onerror = null;
        game.isBusy = false;
      }, 2500);
      return;
    }
  }
  game.isBusy = true;
  game.lastActionTime = Date.now();
  daily.drink++;
  saveDailyEatDrink(daily);

  const useDrinkWater = Math.random() < 0.2;
  const drinkImage = useDrinkWater ? './assets/hamster/drinkwater.png' : './assets/hamster/drink.png';
  if (useDrinkWater) {
    log("벌컥벌컥! 물을 마시는 중... +10", { category: '물마시기', xp: 10 });
  } else {
    log("물을 마시는 중... +10", { category: '물마시기', xp: 10 });
  }
  changeDrinkAction(drinkImage, 2000);
  showExpParticle(10);
  addExp(10);
  updateStats(10, false);
  showSmartFeedback(); /* 똑똑한 잔소리 */
}

/* 물 10회 이상 시 물 급수통 쪽에 throw up 2 오버레이 표시 */
function showThrowUp2NearWaterBottle() {
  const screenTop = document.querySelector('.screen-top');
  if (!screenTop) return;
  const overlay = document.createElement('div');
  overlay.className = 'throwup2-overlay';
  const img = document.createElement('img');
  img.src = 'assets/hamster/overfed/throw up 2.png';
  img.alt = '';
  overlay.appendChild(img);
  screenTop.appendChild(overlay);
  setTimeout(() => overlay.remove(), 2500);
}

/* 이미지 사라짐 방지 */
function changeAction(imgSrc, duration) {
  const originalSrc = getBaseHamsterSrc();
  hamster.src = imgSrc;
  hamster.classList.remove('bounce', 'sleeping');

  // 이미지 로드 실패 시 원상복구
  hamster.onerror = function () {
    console.warn("이미지 로드 실패:", imgSrc);
    log("⚠ 오류: 이미지가 없어요!");
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    hamster.classList.remove('sleeping');
    game.isBusy = false;
  };

  setTimeout(() => {
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    hamster.classList.remove('sleeping');
    game.isBusy = false;
    hamster.onerror = null;
  }, duration);
}

/* 잠자는 모습 (오른쪽 집 안) - sleepImageSrc 생략 시 sleep.png, 밥 먹고 잠들면 full_and_sleep.png. adjustClass 있으면 해당 클래스로 위치·크기 적용 */
function changeSleepAction(duration, sleepImageSrc, adjustClass) {
  const originalSrc = getBaseHamsterSrc();
  const sleepImg = sleepImageSrc || './assets/hamster/sleep.png';
  hamster.src = sleepImg;
  hamster.classList.remove('bounce');
  hamster.classList.add('sleeping');
  if (adjustClass) hamster.classList.add(adjustClass);

  hamster.onerror = function () {
    console.warn("이미지 로드 실패:", sleepImg);
    log("⚠ 오류: 잠자는 이미지가 없어요!");
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    hamster.classList.remove('sleeping');
    if (adjustClass) hamster.classList.remove(adjustClass);
    game.isBusy = false;
  };

  setTimeout(() => {
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    hamster.classList.remove('sleeping');
    if (adjustClass) hamster.classList.remove(adjustClass);
    game.isBusy = false;
    hamster.onerror = null;
  }, duration);
}

/* 물 마시는 모습 (물 급수통 위치로 이동) */
function changeDrinkAction(imgSrc, duration) {
  const originalSrc = getBaseHamsterSrc();

  // 이미지에 따라 다른 크기 클래스 설정
  const isDrinkWater = imgSrc.includes('drinkwater');
  const sizeClass = isDrinkWater ? 'drink-water' : 'drink-normal';

  // 물 급수통 위치로 이동
  hamster.src = imgSrc;
  hamster.classList.remove('bounce', 'sleeping', 'drink-normal', 'drink-water');
  hamster.classList.add('drinking', sizeClass);

  // 물 마시는 말풍선 표시 (챱챱챱... / 할짝할짝 랜덤)
  const drinkBubble = document.getElementById('drinkSpeechBubble');
  const drinkBubbleTexts = ['챱챱챱...', '할짝할짝'];
  if (drinkBubble) {
    drinkBubble.textContent = drinkBubbleTexts[Math.floor(Math.random() * drinkBubbleTexts.length)];
    drinkBubble.classList.add('show');
  }

  // 물방울 애니메이션 시작
  startWaterDropAnimation(duration);

  // 이미지 로드 실패 시 원상복구
  hamster.onerror = function () {
    console.warn("이미지 로드 실패:", imgSrc);
    log("⚠ 오류: 물 마시는 이미지가 없어요!");
    hamster.src = originalSrc;
    hamster.classList.remove('drinking', 'drink-normal', 'drink-water');
    hamster.classList.add('bounce');
    const drinkBubble = document.getElementById('drinkSpeechBubble');
    if (drinkBubble) drinkBubble.classList.remove('show');
    game.isBusy = false;
  };

  setTimeout(() => {
    hamster.src = originalSrc;
    hamster.classList.remove('drinking', 'drink-normal', 'drink-water');
    hamster.classList.add('bounce');
    const drinkBubble = document.getElementById('drinkSpeechBubble');
    if (drinkBubble) drinkBubble.classList.remove('show');
    game.isBusy = false;
    hamster.onerror = null;
  }, duration);
}

/* 물방울 애니메이션 */
function startWaterDropAnimation(duration) {
  const screenTop = document.querySelector('.screen-top');
  const waterBottleArea = document.querySelector('.water-bottle-click-area');

  if (!screenTop || !waterBottleArea) return;

  // 물 급수통 클릭 영역의 실제 위치 계산
  const bottleRect = waterBottleArea.getBoundingClientRect();
  const screenRect = screenTop.getBoundingClientRect();

  // CSS 변수에서 오프셋 값 가져오기 (body에서 우선, 없으면 :root에서)
  const bodyStyles = getComputedStyle(document.body);
  const rootStyles = getComputedStyle(document.documentElement);

  const getPropValue = (prop, fallback) => {
    const val = bodyStyles.getPropertyValue(prop).trim() || rootStyles.getPropertyValue(prop).trim();
    if (!val) return fallback;
    const num = parseFloat(val);
    return isNaN(num) ? fallback : num;
  };

  const offsetX = getPropValue('--water-drop-offset-x', -80);
  const offsetY = getPropValue('--water-drop-offset-y', -65);

  // 물방울이 떨어지는 시작 위치 (물 급수통 아래쪽 중앙)
  // getBoundingClientRect()는 화면(Viewport) 좌표이므로, 스케일 보정이 필요함
  const scale = window.currentScale || 1;

  // 화면상 거리 계산
  const screenX = (bottleRect.left + bottleRect.width / 2) - screenRect.left;
  const screenY = bottleRect.bottom - screenRect.top;

  // 스케일 보정된 로컬 좌표 계산
  let startX = (screenX / scale) + offsetX;
  let startY = (screenY / scale) + offsetY;

  if (document.documentElement.classList.contains('notion-embed')) {
    const notionX = getPropValue('--water-drop-offset-x-notion', 55);
    const notionY = getPropValue('--water-drop-offset-y-notion', 18);
    startX += notionX;
    startY += notionY;
  }

  // 물 마시는 동안 여러 개의 물방울 생성
  const dropCount = 12; // 총 8개의 물방울

  for (let i = 0; i < dropCount; i++) {
    setTimeout(() => {
      createWaterDrop(screenTop, startX, startY);
    }, i * (duration / dropCount));
  }
}

/* 물방울 생성 */
function createWaterDrop(container, x, y) {
  const drop = document.createElement('div');
  drop.className = 'water-drop';

  // 약간의 랜덤 오프셋 추가
  const offsetX = (Math.random() - 0.5) * 20;
  drop.style.left = (x + offsetX) + 'px';
  drop.style.top = y + 'px';

  container.appendChild(drop);

  // 애니메이션 종료 후 제거
  setTimeout(() => {
    if (drop.parentNode) {
      drop.parentNode.removeChild(drop);
    }
  }, 1000);
}

/* sad 또는 angry 이미지 랜덤 표시 (70% sad, 30% angry) */
function showSadOrAngryRandomly(forceShow = false) {
  // forceShow가 false이고, 이미 busy 상태이거나 최근에 감정을 표시했다면 건너뛰기
  const lastEmotionTime = Math.max(game.lastSadTime, game.lastAngryTime);
  if (!forceShow && (game.isBusy || Date.now() - lastEmotionTime < 10000)) {
    return;
  }

  // 70% sad, 30% angry 랜덤 선택
  const isAngry = Math.random() < 0.3;

  if (isAngry) {
    showAngryRandomly(forceShow);
  } else {
    showSadRandomly(forceShow);
  }
}

/* sad 이미지 랜덤 표시 */
function showSadRandomly(forceShow = false) {
  // forceShow가 false이고, 이미 busy 상태이거나 최근에 sad를 표시했다면 건너뛰기
  if (!forceShow && (game.isBusy || Date.now() - game.lastSadTime < 10000)) {
    return;
  }

  game.isBusy = true;
  game.lastSadTime = Date.now();

  // 랜덤 sad 메시지 배열
  const sadMessages = [
    "😢 하루치가 슬퍼 보여요...",
    "😞 하루치가 외로워하는 것 같아요",
    "😔 하루치가 기다리고 있어요...",
    "💔 하루치가 관심을 원해요",
    "😿 하루치가 쓸쓸해 보여요",
    "😰 하루치가 불안해하는 것 같아요",
    "😥 하루치가 심심해하는 것 같아요",
    "😪 하루치가 지쳐 보여요...",
    "😓 하루치가 힘들어하는 것 같아요",
    "😭 하루치가 울고 있어요..."
  ];

  // 랜덤으로 메시지 선택
  const randomMessage = sadMessages[Math.floor(Math.random() * sadMessages.length)];
  log(randomMessage);

  const originalSrc = getBaseHamsterSrc();
  hamster.src = 'assets/hamster/sad.png';
  hamster.classList.remove('bounce', 'sleeping', 'drinking');

  // 이미지 로드 실패 시 원상복구
  hamster.onerror = function () {
    console.warn("이미지 로드 실패: sad.png");
    log("⚠ 오류: sad 이미지가 없어요!");
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    game.isBusy = false;
    hamster.onerror = null;
  };

  // 2-4초 사이 랜덤하게 표시
  const duration = 2000 + Math.random() * 2000;

  setTimeout(() => {
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    game.isBusy = false;
    hamster.onerror = null;
  }, duration);
}

/* angry 이미지 랜덤 표시 (back.png - 삐져서 뒤돌아 선 모습 + 오른쪽 말풍선 빠직) */
function showAngryRandomly(forceShow = false) {
  // forceShow가 false이고, 이미 busy 상태이거나 최근에 angry를 표시했다면 건너뛰기
  if (!forceShow && (game.isBusy || Date.now() - game.lastAngryTime < 10000)) {
    return;
  }

  game.isBusy = true;
  game.lastAngryTime = Date.now();

  // 랜덤 angry 메시지 배열
  const angryMessages = [
    "😠 하루치가 화가 났어요!",
    "😡 하루치가 매우 화가 나있어요!",
    "💢 하루치가 짜증이 났어요!",
    "🤬 하루치가 화가 나서 떠들어요!",
    "😤 하루치가 불만이 많아요!",
    "💥 하루치가 폭발 직전이에요!"
  ];

  // 랜덤으로 메시지 선택
  const randomMessage = angryMessages[Math.floor(Math.random() * angryMessages.length)];
  log(randomMessage);

  const originalSrc = getBaseHamsterSrc();
  hamster.src = 'assets/hamster/back.png';
  hamster.classList.remove('bounce', 'sleeping', 'drinking');
  hamster.classList.add('angry');

  // 오른쪽 말풍선 빠직 표시
  const speechBubble = document.getElementById('angrySpeechBubble');
  const angryBubbleTexts = ['빠직!', '찍찍!', '찍!!', '...'];
  if (speechBubble) {
    speechBubble.textContent = angryBubbleTexts[Math.floor(Math.random() * angryBubbleTexts.length)];
    speechBubble.classList.add('show');
  }

  // 이미지 로드 실패 시 원상복구
  hamster.onerror = function () {
    console.warn("이미지 로드 실패: back.png");
    log("⚠ 오류: back 이미지가 없어요!");
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    hamster.classList.remove('angry');
    if (speechBubble) speechBubble.classList.remove('show');
    game.isBusy = false;
    hamster.onerror = null;
  };

  // 3-5초 사이 랜덤하게 표시 (sad보다 조금 더 길게)
  const duration = 3000 + Math.random() * 2000;

  setTimeout(() => {
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    hamster.classList.remove('angry');
    if (speechBubble) speechBubble.classList.remove('show');
    game.isBusy = false;
    hamster.onerror = null;
  }, duration);
}

/* C 버튼: 화난 모습 (angry.png - 정면 화난 표정) */
function showAngryFaceAction() {
  if (game.isBusy) return;

  game.isBusy = true;

  const angryMessages = [
    "😠 하루치가 화가 났어요!",
    "😡 하루치가 매우 화가 나있어요!",
    "💢 하루치가 짜증이 났어요!"
  ];
  log(angryMessages[Math.floor(Math.random() * angryMessages.length)]);

  const originalSrc = getBaseHamsterSrc();
  hamster.src = './assets/hamster/angry.png';
  hamster.classList.remove('bounce', 'sleeping', 'drinking');

  const speechBubble = document.getElementById('angrySpeechBubble');
  const angryBubbleTexts = ['빠직!', '빠직!!', '빠악!', '쳇!'];
  if (speechBubble) {
    speechBubble.textContent = angryBubbleTexts[Math.floor(Math.random() * angryBubbleTexts.length)];
    speechBubble.classList.add('show');
  }

  hamster.onerror = function () {
    console.warn("이미지 로드 실패: angry.png");
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    if (speechBubble) speechBubble.classList.remove('show');
    game.isBusy = false;
    hamster.onerror = null;
  };

  const duration = 2500 + Math.random() * 1500;
  setTimeout(() => {
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    if (speechBubble) speechBubble.classList.remove('show');
    game.isBusy = false;
    hamster.onerror = null;
  }, duration);
}

/* B 버튼: 뒤태 (back.png) - 씰룩씰룩(엉덩이 흔들림) / 토실토실(귀여운 엉덩이) */
function showButtAction() {
  if (game.isBusy) return;

  game.isBusy = true;

  const isWiggle = Math.random() < 0.5; // 50% 씰룩씰룩, 50% 토실토실
  const bubbleText = isWiggle ? '씰룩씰룩' : '토실토실';

  log(isWiggle ? '🍑 하루치 엉덩이가 씰룩씰룩~' : '🍑 하루치 토실토실한 엉덩이!');

  const originalSrc = getBaseHamsterSrc();
  hamster.src = 'assets/hamster/back.png';
  hamster.classList.remove('bounce', 'sleeping', 'drinking', 'angry');
  hamster.classList.add('butt');
  if (isWiggle) hamster.classList.add('butt-wiggle');

  const buttBubble = document.getElementById('buttSpeechBubble');
  if (buttBubble) {
    buttBubble.textContent = bubbleText;
    buttBubble.classList.add('show');
  }

  hamster.onerror = function () {
    console.warn("이미지 로드 실패: back.png");
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    hamster.classList.remove('butt', 'butt-wiggle');
    if (buttBubble) buttBubble.classList.remove('show');
    game.isBusy = false;
    hamster.onerror = null;
  };

  const duration = 2500 + Math.random() * 1000;
  setTimeout(() => {
    hamster.src = originalSrc;
    hamster.classList.add('bounce');
    hamster.classList.remove('butt', 'butt-wiggle');
    if (buttBubble) buttBubble.classList.remove('show');
    game.isBusy = false;
    hamster.onerror = null;
  }, duration);
}

/* 장시간 대기 시 sad/angry 체크 타이머 */
function startSadCheckTimer() {
  // 30초마다 체크
  setInterval(() => {
    if (!game.isBusy) {
      const idleTime = Date.now() - game.lastActionTime;
      const lastEmotionTime = Math.max(game.lastSadTime, game.lastAngryTime);

      // 5분(300초) 이상 방치 시 angry 1% 확률
      if (idleTime >= 300000) {
        if (Math.random() < 0.01 && Date.now() - lastEmotionTime > 60000) {
          showAngryRandomly();
          return;
        }
      }

      // 2분(120초) 이상 대기 중일 때 sad/angry 랜덤 (70% sad, 30% angry)
      if (idleTime >= 120000) {
        // 3% 확률로 감정 표시 (가끔씩만)
        if (Math.random() < 0.03 && Date.now() - lastEmotionTime > 30000) {
          showSadOrAngryRandomly();
        }
      }
    }
  }, 30000); // 30초마다 체크
}

/* 그루밍 애니메이션 변수 */
let groomingAnimationInterval = null;
let currentGroomingFrame = 0;
const GROOMING_FRAME_COUNT = 16; // 총 16프레임
const GROOMING_FRAME_WIDTH = 64; // 원본 1프레임 너비 (256px / 4)
const GROOMING_FRAME_HEIGHT = 64; // 원본 1프레임 높이 (256px / 4)
const DISPLAY_FRAME_WIDTH = 200; // 그루밍 애니메이션 표시 크기 (오버레이 크기에 맞춤)
const DISPLAY_FRAME_HEIGHT = 200; // 그루밍 애니메이션 표시 크기 (오버레이 크기에 맞춤)

/* 그루밍 애니메이션 속도 (CSS 변수에서 읽어옴, 기본값 120ms) */
function getGroomingAnimationSpeed(frameIndex = null) {
  const bodyStyles = getComputedStyle(document.body);
  const rootStyles = getComputedStyle(document.documentElement);

  // 프레임별 개별 속도가 설정되어 있는지 확인
  if (frameIndex !== null) {
    const frameSpeed = bodyStyles.getPropertyValue(`--grooming-frame-${frameIndex}-speed`) ||
      rootStyles.getPropertyValue(`--grooming-frame-${frameIndex}-speed`);
    if (frameSpeed && frameSpeed.trim() !== '') {
      const speed = parseFloat(frameSpeed.replace('ms', '').trim());
      if (speed > 0) return speed;
    }
  }

  // 기본 속도 사용
  const speedValue = bodyStyles.getPropertyValue('--grooming-animation-speed') ||
    rootStyles.getPropertyValue('--grooming-animation-speed') || '120ms';
  const speed = parseFloat(speedValue.replace('ms', '')) || 120;
  return speed;
}

/* 프레임 홀드 배수 가져오기 */
function getGroomingFrameHold() {
  const rootStyles = getComputedStyle(document.documentElement);
  const holdValue = rootStyles.getPropertyValue('--grooming-frame-hold') || '1';
  return parseFloat(holdValue) || 1;
}

/* 애니메이션 반복 횟수 가져오기 */
function getGroomingRepeatCount() {
  const rootStyles = getComputedStyle(document.documentElement);
  const repeatValue = rootStyles.getPropertyValue('--grooming-repeat-count') || '1';
  return parseFloat(repeatValue) || 1;
}

/* 그루밍 애니메이션 프레임 업데이트 */
function updateGroomingFrame() {
  const groomingOverlay = document.getElementById('groomingOverlay');
  if (!groomingOverlay) return;

  // 현재 프레임 인덱스로 열(col)과 행(row) 계산
  const col = currentGroomingFrame % 4; // 0~3
  const row = Math.floor(currentGroomingFrame / 4); // 0~3

  // 오버레이 크기 가져오기 (동적으로 계산)
  const frameWidth = window.currentDisplayFrameWidth || DISPLAY_FRAME_WIDTH;
  const frameHeight = window.currentDisplayFrameHeight || DISPLAY_FRAME_HEIGHT;

  // 각 행(row)별 및 프레임별 X, Y 오프셋을 CSS 변수에서 가져오기 (body 우선, 없으면 :root)
  const bodyStyles = getComputedStyle(document.body);
  const rootStyles = getComputedStyle(document.documentElement);

  // 행별 Y 오프셋 (0-3행)
  const rowYOffsets = (function () {
    return [
      parseFloat(bodyStyles.getPropertyValue('--grooming-row-0-y-offset')) ||
      parseFloat(rootStyles.getPropertyValue('--grooming-row-0-y-offset')) || 0,
      parseFloat(bodyStyles.getPropertyValue('--grooming-row-1-y-offset')) ||
      parseFloat(rootStyles.getPropertyValue('--grooming-row-1-y-offset')) || 0,
      parseFloat(bodyStyles.getPropertyValue('--grooming-row-2-y-offset')) ||
      parseFloat(rootStyles.getPropertyValue('--grooming-row-2-y-offset')) || 0,
      parseFloat(bodyStyles.getPropertyValue('--grooming-row-3-y-offset')) ||
      parseFloat(rootStyles.getPropertyValue('--grooming-row-3-y-offset')) || 0
    ];
  })();

  // 행별 X 오프셋 (0-3행)
  const rowXOffsets = (function () {
    return [
      parseFloat(bodyStyles.getPropertyValue('--grooming-row-0-x-offset')) ||
      parseFloat(rootStyles.getPropertyValue('--grooming-row-0-x-offset')) || 0,
      parseFloat(bodyStyles.getPropertyValue('--grooming-row-1-x-offset')) ||
      parseFloat(rootStyles.getPropertyValue('--grooming-row-1-x-offset')) || 0,
      parseFloat(bodyStyles.getPropertyValue('--grooming-row-2-x-offset')) ||
      parseFloat(rootStyles.getPropertyValue('--grooming-row-2-x-offset')) || 0,
      parseFloat(bodyStyles.getPropertyValue('--grooming-row-3-x-offset')) ||
      parseFloat(rootStyles.getPropertyValue('--grooming-row-3-x-offset')) || 0
    ];
  })();

  // 프레임별 개별 Y 오프셋 (0-15 프레임, 우선순위 높음)
  const frameYOffset = parseFloat(bodyStyles.getPropertyValue(`--grooming-frame-${currentGroomingFrame}-y-offset`)) ||
    parseFloat(rootStyles.getPropertyValue(`--grooming-frame-${currentGroomingFrame}-y-offset`)) ||
    null;

  // 프레임별 개별 X 오프셋 (0-15 프레임, 우선순위 높음)
  const frameXOffset = parseFloat(bodyStyles.getPropertyValue(`--grooming-frame-${currentGroomingFrame}-x-offset`)) ||
    parseFloat(rootStyles.getPropertyValue(`--grooming-frame-${currentGroomingFrame}-x-offset`)) ||
    null;

  // background-position을 음수 픽셀 값으로 계산 (X 오프셋 적용)
  const baseX = -col * frameWidth;
  // 프레임별 개별 오프셋이 있으면 우선 사용, 없으면 행별 오프셋 사용
  const finalXOffset = frameXOffset !== null ? frameXOffset : (rowXOffsets[row] || 0);
  const x = baseX + finalXOffset;

  // y 위치 계산: 기본 위치 + 오프셋 (프레임별 개별 오프셋 우선, 없으면 행별 오프셋)
  const baseY = -row * frameHeight;
  const finalYOffset = frameYOffset !== null ? frameYOffset : (rowYOffsets[row] || 0);
  const y = baseY + finalYOffset;

  // background-position 업데이트 (오버레이 div에 적용)
  groomingOverlay.style.backgroundPosition = `${x}px ${y}px`;

  // 다음 프레임으로 이동
  currentGroomingFrame++;
}

/* 그루밍 프레임 자동 정렬 - 모든 프레임이 같은 위치에 오도록 자동 조정 */
function autoAlignGroomingFrames() {
  const groomingOverlay = document.getElementById('groomingOverlay');
  if (!groomingOverlay) {
    log("⚠ 그루밍 오버레이를 찾을 수 없습니다.");
    return;
  }

  // 오버레이 크기 가져오기
  const overlayWidth = parseInt(window.getComputedStyle(groomingOverlay).width) || 290;
  const overlayHeight = parseInt(window.getComputedStyle(groomingOverlay).height) || 290;

  // 기준 프레임(프레임 0)의 위치를 기준으로 설정
  const referenceFrame = 0;
  const referenceRow = Math.floor(referenceFrame / 4);
  const referenceCol = referenceFrame % 4;

  // 기준 프레임의 기본 Y 위치 (오프셋 없이)
  const referenceBaseY = -referenceRow * overlayHeight;
  // 기준 프레임의 기본 X 위치 (오프셋 없이, 컬럼 0 기준)
  const referenceBaseX = -referenceCol * overlayWidth;

  // 각 행의 오프셋을 계산하여 모든 프레임이 같은 Y, X 위치에 오도록 조정
  const rowYOffsets = [];
  const rowXOffsets = [];

  for (let row = 0; row < 4; row++) {
    // 각 행의 기본 Y 위치
    const baseY = -row * overlayHeight;

    // 기준 프레임과 같은 Y 위치에 오도록 필요한 오프셋 계산
    const neededYOffset = referenceBaseY - baseY;
    rowYOffsets[row] = neededYOffset;

    // 각 행의 첫 번째 프레임(컬럼 0)의 기본 X 위치
    const baseX = -0 * overlayWidth; // 항상 0이지만 명시적으로 표시

    // 기준 프레임과 같은 X 위치에 오도록 필요한 오프셋 계산
    const neededXOffset = referenceBaseX - baseX;
    rowXOffsets[row] = neededXOffset;
  }

  // CSS 변수에 적용
  for (let i = 0; i < 4; i++) {
    document.documentElement.style.setProperty(`--grooming-row-${i}-y-offset`, `${rowYOffsets[i]}px`);
    document.documentElement.style.setProperty(`--grooming-row-${i}-x-offset`, `${rowXOffsets[i]}px`);
  }

  // 애니메이션이 실행 중이면 즉시 업데이트
  if (groomingAnimationInterval) {
    updateGroomingFrame();
  }
}

/* 그루밍 애니메이션 표시 */
function showGroomingAnimation() {
  // 동시 입력 충돌 방지: 그루밍 중에는 다른 액션 차단
  if (game.isBusy || hamster.classList.contains('grooming')) return;
  game.isBusy = true;

  // 기존 애니메이션이 실행 중이면 정리
  if (groomingAnimationInterval) {
    clearInterval(groomingAnimationInterval);
    groomingAnimationInterval = null;
  }

  game.lastGroomingTime = Date.now();

  // img 태그를 숨기고 오버레이 div 표시
  hamster.classList.remove('bounce', 'sleeping', 'drinking');
  hamster.classList.add('grooming');

  // normal 이미지 완전히 숨기기
  hamster.style.opacity = '0';
  hamster.style.visibility = 'hidden';

  const groomingOverlay = document.getElementById('groomingOverlay');
  if (!groomingOverlay) {
    console.error('groomingOverlay 요소를 찾을 수 없습니다.');
    game.isBusy = false;
    return;
  }

  // 먼저 active 클래스를 추가해서 display: block으로 만들어 크기 측정 가능하게 함
  groomingOverlay.classList.add('active');

  // 위치 고정 (CSS 변수 사용) - body에서 먼저 읽어서 스킨별 오버라이드 반영
  const bodyStyles = getComputedStyle(document.body);
  const rootStyles = getComputedStyle(document.documentElement);
  const groomingTop = bodyStyles.getPropertyValue('--grooming-top') ||
    rootStyles.getPropertyValue('--grooming-top') || '60%';
  const groomingLeft = bodyStyles.getPropertyValue('--grooming-left') ||
    rootStyles.getPropertyValue('--grooming-left') || '50%';
  const groomingOffsetX = bodyStyles.getPropertyValue('--grooming-offset-x') ||
    rootStyles.getPropertyValue('--grooming-offset-x') || '0px';
  const groomingOffsetY = bodyStyles.getPropertyValue('--grooming-offset-y') ||
    rootStyles.getPropertyValue('--grooming-offset-y') || '0px';

  groomingOverlay.style.top = `calc(${groomingTop} + ${groomingOffsetY})`;
  groomingOverlay.style.left = `calc(${groomingLeft} + ${groomingOffsetX})`;
  groomingOverlay.style.transform = 'translate(-50%, -50%)';
  groomingOverlay.style.display = 'block'; // 명시적으로 표시

  // 오버레이 크기 가져오기 (이제 display: block이므로 크기 측정 가능)
  const overlayWidth = parseInt(window.getComputedStyle(groomingOverlay).width) || 120;
  const overlayHeight = parseInt(window.getComputedStyle(groomingOverlay).height) || 120;

  // background-image 명시적으로 설정
  groomingOverlay.style.backgroundImage = 'url(./assets/animations/spr_hamster_shedding.png)';
  groomingOverlay.style.backgroundRepeat = 'no-repeat';

  // background-size를 오버레이 크기에 맞춰 동적으로 설정 (4x4 그리드)
  groomingOverlay.style.backgroundSize = `${overlayWidth * 4}px ${overlayHeight * 4}px`;
  groomingOverlay.style.backgroundPosition = '0px 0px';

  // overflow: hidden으로 영역 밖의 이미지 숨김
  groomingOverlay.style.overflow = 'hidden';
  groomingOverlay.style.imageRendering = 'pixelated';

  // DISPLAY_FRAME_WIDTH/HEIGHT를 오버레이 크기에 맞춰 업데이트
  window.currentDisplayFrameWidth = overlayWidth;
  window.currentDisplayFrameHeight = overlayHeight;

  // 자동 정렬 실행 (위/아래, 왼쪽/오른쪽 모두 정렬)
  autoAlignGroomingFrames();

  // 프레임 인덱스 초기화
  currentGroomingFrame = 0;

  // 첫 프레임 설정
  updateGroomingFrame();

  // 프레임 홀드 배수 가져오기
  const frameHold = getGroomingFrameHold();
  // 반복 횟수 가져오기
  const repeatCount = getGroomingRepeatCount();
  let holdCount = 0;
  let animationCycle = 0; // 애니메이션 사이클 카운터

  // 애니메이션 프레임 진행 함수
  function advanceFrame() {
    holdCount++;

    // 프레임 홀드만큼 반복했으면 다음 프레임으로
    if (holdCount >= frameHold) {
      holdCount = 0;
      updateGroomingFrame();

      // 모든 프레임이 재생되었으면
      if (currentGroomingFrame >= GROOMING_FRAME_COUNT) {
        animationCycle++;

        // 지정된 횟수만큼 반복하지 않았으면 다시 시작
        if (animationCycle < repeatCount) {
          currentGroomingFrame = 0;
          updateGroomingFrame();
          return;
        }

        // 모든 반복이 끝났으면 종료
        if (groomingAnimationInterval) {
          clearInterval(groomingAnimationInterval);
          groomingAnimationInterval = null;
        }

        // 원상복구
        hamster.classList.remove('grooming');
        hamster.classList.add('bounce');
        hamster.style.opacity = '';
        hamster.style.visibility = '';
        hamster.style.backgroundImage = '';
        hamster.style.backgroundSize = '';
        hamster.style.backgroundPosition = '';
        hamster.style.backgroundRepeat = '';

        // 그루밍 오버레이 완전히 숨기기
        const overlay = document.getElementById('groomingOverlay');
        if (overlay) {
          overlay.classList.remove('active');
          overlay.style.display = 'none';
          overlay.style.backgroundImage = '';
          overlay.style.backgroundSize = '';
          overlay.style.backgroundPosition = '';
        }

        currentGroomingFrame = 0;
        game.isBusy = false;
        return;
      }
    }

    // 현재 프레임의 속도로 다음 인터벌 설정 (프레임별 가변 속도 적용)
    // updateGroomingFrame()에서 이미 currentGroomingFrame++를 했으므로 현재 프레임 인덱스 사용
    const currentFrameIndex = currentGroomingFrame < GROOMING_FRAME_COUNT ? currentGroomingFrame : 0;
    const currentSpeed = getGroomingAnimationSpeed(currentFrameIndex);
    clearInterval(groomingAnimationInterval);
    groomingAnimationInterval = setInterval(advanceFrame, currentSpeed);
  }

  // setInterval로 애니메이션 시작 (프레임별 가변 속도 적용)
  groomingAnimationInterval = setInterval(advanceFrame, getGroomingAnimationSpeed(currentGroomingFrame));
}

/* 그루밍 애니메이션 체크 타이머 */
function startGroomingCheckTimer() {
  // 20초마다 체크
  setInterval(() => {
    // busy 상태가 아니고, normal 상태일 때만
    if (!game.isBusy && !hamster.classList.contains('sleeping') &&
      !hamster.classList.contains('drinking') &&
      !hamster.classList.contains('grooming')) {

      // 30초 이상 대기 중일 때 5% 확률로 그루밍
      const idleTime = Date.now() - game.lastActionTime;
      if (idleTime >= 30000) {
        if (Math.random() < 0.05 && Date.now() - game.lastGroomingTime > 20000) {
          showGroomingAnimation();
        }
      }
    }
  }, 20000); // 20초마다 체크
}

function addExp(amount) {
  game.exp += amount;
  while (game.exp >= getMaxExp(game.level)) {
    game.exp -= getMaxExp(game.level);
    game.level++;
    logLevelUp(`⭐ LEVEL UP! LV.${game.level} ⭐`);
    showLevelUpEffect();
  }
  updateUI();
}

/* EXP 파티클 효과 */
function showExpParticle(amount) {
  // 하루치 머리 위 위치 계산 (액션과 직접 연결)
  const hamsterRect = hamster.getBoundingClientRect();
  const centerX = hamsterRect.left + hamsterRect.width / 2;
  const headY = hamsterRect.top + 50; // 하루치 머리 더 아래쪽

  const particle = document.createElement('div');
  particle.className = 'exp-particle';
  particle.textContent = `+${amount}`;
  particle.style.left = centerX + 'px';
  particle.style.top = headY + 'px';
  particle.style.transform = 'translate(-50%, 0)';

  document.body.appendChild(particle);
  setTimeout(() => particle.remove(), 1500);
}

/* 레벨업 화려한 효과 (부드러운 버전) */
function showLevelUpEffect() {
  // 화면 플래시 효과 (부드럽게)
  const flash = document.createElement('div');
  flash.className = 'levelup-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);

  // 하루치 반짝임 효과 (부드럽게)
  hamster.classList.add('levelup');
  setTimeout(() => {
    hamster.classList.remove('levelup');
  }, 800);

  // 별 파티클 효과 (개수 줄이고 부드럽게)
  const hamsterRect = hamster.getBoundingClientRect();
  const centerX = hamsterRect.left + hamsterRect.width / 2;
  const centerY = hamsterRect.top + hamsterRect.height / 2;

  const starCount = 8; // 12개에서 8개로 줄임
  for (let i = 0; i < starCount; i++) {
    const angle = (360 / starCount) * i;
    const distance = 60 + Math.random() * 30; // 거리 줄임
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * distance;
    const y = Math.sin(radian) * distance;

    const star = document.createElement('div');
    star.className = 'star-particle';
    star.textContent = '⭐';
    star.style.left = centerX + 'px';
    star.style.top = centerY + 'px';
    star.style.setProperty('--star-x', x + 'px');
    star.style.setProperty('--star-y', y + 'px');

    document.body.appendChild(star);
    setTimeout(() => star.remove(), 1200);
  }
}

/* 통계 모달 관련 */

/* 출석 캘린더 보는 달 (전역) */
let attendanceViewYear = new Date().getFullYear();
let attendanceViewMonth = new Date().getMonth();

/* 이번 달 출석 일수 */
function getMonthlyAttendanceCount(year, month) {
  if (!year) year = new Date().getFullYear();
  if (month === undefined) month = new Date().getMonth();
  let count = 0;
  stats.playDays.forEach(d => {
    const [y, m] = d.split('-').map(Number);
    if (y === year && m === month + 1) count++;
  });
  return count;
}

/* 출석 캘린더 - 월별 달력 형태 (일~토) */
function getAttendanceCalendarHTML(year, month) {
  if (!year) year = attendanceViewYear;
  if (month === undefined) month = attendanceViewMonth;
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const viewMonthCount = getMonthlyAttendanceCount(year, month);

  let weekdaysHtml = weekdays.map(w => `<span>${w}</span>`).join('');
  let cellsHtml = '';
  const emptyCells = startWeekday;
  for (let i = 0; i < emptyCells; i++) {
    cellsHtml += '<div class="attendance-day empty"></div>';
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const checked = stats.playDays.has(dateStr);
    const isToday = dateStr === today;
    cellsHtml += `<div class="attendance-day ${checked ? 'checked' : ''} ${isToday ? 'today' : ''}" title="${dateStr} ${checked ? '출석' : '미출석'}">${d}</div>`;
  }
  return {
    title: `${year}년 ${monthNames[month]}`,
    weekdays: weekdaysHtml,
    cells: cellsHtml,
    count: viewMonthCount
  };
}

function changeAttendanceMonth(delta) {
  const now = new Date();
  const maxYear = now.getFullYear();
  const maxMonth = now.getMonth();
  attendanceViewMonth += delta;
  if (attendanceViewMonth > 11) {
    attendanceViewMonth = 0;
    attendanceViewYear++;
  } else if (attendanceViewMonth < 0) {
    attendanceViewMonth = 11;
    attendanceViewYear--;
  }
  if (attendanceViewYear > maxYear || (attendanceViewYear === maxYear && attendanceViewMonth > maxMonth)) {
    attendanceViewYear = maxYear;
    attendanceViewMonth = maxMonth;
  }
  showStats(false);
}

function canGoNextMonth() {
  const now = new Date();
  return attendanceViewYear < now.getFullYear() || (attendanceViewYear === now.getFullYear() && attendanceViewMonth < now.getMonth());
}

function showStats(resetCalendarToCurrent) {
  const modal = document.getElementById('statsModal');
  const content = document.getElementById('statsContent');
  if (resetCalendarToCurrent !== false) {
    const now = new Date();
    attendanceViewYear = now.getFullYear();
    attendanceViewMonth = now.getMonth();
  }

  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  const playDaysCount = stats.playDays.size;
  const avgDailyExp = playDaysCount > 0 ? Math.floor(stats.totalExp / playDaysCount) : 0;
  const goalPercent = dailyGoal.target > 0
    ? Math.min(Math.floor((dailyGoal.completed / dailyGoal.target) * 100), 100)
    : 0;
  const cal = getAttendanceCalendarHTML();

  const manualCount = getDailyManualTaskCount();
  const manualRemain = Math.max(0, MANUAL_TASK_DAILY_LIMIT - manualCount);
  content.innerHTML = `
        <div class="stats-section" id="manualTaskSection">
          <div class="stats-section-title">✏ 할 일 직접 기록 <span style="opacity:0.8; font-size:10px;">(오늘 ${manualCount}/${MANUAL_TASK_DAILY_LIMIT}건)</span></div>
          ${manualRemain > 0 ? `
          <div class="stats-item" style="flex-wrap: wrap; gap: 6px;">
            <button type="button" onclick="addManualTask('물 마시기', 10)" style="padding: 6px 10px; font-size: 10px; background: #0f380f; color: #9bbc0f; border: 1px solid #306230; border-radius: 4px; cursor: pointer;">물 10</button>
            <button type="button" onclick="addManualTask('밥 먹기', 10)" style="padding: 6px 10px; font-size: 10px; background: #0f380f; color: #9bbc0f; border: 1px solid #306230; border-radius: 4px; cursor: pointer;">밥 10</button>
            <button type="button" onclick="addManualTask('쓰다듬기', 5)" style="padding: 6px 10px; font-size: 10px; background: #0f380f; color: #9bbc0f; border: 1px solid #306230; border-radius: 4px; cursor: pointer;">쓰담 5</button>
            <button type="button" onclick="addManualTask('운동', 20)" style="padding: 6px 10px; font-size: 10px; background: #0f380f; color: #9bbc0f; border: 1px solid #306230; border-radius: 4px; cursor: pointer;">운동 20</button>
            <button type="button" onclick="addManualTask('독서', 40)" style="padding: 6px 10px; font-size: 10px; background: #0f380f; color: #9bbc0f; border: 1px solid #306230; border-radius: 4px; cursor: pointer;">독서 40</button>
          </div>
          <div class="stats-item" style="flex-wrap: wrap; align-items: center; gap: 6px;">
            <input type="text" id="manualTaskName" placeholder="할 일 이름" maxlength="30"
                   onkeydown="if(event.key==='Enter')submitManualTaskCustom()"
                   style="width: 90px; padding: 6px 8px; font-size: 11px; background: rgba(15,56,15,0.8); border: 2px solid #0f380f; color: #fff; border-radius: 4px;">
            <select id="manualTaskXp" style="padding: 6px 8px; font-size: 11px; background: rgba(15,56,15,0.8); border: 2px solid #0f380f; color: #fff; border-radius: 4px; width: 60px;">
              <option value="5">5</option>
              <option value="10" selected>10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
            <span style="font-size: 10px; opacity: 0.9;">XP</span>
            <button type="button" onclick="submitManualTaskCustom()" style="padding: 6px 10px; font-size: 10px; background: #306230; color: #9bbc0f; border: 1px solid #306230; border-radius: 4px; cursor: pointer;">추가</button>
          </div>
          ` : `
          <div class="stats-item" style="color: #8b7355;">오늘 기록 한도(10건)에 도달했습니다. 내일 다시 시도해 주세요.</div>
          `}
        </div>
        <div class="stats-section">
          <div class="stats-section-title">📊 통계</div>
          <div class="stats-item">
            <span class="stats-label">총 플레이 일수</span>
            <span class="stats-value">${playDaysCount}일</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">총 액션 횟수</span>
            <span class="stats-value">${stats.totalActions}회</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">총 획득 EXP</span>
            <span class="stats-value">${stats.totalExp}점</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">평균 일일 EXP</span>
            <span class="stats-value">${avgDailyExp}점</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">현재 레벨</span>
            <span class="stats-value">LV.${game.level}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">첫 플레이</span>
            <span class="stats-value">${stats.firstPlayDate || '오늘'}</span>
          </div>
        </div>

        <div class="stats-section">
          <div class="stats-section-title">📅 출석 체크</div>
          <div class="stats-item">
            <span class="stats-label">연속 출석</span>
            <span class="stats-value">${stats.consecutiveDays}일 ${stats.consecutiveDays >= 7 ? '🔥' : ''}</span>
          </div>
          <div class="stats-item" style="font-size: 10px; opacity: 0.85;">
            <span class="stats-label">보상</span>
            <span class="stats-value">매일 10 XP · 7일 +50 · 14일 +100 · 21일 +150 · 30일 +300</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">이번 달 출석</span>
            <span class="stats-value">${getMonthlyAttendanceCount()}일</span>
          </div>
          <div class="attendance-calendar-wrap">
            <div class="attendance-calendar-header">
              <span class="attendance-calendar-title">${cal.title} (${cal.count}일 출석)</span>
              <div class="attendance-calendar-nav">
                <button type="button" onclick="changeAttendanceMonth(-1)">◀ 이전</button>
                <button type="button" onclick="changeAttendanceMonth(1)" ${!canGoNextMonth() ? 'disabled' : ''}>다음 ▶</button>
              </div>
            </div>
            <div class="attendance-calendar-weekdays">${cal.weekdays}</div>
            <div class="attendance-calendar">${cal.cells}</div>
          </div>
        </div>
        
        <div class="stats-section">
          <div class="stats-section-title">🎯 일일 목표</div>
          <div class="stats-item">
            <span class="stats-label">오늘 완료</span>
            <span class="stats-value" id="statsGoalCompleteValue">${dailyGoal.completed}/${dailyGoal.target} (${goalPercent}%)</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">목표 설정</span>
            <span class="stats-value">
              <input type="number" id="goalInput" min="1" max="50" value="${dailyGoal.target}" 
                     style="width: 50px; padding: 4px; font-size: 11px; text-align: center; 
                            background: rgba(15,56,15,0.8); border: 2px solid #0f380f; 
                            color: #ffffff; border-radius: 4px;">
              <button onclick="saveGoal()" style="margin-left: 8px; padding: 4px 8px; 
                     font-size: 10px; background: #0f380f; color: #9bbc0f; 
                     border: 2px solid #0f380f; border-radius: 4px; cursor: pointer;">저장</button>
            </span>
          </div>
          ${dailyGoal.achieved ? '<div class="stats-item" id="statsGoalAchievedMsg" style="color: #ffcc00; font-weight: bold;">✨ 오늘 목표 달성!</div>' : ''}
        </div>

        <div class="stats-section">
          <div class="stats-section-title">🎁 쿠폰 입력</div>
          <div class="stats-item" style="flex-wrap: wrap; align-items: center; gap: 6px;">
            <input type="text" id="couponInput" placeholder="사전예약 쿠폰 입력" maxlength="30"
                   onkeydown="if(event.key==='Enter')submitCoupon()"
                   style="flex: 1; min-width: 120px; padding: 6px 10px; font-size: 11px; 
                          background: rgba(15,56,15,0.8); border: 2px solid #0f380f; 
                          color: #fff; border-radius: 4px;">
            <button type="button" onclick="submitCoupon()"
                    style="padding: 6px 12px; font-size: 11px; background: #306230; color: #9bbc0f; 
                           border: 2px solid #306230; border-radius: 4px; cursor: pointer;">등록</button>
          </div>
          <div class="stats-item" style="font-size: 10px; opacity: 0.85;">
            ${getHamsterSkin() === 'baby'
      ? '🐹 응애 하루치 스킨 적용 중!'
      : '사전예약 쿠폰으로 응애 하루치 스킨을 해금하세요!'}
          </div>
        </div>
        ${window.IS_PRO ? `
        <div class="stats-credit">
          제작 by bbaekyohan PRO
        </div>
        ` : ''}
      `;

  modal.classList.add('show');
}

/* 팝업 내 목표 표시 즉시 반영 (저장 후 호출) */
function updateStatsPopupGoal() {
  const el = document.getElementById('statsGoalCompleteValue');
  if (el) {
    const percent = dailyGoal.target > 0
      ? Math.min(Math.floor((dailyGoal.completed / dailyGoal.target) * 100), 100)
      : 0;
    el.textContent = `${dailyGoal.completed}/${dailyGoal.target} (${percent}%)`;
  }
  let achievedDiv = document.getElementById('statsGoalAchievedMsg');
  if (dailyGoal.achieved || dailyGoal.completed >= dailyGoal.target) {
    if (!achievedDiv) {
      achievedDiv = document.createElement('div');
      achievedDiv.id = 'statsGoalAchievedMsg';
      achievedDiv.className = 'stats-item';
      achievedDiv.style.cssText = 'color: #ffcc00; font-weight: bold;';
      achievedDiv.textContent = '✨ 오늘 목표 달성!';
      const goalSection = document.getElementById('statsContent')?.querySelector('.stats-section');
      const lastItem = goalSection?.querySelector('.stats-item:last-of-type');
      if (lastItem) lastItem.after(achievedDiv);
    }
  } else if (achievedDiv) {
    achievedDiv.remove();
  }
}

/* 목표 저장 */
function saveGoal() {
  const input = document.getElementById('goalInput');
  if (input) {
    const newTarget = parseInt(input.value) || 5;
    if (newTarget >= 1 && newTarget <= 50) {
      const wasAchieved = dailyGoal.achieved;
      dailyGoal.target = newTarget;

      // 목표 달성 상태 재계산
      if (dailyGoal.completed >= dailyGoal.target) {
        if (!wasAchieved) {
          // 새로 달성한 경우에만 효과 표시
          dailyGoal.achieved = true;
          showGoalAchievedEffect();
          log(`🎯 목표 달성! (목표 변경으로 달성)`);
        } else {
          dailyGoal.achieved = true;
        }
      } else {
        dailyGoal.achieved = false;
      }

      saveDailyGoal();
      updateGoalUI();
      updateStatsPopupGoal(); /* 팝업 내 목표 표시 즉시 반영 */
      log(`🎯 일일 목표가 ${newTarget}개로 변경되었습니다.`);
      35
    }
  }
}

/* 목표 달성 효과 */
function showGoalAchievedEffect() {
  // 하루치에 특별 효과
  hamster.classList.add('levelup');
  setTimeout(() => {
    hamster.classList.remove('levelup');
  }, 1000);

  // 화면 플래시 효과 (레벨업보다 부드럽게)
  const flash = document.createElement('div');
  flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255,204,0,0.3) 0%, transparent 70%);
        pointer-events: none;
        z-index: 400;
        animation: fadeOut 0.8s ease-out forwards;
      `;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 800);
}

function closeStats() {
  const modal = document.getElementById('statsModal');
  modal.classList.remove('show');
}

/* 모달 외부 클릭 시 닫기 */
document.addEventListener('click', function (e) {
  if (e.target === document.getElementById('statsModal')) closeStats();
  if (e.target === document.getElementById('logModal')) closeLogModal();
});

/* 키보드 'S' 키로 통계 열기, Escape로 모달 닫기 */
document.addEventListener('keydown', function (e) {
  if (e.key === 's' || e.key === 'S') {
    const activeElement = document.activeElement;
    if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
      showStats();
    }
  }
  if (e.key === 'Escape') {
    closeStats();
    closeLogModal();
  }
});

/* 레벨별 칭호 시스템 */
function getTitleByLevel(level) {
  if (level >= 1000) return "🌌 우주급 성장 마스터";
  if (level >= 500) return "🌟 전설의 성장왕";
  if (level >= 300) return "💎 다이아몬드 성장가";
  if (level >= 200) return "👑 플래티넘 마스터";
  if (level >= 150) return "🏆 골드 챔피언";
  if (level >= 100) return "⭐ 골드 성장가";
  if (level >= 80) return "🔥 열정의 마스터";
  if (level >= 60) return "💪 습관의 달인";
  if (level >= 50) return "🎯 목표 달성 전문가";
  if (level >= 40) return "📚 지식의 수집가";
  if (level >= 30) return "🎯 목표 달성자";
  if (level >= 25) return "📊 성장 기록가";
  if (level >= 20) return "✨ 성장하는 리더";
  if (level >= 17) return "🏃 꾸준함의 증명자";
  if (level >= 15) return "💪 노력하는 하루치";
  if (level >= 12) return "📝 습관 만들기 중";
  if (level >= 10) return "📈 성장 중인 하루치";
  if (level >= 7) return "🌿 조금씩 자라는 중";
  if (level >= 5) return "🌱 새싹 하루치";
  return "🐹 새내기 하루치";
}

function updateUI() {
  if (!uiLevel || !uiExp || !expText) return;
  uiLevel.innerText = game.level;
  const pct = Math.min(100, (game.exp / getMaxExp(game.level)) * 100);
  uiExp.style.width = `${pct}%`;
  expText.innerText = `${Math.floor(pct)}%`;

  // 칭호 업데이트
  const title = getTitleByLevel(game.level);
  const titleElement = document.getElementById('hamsterTitle');
  if (titleElement) {
    titleElement.textContent = title;
  }

  // 목표 UI 업데이트
  updateGoalUI();
}

function addToLogHistory(msg, kind, category, xp, date) {
  const safeMsg = typeof msg === 'string' ? msg : String(msg ?? '');
  const safeCategory = category == null ? null : String(category);
  const safeDate = date == null ? null : String(date);
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'short' });
  logHistory.unshift({
    msg: safeMsg,
    kind: kind || 'normal',
    category: safeCategory || null,
    xp: xp != null ? xp : null,
    date: safeDate != null ? safeDate : now
  });
  if (logHistory.length > 200) logHistory.pop();
}

/* 수동 할 일 기록 - XP 상한·일일 10건 제한 */
function addManualTask(name, xp) {
  const count = getDailyManualTaskCount();
  if (count >= MANUAL_TASK_DAILY_LIMIT) {
    log('📌 오늘 수동 기록 한도(10건)에 도달했습니다.', { kind: 'system' });
    showStats(false);
    return;
  }
  const capped = Math.min(Math.max(5, Math.floor(xp) || 10), MANUAL_TASK_XP_CAP);
  const displayName = (name || '할 일').trim() || '할 일';
  log(`✏ ${displayName} +${capped} XP`, { category: '수동기록', xp: capped });
  game.exp += capped;
  while (game.exp >= getMaxExp(game.level)) {
    game.exp -= getMaxExp(game.level);
    game.level++;
    logLevelUp(`⭐ LEVEL UP! LV.${game.level} ⭐`);
    showLevelUpEffect();
  }
  saveStats();
  updateStats(capped, true);
  saveDailyManualTaskCount(count + 1);
  updateUI();
  showStats(false);
}
function submitManualTaskCustom() {
  const input = document.getElementById('manualTaskName');
  const select = document.getElementById('manualTaskXp');
  const name = (input && input.value.trim()) || '할 일';
  const xp = (select && parseInt(select.value, 10)) || 10;
  addManualTask(name, xp);
  if (input) input.value = '';
}

function log(msg, opts) {
  opts = opts || {};
  addToLogHistory(msg, opts.kind || 'normal', opts.category || null, opts.xp != null ? opts.xp : null);
  if (!uiLog) return;
  const item = document.createElement('div');
  item.className = 'log-item new' + (opts.category ? ' log-cat-' + opts.category : '');
  item.innerText = `> ${msg}`;
  uiLog.prepend(item);
  if (uiLog.children.length > 20) uiLog.removeChild(uiLog.lastChild);
}

function logLevelUp(msg) {
  addToLogHistory(msg, 'level-up', '레벨업', null);
  if (!uiLog) return;
  const item = document.createElement('div');
  item.className = 'log-item new level-up';
  item.innerText = `> ${msg}`;
  uiLog.prepend(item);
  if (uiLog.children.length > 20) uiLog.removeChild(uiLog.lastChild);
}

function logImportant(msg) {
  addToLogHistory(msg, 'important', null, null);
  if (!uiLog) return;
  const item = document.createElement('div');
  item.className = 'log-item new important';
  item.innerText = `> ${msg}`;
  uiLog.prepend(item);
  if (uiLog.children.length > 20) uiLog.removeChild(uiLog.lastChild);
}

async function openLogModal() {
  if (NOTION_ENABLED) await fetchAndMergeNotionLogs(); /* 열 때마다 최신 노션 완료 로그 반영 */
  const content = document.getElementById('logModalContent');
  if (!content) return;
  const all = logHistory.length ? logHistory : [
    { msg: '시스템 가동..', kind: 'normal', category: null, xp: null, date: null },
    { msg: '하루치가 기다려요!', kind: 'normal', category: null, xp: null, date: null }
  ];
  const taskLogs = all.filter(e => e.category && LOG_CATEGORY_TASK.includes(e.category));
  const clickLogs = all.filter(e => e.category && LOG_CATEGORY_CLICK.includes(e.category));
  const otherLogs = all.filter(e => !e.category || (!LOG_CATEGORY_TASK.includes(e.category) && !LOG_CATEGORY_CLICK.includes(e.category)));

  function renderSectionNode(title, entries, sectionClass) {
    if (entries.length === 0) return null;

    const section = document.createElement('div');
    section.className = `log-section ${sectionClass}`;

    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'log-section-title';
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);

    entries.forEach((e) => {
      const line = document.createElement('div');
      line.className = 'log-line';
      if (e.kind === 'level-up') line.classList.add('level-up');
      if (e.kind === 'important') line.classList.add('important');

      if (e.date) {
        const dateSpan = document.createElement('span');
        dateSpan.className = 'log-date';
        dateSpan.textContent = String(e.date);
        line.appendChild(dateSpan);
        line.appendChild(document.createTextNode(' '));
      }

      if (e.category) {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'log-cat-tag';
        tagSpan.textContent = String(e.category);
        line.appendChild(tagSpan);
        line.appendChild(document.createTextNode(' '));
      }

      const msg = String(e.msg ?? '');
      line.appendChild(document.createTextNode(`> ${msg}`));

      if (e.xp != null && !msg.includes('+' + e.xp)) {
        line.appendChild(document.createTextNode(' '));
        const xpSpan = document.createElement('span');
        xpSpan.className = 'log-xp';
        xpSpan.textContent = `+${e.xp} XP`;
        line.appendChild(xpSpan);
      }

      section.appendChild(line);
    });

    return section;
  }

  content.innerHTML = '';

  if (NOTION_ENABLED) {
    const refreshWrap = document.createElement('div');
    refreshWrap.className = 'log-refresh-wrap';
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'log-refresh-btn';
    refreshBtn.type = 'button';
    refreshBtn.textContent = '🔄 새로고침';
    refreshBtn.addEventListener('click', openLogModal);
    refreshWrap.appendChild(refreshBtn);
    content.appendChild(refreshWrap);
  }

  const sections = [
    renderSectionNode('📌 할일 완료 경험치 (할일/루틴/운동/독서/책/SNS)', taskLogs, 'log-section-task'),
    renderSectionNode('🖱 클릭 경험치 (밥/물/쓰다듬기)', clickLogs, 'log-section-click'),
    renderSectionNode('📋 기타', otherLogs, 'log-section-other')
  ];
  sections.forEach((section) => {
    if (section) content.appendChild(section);
  });

  document.getElementById('logModal').classList.add('show');
}

function closeLogModal() {
  document.getElementById('logModal').classList.remove('show');
}

init();
/* 노션 임베드 또는 iframe에서만 오프닝 화면 생략
   단, 로컬 개발(Live Server)에서는 오프닝 위치 조정 테스트를 위해 자동 스킵하지 않음 */
const isLocalDevHost = /^(localhost|127\.0\.0\.1)$/i.test(location.hostname || '');
const SKIP_OPENING_FOR_NOTION = NOTION_ENABLED && !isLocalDevHost;
if (SKIP_OPENING_FOR_NOTION) {
  startGame();
} else {
  document.body.classList.remove('opening-closed');
  /* 게임기 버전: 오프닝 화면 표시, 터치 시 재생 시작 */
  (function () {
    var o = document.getElementById('openingBgm');
    if (o) {
      o.volume = 0.6;
      o.loop = true;
    }
    var startScreen = document.getElementById('startScreen');
    function onFirstTouch() {
      unmuteOpening();
      startScreen.removeEventListener('click', onFirstTouch, true);
      startScreen.removeEventListener('touchstart', onFirstTouch, true);
    }
    if (startScreen) {
      startScreen.addEventListener('click', onFirstTouch, true);
      startScreen.addEventListener('touchstart', onFirstTouch, { passive: true, capture: true });
    }
  })();
}

/* ===== 똑똑한 잔소리 (Smart Feedback) 시스템 ===== */
const SMART_FEEDBACK = {
  /* 달성률 100% */
  perfect: [
    '와! 다 해냈어! 오늘 최고야! 🌻',
    '대단해! 오늘 목표 완벽 달성! ✨',
    '역시 너야! 하루치가 자랑스러워! 🏆',
    '완벽한 하루! 해바라기가 활짝! 🌻✨',
    '오늘 100%! 너 진짜 멋있어! 💛'
  ],
  /* 달성률 70~99% */
  good: [
    '거의 다 왔어! 조금만 더 화이팅! 💪',
    '오~ 잘하고 있어! 마무리만 남았다! 🐹',
    '이 속도면 금방이야! 응원해! 📣',
    '대부분 끝냈네! 마지막 스퍼트! 🔥',
    '조금만 더! 하루치가 기다리고 있어! 🌟'
  ],
  /* 달성률 50~69% */
  half: [
    '반은 했네! 하루치 믿고 있을게~ 🐹',
    '절반 넘었어! 페이스 유지하자! 💪',
    '좋아좋아~ 이 페이스면 돼! 👍',
    '반쯤 왔어! 쉬어가도 괜찮아~ ☕',
    '하루치도 응원 중! 할 수 있어! 📣'
  ],
  /* 달성률 30~49% */
  low: [
    '음... 오늘 좀 바빴어? 괜찮아~ 🐹',
    '천천히 해도 돼, 중요한 건 꾸준함! 🌱',
    '하나만 더 해볼까? 작은 것부터! 📝',
    '오늘 컨디션 안 좋아? 쉬어도 돼~ 😊',
    '하루치가 옆에서 기다릴게~ 🐹💤'
  ],
  /* 달성률 0~29% */
  start: [
    '하루치 좀 심심해... 내일은 같이 하자! 🐹',
    '오늘은 쉬는 날인가? 괜찮아~ 😊',
    '하나만 해보면 어때? 작은 거라도! 🌱',
    '시작이 반이야! 뭐든 하나 적어볼까? ✏️',
    '하루치가 기다리고 있어요~ 🐹💕'
  ],
  /* 연속 출석 7일 이상 특별 메시지 */
  streak: [
    '일주일 연속이라니! 너 진짜 대단해! 🔥',
    '연속 출석 중! 습관이 되고 있어! 🌟',
    '꾸준함이 최고야! 하루치도 쑥쑥! 🌻',
    '매일 와줘서 고마워! 하루치 행복해! 💛',
    '연속 기록 갱신 중! 멈추지 마! 🏃‍♂️✨'
  ]
};

/* 마지막 피드백 표시 시간 (스팸 방지) */
let lastFeedbackTime = 0;
const FEEDBACK_COOLDOWN_MS = 30000; /* 최소 30초 간격 */
const FEEDBACK_SHOW_DURATION = 4000; /* 말풍선 표시 시간 4초 */
const FEEDBACK_CHANCE = 0.3; /* 액션 시 30% 확률로 표시 */

/**
 * 현재 달성률을 기반으로 피드백 메시지를 선택합니다.
 * @returns {{ text: string, tier: string }}
 */
function getSmartFeedbackMessage() {
  /* 연속 출석 7일 이상이면 50% 확률로 streak 메시지 */
  if (stats.consecutiveDays >= 7 && Math.random() < 0.5) {
    const arr = SMART_FEEDBACK.streak;
    return { text: arr[Math.floor(Math.random() * arr.length)], tier: 'streak' };
  }

  /* 달성률 계산 */
  const rate = dailyGoal.target > 0
    ? Math.min(Math.floor((dailyGoal.completed / dailyGoal.target) * 100), 100)
    : 0;

  let tier, arr;
  if (rate >= 100) { tier = 'perfect'; arr = SMART_FEEDBACK.perfect; }
  else if (rate >= 70) { tier = 'good'; arr = SMART_FEEDBACK.good; }
  else if (rate >= 50) { tier = 'half'; arr = SMART_FEEDBACK.half; }
  else if (rate >= 30) { tier = 'low'; arr = SMART_FEEDBACK.low; }
  else { tier = 'start'; arr = SMART_FEEDBACK.start; }

  return { text: arr[Math.floor(Math.random() * arr.length)], tier };
}

/**
 * 피드백 말풍선을 표시합니다.
 * @param {boolean} force - true면 쿨다운 무시하고 강제 표시
 */
function showSmartFeedback(force = false) {
  const now = Date.now();
  if (!force && now - lastFeedbackTime < FEEDBACK_COOLDOWN_MS) return;
  if (!force && Math.random() > FEEDBACK_CHANCE) return;

  const bubble = document.getElementById('feedbackSpeechBubble');
  if (!bubble) return;

  /* 이미 표시 중이면 무시 */
  if (bubble.classList.contains('show')) return;

  const { text } = getSmartFeedbackMessage();
  bubble.textContent = text;
  bubble.classList.remove('hiding');
  bubble.classList.add('show');
  lastFeedbackTime = now;

  /* 일정 시간 후 사라짐 */
  setTimeout(() => {
    bubble.classList.add('hiding');
    setTimeout(() => {
      bubble.classList.remove('show', 'hiding');
    }, 300);
  }, FEEDBACK_SHOW_DURATION);
}

/**
 * 첫 접속 시 환영 피드백 (하루 1회)
 */
function showWelcomeFeedback() {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  const key = 'hamsterFeedbackWelcome';
  try {
    if (localStorage.getItem(key) === today) return;
  } catch (_) { }

  localStorage.setItem(key, today);
  /* 게임 시작 2초 후 환영 메시지 */
  setTimeout(() => showSmartFeedback(true), 2000);
}

/* 게임 시작 시 환영 피드백 트리거 */
showWelcomeFeedback();

/* 개발자 도구 (콘솔에서 dev.xxx 호출 가능) */
window.dev = {

  addExp: function (amount) { addExp(amount); },
  levelUp: function () { game.exp = getMaxExp(game.level); addExp(0); },
  setLevel: function (level) { game.level = level; game.exp = 0; updateUI(); },
  setExp: function (exp) { game.exp = exp; updateUI(); },
  status: function () { console.log(`LV.${game.level} EXP:${game.exp}/${getMaxExp(game.level)}`); },
  feedback: function () { showSmartFeedback(true); } /* 피드백 강제 표시 */
};

/* 그루밍 애니메이션 조정 패널 함수들 */
function openGroomingAdjustPanel(event) {
  // 이벤트 전파 방지 (스킨 변경 이벤트와 충돌 방지)
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  const panel = document.getElementById('groomingAdjustPanel');
  if (!panel) return;

  // 현재 CSS 변수 값 읽어서 슬라이더에 반영
  const bodyStyles = getComputedStyle(document.body);
  const rootStyles = getComputedStyle(document.documentElement);

  const groomingTop = bodyStyles.getPropertyValue('--grooming-top') ||
    rootStyles.getPropertyValue('--grooming-top') || '75%';
  const groomingLeft = bodyStyles.getPropertyValue('--grooming-left') ||
    rootStyles.getPropertyValue('--grooming-left') || '50%';
  const groomingOffsetX = bodyStyles.getPropertyValue('--grooming-offset-x') ||
    rootStyles.getPropertyValue('--grooming-offset-x') || '0px';
  const groomingOffsetY = bodyStyles.getPropertyValue('--grooming-offset-y') ||
    rootStyles.getPropertyValue('--grooming-offset-y') || '-30px';
  const groomingClipTop = bodyStyles.getPropertyValue('--grooming-clip-top') ||
    rootStyles.getPropertyValue('--grooming-clip-top') || '28px';
  const groomingSpeed = bodyStyles.getPropertyValue('--grooming-animation-speed') ||
    rootStyles.getPropertyValue('--grooming-animation-speed') || '150ms';

  document.getElementById('groomingTop').value = parseFloat(groomingTop) || 75;
  document.getElementById('groomingTopValue').textContent = groomingTop;
  document.getElementById('groomingLeft').value = parseFloat(groomingLeft) || 50;
  document.getElementById('groomingLeftValue').textContent = groomingLeft;
  document.getElementById('groomingOffsetX').value = parseFloat(groomingOffsetX) || 0;
  document.getElementById('groomingOffsetXValue').textContent = groomingOffsetX;
  document.getElementById('groomingOffsetY').value = parseFloat(groomingOffsetY) || -30;
  document.getElementById('groomingOffsetYValue').textContent = groomingOffsetY;
  document.getElementById('groomingClipTop').value = parseFloat(groomingClipTop) || 28;
  document.getElementById('groomingClipTopValue').textContent = groomingClipTop;
  document.getElementById('groomingSpeed').value = parseFloat(groomingSpeed.replace('ms', '')) || 150;
  document.getElementById('groomingSpeedValue').textContent = groomingSpeed;

  // 행별 Y 오프셋
  for (let i = 0; i < 4; i++) {
    const rowY = bodyStyles.getPropertyValue(`--grooming-row-${i}-y-offset`) ||
      rootStyles.getPropertyValue(`--grooming-row-${i}-y-offset`) || '0px';
    const value = parseFloat(rowY) || 0;
    document.getElementById(`groomingRow${i}Y`).value = value;
    document.getElementById(`groomingRow${i}YValue`).textContent = rowY;
  }

  panel.classList.add('is-open');
}

function closeGroomingAdjustPanel() {
  const panel = document.getElementById('groomingAdjustPanel');
  if (panel) panel.classList.remove('is-open');
}

function updateGroomingValue(type, value) {
  if (type === 'top') {
    document.body.style.setProperty('--grooming-top', value + '%');
    document.getElementById('groomingTopValue').textContent = value + '%';
  } else if (type === 'left') {
    document.body.style.setProperty('--grooming-left', value + '%');
    document.getElementById('groomingLeftValue').textContent = value + '%';
  } else if (type === 'offsetX') {
    document.body.style.setProperty('--grooming-offset-x', value + 'px');
    document.getElementById('groomingOffsetXValue').textContent = value + 'px';
  } else if (type === 'offsetY') {
    document.body.style.setProperty('--grooming-offset-y', value + 'px');
    document.getElementById('groomingOffsetYValue').textContent = value + 'px';
  } else if (type === 'clipTop') {
    document.body.style.setProperty('--grooming-clip-top', value + 'px');
    document.getElementById('groomingClipTopValue').textContent = value + 'px';
  } else if (type === 'speed') {
    document.body.style.setProperty('--grooming-animation-speed', value + 'ms');
    document.getElementById('groomingSpeedValue').textContent = value + 'ms';
  }

  // 실행 중인 애니메이션에 즉시 반영
  const groomingOverlay = document.getElementById('groomingOverlay');
  if (groomingOverlay && groomingOverlay.classList.contains('active')) {
    const bodyStyles = getComputedStyle(document.body);
    const rootStyles = getComputedStyle(document.documentElement);
    const groomingTop = bodyStyles.getPropertyValue('--grooming-top') ||
      rootStyles.getPropertyValue('--grooming-top') || '68%';
    const groomingLeft = bodyStyles.getPropertyValue('--grooming-left') ||
      rootStyles.getPropertyValue('--grooming-left') || '50%';
    const groomingOffsetX = bodyStyles.getPropertyValue('--grooming-offset-x') ||
      rootStyles.getPropertyValue('--grooming-offset-x') || '0px';
    const groomingOffsetY = bodyStyles.getPropertyValue('--grooming-offset-y') ||
      rootStyles.getPropertyValue('--grooming-offset-y') || '0px';

    groomingOverlay.style.top = `calc(${groomingTop} + ${groomingOffsetY})`;
    groomingOverlay.style.left = `calc(${groomingLeft} + ${groomingOffsetX})`;
  }
}

function updateGroomingRowOffset(row, axis, value) {
  document.body.style.setProperty(`--grooming-row-${row}-${axis}-offset`, value + 'px');
  document.getElementById(`groomingRow${row}${axis.toUpperCase()}Value`).textContent = value + 'px';

  // 실행 중인 애니메이션에 즉시 반영
  if (window.groomingAnimationInterval) {
    if (typeof updateGroomingFrame === 'function') {
      updateGroomingFrame();
    }
  }
}

function resetGroomingValues() {
  // 블랙 스킨 기본값으로 리셋
  const currentTheme = document.body.getAttribute('data-frame-theme') || 'classic';
  if (currentTheme === 'black') {
    document.body.style.setProperty('--grooming-top', '68%');
    document.body.style.setProperty('--grooming-left', '50%');
    document.body.style.setProperty('--grooming-offset-x', '0px');
    document.body.style.setProperty('--grooming-offset-y', '-30px');
    document.body.style.setProperty('--grooming-clip-top', '28px');
    document.body.style.setProperty('--grooming-animation-speed', '150ms');
    for (let i = 0; i < 4; i++) {
      document.body.style.setProperty(`--grooming-row-${i}-y-offset`, '0px');
    }
  } else {
    // 기본 스킨 값으로 리셋
    document.body.style.setProperty('--grooming-top', '60%');
    document.body.style.setProperty('--grooming-left', '50%');
    document.body.style.setProperty('--grooming-offset-x', '0px');
    document.body.style.setProperty('--grooming-offset-y', '-30px');
    document.body.style.setProperty('--grooming-clip-top', '28px');
    document.body.style.setProperty('--grooming-animation-speed', '120ms');
    for (let i = 0; i < 4; i++) {
      document.body.style.setProperty(`--grooming-row-${i}-y-offset`, '0px');
    }
  }

  // 패널 값도 업데이트
  openGroomingAdjustPanel();
}

// 바깥 클릭 시 그루밍 조정 패널 닫기
document.addEventListener('click', function (e) {
  const panel = document.getElementById('groomingAdjustPanel');
  if (!panel || !panel.classList.contains('is-open')) return;
  const isInside = panel.contains(e.target);
  if (!isInside) {
    panel.classList.remove('is-open');
  }
});

/* === 브라우저 탭 타이틀 동적 변경 === */
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    document.title = '하루치가 기다려요! ';
  } else {
    document.title = '하루치 - 햄스터 다마고치 ';
  }
});
