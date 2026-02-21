# 🔄 하루치 파일 구조 리팩토링 가이드

> **이 문서는 Cursor와 Antigravity 모두를 위한 리팩토링 기록입니다.**
> 모든 AI 에이전트는 작업 전에 이 문서를 읽어주세요.

---

## ⚠️ 중요 변경 사항

**기존 4,710줄 모놀리스 `index.html`이 3개 파일로 분리되었습니다.**

```
[이전]
tama/
  index.html          ← 4,710줄 (HTML + CSS + JS 전부 인라인)

[이후]
tama/
  index.html           ← 204줄 (HTML 구조 + 외부 파일 참조만)
  css/
    styles.css         ← 2,154줄 (모든 CSS)
  js/
    game.js            ← 2,352줄 (모든 JS)

  index.html.backup    ← 원본 백업 (리팩토링 전 상태)
  index.html.old       ← 리팩토링 직전 상태 (Cursor 작업 포함)
```

---

## 📂 파일별 역할

### `index.html` (204줄) — HTML 구조만
- `<head>`: meta 태그, Google Fonts, OG 태그
- `<script>`: 티어 판별 (`APP_TIER`, `IS_PRO`), 노션 임베드 감지
- `<link rel="stylesheet" href="css/styles.css">`: 외부 CSS 참조
- `<body>`: HTML 구조 (오디오, 시작 화면, 게임 화면, 모달)
- `<script src="js/game.js">`: 외부 JS 참조
- Vercel Speed Insights

### `css/styles.css` (2,154줄) — 모든 스타일
- `:root` CSS 변수 (프레임 크기, 색상, 위치값)
- 스킨별 변수 오버라이드 (classic, black, white, haruchi1, haruchi2)
- 레이아웃 (device-wrapper, screen-top, screen-bottom)
- 노션 임베드 전용 스타일
- 게임 UI (레벨바, 로그, 통계 패널)
- 애니메이션 (@keyframes)
- 말풍선 (angry, drink, butt, feedback)
- 모달 (통계, 로그)
- 시작 화면
- 반응형/모바일 스타일

### `js/game.js` (2,352줄) — 모든 게임 로직
- 프레임 스킨 매핑 및 관리
- DOM 참조 (`hamster`, `uiLevel`, `uiExp` 등)
- 게임 상태 (`game`, `stats`, `dailyGoal`)
- localStorage 관리 (저장/불러오기)
- 클릭 핸들러 (`handleHamsterClick`, `handleBowlClick`, `handleWaterBottleClick`)
- 애니메이션 (changeAction, changeSleepAction, changeDrinkAction)
- 감정 표현 (sad, angry, grooming)
- Smart Feedback 시스템
- 통계 팝업 (`showStats`)
- 로그 시스템 (`log`, `openLogModal`)
- 레벨/칭호 시스템
- 일일 목표 / 출석 추적
- 노션 XP 동기화
- 초기화 (`init`, `startGame`)
- 개발자 도구 (`window.dev`)

---

## 🛠 작업 가이드

### CSS 수정 시
```
파일: tama/css/styles.css
```
- CSS 변수 변경 → `:root` 또는 `body[data-frame-theme="xxx"]` 블록
- 레이아웃/크기 조정 → 해당 클래스 검색
- 새 애니메이션 추가 → `@keyframes` 섹션 끝에 추가

### JS 수정 시
```
파일: tama/js/game.js
```
- 새 기능 추가 → 파일 끝 (`window.dev` 위)에 추가
- 핸들러 수정 → `handle~Click()` 함수 검색
- 상태 변수 추가 → `game` 또는 `stats` 객체 근처

### HTML 구조 수정 시
```
파일: tama/index.html
```
- 새 UI 요소 추가 → `<body>` 내 해당 위치
- 스크립트 추가 → `</body>` 위에 새 `<script>` 태그

---

## ⚡ Cursor 작업 시 주의사항

1. **더 이상 `index.html`에 CSS/JS를 인라인으로 넣지 마세요.**
   - CSS 변경 → `css/styles.css`
   - JS 변경 → `js/game.js`

2. **Cursor가 이전에 `index.html`에 추가한 코드는 모두 이관되었습니다.**
   - 블랙/화이트 스킨 변수, 버튼 D, 프레임 스킨 리팩토링 등 Cursor가 작업한 내용은 모두 `css/styles.css`와 `js/game.js`에 포함되어 있습니다.

3. **백업 파일 참고 가능:**
   - `index.html.backup` — Antigravity가 리팩토링 시작 전에 만든 백업
   - `index.html.old` — 리팩토링 직전 상태 (Cursor 작업 포함)
   - 필요 시 이 파일들로 변경 전 코드를 확인할 수 있습니다.

---

## 🔍 확인 필요 사항

리팩토링 후 다음 사항을 확인해 주세요:
- [ ] 게임이 정상적으로 시작되는지
- [ ] 모든 클릭 인터랙션이 동작하는지
- [ ] 스킨 변경이 정상 작동하는지
- [ ] 노션 임베드 모드가 정상 작동하는지
- [ ] 모바일에서 정상 표시되는지

---

*리팩토링 수행: Antigravity (2026-02-20)*
*4,710줄 → 204줄 + 2,154줄(CSS) + 2,352줄(JS)*
