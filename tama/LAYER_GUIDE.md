# 레이어 구조 가이드

## 📐 레이어 구조 (Z-Index 순서)

### Layer 1 (Z=0) - Background
- **위치**: 프레임의 화면 영역에 맞춰 배치
- **크기**: `--screen-width` x `--screen-height`
- **위치**: `left: --screen-left`, `top: --screen-top`
- **용도**: `bg.png` 배경 이미지 표시

### Layer 2 (Z=10) - Character
- **위치**: 프레임의 화면 영역에 맞춰 배치 (bg와 동일한 영역)
- **크기**: `--screen-width` x `--screen-height`
- **용도**: 햄스터 캐릭터 표시
  - **Idle/Happy/Sad/Eat**: 화면 중앙 (수평 50%, 수직 35%)
  - **Running**: 왼쪽 쳇바퀴 위치 (left: 80px, top: 50%)

### Layer 3 (Z=20) - Frame
- **위치**: 전체 프레임 크기 (`inset: 0`)
- **용도**: `frame.png` 프레임 이미지 (투명한 화면 영역 포함)

### Layer 4 (Z=30) - UI Overlay
- **위치**: 프레임의 화면 영역에 맞춰 배치
- **크기**: `--screen-width` x `--screen-height`
- **용도**: LV, EXP, Log UI 표시

## 🎯 화면 영역 변수 조정

실제 `frame.png`의 투명한 화면 영역에 맞춰 다음 변수들을 조정하세요:

```css
:root{
  --screen-left: 50px;    /* 프레임 내부 화면 시작 X 위치 */
  --screen-top: 40px;    /* 프레임 내부 화면 시작 Y 위치 */
  --screen-width: 570px;  /* 프레임 내부 화면 너비 */
  --screen-height: 280px; /* 프레임 내부 화면 높이 */
}
```

### 조정 방법

1. **브라우저 개발자 도구 사용**
   - F12로 개발자 도구 열기
   - Elements 탭에서 `.layer-bg` 선택
   - 실제 프레임 이미지와 비교하여 위치/크기 조정

2. **시각적 확인**
   - `bg.png`가 프레임의 투명 영역에 정확히 들어가는지 확인
   - 캐릭터가 화면 중앙에 위치하는지 확인
   - UI가 화면 하단에 잘 보이는지 확인

## 📍 캐릭터 위치 조정

### Idle/Happy/Sad/Eat 상태
```css
.hamster.idle,
.hamster.happy,
.hamster.sad,
.hamster.eat{
  left: 50%;      /* 수평 중앙 */
  top: 35%;       /* 수직으로 상단 2/3 지점 */
  transform: translate(-50%, -50%);
}
```

### Running 상태
```css
.hamster.running{
  left: 80px;     /* bg.png의 쳇바퀴 위치에 맞춰 조정 */
  top: 50%;       /* 수직 중앙 */
  transform: translateY(-50%);
}
```

**주의**: `bg.png`의 실제 쳇바퀴 위치에 맞춰 `left` 값을 조정해야 합니다.

## ✅ 체크리스트

- [ ] `--screen-left`, `--screen-top`, `--screen-width`, `--screen-height` 값이 실제 프레임의 화면 영역과 일치하는지 확인
- [ ] `bg.png`가 프레임의 투명 영역에 정확히 들어가는지 확인
- [ ] 캐릭터가 화면 중앙에 위치하는지 확인
- [ ] Running 상태일 때 쳇바퀴 위치가 `bg.png`의 쳇바퀴와 일치하는지 확인
- [ ] UI가 화면 하단에 잘 보이는지 확인

## 🔧 빠른 조정 팁

1. **화면 영역이 잘못된 경우**
   - 개발자 도구에서 `.layer-bg`의 크기와 위치를 확인
   - `--screen-*` 변수 값을 조정

2. **캐릭터 위치가 어긋난 경우**
   - Idle 상태: `top: 35%` 값을 조정 (작을수록 위로)
   - Running 상태: `left: 80px` 값을 조정 (bg.png의 쳇바퀴 위치에 맞춤)

3. **배경이 잘리는 경우**
   - `object-fit: cover` → `object-fit: contain`으로 변경
   - 또는 `object-position` 조정
