---
id: claude-md-haruchi-game
date: 2026-06-10
tags: [process, documentation]
---

# 기록 규칙 (Haruchi-game)

> 이 파일은 기록/운영 전용. 코딩/디자인 → .cursorrules 참조.
> See also: AGENTS.md (`vhk sync` 로 생성 — Codex/OpenAI 계열 호환).

## 현재 상태
- **Phase:** Phase 1 — MVP
- **블로커:** 없음
- **다음 액션:** Goal 1 완료 처리 후 Notion 동기화 검증 (Goal 2)
- **마지막 업데이트:** 2026-06-10

<!-- vhk:rules:start -->
> ⚡ 아래 규칙 섹션은 RULES.md에서 자동 생성됨 (vhk sync). 직접 수정 금지.

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

<!-- vhk:rules:end -->
