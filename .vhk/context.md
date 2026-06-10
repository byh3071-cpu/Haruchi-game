# 프로젝트 컨텍스트

> 이 파일은 `vhk context`로 자동 생성되었습니다.
> AI 어시스턴트에게 프로젝트 맥락을 제공합니다.

## 원본 지도 (Source of Truth)

> 무엇을 고칠 땀 "원본" 한 곳만 고치세요. 나머지는 파생본이라 자동 생성됩니다.

- **규칙(원본)**: `RULES.md` — 규칙은 여기 한 곳에서만 수정
- **작업 상태**: `docs/state/next-task.md`, `docs/state/blockers.md`
- **버전·릴리스**: `package.json`, `CHANGELOG.md`
- **명령 목록**: `COMMANDS.md` (+ `vhk help`)
- **파생본(직접 수정 금지)**: `.cursorrules`·`.windsurfrules`·`.github/copilot-instructions.md`·`AGENTS.md`·`GEMINI.md` 등 7종 + `CLAUDE.md` 규칙 영역 → `vhk sync` 로 생성

## 기술 스택

- **테스트**: jest
- **패키지 매니저**: npm
- **패키지 이름**: hamster-damagochi
- **버전**: 1.0.0

## 디렉토리 구조

```text
├── AGENTS.md
├── api/
│   ├── cron-sync.js
│   ├── game.js
│   ├── game.test.js
│   ├── owner-auth.js
│   └── trigger-sync.js
├── BACKLOG.md
├── CHANGELOG.md
├── CLAUDE.md
├── COMMANDS.md
├── docs/
│   ├── adr/
│   │   └── ADR-000-template.md
│   ├── ARCHITECTURE.md
│   ├── guides/
│   │   ├── BACKEND_OPERATIONS_CHECKLIST.md
│   │   ├── CURSOR_ANTIGRAVITY_COLLABORATION.md
│   │   ├── CURSOR_NOTION_COLLABORATION.md
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   ├── MAKE_AUTOMATION_SETUP.md
│   │   ├── MAKE_NOTION_HARUCHI_FULL_GUIDE.md
│   │   ├── NOTION_SETUP.md
│   │   ├── NOTION_TEMPLATE_GUIDE.md
│   │   ├── NOTION_TEST_SETUP.md
│   │   ├── PRO_NOTION_TEMPLATE_GUIDE.md
│   │   ├── PRO_SERVER_URL.md
│   │   ├── REFACTORING_GUIDE.md
│   │   └── VERSION_MANAGEMENT.md
│   ├── log/
│   ├── planning/
│   │   ├── AUTOMATION_ARCHITECTURE.md
│   │   ├── notion_distribution_strategy.md.resolved
│   │   ├── OPENSPEC_HARUCHI_GAME.md
│   │   ├── OPENSPEC_SPEED_INSIGHTS.md
│   │   ├── PRD_HARUCHI_GAME.md
│   │   ├── PRD_SPEED_INSIGHTS.md
│   │   ├── PRIORITY_ANALYSIS.md
│   │   ├── PRO_AUTOMATION_ROADMAP.md
│   │   ├── PRO_FEATURES_ROADMAP.md
│   │   └── PRO_MVP_ROADMAP.md
│   ├── PRD.md
│   ├── til.md
│   └── troubleshooting/
├── eslint.config.js
├── GEMINI.md
├── notion-sync/
│   ├── .env.example
│   ├── index.js
│   ├── npm
│   ├── package-lock.json
│   ├── package.json
│   ├── sync-lib.js
│   └── sync-lib.test.js
├── package-lock.json
├── package.json
├── PRO_SERVER_URL.md
├── README.md
├── RULES.md
├── tama/
│   ├── assets/
│   │   ├── animations/
│   │   ├── audio/
│   │   ├── hamster/
│   │   ├── haruchi_logo_pixel.svg
│   │   ├── logo2.png
│   │   ├── main_logo.png
│   │   ├── marketing_banner_pixel.svg
│   │   ├── misc/
│   │   ├── README.md
│   │   ├── scene/
│   │   ├── seed_growth.svg
│   │   ├── Thumbnail.png
│   │   └── Thumbnail_og.png
│   ├── ASSETS_CHECKLIST.md
│   ├── css/
│   │   └── styles.css
│   ├── favicon.ico
│   ├── GAMIFICATION_TODO.md
│   ├── IMAGE_RECOMMENDATIONS.md
│   ├── index.html
│   ├── js/
│   │   └── game.js
│   ├── LAYER_GUIDE.md
│   ├── notion-setup-helper.html
│   ├── test-notion-embed.html
│   ├── thumbnail_resize.html
│   ├── WHEEL_ANIMATION_GUIDE.md
│   └── WHEEL_SETUP.md
└── vercel.json
```

