# 하루치 Pro 버전 기능 구현 로드맵

> 6개 프로 기능의 구현 계획 및 기술 요구사항

---

## 📋 기능 개요

| # | 기능 | 한글 | 요약 |
|---|------|------|------|
| 1 | Auto-Leveling | 자동 성장 시스템 | 노션 체크만 하면 XP 자동 충전 |
| 2 | Streak Calendar | 습관 달력 | 캘린더에 도장처럼 기록 |
| 3 | Integrated Dashboard | 통합 대시보드 | 한 화면에 모든 정보 |
| 4 | App-like View | 모바일 최적화 뷰 | 전용 모바일 레이아웃 |
| 5 | AI Growth Report | AI 성장 리포트 | 주/월별 습관 요약 |
| 6 | AI Daily Feedback | AI 하루 피드백 | 오늘의 응원 메시지 |

---

## ① 자동 성장 시스템 (Auto-Leveling)

**목표:** "이제 밥 일일이 안 줘도 돼요!" — 노션 할 일 ✔ 체크만 하면 XP 바 자동 충전

### 현재 상태
- ✅ 노션 XP 연동 존재 (`fetchAndApplyNotionXP`, 60초 간격)
- ✅ notion-sync → XP 로그 DB → api/game 조회

### 구현 과제
- [ ] **폴링 간격 단축** (60초 → 30초 또는 15초) — 체크 직후 반영 속도 개선
- [ ] **실시간 감지** (선택) — Notion API Webhook이 있다면 연동 검토
- [ ] **노션 없이도 작동** — 기본 버전은 수동 기록, 프로만 노션 자동
- [ ] **UX 문구** — "노션에서 체크만 하면 자동으로!" 안내 추가

### 기술 스택
- 기존: `api/game.js`, `notion-sync/index.js`
- 변경: index.html 내 `setInterval` 값 조정, Pro 전용 안내 UI

---

## ② 습관 달력 (Streak Calendar)

**목표:** "내 노력이 예쁘게 쌓여요" — 습관한 날이 캘린더에 도장처럼 기록

### 현재 상태
- ✅ 출석 체크 캘린더 존재 (통계 모달 내 월별 달력)
- ✅ `playDays` (액션한 날), `consecutiveDays` (연속 출석) 저장

### 구현 과제
- [ ] **Pro 전용 강화** — `IS_PRO` 시 습관 달력을 더 눈에 띄게 배치
- [ ] **노션 습관 연동** (선택) — 노션 DB의 체크일과 병합 표시
- [ ] **시각 개선** — 도장/스탬프 느낌의 스타일 강화
- [ ] **독립 뷰** — 통합 대시보드와 연계해 상단/전용 섹션으로 노출

### 기술 스택
- 기존: `getAttendanceCalendarHTML`, `stats.playDays`
- 변경: CSS 개선, Pro 분기, (선택) 노션 로그 기반 날짜 병합

---

## ③ 통합 대시보드 (Integrated Dashboard)

**목표:** "다 모아서 한 화면에!" — 하루치 상태, 습관, 목표를 한곳에

### 현재 상태
- ✅ 통계 모달에 할 일 기록, 통계, 출석, 목표, 쿠폰 존재
- ⚠️ 레이아웃이 리스트 형태, 대시보드 느낌은 부족

### 구현 과제
- [ ] **Pro 전용 대시보드 UI** — 카드형/그리드 레이아웃
- [ ] **한 화면 구성** — 하루치 상태 + 습관 캘린더 + 목표 진행률
- [ ] **반응형** — 모바일에서도 한 화면에 잘 보이도록
- [ ] **접근 경로** — 왼쪽 패널 더블클릭 유지, Pro는 전용 대시보드 탭/모드

### 기술 스택
- CSS Grid/Flexbox 재구성
- `showStats()` 내 `IS_PRO` 분기로 다른 HTML 렌더링
- 기존 stats 데이터 활용

---

## ④ 모바일 최적화 뷰 (App-like View)

**목표:** "스마트폰에서도 앱처럼!" — 출퇴근 중 바로 체크·하루치 확인

