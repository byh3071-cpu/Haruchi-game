---
id: wheel-gate0-asset
date: 2026-06-10
tags: [planning, wheel, gate0, human-decision]
---

# Gate 0 — 챗바퀴 에셋·구성 (사람 결정 기록)

> AI는 **본 파일이 채워지기 전** `wheel.png` 제작·최종 에셋 커밋을 하지 않는다.

## Gate 0-A: 제작 방식 (하나만 선택)

> **픽셀아트 미경험자:** A(본인 직접 그리기)는 **비추천**. 아래 **D(외주)** 또는 **B(AI 초안 + 외주/AI 반복 보정)** 가 현실적.

- [ ] **A. 수동 픽셀아트** — Pixelorama/LibreSprite, `normal.png` 레퍼런스 (경험자·작가용)
- [ ] **B. AI 초안 1프레임 + 보정** — 초안은 AI, 8프레임 통일·팔레트 맞춤은 작가 또는 AI 반복+검증 스크립트
- [ ] **C. AI 8프레임 일괄** (비추천 — 프레임 drift 빈번)
- [ ] **D. 외주/커미션** — 본인은 스펙·검수만 (`WHEEL_ANIMATION_SPEC.md` §6 체크리스트)
- [x] **E. AI + 오픈소스 툴체인** — 본인 그리기·외주 없음. AI가 검증·정렬·반복 보정 스크립트 운영, 사람은 Gate Final 검수만

**선택:** **E (AI + 오픈소스 툴체인)** — 2026-06-10 확정

**담당:** [x] **E: AI툴체인+본인검수만**

**메모:**

---

## Gate 0-B: 구성 (v1 하나 선택)

**눈으로 비교:** 브라우저에서 [wheel-gate0-comparison.html](./wheel-gate0-comparison.html) 열기 (Live Server OK)

- [x] **A. 합성** — 햄스터+바퀴 8프레임 한 시트 ← **2026-06-10 최종: 기존 run.png 재슬라이스 채택으로 합성 확정**
- [ ] **B. 분리** — 바퀴 CSS rotate + 햄스터 다리 시트 (v2 후보로 강등)

**선택:** **A (합성)** — 단, 신규 제작이 아니라 **기존 `run.png` 재슬라이스** (`wheel_run.png`)

**변경 이력:**
- 처음 B(분리) 선택 → Phase 2에서 기존 에셋 발견 (`run.png` = bg 바퀴와 동일 디자인 8프레임)
- 사용자 확인 후 후보 B(run.png 재슬라이스) 채택 → 구성상 합성으로 변경 (신규 생성 0, 스타일 위험 0)

---

## 이미 확정 (수정 불필요)

| 항목 | 값 |
|------|-----|
| 발동 | D 버튼 |
| 범위 | Pro 먼저 |
| 프레임 크기 | normal.png에 맞춤 |
| 상세 스펙 | [WHEEL_ANIMATION_SPEC.md](./WHEEL_ANIMATION_SPEC.md) |

---

**서명 / 날짜:** Gate 0 완료 — 2026-06-10 (A=E, B=분리)
