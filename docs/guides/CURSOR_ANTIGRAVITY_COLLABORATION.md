# 🤝 Cursor × Antigravity 협업 가이드라인

> 두 AI IDE가 충돌 없이 협업할 수 있도록 역할 분담 및 작업 기준

---

## 1. 역할 분담

| 도구 | 담당 영역 | 강점 | 작업 기준 |
|------|-----------|------|-----------|
| **Cursor** | 빠른 코드 수정, API, 로직, 단일 파일 | 코드 추천·수정 속도 | `tama/`, `api/`, `notion-sync/`, `.env` |
| **Antigravity** | 전체 구조 리팩토링, 멀티파일, Figma→코드 | 프로젝트 전체 이해, 자율 실행 | 대규모 리팩터링, 아키텍처 변경 |

---

## 2. 파일/폴더 소유권 (충돌 방지)

### Cursor 우선 작업

| 경로 | 내용 |
|------|------|
| `tama/js/game.js` | 게임 로직, XP, 출석, UI 업데이트 |
| `tama/css/styles.css` | 스타일, 스킨별 CSS |
| `api/*.js` | API 핸들러 (game, cron-sync, trigger-sync) |
| `notion-sync/*.js` | sync-lib, index |
| `.env`, `.env.pro2` | 환경변수 (로컬) |
| `docs/guides/*.md` | 가이드 문서 |

### Antigravity 우선 작업

| 경로 | 내용 |
|------|------|
| 대규모 리팩터링 | 여러 파일 동시 수정 |
| `tama/` 구조 변경 | 컴포넌트 분리, 모듈화 |
| 아키텍처 설계 | 새 폴더/패키지 구조 |
| Figma 디자인 → 코드 | 디자인 시안 기반 구현 |

### 공유 (협의 후 작업)

| 경로 | 규칙 |
|------|------|
| `tama/index.html` | 한 번에 한 도구만 수정. 작업 전 `git status` 확인 |
| `package.json` | 의존성 추가 시 상대방에게 알림 |
| `vercel.json` | Cron, 라우팅 변경 시 문서화 |

---

## 3. 작업 순서 (충돌 방지)

```
1. 작업 시작 전: git pull / git status
2. 한 번에 한 도구만 "동일 파일" 수정
3. Cursor로 작업 중 → Antigravity는 해당 파일 건드리지 않음
4. Antigravity로 작업 중 → Cursor는 해당 범위 건드리지 않음
5. 작업 완료 후: git commit → push
6. 다음 도구: pull 후 작업
```

---

## 4. 작업 유형별 추천

| 작업 유형 | 추천 도구 | 이유 |
|-----------|-----------|------|
| 버그 수정, 작은 기능 추가 | **Cursor** | 빠른 수정 |
| 폴링 5초, 로그 문구 변경 | **Cursor** | 단일 파일 |
| 씨앗 농장, 똑똑한 잔소리 | **Cursor** | game.js 중심 |
| 전체 game.js 모듈 분리 | **Antigravity** | 멀티파일 리팩터링 |
| Figma → HTML/CSS 변환 | **Antigravity** | 멀티모달 |
| API 구조 대규모 변경 | **Antigravity** | 아키텍처 |
| 문서 작성·수정 | **Cursor** | 마크다운 빠른 편집 |

---

## 5. handoff 시 전달할 컨텍스트

### Cursor → Antigravity

```
- 방금 수정: tama/js/game.js (폴링 5초, 씨앗 농장)
- 다음 작업: game.js 모듈 분리 (state, ui, notion 분리)
- 참고: docs/planning/PRO_FEATURES_ROADMAP.md
```

### Antigravity → Cursor

```
- 리팩터링 완료: tama/js/ 폴더 구조 변경
- 새 파일: game-state.js, game-ui.js, notion-sync-client.js
- index.html에서 스크립트 로드 순서 변경됨
```

---

## 6. Git 규칙 (충돌 최소화)

| 규칙 | 설명 |
|------|------|
| **작업 전 pull** | 항상 최신 상태에서 시작 |
| **작업 단위 commit** | "feat: 폴링 5초" 처럼 명확한 메시지 |
| **충돌 시** | 한쪽에서 해결. Cursor는 로직, Antigravity는 구조 우선 |
| **브랜치** | 대규모 작업 시 `feature/xxx` 브랜치 사용 권장 |

---

## 7. 문서 참조

| 문서 | Cursor | Antigravity |
|------|--------|-------------|
| `PRO_FEATURES_ROADMAP.md` | ✅ | ✅ |
| `AUTOMATION_ARCHITECTURE.md` | ✅ | ✅ |
| `CURSOR_NOTION_COLLABORATION.md` | ✅ | - |
| `REFACTORING_GUIDE.md` | ✅ | ✅ |

---

## 8. 요약

| 항목 | Cursor | Antigravity |
|------|--------|-------------|
| **주 사용처** | 일상적인 코드 수정 | 대규모 리팩터링, 구조 변경 |
| **동시 작업** | ❌ 같은 파일 X | ❌ 같은 파일 X |
| **작업 전** | git pull | git pull |
| **작업 후** | commit, push | commit, push |

---

*제작 by bbaekyohan | [하루치 GitHub](https://github.com/byh3071-cpu/Haruchi-game)*
