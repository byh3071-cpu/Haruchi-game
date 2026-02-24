# 🚀 하루치 Pro 2.0 — 사용자 친화적 자동화 로드맵

> 노션 DB 자동 연결 → 완료 체크 시 하루치 게임에 XP 자동 반영

---

## 1. 목표 흐름

```
[사용자] 템플릿 복제
    ↓
[사용자] "하루치 Pro 연동하기" 클릭 (1회)
    ↓
[시스템] 노션 OAuth → 사용자 DB 자동 탐지
    ↓
[시스템] 사용자별 DB ID 저장 (백엔드)
    ↓
[사용자] 노션에서 할 일 ✓ 체크
    ↓
[시스템] notion-sync (사용자 DB 읽기) → XP 로그 생성
    ↓
[게임] 30초마다 XP 폴링 → 하루치 레벨업
```

**결과**: 사용자는 **복제 + 1회 연동**만 하면, 이후 체크만 해도 XP가 자동으로 반영됨.

---

## 2. 단계별 로드맵

### Phase 1: 템플릿 단순화 (현재 → 단기)

| 작업 | 내용 |
|------|------|
| 템플릿에 DB 포함 | 복제 시 할일·XP·하루치 DB 함께 복제 |
| 단계별 가이드 | "1. 복제 2. Integration 연결" 최소화 |
| 체크리스트 문서 | NOTION_TEST_SETUP.md 등 |

**한계**: 사용자가 여전히 Integration 생성·연결 필요.

---

### Phase 2: OAuth + 중앙 서버 (중기)

| 작업 | 내용 |
|------|------|
| Notion OAuth 도입 | Public Integration, "노션으로 로그인" |
| 사용자 DB 자동 탐지 | OAuth 후 워크스페이스에서 템플릿 DB 검색 |
| 사용자별 설정 저장 | 백엔드 DB에 user_id → DB IDs 저장 |
| notion-sync 다중 사용자 | 저장된 사용자별로 순회하며 XP 로그 생성 |

**결과**: 사용자는 **노션 로그인 1회**만 하면 됨.

---

### Phase 3: 완전 자동화 (장기)

| 작업 | 내용 |
|------|------|
| 템플릿 복제 = 즉시 사용 | 복제만 하면 바로 동작 |
| DB 구조 표준화 | 템플릿 DB 이름·속성 고정 → 자동 매칭 |
| 실시간/단축 폴링 | 체크 후 수 초~수십 초 내 XP 반영 |

---

## 3. 백엔드 옵션 비교

### 3-1. Firebase

| 항목 | 내용 |
|------|------|
| **Firestore** | 사용자별 설정 저장 (user_id → notion_db_ids, access_token 등) |
| **Firebase Auth** | 사용자 인증 (노션 OAuth와 연동 시 세션 관리) |
| **Cloud Functions** | notion-sync 로직 실행 (스케줄러로 사용자별 순회) |
| **장점** | 실시간 DB, 무료 티어, 클라이언트 SDK |
| **단점** | Notion API 호출은 Functions에서 직접 구현 필요 |

### 3-2. Vercel + Supabase (기존 전략)

| 항목 | 내용 |
|------|------|
| **Supabase** | PostgreSQL, 사용자 설정 저장 |
| **Vercel Serverless** | api/game, cron-sync |
| **장점** | 현재 구조와 유사, 마이그레이션 부담 적음 |
| **단점** | Supabase 별도 설정 필요 |

### 3-3. Vercel + Firebase

| 항목 | 내용 |
|------|------|
| **Firestore** | 사용자 설정 저장 |
| **Vercel** | api/game, cron-sync (Firebase Admin SDK로 Firestore 읽기) |
| **장점** | Firestore의 실시간성, Firebase Auth 활용 가능 |
| **단점** | Vercel + Firebase 연동 설정 필요 |

### 3-4. 추천

| 상황 | 추천 |
|------|------|
| **빠른 도입** | Vercel + Supabase (notion_distribution_strategy와 동일) |
| **실시간·확장성** | Firebase (Firestore + Cloud Functions) |
| **최소 변경** | Vercel 유지 + Firestore만 추가 (설정 저장용) |

---

## 4. 아키텍처: 사용자 노션 DB → 자동 XP 반영

### 4-1. 데이터 흐름

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  사용자 노션     │     │  하루치 백엔드   │     │  하루치 게임     │
│  (할일 DB)      │     │  (Vercel/Firebase)│     │  (haruchipro)   │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                        │
         │ 1. OAuth 연동 (1회)   │                        │
         │ ─────────────────────>│                        │
         │    DB IDs 저장        │                        │
         │                       │                        │
         │ 2. 할 일 ✓ 체크       │                        │
         │                       │ 3. Cron: notion-sync   │
         │ <─────────────────────│    (사용자 DB 읽기)    │
         │    XP 로그 생성       │                        │
         │                       │ 4. getXp API          │
         │                       │ <─────────────────────│
         │                       │    XP 합계 반환        │
         │                       │ 5. 30초 폴링           │
         │                       │ ─────────────────────>│
         │                       │    XP → 레벨업 반영    │
```

### 4-2. 저장할 사용자별 데이터 (Firestore/Supabase 예시)

| 필드 | 용도 |
|------|------|
| `user_id` | 사용자 식별 (노션 OAuth 후 발급) |
| `notion_access_token` | 노션 API 호출용 (암호화 저장) |
| `haruchi_page_id` | 하루치 행 페이지 ID |
| `xp_log_db_id` | XP 로그 DB ID |
| `todo_db_id` | 할일 DB ID |
| `connected_at` | 연동 시각 |

### 4-3. notion-sync 다중 사용자 로직

```text
1. Firestore/Supabase에서 연동된 사용자 목록 조회
2. 각 사용자별로:
   - 해당 사용자의 access_token, DB IDs 사용
   - notion-sync 로직 실행 (할일 DB → XP 로그 생성)
3. 완료
```

---

## 5. Firebase 사용 시 구조 예시

```
haruchipro.vercel.app
├── /api/game          → getXp 시 Firestore에서 user_id로 DB ID 조회
├── /api/oauth         → 노션 OAuth 콜백, DB 탐지 후 Firestore 저장
├── /api/cron-sync     → Firestore 사용자 순회, notion-sync 실행
└── Firebase
    ├── Firestore      → users/{userId}/notion_config
    └── (선택) Auth    → 세션/로그인 관리
```

---

## 6. 참고 문서

- [notion_distribution_strategy.md.resolved](./notion_distribution_strategy.md.resolved) — OAuth·SaaS 전략
- [PRO_FEATURES_ROADMAP.md](./PRO_FEATURES_ROADMAP.md) — Pro 2.0 기능
- [NOTION_SETUP.md](../guides/NOTION_SETUP.md) — 현재 연동 방식

---

*마지막 업데이트: 2026-02-23*
