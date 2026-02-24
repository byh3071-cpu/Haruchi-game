# 🚀 하루치 Pro 2.0 — MVP 검증 로드맵

> **우선순위**: 똑똑한 잔소리 → 나중에. **자동화·통합 대시보드·모바일** 먼저 빠르게 MVP 검증.

---

## 1. MVP 3대 핵심

| # | 기능 | 목표 | 검증 포인트 |
|---|------|------|-------------|
| 1 | **자동화** | 노션 ✓ 체크 → XP 즉시 반영 | Make/trigger-sync 연동, Cron 5분 |
| 2 | **통합 대시보드** | 목표·출석·통계 한 화면 카드형 | Pro 사용자 한눈에 파악 |
| 3 | **모바일 최적화** | 출퇴근길 폰에서 쉽게 체크 | 768px 이하 터치 영역, 전체 화면 대시보드 |

---

## 2. 자동화 (Automation)

### 현재 구성
- `api/trigger-sync.js` — Make/n8n에서 호출 시 즉시 notion-sync
- `api/cron-sync.js` — Vercel Cron 주기 실행 (백업)
- 게임 폴링 5초 — XP 빠르게 반영

### MVP 체크리스트
- [x] Vercel Cron: 5분 간격 (`*/5 * * * *`) — vercel.json 수정
- [ ] 참고: Vercel Hobby는 Cron 1회/일 제한 있을 수 있음. Pro에서 5분 동작 확인
- [ ] Vercel 환경변수: `TRIGGER_SYNC_SECRET` (Make용)
- [ ] Make.com: Notion Watch DB → POST /api/trigger-sync
- [ ] 1인 테스트: 노션 체크 → 5~10초 내 XP 반영 확인

### Make.com 최소 설정
1. 트리거: Notion → Watch Database Items (할일 DB)
2. 액션: HTTP → POST `https://haruchipro.vercel.app/api/trigger-sync`
3. Header: `Authorization: Bearer {TRIGGER_SYNC_SECRET}`

→ 상세: [docs/guides/MAKE_AUTOMATION_SETUP.md](../guides/MAKE_AUTOMATION_SETUP.md)

---

## 3. 통합 대시보드 (Integrated Dashboard)

### 구현
- `showStats()` 내 `IS_PRO` 분기 → 카드형 그리드
- 카드: 목표 | 출석 | 통계 | 수동기록 | 쿠폰

### Pro 카드 레이아웃
```
┌─────────────┬─────────────┐
│  🎯 목표    │  📅 출석    │
│  N/M (N%)   │  연속 N일   │
└─────────────┴─────────────┘
┌─────────────┬─────────────┐
│  📊 통계    │  ✏ 수동기록 │
│  LV, XP...  │  버튼들     │
└─────────────┴─────────────┘
```

---

## 4. 모바일 최적화 (Mobile View)

### 구현
- `@media (max-width: 768px)` 미디어쿼리
- 통계 모달: 전체 화면, 스크롤 가능
- 버튼(A,B,C,D): `min-height: 48px`, 터치 영역 확대
- 패널 클릭 영역: 터치하기 쉬운 크기

### 터치 최적화
- `touch-action: manipulation` — 더블탭 줌 방지
- `-webkit-tap-highlight-color: transparent` — 탭 하이라이트 제거
- 버튼 최소 44x44px (Apple HIG)

---

## 5. 보류 (나중에)
- **똑똑한 잔소리**: 이미 구현됨. MVP 검증 후 강화.

---

## 6. 파일 변경 요약

| 파일 | 변경 |
|------|------|
| `vercel.json` | cron `*/5 * * * *` (5분) |
| `tama/js/game.js` | showStats() IS_PRO → 카드형 HTML |
| `tama/css/styles.css` | .stats-dashboard-pro, @media 768px |
| `docs/planning/PRO_MVP_ROADMAP.md` | 이 문서 |

---

*마지막 업데이트: 2026-02-23*
