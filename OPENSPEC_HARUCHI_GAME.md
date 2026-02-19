# OpenSpec: 하루치 게임 구현 명세서

## 📋 요구사항 명세서 (Open Specification)

### 1. 무엇을 만들 것인가?

**프로젝트**: 하루치 - 웹 기반 햄스터 다마고치 게임  
**타입**: 싱글 페이지 애플리케이션 (SPA)  
**플랫폼**: 웹 브라우저 (PC 및 모바일)

### 2. 어떻게 만들 것인가?

#### 2.1 아키텍처

**구조**: 모놀리식 HTML 파일 기반
- 단일 HTML 파일 (`tama/index.html`)에 모든 코드 포함
- 인라인 CSS 및 JavaScript
- 외부 리소스: 이미지, 오디오 파일만 분리

**데이터 흐름**:
```
사용자 액션 → JavaScript 이벤트 핸들러 → 게임 상태 업데이트 → UI 렌더링 → localStorage 저장
```

#### 2.2 파일 구조

```
Haruchi-game/
├── tama/                          # 게임 메인 디렉토리
│   ├── index.html                 # 메인 게임 파일 (모든 로직 포함)
│   ├── assets/                    # 리소스 파일
│   │   ├── hamster/               # 햄스터 스프라이트 이미지
│   │   ├── scene/                 # 배경 및 프레임 이미지
│   │   ├── audio/                 # 오디오 파일 (오프닝, BGM)
│   │   └── Thumbnail_og.png       # OG 이미지 (소셜 공유용)
│   └── thumbnail_resize.html      # 썸네일 생성 도구
├── vercel.json                    # Vercel 배포 설정
├── package.json                   # 프로젝트 메타데이터
└── [문서 파일들]                  # README, CHANGELOG 등
```

#### 2.3 기술 스택 상세

**프론트엔드**:
- **HTML5**: 시맨틱 마크업, 게임 구조
- **CSS3**: 
  - CSS Variables (커스텀 속성)로 테마 관리
  - Flexbox/Grid 레이아웃
  - CSS Animations (키프레임 애니메이션)
  - 미디어 쿼리 (반응형 디자인)
- **Vanilla JavaScript (ES6+)**:
  - 모듈 패턴 없이 전역 스코프 사용
  - 이벤트 리스너 기반 상호작용
  - localStorage API로 데이터 저장

**배포**:
- **Vercel**: 정적 호스팅
- **GitHub**: 버전 관리 및 CI/CD 연동

**성능 모니터링**:
- **Vercel Speed Insights**: Core Web Vitals 추적

### 3. 핵심 기능 구현 명세

#### 3.1 게임 상태 관리

**데이터 구조** (`game` 객체):
```javascript
game = {
  level: 1,              // 현재 레벨
  exp: 0,                // 현재 경험치
  maxExp: 100,           // 레벨업에 필요한 경험치
  hunger: 50,            // 배고픔 수치 (0-100)
  thirst: 50,            // 목마름 수치 (0-100)
  happiness: 50,         // 행복도 (0-100)
  mood: 'normal',        // 현재 기분 상태
  lastAction: null,      // 마지막 액션 타입
  stats: {               // 통계 데이터
    totalActions: 0,
    playDays: [],
    startDate: null
  }
}
```

**저장 방식**:
- `localStorage.setItem('haruchi_game', JSON.stringify(game))`
- 페이지 로드 시 `localStorage.getItem()`으로 복원

#### 3.2 액션 시스템

**액션 타입**:
1. **밥 주기** (`feed`)
   - EXP +10
   - 배고픔 +20
   - 행복도 +5

2. **물 주기** (`water`)
   - EXP +5
   - 목마름 +20
   - 행복도 +3

3. **쓰다듬기** (`pet`)
   - EXP +15
   - 행복도 +15
   - 기분 상태 변화

**액션 처리 흐름**:
```javascript
function performAction(actionType) {
  1. 게임 상태 업데이트 (EXP, 수치 변경)
  2. 레벨업 체크 (exp >= maxExp)
  3. UI 업데이트 (경험치 바, 레벨 표시)
  4. 햄스터 애니메이션 트리거
  5. localStorage 저장
  6. 통계 업데이트
}
```

#### 3.3 레벨업 시스템

**레벨업 공식**:
- 초기 `maxExp = 100`
- 레벨업 시: `maxExp = 100 + (level * 20)`
- 예: 레벨 1→2: 100 EXP, 레벨 2→3: 120 EXP

**레벨업 처리**:
```javascript
function checkLevelUp() {
  if (game.exp >= game.maxExp) {
    game.level++;
    game.exp = 0;
    game.maxExp = calculateMaxExp(game.level);
    triggerLevelUpAnimation();
    updateUI();
  }
}
```

#### 3.4 상태 시스템

**기분 상태** (`mood`):
- `normal`: 기본 상태
- `happy`: 행복도 높을 때
- `sad`: 행복도 낮을 때
- `hungry`: 배고픔 높을 때
- `thirsty`: 목마름 높을 때
- `sleepy`: 특정 조건 (예: 배부름 + 시간)

**상태 변화 로직**:
```javascript
function updateMood() {
  if (game.happiness > 70) mood = 'happy';
  else if (game.happiness < 30) mood = 'sad';
  else if (game.hunger < 30) mood = 'hungry';
  else if (game.thirst < 30) mood = 'thirsty';
  else mood = 'normal';
  
  updateHamsterSprite(mood);
}
```

#### 3.5 애니메이션 시스템

**CSS 애니메이션**:
- 햄스터 스프라이트 변경 (기분에 따라)
- 경험치 바 애니메이션
- 레벨업 시 화면 효과
- 버튼 클릭 피드백

