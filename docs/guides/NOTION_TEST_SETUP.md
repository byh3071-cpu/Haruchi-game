# 🧪 하루치 Pro 노션 연동 테스트 설정

> 테스트용 인라인 할일 DB로 자동 XP 연동 확인하기

---

## 1. 노션에서 인라인 할일 DB 만들기

### 1-1. DB 생성

1. 노션 페이지에서 `/table` 또는 `/database` 입력
2. **인라인** 테이블 선택 (페이지 안에 새 DB 생성)
3. DB 이름: `오늘 할 일` (또는 원하는 이름)

### 1-2. 속성 추가/확인

| 속성명 | 타입 | 필수 |
|--------|------|------|
| 제목 (또는 "할 일") | 제목(Title) | ✅ 기본 포함 |
| 완료 | 체크박스 | ✅ |
| XP 지급됨 | 체크박스 | ✅ |

**추가 방법**: 열 헤더 `+` 클릭 → 속성 추가

### 1-3. DB ID 복사

1. DB를 **전체 페이지로 열기** (우클릭 → "전체 페이지에서 열기")
2. URL에서 32자리 ID 복사
   - `https://notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
   - `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` 부분만

---

## 2. notion-sync .env 설정

### 2-1. 프로 2.0 테스트용 (.env.pro2)

기존 `.env`는 그대로 두고, 프로 2.0 템플릿 테스트용으로 별도 파일 사용:

```bash
cd notion-sync
cp .env.pro2.example .env.pro2
# .env.pro2에 실제 값 입력
```

### 2-2. 값 채우기

| 변수 | 값 |
|------|-----|
| `NOTION_API_KEY` | [노션 Integration](https://www.notion.so/my-integrations) 토큰 |
| `HARUCHI_PAGE_ID` | 프로 2.0 템플릿의 하루치 DB 행 페이지 ID |
| `XP_LOG_DB_ID` | 프로 2.0 템플릿의 XP 로그 DB ID |
| `TODO_DB_ID` | 방금 만든 인라인 할일 DB ID |

> 프로 2.0 템플릿에 하루치 DB·XP DB가 따로 있다면 그 ID 사용. 기존과 동일하면 기존 ID 그대로 사용 가능

---

## 3. Integration 연결

1. 노션 Integration이 **할일 DB, XP DB, 하루치 DB**에 연결되어 있어야 함
2. 각 DB 페이지 → `⋯` → "연결" → 본인 Integration 선택

---

## 4. notion-sync 실행

**프로 2.0 테스트용** (.env.pro2 사용):

```bash
cd notion-sync
npm install
node index.js pro2
# 또는: npm run sync:pro2
```

**기존 템플릿용** (.env 사용):

```bash
node index.js
# 또는: npm run sync
```

**성공 시**: `완료: N개 XP 로그 생성` (N은 완료된 항목 수)

---

## 5. 게임에서 테스트

### 5-1. 임베드 URL

노션 페이지에 `/embed` 추가 후:

```
https://haruchipro.vercel.app/?notion=1
```

### 5-2. 테스트 순서

1. 할일 DB에 항목 추가 (예: "테스트 할 일")
2. **완료** 체크
3. `node index.js` 실행 (또는 Vercel Cron 대기)
4. 하루치 임베드 새로고침 → XP 증가 확인

---

## 6. Integration 연결 (필수)

**각 DB를 Integration에 연결해야 합니다.**

1. 할일 DB → 전체 페이지에서 열기 → `⋯` → **연결** → 본인 Integration 선택
2. XP 로그 DB → 동일하게 연결
3. 하루치 DB (하루치 행이 있는 DB) → 동일하게 연결

연결하지 않으면 `object_not_found` 또는 `Could not find database` 오류 발생.

---

## 7. 트러블슈팅

| 증상 | 확인 |
|------|------|
| "필수 환경변수 없음" | .env.pro2에 NOTION_API_KEY, HARUCHI_PAGE_ID, XP_LOG_DB_ID 있는지 |
| "Could not find database" | 해당 DB를 Integration에 **연결**했는지 |
| "validation_error" (database_id) | ID가 32자리인지, 하이픈 유무 상관없음 (코드에서 자동 처리) |
| XP 안 올라감 | 완료 체크 후 notion-sync 실행했는지, Vercel에 환경변수 설정했는지 |

---

*참고: [NOTION_SETUP.md](./NOTION_SETUP.md) | [PRO_NOTION_TEMPLATE_GUIDE.md](./PRO_NOTION_TEMPLATE_GUIDE.md)*
