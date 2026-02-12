# Hamster Damagochi - 점검 및 개선 내역

## ✅ 적용된 개선사항

### 1. UX 개선
- **왼쪽 버튼(◀)**: 동기화 시도 → `file://` 로컬에서는 테스트 시뮬레이션 (루틴→할 일→독서→운동 순환)
- **키보드 1~4**: input/textarea 포커스 시 무시 (숫자 입력 방해 안 함)
- **폰트**: Noto Sans KR(한글), Press Start 2P(숫자/픽셀) 적용

### 2. 진화 시스템
- Lv.1~9: 기본
- Lv.10~29: 아기 (밝기↑)
- Lv.30~99: 골든 (골드 톤)
- Lv.100+: 햄스터킹 (빛나는 효과)
- 나중에 `assets/evolve_*.png` 추가 시 `EVOLUTION_STAGES`에서 이미지 매핑 가능

### 3. 레벨업 연출
- "LEVEL UP! Lv.N" 토스트 추가

### 4. Notion 연동 준비
- `getTodayISO()`: KST 기준 오늘 날짜
- `syncFromNotion()`: API 호출 + 스냅샷 기반 XP (악용 방지)
- `api/game.js`: Vercel Serverless 플레이스홀더
- `vercel.json`: 배포 설정

### 5. 악용 방지
- 동기화 시 "증가분"만 XP 추가 (체크 해제 시 이전 스냅샷과 비교)

---

## 📋 추후 구현 권장

1. **api/game.js** Notion API 실제 연동
2. **1분 미만 자동 갱신 금지** (동기화 버튼 쿨다운)
3. **낙관적 UI**: 동기화 클릭 시 응답 전 XP 바 애니메이션
4. **진화용 이미지** 추가 시 `IMG` 객체에 evolve 단계별 경로 매핑
