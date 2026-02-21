# 하루치 백엔드 운영 체크리스트

프론트는 Vercel 연동 배포를 유지하면서, 백엔드를 안정적으로 운영하기 위한 실전 체크리스트입니다.  
현재 구조(노션 연동 + Vercel API)와 이후 확장(웹/앱 서비스화)까지 같이 고려했습니다.

---

## 1) 환경 구성 체크

- [ ] `Production` / `Preview` 환경을 분리했다.
- [ ] 환경별 Notion 키/DB ID를 분리했다.
- [ ] 로컬 `.env.local`과 Vercel 환경변수 키 이름을 통일했다.
- [ ] 비밀키가 Git에 커밋되지 않도록 `.gitignore`를 확인했다.
- [ ] 운영/개발 URL과 도메인 정책(CORS, 리다이렉트)을 점검했다.

---

## 2) 배포 전 체크 (Pre-deploy)

- [ ] Preview에서 API 동작 확인:
  - `/api/game?action=getXp`
  - `/api/game?action=getLogs`
- [ ] Notion 연동 시 응답이 예상 값인지 확인 (`totalExp`, `logs`).
- [ ] cron 엔드포인트(`/api/cron-sync`) 수동 호출 테스트.
- [ ] 최근 수정사항이 운영 환경변수 요구사항과 일치하는지 확인.
- [ ] 에러 로그(Vercel Functions) 증가 여부 사전 확인.

---

## 3) 배포 후 체크 (Post-deploy)

- [ ] 기본 버전 접속 정상 (`/`)
- [ ] 프로 버전 접속 정상 (`/?tier=pro`)
- [ ] 노션 임베드 모드 정상 (`/?notion=1`, 필요 시 `&tier=pro`)
- [ ] XP 반영/로그 모달/행동 루프(밥/물/잠/쓰다듬기) 정상
- [ ] 크론 실행 후 처리 로그(성공/실패) 확인

---

## 4) 모니터링 체크

- [ ] Vercel Functions 에러 로그를 일일 확인한다.
- [ ] cron 성공/실패 횟수를 주간 점검한다.
- [ ] API 응답시간(P95/P99) 급증 여부를 확인한다.
- [ ] 실패 알림(이메일/Slack/Sentry)을 수신 가능하게 설정했다.

권장 지표:

- `api/game` 성공률, 오류율
- `api/cron-sync` 성공 횟수, 마지막 성공 시각
- Notion API 오류(권한/레이트리밋) 발생 횟수

---

## 5) 장애 대응 체크

- [ ] 장애 시점 배포 버전(커밋 SHA)을 즉시 식별할 수 있다.
- [ ] 롤백 기준과 롤백 절차가 문서화되어 있다.
- [ ] Notion 토큰 만료/권한 오류 점검 절차가 있다.
- [ ] 임시 우회 모드(예: XP fallback) 정책이 있다.
- [ ] 장애 후 재발 방지 액션 아이템을 남긴다.

---

## 6) 보안 체크

- [ ] API 입력값 검증(화이트리스트/스키마)을 적용했다.
- [ ] 사용자/외부 문자열은 `innerHTML` 대신 `textContent`로 렌더링한다.
- [ ] 레이트 리밋 또는 요청 제한 정책이 있다.
- [ ] 비밀키 로테이션 정책(예: 분기 1회)을 운영한다.
- [ ] 민감 정보 로그 노출(키, 토큰, DB ID)이 없는지 점검한다.

---

## 운영 템플릿 (복붙용)

## A. 배포 런북 (Runbook)

- 서비스명:
- 배포 담당:
- 배포 일시:
- 변경 요약:
- 영향 범위:
- 롤백 기준:
- 롤백 방법:
- 배포 후 검증 링크:
- 최종 결과:

## B. 장애 리포트

- 발생 일시:
- 영향도:
- 증상:
- 원인:
- 임시 조치:
- 근본 조치:
- 재발 방지 항목:
- 담당자/완료일:

---

## 노션 연동 외 확장 아키텍처 가이드

현재에서 크게 벗어나지 않으면서 단계적으로 확장하는 것을 권장합니다.

### 1단계: 현재 유지 + 운영 안정화

- Vercel API 유지 (`api/game`, `api/cron-sync`)
- 환경 분리 + 모니터링 + 보안 기본기 적용

### 2단계: 사용자 증가 대응

- Managed DB 도입 (Supabase Postgres / Neon / RDS)
- Auth 도입 (Supabase Auth / Clerk)
- 데이터 모델 정리(유저, 액션 로그, XP 이력, 일일 목표)

### 3단계: 웹/앱 서비스화

- BFF + 도메인 API 분리
- 백그라운드 작업 큐 분리(Upstash Redis / SQS)
- 관측성 강화(Sentry + OpenTelemetry + 대시보드)

---

## 하루치 기준 추천 스택

- API: Vercel Functions
- DB: Supabase Postgres
- Auth: Supabase Auth 또는 Clerk
- Queue/Rate limit: Upstash Redis
- Monitoring: Sentry + Vercel Logs
- Analytics: PostHog 또는 GA4

---

필요하면 다음 단계로, 이 문서와 연결되는 `운영 점검 스케줄표(일/주/월)`도 추가할 수 있습니다.
