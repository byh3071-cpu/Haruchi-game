# Haruchi-game — AGENTS.md (에이전트 작동 규약)

> ⚡ 이 파일은 RULES.md에서 자동 생성됨 (vhk sync). 직접 수정 금지.
> 빠른 시작(토큰 절감): `docs/context/agent-compact.md` 를 먼저 읽으세요.

## Loop Protocol
- 루프: `context → goal next → 작업 → goal check → goal done`
- 작업 시작 시 `.vhk/HARD_STOP` 확인 — 있으면 모든 자동화 즉시 중단.
- active goal 만 작업. `docs/state`(next-task/blockers)는 append-only.
- 교훈·결정·실패·성공은 `vhk memory`(memory v2 4버킷, 단일 출처).
- 게이트(tsc / test:run / build) 통과해야만 `vhk goal done`.

## 기술 스택 (변경 시 ADR 필수)
- 프론트: Vanilla JavaScript (tama/js/game.js), HTML, CSS — 프레임워크 없음
- 백엔드: Vercel Serverless Functions (api/), Node.js >= 22
- 연동: @notionhq/client (Notion XP 동기화), Make.com 자동화
- 테스트: Jest (ESM, --experimental-vm-modules)
- 린트: ESLint flat config
- 배포: Vercel (tama/ 정적 + api/ 서버리스)
- 데이터: 브라우저 localStorage (클라이언트) + Notion DB (Pro 동기화)

## 코딩 규칙
- 들여쓰기 spaces 2, 세미콜론 생략 (no-semicolon)
- 변수명·함수명·커밋 메시지는 영어, 응답·문서는 한국어
- 빈 catch 금지, console.log 프로덕션 제거
- 시크릿·API 키 하드코딩 금지 — .env.local / Vercel 환경변수만 사용
- 확인 없이 파일 삭제·이동·이름 변경 금지
- 에러 발생 시 임의 수정 금지 — 원인과 해결 방안 먼저 제시
- 새 기능은 입력값·출력값·예외 조건 먼저 확인 후 구현

## 커밋 컨벤션
- feat: / fix: / refactor: / docs: / chore:

## 기록 규칙
- 모든 .md 파일은 YAML 프론트매터(id, date, tags) 포함, 날짜 YYYY-MM-DD
- 세션 종료 시 docs/log/YYYY-MM-DD-{작업명}.md 생성
- 기술 선택 시 docs/adr/ADR-{번호}-{제목}.md 생성

## 기타 규칙
> RULES.md 의 비표준 H2 섹션 — 표준 매핑 외이지만 보존 위해 전파(직접 수정은 RULES.md 에서).

### 프로젝트 정체성
- 한 줄 설명: 하루치(Haruchi) — 햄스터 다마고치 웹 게임 + Notion 게이미피케이션 연동. 최종 목표는 ESP32 기반 실물 다마고치 하드웨어 구현
- 스택: Vanilla JS (ES Modules) + HTML/CSS + Vercel Serverless Functions + Notion API

### 게임 도메인 규칙
- 게임 상태는 localStorage 키 하위 호환 유지 (기존 세이브 깨지 않기)
- XP 규칙 변경 시 notion-sync/sync-lib.js 와 docs 동기화
- 에셋(tama/assets/)은 로컬 버전이 SoT — 원격이 덮어쓰지 않도록 주의
- 게임 로직은 추후 ESP32 펌웨어 포팅을 고려해 UI 와 분리 유지

<!-- YOHAN-ROSTER-CARD:BEGIN (managed by yohan-brain ops/propagation — SoT를 고쳐라, 직접수정 금지) -->
## 상시 지휘자 — 라우팅 카드 (yohan ecosystem)

> SoT: yohan-brain `memory/core/agent-roster.yaml` `conductor_always_on` (v0.5+, status=active면 obey).
> 이 레포 자체 규칙(RULES/CLAUDE LIVE)이 있으면 그게 우선(precedence).

- 모든 태스크: 해법 구상 **전에** 크기 판정 → `라우팅: S|M|L — 계획 1줄 (근거: 파일수/신규설계/리스크)` 선언 후 진행. 키워드("풀개발") 불필요, 항상.
- **판정법(감 금지)**: ①하드 트리거 먼저 → 해당 시 즉시 확정 · ②없으면 예상 수정 파일 수를 먼저 세고 구간 매핑(≤2=S·3~6=M·≥7/다레포=L). LLM 자유분류는 불안정(실측 33~56%) — 파일수 결정론이 정답.
- **S**(≤2파일·신규설계 없음·≤15분): 지휘자 단독. 서브에이전트·orca 금지(오버헤드).
- **M**(3~6파일·부분 신규): 서브에이전트 티어링 — 탐색 haiku → 계획 opus(승인) → 구현 sonnet → 적대검증 opus/fable 루프.
- **L**(≥7파일·신규 모듈·다레포·릴리즈급): Plan 승인★ 뒤 실행 provider를 별도 판정한다. Orca 상태 때문에 M/S로 낮추지 않는다. "풀개발"=L 강제.
- **L provider 상태**: orca-ready(검증된 단일 Orca CLI) · native-approved(승인된 surface-native 계약) · plan-only(조사~티켓·정적검증) · blocked(안전 provider 없음).
- **Orca readiness**: selector는 ORCA_CLI_COMMAND → ORCA_DEV_REPO_ROOT의 orca-dev → Linux 비관리 orca-ide → orca 순서로 딱 한 번 선택한다. 같은 CLI로 guide·agent-context·bounded status를 확인하고 자동 폴백하지 않는다. (choose_once=true · automatic_fallback=false)
- runtime·graph가 ready가 아니면 orchestration RPC, task-list, Run·Task·Dispatch·terminal 생성을 금지한다.
- 하드 트리거(분류 생략): 스키마 마이그레이션·인증/결제/보안·크로스레포·릴리즈 = 무조건 **L** · 오타·문서/주석만 = **S**.
- 애매하면 작은 쪽 시작 → 검증 실패(테스트/tsc/critic) 시 **재선언 후 승급**(몰래 계속 금지).
- 동시 작업 = worktree만. 같은 레포·같은 브랜치 2에이전트 금지.
- Antigravity(agy) = 보조·초안 전용(메인 지휘 금지) — 산출물은 상위 티어 검증 필수.
- AGY는 Orca inject 비지원이며 manual-send만 사용한다.
- 배포·시크릿·npm publish·main 직push = 사람 게이트(불변).
<!-- YOHAN-ROSTER-CARD:END -->
