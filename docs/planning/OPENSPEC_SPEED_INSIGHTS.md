# OpenSpec: Vercel Speed Insights 통합 구현 명세서

## 📋 요구사항 명세서 (Open Specification)

### 1. 무엇을 만들 것인가?

**기능**: Vercel Speed Insights를 하루치 게임에 통합하여 웹사이트 성능을 모니터링하는 시스템

**범위**: 
- HTML 프로젝트에 Speed Insights 스크립트 추가
- Vercel 대시보드 설정
- 배포 및 검증

### 2. 어떻게 만들 것인가?

#### 2.1 기술 스택 및 도구

- **프레임워크**: 바닐라 HTML/CSS/JavaScript
- **배포 플랫폼**: Vercel
- **모니터링 도구**: Vercel Speed Insights (내장 스크립트)

#### 2.2 구현 방식

**HTML 프로젝트용 통합 방법**:
- Next.js 패키지 설치 불필요 (`@vercel/speed-insights` 패키지 사용 안 함)
- Vercel이 제공하는 스크립트 태그만 추가
- `/_vercel/speed-insights/script.js` 경로 사용

#### 2.3 파일 구조

```
tama/
└── index.html  # Speed Insights 스크립트 추가 위치
```

### 3. 상세 구현 명세

#### 3.1 코드 추가 위치

**파일**: `tama/index.html`  
**위치**: `</body>` 태그 바로 앞  
**이유**: 페이지 로딩 완료 후 성능 측정 시작

#### 3.2 추가할 코드

```html
<!-- Vercel Speed Insights: 웹사이트 성능 모니터링 -->
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
```

**코드 설명**:
- 첫 번째 스크립트: Speed Insights 큐 초기화 (비동기 로딩 대비)
- 두 번째 스크립트: 실제 Speed Insights 스크립트 로드 (`defer` 속성으로 비동기)

#### 3.3 Vercel 대시보드 설정

**단계**:
1. Vercel 대시보드 접속
2. 프로젝트 선택 (`haruchi-game` 또는 해당 프로젝트)
3. **Speed Insights** 탭 클릭
4. **Enable** 버튼 클릭
5. 다음 배포 후 자동으로 활성화됨

**참고**: 
- Speed Insights 활성화 시 `/_vercel/speed-insights/*` 경로가 자동 생성됨
- 배포 후 스크립트가 정상 작동하는지 확인 필요

### 4. 배포 및 검증 절차

#### 4.1 배포 전 체크리스트

- [ ] `tama/index.html`에 Speed Insights 스크립트 추가 확인
- [ ] 코드 포맷팅 및 문법 오류 확인
- [ ] Git 커밋 및 푸시

#### 4.2 배포 후 검증

**1단계: 배포 확인**
- Vercel 대시보드 → Deployments 탭에서 최신 배포 상태 확인
- 배포 URL 접속하여 게임 정상 작동 확인

**2단계: 스크립트 로드 확인**
- 브라우저 개발자 도구 → Network 탭
- `/_vercel/speed-insights/script.js` 파일이 로드되는지 확인
- 상태 코드: 200 OK

**3단계: 데이터 수집 확인**
- 배포된 사이트 방문 (여러 페이지 탐색)
- 30초~몇 분 대기
- Vercel 대시보드 → Speed Insights 탭에서 데이터 확인

**4단계: 성능 지표 확인**
- Core Web Vitals (LCP, FID, CLS) 값 확인
- 페이지 로딩 시간 확인
- 기기/브라우저별 통계 확인

### 5. 예상 결과

#### 5.1 정상 작동 시

- Vercel 대시보드에서 성능 데이터 확인 가능
- 시간이 지날수록 더 많은 데이터 수집
- 성능 지표 그래프 및 통계 표시

#### 5.2 문제 발생 시

**스크립트가 로드되지 않는 경우**:
- Vercel 대시보드에서 Speed Insights가 활성화되었는지 확인
- 배포가 완료되었는지 확인 (최신 배포 확인)
- 브라우저 콘솔에서 에러 메시지 확인

**데이터가 수집되지 않는 경우**:
- 콘텐츠 차단기(AdBlock 등) 비활성화 후 테스트
- 여러 페이지를 탐색해보기
- 30초 이상 대기 후 다시 확인

### 6. 유지보수

#### 6.1 정기 점검

- **주 1회**: Speed Insights 대시보드에서 성능 트렌드 확인
- **월 1회**: 성능 지표 분석 및 개선 계획 수립

#### 6.2 성능 개선 프로세스

1. Speed Insights 데이터 분석
2. 병목 지점 식별 (느린 페이지, 큰 리소스 등)
3. 개선 작업 수행 (이미지 최적화, 코드 분할 등)
4. 재배포 후 성능 비교

### 7. 참고 자료

- [Vercel Speed Insights 공식 문서](https://vercel.com/docs/speed-insights/quickstart)
- [Core Web Vitals 가이드](https://web.dev/vitals/)
- [HTML 프로젝트 통합 가이드](https://vercel.com/docs/speed-insights/quickstart#add-the-script-tag-to-your-site)

---

## ✅ 구현 완료 체크리스트

- [x] `tama/index.html`에 Speed Insights 스크립트 추가
- [ ] Vercel 대시보드에서 Speed Insights 활성화
- [ ] Git 커밋 및 푸시
- [ ] 배포 완료 확인
- [ ] 스크립트 로드 확인 (Network 탭)
- [ ] 데이터 수집 확인 (대시보드)
- [ ] 성능 지표 확인 및 분석
