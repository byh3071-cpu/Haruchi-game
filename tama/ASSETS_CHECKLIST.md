# 이미지 에셋 체크리스트

## ✅ 현재 보유한 이미지

1. **bg.png** ✅
   - 배경 레이어 (하단)
   - 왼쪽에 정적 쳇바퀴 일러스트 포함
   - 용도: Layer 1 (Z=0)

2. **frame.png** ✅
   - 디바이스 프레임 (최상단)
   - 중앙 화면 영역은 투명
   - 용도: Layer 3 (Z=20)

3. **normal.png** ✅
   - Idle 상태 햄스터 캐릭터
   - 용도: STATE.IDLE

4. **happy.png** ✅
   - 레벨업/성공 상태
   - 용도: STATE.LEVEL_UP

5. **sad.png** ✅
   - 낮은 건강/방치 상태
   - 용도: STATE.SAD

6. **eat.png** ✅
   - 먹는 상태
   - 용도: STATE.EATING

7. **wheel.png** ✅
   - 스프라이트 시트 (2행 4열, 총 8프레임)
   - 쳇바퀴 포함
   - 용도: STATE.RUNNING 애니메이션

## 📋 모든 필수 이미지 준비 완료!

모든 필요한 이미지가 `assets` 폴더에 있습니다.

## 🎨 이미지 사용 위치

### 배경 (bg.png)
- Layer 1 (Z=0)
- 전체 화면 배경
- 왼쪽에 정적 쳇바퀴가 그려져 있음

### 캐릭터 위치
- **Idle/Happy/Sad/Eat**: 중앙 오른쪽 공간 (bg.png의 빈 공간)
- **Running**: bg.png의 왼쪽 쳇바퀴 위에 정확히 오버레이

### 프레임 (frame.png)
- Layer 3 (Z=20)
- 모든 것을 감싸는 디바이스 프레임
- pointer-events: none (버튼 클릭 허용)

## 🔧 이미지 위치 조정이 필요한 경우

현재 코드에서 캐릭터 위치는 다음과 같이 설정되어 있습니다:

```css
/* Idle/Happy/Sad/Eat - 중앙 오른쪽 */
.hamster.idle,
.hamster.happy,
.hamster.sad,
.hamster.eat{
  right: 80px;
  bottom: 60px;
}

/* Running - 왼쪽 쳇바퀴 위 */
.hamster.running{
  left: 50px;
  bottom: 80px;
}
```

만약 실제 bg.png의 쳇바퀴 위치와 맞지 않는다면, 이 값들을 조정해야 합니다.

## ✅ 체크리스트

- [x] bg.png - 배경 이미지
- [x] frame.png - 프레임 이미지
- [x] normal.png - Idle 상태
- [x] happy.png - 레벨업 상태
- [x] sad.png - 슬픔 상태
- [x] eat.png - 먹는 상태
- [x] wheel.png - 달리기 애니메이션 (8프레임)

**모든 이미지 준비 완료!** 🎉
