# 🔗 Make.com × 노션 × 하루치 임베드 — 전체 연동 가이드

> 노션에서 할 일 ✓ 체크 → Make.com 감지 → 하루치 게임에 XP 즉시 반영까지 **처음부터 끝까지** 설정하는 방법

---

## 📌 전체 흐름 (한눈에)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. 노션 페이지                                                           │
│     ├─ 할일 DB (Linked DB로 "오늘 할 일" 표시)                            │
│     ├─ 하루치 임베드 (haruchipro.vercel.app/?notion=1)                    │
│     └─ 사용자: 할 일 ✓ 체크                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. Make.com (자동화)                                                     │
│     ├─ 트리거: Notion "Watch Database Items" (할일 DB 감시)               │
│     ├─ 감지: 항목이 생성/수정됨                                           │
│     └─ 액션: HTTP POST → haruchipro.vercel.app/api/trigger-sync          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. 하루치 서버 (Vercel)                                                  │
│     ├─ trigger-sync: notion-sync 실행                                    │
│     ├─ notion-sync: 할일 DB 완료 항목 → XP 로그 DB에 기록                 │
│     └─ XP 로그 DB ↔ 하루치 DB (Relation)                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. 하루치 임베드 (게임)                                                  │
│     ├─ 2초마다 /api/game?action=getXp 호출 → XP 합산 조회                 │
│     └─ XP 반영 → 하루치 레벨업, 경험치 바 표시                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1단계: 노션 DB 구조 준비

### 1-1. 필요한 DB 3가지

| DB | 용도 | 필수 속성 |
|----|------|-----------|
| **할일 DB** | 완료 체크하는 항목들 | `할 일`(제목), `완료`(체크), `XP 지급됨`(체크) |
| **XP 로그 DB** | notion-sync가 생성하는 XP 기록 | `이름`(제목), `XP`(숫자), `하루치`(관계) |
| **하루치 DB** | 캐릭터 행 1개 | `캐릭터`(제목), XP 로그 DB와 Relation |

### 1-2. 할일 DB 속성 확인

1. 할일 DB 열기 → `⋯` → **속성 추가**
2. 아래 속성이 있는지 확인:

| 속성명 | 타입 | 비고 |
|--------|------|------|
| 할 일 (또는 제목) | 제목 | 기본 |
| 완료 | 체크박스 | ✓ 체크 = 완료 |
| XP 지급됨 | 체크박스 | notion-sync가 자동 체크 (중복 방지) |

### 1-3. DB ID 복사 방법

**할일 DB ID**:
1. 할일 DB를 **전체 페이지로 열기** (우클릭 → "전체 페이지에서 열기")
2. URL 확인: `https://www.notion.so/워크스페이스/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
3. `?v=` 앞의 **32자리**가 DB ID: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**XP 로그 DB ID, 하루치 DB ID**: 동일한 방법으로 복사

**하루치 행(페이지) ID** (HARUCHI_PAGE_ID):
1. 하루치 DB에서 "하루치" 행 클릭 → 페이지 열림
2. 해당 페이지 URL의 32자리 ID 복사

---

## 2단계: 노션 Integration 설정

### 2-1. Integration 생성

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) 접속
2. **+ New integration** 클릭
3. 이름: `하루치 하루치` (또는 원하는 이름)
4. 연결할 워크스페이스 선택
5. **Capabilities** → Content, Update content, Read content 체크
6. **Submit** → **Internal Integration Secret** 복사 (이게 `NOTION_API_KEY`)

### 2-2. DB에 Integration 연결

**각 DB마다** 다음 작업 수행:

1. DB를 **전체 페이지로 열기**
2. 우측 상단 `⋯` → **연결** → 방금 만든 Integration 선택
3. 연결할 DB: **할일 DB, XP 로그 DB, 하루치 DB** 모두 반복

> ⚠️ 연결하지 않으면 Make.com·하루치 서버에서 `object_not_found` 오류 발생

---

## 3단계: 노션 페이지에 하루치 임베드 넣기

### 3-1. 임베드 URL

노션 페이지에 `/embed` 블록 추가 후:

```
https://haruchipro.vercel.app/?notion=1
```

### 3-2. `?notion=1` 파라미터 필수

- 이 파라미터가 있어야 게임이 **노션 XP 모드**로 동작
- 2초마다 XP 자동 갱신, 로그 표시 등 활성화

### 3-3. 권장 레이아웃

```
[오늘의 목표] Callout
[하루치 임베드] ← haruchipro.vercel.app/?notion=1 (높이 450px 이상)
[오늘 할 일] Linked DB (할일 DB 연결)
```

---

## 4단계: Vercel 환경변수 설정

### 4-1. 하루치 프로젝트 Vercel 대시보드

1. [vercel.com](https://vercel.com) → 프로젝트 선택
2. **Settings** → **Environment Variables**

### 4-2. 필수 변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NOTION_API_KEY` | Integration Secret | 2단계에서 복사한 값 |
| `HARUCHI_PAGE_ID` | 하루치 행 페이지 ID | 32자리 |
| `XP_LOG_DB_ID` | XP 로그 DB ID | 32자리 |
| `TODO_DB_ID` | 할일 DB ID | 32자리 |
| `TRIGGER_SYNC_SECRET` | 랜덤 문자열 | Make.com 인증용 (32자 이상 권장) |

