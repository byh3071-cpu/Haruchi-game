# 하루치 노션 연동 설정 가이드

## 1. Vercel 환경변수 (api/game.js - 게임 XP 조회)

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `NOTION_API_KEY` | ✅ | 노션 Integration 토큰 (https://www.notion.so/my-integrations) |
| `HARUCHI_PAGE_ID` | ✅ | 하루치 캐릭터 페이지 ID (URL 마지막 32자리) |
| `NOTION_XP_PROPERTY` | | 총 XP 속성 이름. 쉼표로 여러 개 시도 (기본: `총 XP,XP,경험치,totalExp`) |
| `XP_LOG_DB_ID` | | XP 로그 DB ID (하루치 페이지에 Rollup이 없을 때 폴백) |

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
