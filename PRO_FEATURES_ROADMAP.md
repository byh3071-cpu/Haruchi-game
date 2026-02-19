# 하루치 Pro 2.0 — 기능 로드맵

> 4가지 핵심 기능 기반 기획·구현 가이드

---

## 📋 Pro 2.0 핵심 4가지

| # | 기능 | 한글 명칭 | 핵심 가치 |
|---|------|-----------|-----------|
| 1 | Auto-Leveling | **자동 레벨업** | 일일이 밥 주기 대신 할 일 ✓ 체크만 하면 XP·레벨 자동 반영 |
| 2 | Streak Calendar | **씨앗 농장** | 노력한 날을 씨앗·해바라기로 기록, 빈칸 채우기 동기부여 |
| 3 | Smart Feedback | **똑똑한 잔소리** | 달성률에 따라 하루치 대사가 매일 달라짐 (칭찬 ↔ 시무룩) |
| 4 | Dashboard + Mobile | **통합 대시보드 & 모바일 뷰** | 목표·습관·일기 한 화면, 출퇴근길 폰에서 쉽게 체크 |

---

## ① 자동 레벨업 (Auto-Leveling)

**목표:** "일일이 밥 주느라 귀찮으셨죠? 이제 할 일(✔)만 체크하세요!"

### 현재 상태
- ✅ 노션 XP 연동 (`fetchAndApplyNotionXP`, 60초 폴링)
- ✅ notion-sync → Vercel Cron 5분마다 실행
- ✅ api/game.js (getXp, getLogs)

### 구현 단계

| 단계 | 작업 | 파일 | 상세 |
|------|------|------|------|
| 1.1 | 폴링 간격 단축 | `tama/index.html` | `setInterval` 60초 → 30초 |
| 1.2 | Pro 전용 안내 문구 | `tama/index.html` | "노션에서 체크만 하면 자동으로!" 배너/툴팁 |

---

## ② 씨앗 농장 (Streak Calendar)

**목표:** "내가 노력한 날들이 캘린더에 예쁜 씨앗과 해바라기로 기록됩니다."

### 현재 상태
- ✅ 출석 캘린더 (`getAttendanceCalendarHTML`, `stats.playDays`)
- ⚠️ 단순 체크박스 스타일

### 구현 단계

| 단계 | 작업 | 파일 | 상세 |
|------|------|------|------|
| 2.1 | 씨앗/해바라기 아이콘 | `tama/index.html` | `.attendance-day.checked`에 🌱/🌿/🌻 |
| 2.2 | 연속 일수별 단계 | `tama/index.html` | 1~3일: 🌱 / 4~6일: 🌿 / 7일+: 🌻 |
| 2.3 | Pro 전용 배치 | `tama/index.html` | 대시보드 상단 강조 |

---

## ③ 똑똑한 잔소리 (Smart Feedback)

**목표:** "달성률에 따라 하루치의 대사가 매일 바뀝니다! 다 끝내면 폭풍 칭찬을, 미루면 시무룩한 하루치를 만나보세요."

### 구현 방식
- **규칙 기반** (우선): 비용 없음, 즉시 적용
- AI API (추후): 자연어 다양성

### 구현 단계

| 단계 | 작업 | 파일 | 상세 |
|------|------|------|------|
| 3.1 | 피드백 문구 테이블 | `tama/index.html` | 100% / 70~99% / 50~69% / 0~49% 별 대사 배열 |
| 3.2 | `getDailyFeedbackText()` | `tama/index.html` | 달성률 → 문구 반환 |
| 3.3 | UI 표시 | `tama/index.html` | 하루치 근처 말풍선 또는 통계 상단 |
| 3.4 | localStorage 캐시 | `tama/index.html` | `hamsterFeedback_{date}` |

---

## ④ 통합 대시보드 & 모바일 뷰

**목표:** "목표, 습관, 일기장까지 한 화면에. 출퇴근길 지하철에서도 폰으로 쉽게 체크하세요."

### 현재 상태
- ✅ 통계 모달 (`showStats`), 반응형
- ⚠️ 리스트 형태, 대시보드 느낌 부족

### 구현 단계

| 단계 | 작업 | 파일 | 상세 |
|------|------|------|------|
| 4.1 | Pro 대시보드 레이아웃 | `tama/index.html` | `showStats()` 내 IS_PRO 분기 → 카드형 그리드 |
| 4.2 | 모바일 감지 | `tama/index.html` | `innerWidth < 768` 또는 `matchMedia` |
| 4.3 | Pro 모바일 뷰 | `tama/index.html` | 버튼 크기 확대, 터치 최적화 |

---

## 🗓 구현 순서

| Phase | 기능 | 예상 공수 |
|-------|------|-----------|
| 1 | ① 자동 레벨업 | 0.5일 |
| 2 | ② 씨앗 농장 | 1일 |
| 3 | ③ 똑똑한 잔소리 | 1일 |
| 4 | ④ 통합 대시보드 | 1.5일 |
| 5 | ④ 모바일 뷰 | 1일 |

**총 예상: 4~5일**

---

## 📁 파일 변경 요약

| 파일 | 변경 내용 |
|------|----------|
| `tama/index.html` | ①~④ 전부 (IS_PRO 분기, CSS, showStats 재구성) |
| `api/game.js` | (선택) |
| `vercel.json` | Cron 설정 유지 |

---

## ✅ Pro 감지

```javascript
window.IS_PRO = hostname.includes('haruchipro') || location.search.includes('tier=pro');
// 로컬 테스트: ?tier=pro
```

---

*마지막 업데이트: 2026-02-16*
