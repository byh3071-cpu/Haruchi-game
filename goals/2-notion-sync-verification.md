---
vhk_format: 1
type: goal
id: 2
title: Pro 2.0 Notion 자동 동기화 검증
status: BLOCKED
priority: P1
---

# Goal 2: Pro 2.0 Notion 자동 동기화 검증

> **보류 (2026-06-10):** 웹앱 Pro UI 먼저 — Notion 연동 검증은 이후 재개.

## 배경
원격에서 pull 한 Pro 2.0 MVP(trigger-sync API, Make.com 연동, cron 5분 간격)가
실환경에서 정상 동작하는지 검증 필요.

## 동작
- api/trigger-sync.js, api/cron-sync.js 동작 검증
- Notion XP 로그 적재 end-to-end 확인
- 환경변수(env-check) 누락 0건

## Completion Check
- `npm test` 중 sync-lib 테스트 통과
- Vercel cron 실행 로그에서 동기화 성공 확인