## VHK CLI 명령어

- `vhk gate — 아이디어 검증`
- `vhk start — 새 프로젝트 시작 마법사`
- `vhk init — 하네스 파일 생성`
- `vhk recap — 오늘 한 일 정리 + ADR 분리`
- `vhk sync — RULES.md → 규칙 파일 동기화`
- `vhk check — RULES.md 규칙 점검`
- `vhk secure — 보안 스캔 (시크릿 유출 검사)`
- `vhk cloud — .vhk 클라우드 백업·복원 (push/pull)`
- `vhk ship — 배포 체크리스트 + 회고`
- `vhk doctor — 개발 환경 점검 (+ --strict 드리프트 게이트)`
- `vhk save — git 저장 (add → commit → push)`
- `vhk undo — 최근 커밋 되돌리기`
- `vhk restore — sync 백업 복원`
- `vhk status — 프로젝트 상태 대시보드`
- `vhk diff — Git 변경사항 한국어 요약`
- `vhk mcp — MCP 서버 시작 (stdio)`
- `vhk mcp-init — Cursor·Claude Desktop MCP 설정 생성`
- `vhk deploy — 프로덕션 배포 (자동 감지)`
- `vhk env — .env → .env.example 동기화`
- `vhk env-check — 필수 환경변수 누락 검사`
- `vhk publish — npm 배포 (버전 범프 → 빌드 → 테스트)`
- `vhk design — 디자인 토큰 생성`
- `vhk design-palette — 컬러 팔레트 프리셋 선택`
- `vhk theme — 다크/라이트 모드 CSS 생성`
- `vhk ref — 레퍼런스 URL 관리 (add/list/open)`
- `vhk harness — 통합 품질 점검 (lint+type+test+build)`
- `vhk audit — 보안 취약점 감사 (npm audit)`
- `vhk migrate — 패키지 매니저 전환 (npm/yarn/pnpm)`
- `vhk update — VHK CLI 셀프 업데이트`
- `vhk context — 프로젝트 맥락 파일 생성 (.vhk/context.md)`
- `vhk mode — Safety Mode 조회/변경 (lite|standard|strict)`
- `vhk verify — 검증 게이트 실행 + 증거 기록`
- `vhk preflight — 출고 전 안전점검 (2FA·shim·env·lint·타입·테스트·git, 치명 시 차단)`
- `vhk testmap — test-first 매핑 점검 (변경 기능 ↔ 테스트 누락 경고)`
- `vhk worktree — worktree 가드 — 생성 시 env/설정 자동 복사·누락 점검 (add/check)`
- `vhk standup — 아침 브리핑 (어제 한 일 + 오늘 추천 goal + 미해결)`
- `vhk today — 저녁 자축·회고 (오늘 커밋·완료 goal 카운트 + 격려)`
- `vhk review — 적대적 자기검증 (거짓완료 의심 탐지)`
- `vhk mission — 미션 계약 — 작업 목표·허용/금지 범위 선언·검증`
- `vhk context-show — 컨텍스트 파일 내용 출력`
- `vhk memory — 기억 관리 v2 (decisions/failures/successes)`
- `vhk brief — 프로젝트 요약 보고서 생성`
- `vhk work — AI 작업 시작/이어하기 (+ handoff)`
- `vhk goal — Goal 단계별 미션 관리`
- `vhk blocker — 블로커 기록 (3건 누적 시 HARD_STOP)`
- `vhk learn — 교훈 기록 → memory v2 단일 SoT`
- `vhk resume — .vhk/HARD_STOP 해제 (--confirm 필요)`
- `vhk pattern — 반복 패턴 감지·목록 (avoid/reinforce)`
- `vhk evolve — 패턴 → 룰 후보 제안·반영·undo`

---

_생성: 2026. 6. 10. 오후 1:13:51_
_vhk-context-git: 2fe9118df1313008cce3009991779462b29e30af_
