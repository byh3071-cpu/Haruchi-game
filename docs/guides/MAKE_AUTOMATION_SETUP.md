# 🔄 Make.com — 노션 완료 체크 → XP 즉시 반영 설정

> 노션에서 할 일 ✓ 체크하면 **수 초 이내** 하루치 게임에 XP가 반영되도록 설정합니다.

**📖 전체 연동 가이드**: [MAKE_NOTION_HARUCHI_FULL_GUIDE.md](./MAKE_NOTION_HARUCHI_FULL_GUIDE.md) — 노션·Make·하루치 임베드 처음부터 끝까지 상세 설정

---

## 1. 흐름

```
[노션] 할 일 ✓ 체크
    ↓ (Make 감지, 수 초~수십 초)
[Make.com] 트리거 → HTTP 요청
    ↓
[하루치] /api/trigger-sync 호출 → notion-sync 즉시 실행
    ↓ (2초 이내, 게임 폴링)
[게임] XP 반영 → 하루치 레벨업
```

---

## 2. 사전 준비

| 항목 | 내용 |
|------|------|
| **Make.com 계정** | [make.com](https://www.make.com) 가입 (무료 플랜 가능) |
| **노션 Integration** | 할일 DB에 Integration 연결 완료 |
| **Vercel 환경변수** | `TRIGGER_SYNC_SECRET` 설정 (임의의 긴 문자열) |

---

## 3. Make.com 시나리오 설정

### 3-1. 새 시나리오 생성

1. Make.com 로그인 → **Create a new scenario**
2. **트리거 모듈** 추가: `Notion` → `Watch Database Items` (또는 `Watch Objects`)

### 3-2. Notion 연결

1. **Connection** → Notion 계정 연결 (OAuth)
2. **Database** → 할일 DB 선택 (URL에서 DB ID 복사 가능)
3. **Trigger** → `Item updated` 또는 `Item created or updated` 선택

### 3-3. HTTP 액션 추가

1. **+** 클릭 → `HTTP` → `Make a request`
2. 설정:
   - **URL**: `https://haruchipro.vercel.app/api/trigger-sync`
   - **Method**: `POST`
   - **Headers**:
     - `Authorization`: `Bearer YOUR_TRIGGER_SYNC_SECRET`
     - `Content-Type`: `application/json`
   - **Body**: `{ "source": "make" }` (선택)

### 3-4. 대안: 쿼리 파라미터 인증

Secret을 URL에 넣고 싶다면:
- **URL**: `https://haruchipro.vercel.app/api/trigger-sync?key=YOUR_TRIGGER_SYNC_SECRET`

---

## 4. Vercel 환경변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `TRIGGER_SYNC_SECRET` | `랜덤문자열` | Make에서 호출 시 인증용 (32자 이상 권장) |

생성 예: `openssl rand -hex 32`

---

## 5. Make.com 폴링 간격

| 플랜 | Watch Database 폴링 |
|------|---------------------|
| Free | 약 15분 간격 |
| Core+ | 더 짧은 간격 설정 가능 |

**즉시성**: Make 무료 플랜은 폴링 간격이 길 수 있음. Core 이상에서 더 빠른 반영 가능.

---

## 6. 게임 측 (이미 적용됨)

- **폴링**: 2초마다 XP·로그 자동 갱신
- **시스템 로그**: 새로고침 버튼 클릭 시 즉시 XP+로그 반영

---

## 7. 테스트

1. Make 시나리오 **Run once** 또는 **Activate**
2. 노션 할일 DB에서 항목 하나 ✓ 체크
3. (Make 무료: 최대 15분 대기 가능)
4. 하루치 게임 화면에서 2초 이내 XP 반영 확인

---

## 8. 트러블슈팅

| 증상 | 확인 |
|------|------|
| 401 Unauthorized | `TRIGGER_SYNC_SECRET` 값이 Make와 Vercel에서 동일한지 |
| XP 안 들어옴 | notion-sync 환경변수 (DB ID, Integration) 확인 |
| Make 실행 안 됨 | Notion DB에 Integration 연결 여부 |

---

*참고: [AUTOMATION_ARCHITECTURE.md](../planning/AUTOMATION_ARCHITECTURE.md)*
