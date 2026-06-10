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
