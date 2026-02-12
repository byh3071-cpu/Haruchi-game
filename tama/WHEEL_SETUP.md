# 쳇바퀴 애니메이션 설정 가이드

## ✅ 구현 완료 사항

### 1. CSS 애니메이션 설정
- **2행 4열 (8프레임)** 레이아웃 지원
- `background-size: 400% 200%` (4열 2행)
- `steps(8)` 애니메이션으로 부드러운 전환
- 각 프레임이 순차적으로 재생됨

### 2. 프레임 순서
```
첫 번째 행 (위):
[프레임1] [프레임2] [프레임3] [프레임4]
  0%       12.5%     25%       37.5%

두 번째 행 (아래):
[프레임5] [프레임6] [프레임7] [프레임8]
  50%      62.5%     75%       87.5%
```

## 📋 이미지 파일 준비

### 필수 작업
1. 생성한 이미지를 `assets` 폴더에 복사
2. 파일명: `wheel.png`
3. 위치: `tama/assets/animations/wheel.png`

### 이미지 확인 사항
- ✅ 2행 4열 레이아웃 (총 8프레임)
- ✅ 각 프레임 크기 일치 (300x300px 권장)
- ✅ 배경 투명
- ✅ normal.png와 스타일 일치

## 🧪 테스트 방법

1. **이미지 복사 확인**
   ```
   tama/assets/animations/wheel.png 파일이 존재하는지 확인
   ```

2. **브라우저에서 테스트**
   - `index.html` 파일 열기
   - 왼쪽 버튼(◀) 클릭
   - 쳇바퀴 타는 애니메이션이 부드럽게 재생되는지 확인

3. **애니메이션 속도 조절** (필요시)
   ```css
   /* index.html의 .ham.wheel::after에서 */
   animation: wheelRun 0.8s steps(8) infinite;
   /* 0.8s 값을 변경 (작을수록 빠름) */
   ```

## 🔧 문제 해결

### 애니메이션이 보이지 않는 경우
1. `wheel.png` 파일이 올바른 위치에 있는지 확인
2. 브라우저 개발자 도구(F12)에서 콘솔 에러 확인
3. CSS가 제대로 적용되었는지 확인

### 프레임이 어긋나는 경우
- 이미지가 정확히 2행 4열로 배치되었는지 확인
- 각 프레임의 크기가 동일한지 확인
- `background-size: 400% 200%` 값이 맞는지 확인

### 스타일이 어색한 경우
- `normal.png`와 색상/스타일 비교
- 햄스터 크기가 일치하는지 확인
- 배경 투명도 확인

## 📝 코드 구조

### CSS 애니메이션
```css
.ham.wheel::after{
  background-image: url("./assets/animations/wheel.png");
  background-size: 400% 200%; /* 4열 2행 */
  animation: wheelRun 0.8s steps(8) infinite;
}

@keyframes wheelRun{
  0%{   background-position: 0%    0%; }    /* 프레임 1 */
  12.5%{ background-position: 33.33% 0%; }  /* 프레임 2 */
  25%{  background-position: 66.66% 0%; }  /* 프레임 3 */
  37.5%{ background-position: 100%   0%; }  /* 프레임 4 */
  50%{  background-position: 0%    100%; }  /* 프레임 5 */
  62.5%{ background-position: 33.33% 100%; } /* 프레임 6 */
  75%{  background-position: 66.66% 100%; } /* 프레임 7 */
  87.5%{ background-position: 100%   100%; } /* 프레임 8 */
  100%{ background-position: 0%    0%; }    /* 처음으로 */
}
```

### JavaScript 상태 관리
```javascript
// wheel 상태로 변경 시
setState("wheel");
// 자동으로 background-image 애니메이션이 시작됨
```

## ✨ 추가 개선 가능 사항

1. **애니메이션 속도 조절**: 사용자 설정으로 변경 가능
2. **사운드 효과**: 쳇바퀴 돌아가는 소리 추가
3. **파티클 효과**: 달리는 동안 별이나 하트 효과
4. **속도 변화**: 레벨에 따라 애니메이션 속도 증가
