---
id: wheel-animation-qa
date: 2026-06-10
tags: [qa, wheel, animation, gate-final]
---

# 챗바퀴 애니메이션 — 사람 최종 검수 (Gate Final)

> 판정 환경: **Live Server** + `localhost` (Pro 자동) + 브라우저 **100% 줌**.
> 실패 항목이 있으면 커밋하지 말고 아래 롤백 우선순위대로 수정 요청.

## 실행 방법

1. Live Server로 `tama/index.html` 열기 (localhost → Pro 기본)
2. 게임 스타트 → **D 버튼** 클릭
3. 챗바퀴 달리기 약 2.5초 루프 → 정면 마무리 포즈 0.7초 → normal 복귀

## 체크리스트

### 위치·정합

- [ ] 오버레이 바퀴가 bg의 정적 바퀴를 **완전히 덮음** (이중 림 없음)
- [ ] 사다리가 bg 사다리 위치와 자연스럽게 겹침
- [ ] 화면(창) 크기를 바꿔도 위치가 따라옴 (cover 수식 검증)

### 이미지·픽셀

- [ ] 픽셀 흐림/보간 없음 (계단 현상 = 정상)
- [ ] 프레임 밖 유령 픽셀/여백 없음
- [ ] 햄스터 스타일이 장면과 동일 계열

### 애니메이션

- [ ] 루프(프레임 0~6)가 끊김 없이 반복
- [ ] 마무리 정면 포즈(프레임 7)가 1회만 표시 후 normal 복귀
- [ ] 속도 자연스러움 (기본 0.63s/루프 — 어색하면 `--wheel-duration` 조정)

### 게임 동작

- [ ] **Pro에서만** 재생 — `?tier=basic`은 기존 "버튼 D 클릭" 로그만
- [ ] 재생 중 다른 버튼/클릭 차단 (`isBusy`)
- [ ] 그루밍(A)과 충돌 없음 (연속 입력 테스트)
- [ ] 종료 후 normal 햄스터 + bounce 정상 복귀

## 실패 시 롤백 우선순위

1. JS `WHEEL_ALIGN` 수치만 조정 (`tama/js/game.js` 상단 상수)
2. CSS `--wheel-duration` 조정
3. `scripts/refine-wheel-b.mjs` 재실행 (프레임 정렬)
4. 에셋 교체 검토 (`docs/planning/WHEEL_ANIMATION_SPEC.md` §1)

## 관련 산출물

| 파일 | 내용 |
|------|------|
| `tama/assets/animations/wheel_run.png` | 최종 시트 (validate PASS) |
| `docs/planning/wheel-alignment.json` | 정합 측정값 |
| `tama/assets/animations/_candidates/qa_alignment_proof.png` | 정합 합성 증거 |
| `docs/planning/WHEEL_ANIMATION_SPEC.md` | 전체 스펙 |