**JavaScript 애니메이션 제어**:
```javascript
function animateAction(actionType) {
  const hamster = document.getElementById('hamster');
  hamster.classList.add(`action-${actionType}`);
  setTimeout(() => {
    hamster.classList.remove(`action-${actionType}`);
  }, 500);
}
```

#### 3.6 오디오 시스템

**오디오 파일**:
- `assets/audio/opening.mp3`: 오프닝 배경음
- `assets/audio/bgm.mp3`: 게임 배경음

**재생 로직**:
- 사용자 인터랙션 후 재생 (브라우저 정책 준수)
- 볼륨 조절 (0.6)
- 루프 재생 (BGM)

#### 3.7 통계 시스템

**통계 데이터**:
```javascript
stats = {
  totalActions: 0,        // 총 액션 횟수
  playDays: [],          // 플레이한 날짜 배열
  startDate: null,       // 첫 플레이 날짜
  lastPlayDate: null     // 마지막 플레이 날짜
}
```

**출석 캘린더**:
- 날짜별 체크 표시
- 연속 플레이 일수 계산
- Pro 버전: 씨앗/해바라기 아이콘

### 4. UI/UX 명세

#### 4.1 레이아웃

**게임보이 스타일 프레임**:
- 고정 크기: 673px × 673px
- 상단 화면: 390px × 280px (게임 영역)
- 하단 패널: 390px × 135px (버튼 영역)

**반응형 디자인**:
- 모바일: 프레임 크기 조정, 터치 최적화
- PC: 중앙 정렬, 마우스 인터랙션

#### 4.2 색상 테마

**게임보이 그린 테마**:
```css
--color-bg: #9bbc0f;        /* 배경색 */
--color-ui-bg: #8bac0f;     /* UI 배경 */
--color-text: #0f380f;      /* 텍스트 */
--exp-bar-bg: #306230;      /* 경험치 바 배경 */
--exp-bar-fill: #0f380f;    /* 경험치 바 채움 */
```

#### 4.3 폰트

- **Press Start 2P**: 게임보이 스타일 (제목, 버튼)
- **Noto Sans KR**: 한글 가독성 (본문, 통계)

### 5. 배포 명세

#### 5.1 Vercel 설정

**`vercel.json`**:
```json
{
  "buildCommand": null,
  "outputDirectory": "tama",
  "devCommand": null,
  "installCommand": null
}
```

**배포 프로세스**:
1. GitHub에 코드 푸시
2. Vercel이 자동 감지 및 배포
3. `tama` 폴더가 루트로 배포됨

#### 5.2 도메인 설정

**기본 버전**: `haruchi.vercel.app`  
**Pro 버전**: `haruchipro.vercel.app`

**버전 구분 로직**:
```javascript
window.APP_TIER = hostname.includes('pro') ? 'pro' : 'basic';
window.IS_PRO = window.APP_TIER === 'pro';
```

### 6. 성능 최적화

#### 6.1 이미지 최적화

- 스프라이트 이미지 최적화 (PNG 압축)
- 적절한 해상도 사용 (게임보이 스타일이므로 낮은 해상도)
- 지연 로딩 (필요 시)

#### 6.2 코드 최적화

- 인라인 스타일/스크립트로 HTTP 요청 최소화
- 이벤트 리스너 최적화 (이벤트 위임 사용)
- localStorage 쓰기 빈도 제한 (디바운싱)

#### 6.3 모니터링

- Vercel Speed Insights로 Core Web Vitals 추적
- Lighthouse 성능 점수 모니터링

### 7. 테스트 명세

#### 7.1 기능 테스트

- [ ] 모든 액션 버튼 정상 작동
- [ ] 레벨업 시스템 정확성
- [ ] 데이터 저장/복원 정상 작동
- [ ] 통계 화면 정확성
- [ ] 오디오 재생 정상

#### 7.2 호환성 테스트

- [ ] Chrome (최신 버전)
- [ ] Safari (iOS, macOS)
- [ ] Firefox (최신 버전)
- [ ] 모바일 브라우저 (Chrome, Safari)

#### 7.3 성능 테스트

- [ ] 페이지 로딩 시간 < 3초
- [ ] 첫 인터랙션 지연 < 100ms
- [ ] 메모리 사용량 모니터링
- [ ] Lighthouse 점수 확인

### 8. 유지보수

#### 8.1 정기 점검

- **주 1회**: 배포 상태 확인, 사용자 피드백 확인
- **월 1회**: 성능 지표 분석, 버그 수정
- **분기 1회**: 기능 개선, 새로운 기능 추가 검토

#### 8.2 버전 관리

- 시맨틱 버저닝 (Semantic Versioning)
- CHANGELOG.md에 변경 이력 기록
- 주요 업데이트는 태그로 관리

---

## ✅ 구현 체크리스트

### 기본 기능 (v1.0)
- [x] 게임 상태 관리 시스템
- [x] 액션 시스템 (밥, 물, 쓰다듬기)
- [x] 레벨업 시스템
- [x] 상태 시스템 (기분, 애니메이션)
- [x] 오디오 시스템
- [x] 데이터 저장 (localStorage)
- [x] 통계 화면
- [x] 반응형 디자인
- [x] Vercel 배포 설정
- [x] Speed Insights 통합

### Pro 기능 (v2.0)
- [ ] 자동 레벨업 (노션 연동)
- [ ] 씨앗 농장 (Streak Calendar)
- [ ] 똑똑한 잔소리 (Smart Feedback)
- [ ] 통합 대시보드
