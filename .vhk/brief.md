# 프로젝트 브리핑

> 생성: 2026. 6. 10. 오후 1:24:02

## 프로젝트 정보

- **이름**: Haruchi-game
- **버전**: 1.0.0
- **설명**: 하루치(Haruchi) — 햄스터 다마고치 웹 게임 + Notion 게이미피케이션 연동. 최종 목표는 ESP32 기반 실물 다마고치 하드웨어 구현
- **의존성**: 1개 (dev: 5개)

## Git 상태

- **현재 브랜치**: main
- **마지막 커밋**: 2fe9118 feat: Pro 2.0 MVP - ?먮룞?? ?듯빀 ??쒕낫?? 紐⑤컮??理쒖쟻?? - ?먮룞?? trigger-sync API, ?대쭅 2珥? Make.com 媛?대뱶 - ?듯빀 ??쒕낫?? Pro 移대뱶??洹몃━???덉씠?꾩썐 - 紐⑤컮?? 768px 誘몃뵒?댁옘由? ?곗튂 ?곸뿭 ?뺣? - Cron 5遺?媛꾧꺽 (vercel.json) - 臾몄꽌: PRO_MVP_ROADMAP, MAKE_NOTION_HARUCHI_FULL_GUIDE (4 months ago)
- **총 커밋 수**: 64
- **미커밋 변경**: 29개 파일

## 저장된 기억 (memory v2)

**결정 (decisions)** (2)
- Vanilla JS 스택 — TypeScript/Next 템플릿 init 후 RULES.md로 덮어씀
- tama/assets/ 로컬 에셋이 SoT — pull 시 이미지 덮어쓰기 금지

**실패·교훈 (failures)** (1)
- OS 전역 NOTION_TOKEN이 Jest 테스트에 상속되어 no_token 테스트 실패 — 💡 테스트에서 NOTION_TOKEN도 명시적으로 비울 것

**성공 (successes)** (1)
- 4개월 방치 후 git pull + VHK init으로 재가동 성공

## 다음 단계 제안

1. 미커밋 변경 사항을 커밋하세요: `vhk save`
2. 품질 점검 실행: `vhk harness`
3. 보안 감사: `vhk audit`
4. 컨텍스트 갱신: `vhk context`

---

_VHK CLI 브리핑_