### 현재 상태
- ✅ 기본 반응형 (`fitScale`, viewport)
- ⚠️ 노션 임베드 iframe 기준이라 모바일에서 조작이 다소 불편할 수 있음

### 구현 과제
- [ ] **모바일 감지** — `window.innerWidth < 768` 등
- [ ] **Pro 전용 모바일 레이아웃** — 터치 친화적 버튼 크기, 간소화된 UI
- [ ] **전용 모바일 페이지** (선택) — `/mobile` 등 별도 경로로 진입
- [ ] **PWA** (선택) — manifest, service worker로 앱처럼 설치

### 기술 스택
- CSS `@media`, `touch-action`
- `IS_PRO && isMobile` 분기
- (선택) `manifest.json`, service worker

---

## ⑤ AI 성장 리포트 (AI Growth Report)

**목표:** "AI가 내 습관을 정리해줘요" — 주/월별 어떤 습관을 잘 지켰는지 요약

### 구현 과제
- [ ] **데이터 수집** — 플레이일, 액션 유형, XP, 목표 달성률 등
- [ ] **API 엔드포인트** — `api/ai-report.js` 등 (Vercel Serverless)
- [ ] **AI 연동** — OpenAI / Claude / 기타 LLM API
- [ ] **프롬프트 설계** — "이 사용자의 이번 주 습관 데이터: ... 요약해줘"
- [ ] **UI** — 대시보드 또는 별도 섹션에 "이번 주 리포트" 표시
- [ ] **비용·제한** — API 호출 횟수 제한, 캐싱(일 1회 등)

### 기술 스택
- 신규: `api/ai-report.js` (또는 `api/ai.js`에 action 추가)
- 환경변수: `OPENAI_API_KEY` 등
- 기존 stats + logHistory 데이터 활용

---

## ⑥ AI 하루 피드백 (AI Daily Feedback)

**목표:** "오늘 하루치가 한마디해줘요" — "오늘 물 마시기 잘했어요!" 같은 응원

### 구현 과제
- [ ] **오늘 데이터 요약** — 오늘 한 액션/할 일 목록
- [ ] **AI 프롬프트** — "오늘 사용자 한 일: 물2, 밥1, 독서1... → 한 줄 응원 메시지"
- [ ] **API** — `api/ai-feedback.js` 또는 `api/ai.js?action=dailyFeedback`
- [ ] **UI** — 대시보드 상단 또는 하루치 근처에 말풍선 형태로 표시
- [ ] **캐싱** — 같은 날 재방문 시 저장된 피드백 재사용

### 기술 스택
- AI API (OpenAI 등)
- `logHistory` 필터링 (오늘 날짜)
- localStorage 캐시: `hamsterAIFeedback_{date}`

---

## 🗓 권장 구현 순서

| 순서 | 기능 | 난이도 | 의존성 |
|------|------|--------|--------|
| 1 | ① 자동 성장 | 낮음 | 기존 인프라 |
| 2 | ② 습관 달력 | 낮음 | 기존 출석 시스템 |
| 3 | ③ 통합 대시보드 | 중간 | ② 활용 |
| 4 | ④ 모바일 뷰 | 중간 | ③ 레이아웃 |
| 5 | ⑤ AI 리포트 | 높음 | API, 비용 |
| 6 | ⑥ AI 피드백 | 높음 | ⑤와 유사 |

---

## 📁 예상 파일 변경

| 파일 | 변경 내용 |
|------|----------|
| `tama/index.html` | Pro 분기, 대시보드 UI, 모바일 뷰, AI 피드백 표시 |
| `api/game.js` | (선택) 폴링 파라미터 |
| `api/ai-report.js` | 신규 — AI 성장 리포트 |
| `api/ai-feedback.js` | 신규 — AI 하루 피드백 |
| `PRO_FEATURES_ROADMAP.md` | 이 문서 — 진행 상황 업데이트 |

---

## ✅ Pro 기능 감지

```javascript
// 이미 존재
window.IS_PRO = hostname.includes('haruchipro') || location.search.includes('tier=pro');

// 사용 예
if (IS_PRO) {
  // Pro 전용 UI/기능
}
```

---

*마지막 업데이트: 2026-02-16*
