# 하루치 노션 연동 설정 가이드

## 1. Vercel 환경변수 (api/game.js - 게임 XP 조회)

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `NOTION_API_KEY` | ✅ | 노션 Integration 토큰 (https://www.notion.so/my-integrations) |
| `HARUCHI_PAGE_ID` | ✅ | DB 자체 ID가 아닌, **DB 안의 하루치 항목(레코드) 페이지 ID** |
| `NOTION_XP_PROPERTY` | | 총 XP 속성 이름. 쉼표로 여러 개 시도 (기본: `총 XP,XP,경험치,totalExp`) |
| `XP_LOG_DB_ID` | | XP 로그 DB ID (하루치 페이지에 Rollup이 없을 때 폴백) |
| `OWNER_ACCESS_KEY` | 권장 | 공개 URL에서 본인만 노션 연동 허용할 때 사용하는 소유자 인증 키 |

### HARUCHI_PAGE_ID / XP_LOG_DB_ID 구분 (중요)

- `HARUCHI_PAGE_ID`: "하루치 DB"를 열고 `하루치` 행을 클릭했을 때 열리는 **아이템 페이지 URL ID**
- `XP_LOG_DB_ID`: XP 로그 **데이터베이스 자체 URL ID**
- `HARUCHI_PAGE_ID`에 DB ID를 넣으면 `page_id_is_database` 오류가 발생합니다.

## 1-1. 공개 배포에서 본인만 노션 연동하기 (Owner Session)

`OWNER_ACCESS_KEY`를 설정하면, 인증된 브라우저만 `/api/game`의 노션 XP/로그를 받을 수 있습니다.

1) Vercel에 `OWNER_ACCESS_KEY` 저장 후 재배포  
2) 본인 브라우저에서 배포 도메인 접속 후 콘솔에서 1회 실행:

```js
const key = "YOUR_OWNER_ACCESS_KEY";
fetch("/api/owner-auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key })
}).then(r => r.json()).then(console.log);
```

3) 확인:
- 성공 시 `{ ok: true }`
- `/api/game?action=getXp` 호출 시 `source: "owner_auth_required"`가 아니면 인증 상태

보안 주의:
- `?key=...` URL 방식은 히스토리에 남을 수 있으므로 권장하지 않습니다.
- `OWNER_ACCESS_KEY`는 정기적으로 교체하세요.

## 2. 노션 DB 구조 (권장)

### 하루치 캐릭터 페이지
- **Rollup** 또는 **Formula** 속성: 연결된 XP 로그의 XP 합산 → 속성명 예: `총 XP`, `XP`
- **Relation** 속성: XP 로그 DB와 연결

### XP 로그 DB
- **제목/이름**: `[타입] · [원본제목] · [XP]XP` 형식
- **XP** (숫자): 경험치 값
- **하루치** (관계): 하루치 캐릭터 페이지와 연결

### 소스 DB (할일, 루틴 등)
- **완료** (체크박스): 완료 시 체크
- **XP 지급됨** (체크박스): notion-sync가 처리했으면 체크 (중복 방지)

### ⚠️ 연결된 DB(Linked DB) 사용 시
- 노션에서 "다른 DB 연결"로 만든 DB는 API `retrieve` 미지원
- notion-sync는 이 경우 스키마 조회 없이 쿼리로 대체 (자동 처리)
- **원본 DB ID** 사용 권장: DB를 **전체 페이지로 열기** → URL의 32자리 ID 복사

## 3. notion-sync 실행 (XP 로그 생성)

완료된 항목 → XP 로그 생성 → 하루치와 연결

```bash
cd notion-sync
npm install
node index.js
```

**Cron 권장**: 5~10분마다 실행 (GitHub Actions, Vercel Cron, 외부 cron 등)

### notion-sync 환경변수 (.env)
`notion-sync/.env` 참고. notion-sync는 로컬에서 실행하므로 .env 사용.

## 4. 게임에서 사용

- **노션 모드 URL**: `https://도메인/?notion=1`
- 페이지 로드 시 자동으로 노션 XP 불러옴
- 통계 → "노션에서 XP 불러오기" 버튼으로 수동 동기화 가능
