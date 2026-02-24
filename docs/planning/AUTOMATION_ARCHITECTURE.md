# 🔄 하루치 Pro — 완료 체크 → XP 즉시 반영 아키텍처

> 사용자가 노션에서 완료 체크하면 자동으로 경험치가 전달되도록 하는 구성

---

## 1. 목표

```
[사용자] 노션 할 일 ✓ 체크
    ↓ (수 초 이내)
[시스템] notion-sync 실행 → XP 로그 생성
    ↓ (5초 이내, 게임 폴링)
[게임] XP 반영 → 하루치 레벨업
```

---

## 2. 옵션 비교

| 방식 | 즉시성 | 필요 도구 | 다중 사용자 | 난이도 |
|------|--------|-----------|-------------|--------|
| **A. Make/n8n** | ⭐⭐⭐ | Make 또는 n8n | 1인당 1 시나리오 | 낮음 |
| **B. Notion Webhook** | ⭐⭐⭐ | Vercel만 | ✅ 지원 | 중간 |
| **C. Cron 단축** | ⭐ | Vercel만 | ✅ 지원 | 낮음 |

---

## 3. 옵션 A: Make / n8n (테스트용, 1인)

### 3-1. Make.com 구성

```
[트리거] Notion - Watch Database Items (할일 DB)
    ↓ (체크 시 트리거)
[액션] HTTP - Make a request
    → POST https://haruchipro.vercel.app/api/trigger-sync
    → Body: { "source": "make" }
```

### 3-2. 필요한 Vercel API

`api/trigger-sync.js` (신규):

- Make에서 호출 시 notion-sync 즉시 실행
- 인증: `Authorization: Bearer {비밀키}` 또는 `?key=xxx` (간단한 보안)

### 3-3. 한계

- Make 시나리오 1개 = 1개 DB만 감시
- 사용자마다 시나리오 필요 → 다중 사용자에 부적합

---

## 4. 옵션 B: Notion Webhook (권장, 다중 사용자)

### 4-1. Notion Webhook 이벤트

| 이벤트 | 용도 |
|--------|------|
| `page.properties_updated` | 체크박스(완료) 변경 시 발생 |

### 4-2. 흐름

```
[사용자] 할 일 ✓ 체크
    ↓
[Notion] page.properties_updated 웹훅 전송
    ↓
[Vercel] POST /api/webhook/notion 수신
    ↓
[로직] entity.id(페이지 ID) → 부모 DB 조회 → Supabase에서 사용자 매칭
    ↓
[로직] 해당 사용자 notion-sync 실행
    ↓
[게임] 5초 폴링으로 XP 반영
```

### 4-3. Notion Webhook 설정

1. [Notion Integration](https://www.notion.so/my-integrations) → Webhooks 탭
2. Subscription 추가
3. Event: `page.properties_updated`
4. URL: `https://haruchipro.vercel.app/api/webhook/notion`

---

## 5. Supabase + Vercel 구성

### 5-1. Supabase (사용자 설정 저장)

**테이블: `notion_config`**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | text | 사용자 식별 (노션 OAuth 시) |
| notion_access_token | text | 노션 API 토큰 (암호화 권장) |
| haruchi_page_id | text | 하루치 행 페이지 ID |
| xp_log_db_id | text | XP 로그 DB ID |
| todo_db_id | text | 할일 DB ID |
| created_at | timestamptz | 생성 시각 |

**1인 테스트 시**: Supabase 없이 Vercel env만 사용 가능.

### 5-2. Vercel API 구조

```
api/
├── game.js           # getXp, getLogs (기존)
├── cron-sync.js      # 주기적 notion-sync (기존, 백업용)
├── trigger-sync.js   # [신규] Make/수동 호출 시 즉시 sync
└── webhook/
    └── notion.js     # [신규] Notion webhook 수신 → sync 트리거
```

### 5-3. trigger-sync.js (Make/수동용)

```javascript
// POST /api/trigger-sync
// 헤더: Authorization: Bearer TRIGGER_SECRET
// 또는 쿼리: ?key=TRIGGER_SECRET
// → notion-sync 실행 (현재 env 기반)
```

---

## 6. 테스트용 최소 구성 (Make 없이)

| 구성 | 내용 |
|------|------|
| **Vercel** | api/game, api/cron-sync (1분 간격) |
| **trigger-sync** | 수동 호출 또는 Make에서 호출 |
| **Supabase** | 1인 테스트 시 생략 가능 |

**즉시성**: Make 트리거 사용 시 체크 후 수 초 ~ 1분.

---

## 7. 테스트용 Make 구성 (즉시 반영)

### 7-1. Make.com 시나리오

1. **트리거**: Notion → Watch Database Items
   - Connection: 본인 노션
   - Database: 할일 DB 선택

2. **액션**: HTTP → Make a request
   - URL: `https://haruchipro.vercel.app/api/trigger-sync`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_SECRET`

### 7-2. Vercel에 추가

- `api/trigger-sync.js` 생성
- 환경변수: `TRIGGER_SYNC_SECRET`

---

## 8. 정리

| 단계 | 작업 | 도구 |
|------|------|------|
| **1. 즉시 테스트** | Make + trigger-sync API | Make, Vercel |
| **2. 다중 사용자** | Notion Webhook + Supabase | Vercel, Supabase |
| **3. OAuth 연동** | 사용자별 DB 자동 저장 | Vercel, Supabase, Notion OAuth |

**지금 당장**: Make + `api/trigger-sync.js`로 1인 테스트 가능.

---

*참고: [PRO_AUTOMATION_ROADMAP.md](./PRO_AUTOMATION_ROADMAP.md) | [notion_distribution_strategy.md.resolved](./notion_distribution_strategy.md.resolved)*