### 4-3. TRIGGER_SYNC_SECRET 생성

```bash
# 터미널에서
openssl rand -hex 32
```

또는 [randomkeygen.com](https://randomkeygen.com) 등에서 32자 이상 랜덤 문자열 생성

### 4-4. 환경변수 저장 후 재배포

**Save** 후 **Redeploy** 실행

---

## 5단계: Make.com 시나리오 설정

### 5-1. 시나리오 생성

1. [make.com](https://www.make.com) 로그인
2. **Create a new scenario** 클릭
3. 빈 시나리오가 열림

### 5-2. 트리거 모듈 추가 (Notion)

1. **+** 버튼 클릭 → `Notion` 검색
2. **Watch Database Items** 선택
   - 없으면 **Watch Objects** 또는 **Search objects** 등 사용 가능한 모듈 선택
3. **Connection**:
   - **Add** 클릭 → Notion OAuth 로그인
   - 본인 노션 계정 연결
4. **Database**:
   - 드롭다운에서 **할일 DB** 선택
   - 또는 **Enter ID**로 직접 DB ID 입력
5. **Trigger** (선택):
   - `Item updated` 또는 `Item created or updated` 선택
   - 완료 체크 = 항목 수정이므로 `Item updated`로 충분

### 5-3. HTTP 액션 모듈 추가

1. Notion 모듈 아래 **+** 클릭
2. `HTTP` 검색 → **Make a request** 선택
3. 설정:

| 필드 | 값 |
|------|-----|
| **URL** | `https://haruchipro.vercel.app/api/trigger-sync` |
| **Method** | `POST` |
| **Headers** | `Add item` 클릭 |
| | Name: `Authorization` |
| | Value: `Bearer 여기에_TRIGGER_SYNC_SECRET_붙여넣기` |
| **Body type** | `Raw` |
| **Content type** | `application/json` |
| **Request content** | `{"source":"make"}` (선택) |

### 5-4. 대안: URL에 쿼리로 Secret 넣기

`Authorization` 헤더 대신 URL에 넣을 때:

- **URL**: `https://haruchipro.vercel.app/api/trigger-sync?key=여기에_TRIGGER_SYNC_SECRET`

### 5-5. 시나리오 저장 및 실행

1. **Save** (Ctrl+S)
2. **Run once** 클릭 → 테스트 실행
3. 정상이면 **Scheduling** → **Activate** (실행 간격 설정)

### 5-6. Make.com 폴링 간격

| 플랜 | Watch Database 폴링 |
|------|---------------------|
| Free | 약 15분 간격 |
| Core+ | 더 짧은 간격 설정 가능 |

**즉시성**: 무료 플랜은 최대 15분 대기 가능. Core 이상에서 더 빠른 반영.

---

## 6단계: 동작 확인

### 6-1. 테스트 순서

1. 노션 페이지에서 할일 DB에 항목 추가 (예: "테스트 할 일")
2. **완료** 체크박스 ✓
3. Make.com 시나리오가 **Activate** 상태인지 확인
4. (무료: 최대 15분 대기) Make.com이 감지 → trigger-sync 호출
5. 하루치 임베드 화면에서 **2초 이내** XP 증가 확인

### 6-2. 수동 동기화로 즉시 확인

Make.com 대기 없이 확인하려면:

1. 터미널에서 `curl` 호출:
   ```bash
   curl -X POST "https://haruchipro.vercel.app/api/trigger-sync?key=YOUR_TRIGGER_SYNC_SECRET"
   ```
2. 또는 하루치 게임의 **🔄 버튼** (시스템 로그 패널) 클릭 → XP·로그 즉시 갱신

### 6-3. Cron 백업

Vercel Cron이 5분마다 `cron-sync`를 실행 중이면, Make.com이 없어도 5분 이내에 XP 반영됨.

---

## 7. 요약

| 단계 | 작업 | 결과 |
|------|------|------|
| 1 | 노션 DB 3종 준비 (할일, XP, 하루치) | DB ID 확보 |
| 2 | Integration 생성 + DB 연결 | API 접근 가능 |
| 3 | 노션 페이지에 임베드 `?notion=1` | 게임 표시 |
| 4 | Vercel 환경변수 설정 | 서버 동작 |
| 5 | Make.com 시나리오 (Watch + HTTP) | 완료 체크 → 즉시 sync |
| 6 | 테스트 | XP 반영 확인 |

---

## 8. 트러블슈팅

| 증상 | 확인 |
|------|------|
| 401 Unauthorized | `TRIGGER_SYNC_SECRET`이 Make와 Vercel에서 동일한지 |
| object_not_found | 해당 DB를 Integration에 **연결**했는지 |
| XP 안 들어옴 | notion-sync 환경변수 (DB ID), `할 일`·`완료`·`XP 지급됨` 속성명 |
| Make 실행 안 됨 | Notion Connection 연결, DB 선택 |
| 임베드 안 보임 | URL에 `?notion=1` 포함 여부 |

---

*참고: [MAKE_AUTOMATION_SETUP.md](./MAKE_AUTOMATION_SETUP.md) | [NOTION_SETUP.md](./NOTION_SETUP.md) | [PRO_NOTION_TEMPLATE_GUIDE.md](./PRO_NOTION_TEMPLATE_GUIDE.md)*
