# 🤝 Notion × Cursor 협업 가이드라인

> 노션 템플릿 작업과 Cursor(코드/문서) 작업이 원활히 이어지도록 하는 가이드

**관련**: [CURSOR_ANTIGRAVITY_COLLABORATION.md](./CURSOR_ANTIGRAVITY_COLLABORATION.md) — Cursor × Antigravity 역할 분담

---

## 1. 역할 구분

| 도구 | 담당 영역 | 산출물 |
|------|-----------|--------|
| **Notion** | 템플릿 페이지, DB 구조, 사용자용 UI | 노션 페이지, DB, 임베드 |
| **Cursor** | 게임 코드, API, notion-sync, 문서 | `tama/`, `api/`, `notion-sync/`, `docs/` |

---

## 2. 워크플로우

```
[Notion] 템플릿 페이지 생성
    ↓
[Notion] DB 구조 확인·수정 (필요 시)
    ↓
[docs] PRO_NOTION_TEMPLATE_GUIDE.md 참고
    ↓
[Notion] 임베드 URL, 섹션 배치
    ↓
[Cursor] notion-sync 환경변수·DB ID 검증
    ↓
[Cursor] 게임 코드 수정 (필요 시)
    ↓
[Notion] 최종 UX/UI 다듬기
```

---

## 3. Cursor에서 참고할 문서

| 문서 | 용도 |
|------|------|
| `docs/guides/PRO_NOTION_TEMPLATE_GUIDE.md` | Pro 2.0 템플릿 구조, 기존 DB 통합 |
| `docs/guides/NOTION_TEMPLATE_GUIDE.md` | 기본/Pro 공통 사용 가이드 |
| `docs/guides/NOTION_SETUP.md` | 환경변수, DB 구조, notion-sync |
| `docs/planning/PRO_FEATURES_ROADMAP.md` | Pro 2.0 기능 로드맵 |
| `docs/planning/PRO_AUTOMATION_ROADMAP.md` | 사용자 친화적 자동화 (OAuth, Firebase, 노션 DB 자동 연결) |

---

## 4. Notion에서 참고할 문서

| 문서 | 용도 |
|------|------|
| `PRO_NOTION_TEMPLATE_GUIDE.md` | Pro 2.0 레이아웃, 섹션 배치 |
| `NOTION_TEMPLATE_GUIDE.md` | 임베드 URL, 조작법, FAQ |

---

## 5. 협업 시 주의사항

### 5-1. DB ID 변경 시

- Notion에서 DB를 새로 만들거나 ID가 바뀌면 `.env` 또는 Vercel 환경변수 업데이트 필요
- 문서에 `[DB ID 변경됨]` 표시 후 Cursor에서 반영

### 5-2. 임베드 URL

| 버전 | URL |
|------|-----|
| 기본 | `https://haruchi.vercel.app/?notion=1` |
| Pro | `https://haruchipro.vercel.app/?notion=1` |

- `?notion=1` 파라미터 필수

### 5-3. notion-sync 소스 DB

```javascript
// sync-lib.js 기준
sources: [
  { id: TODO_DB_ID, type: '할일', titleProp: '할 일', xp: 10 },
  { id: ROUTINE_DB_ID, type: '루틴', titleProp: '이름', xp: 20 },
  { id: WORKOUT_DB_ID, type: '운동', titleProp: '운동', xp: 80 },
  { id: READING_SESSION_DB_ID, type: '독서', titleProp: '세션 이름', xp: 40 },
  { id: READING_BOOK_DB_ID, type: '책', titleProp: '책 이름', xp: 300, statusValue: '완독' },
  { id: SNS_DB_ID, type: 'SNS', titleProp: '제목', xp: 10, statusValue: '발행' },
]
```

- DB 속성명(완료, XP 지급됨 등) 변경 시 `sync-lib.js` 수정 필요

---

## 6. Cursor AI에게 전달할 컨텍스트

노션 작업 후 Cursor에서 이어서 작업할 때, 아래를 포함하면 좋습니다:

```
- 노션: [하루치 Pro 2.0] 템플릿 페이지 생성 완료
- 임베드: haruchipro.vercel.app/?notion=1 적용
- DB: 기존 할일/루틴/운동/독서/SNS/XP/하루치 DB 사용
- 참고: docs/guides/PRO_NOTION_TEMPLATE_GUIDE.md
```

---

## 7. 문서 업데이트 규칙

| 변경 | 업데이트 문서 |
|------|----------------|
| Pro 2.0 템플릿 구조 변경 | `PRO_NOTION_TEMPLATE_GUIDE.md` |
| DB 구조·속성 변경 | `NOTION_SETUP.md`, `sync-lib.js` |

---

*제작 by bbaekyohan | [하루치 GitHub](https://github.com/byh3071-cpu/Haruchi-game)*
