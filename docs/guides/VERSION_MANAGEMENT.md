# 하루치 버전 관리 가이드

> **기본(1000원)** / **프로(5000원)** 단일 코드베이스 관리

---

## 📌 버전 구분 방식

| 구분 | 기본 (1000원) | 프로 (5000원) |
|------|---------------|---------------|
| **URL** | `haruchi.vercel.app` | `haruchipro.vercel.app` |
| **감지** | 기본 | hostname에 `haruchipro`, `-pro` 포함 또는 `?tier=pro` |
| **변수** | `APP_TIER='basic'`, `IS_PRO=false` | `APP_TIER='pro'`, `IS_PRO=true` |

**같은 코드**를 두 Vercel 프로젝트에 배포하고, **도메인만 다르게** 설정합니다.

---

## 🔧 배포 설정

### 1. Vercel 프로젝트 2개 생성

| 프로젝트 | GitHub 연결 | Custom Domain | 출력 |
|----------|-------------|---------------|------|
| **haruchi-basic** | 이 저장소 main | `haruchi.vercel.app` (예) | tama/ |
| **haruchipro** | 이 저장소 main | `haruchipro.vercel.app` | tama/ |

- 둘 다 **같은 저장소**의 **같은 브랜치** 사용
- **outputDirectory**: `tama` (vercel.json)
- **프로 감지**: `haruchipro` 도메인 사용 시 자동으로 `IS_PRO=true`

### 2. Custom Domain 설정

**기본 버전**  
- Vercel: haruchi-basic → Settings → Domains → `haruchi.vercel.app` (또는 본인 도메인)

**프로 버전**  
- Vercel: haruchipro → Settings → Domains → `haruchipro.vercel.app` (예: https://haruchipro.vercel.app/)

> hostname에 `haruchipro` 또는 `-pro`가 포함되면 자동으로 프로 모드로 동작합니다.

---

## 🔄 기능 수정 및 배포 절차

### 공통 (기본·프로 둘 다 적용)

1. 코드 수정 후 저장
2. Git 커밋 & 푸시
   ```bash
   git add .
   git commit -m "설명"
   git push origin main
   ```
3. **Vercel이 자동 배포** → 기본·프로 두 프로젝트 모두 최신 코드로 업데이트됨

> 두 Vercel 프로젝트가 **같은 저장소 main**에 연결돼 있으면, 푸시 한 번으로 **둘 다** 배포됩니다.

---

### 프로 전용 기능 추가

1. `tama/index.html` 에서 `IS_PRO`로 분기
   ```javascript
   if (window.IS_PRO) {
     // 프로에만 보이는 기능
   }
   ```
2. 또는 CSS로 숨기기
   ```css
   .pro-only { display: none; }
   body.app-tier-pro .pro-only { display: block; }
   ```
3. 커밋 & 푸시 → haruchipro.vercel.app 에만 적용된 것처럼 동작

---

### 기본 전용 (프로에는 안 보이게)

```javascript
if (!window.IS_PRO) {
  // 기본에만 보이는 기능 (예: 업그레이드 유도 배너)
}
```

---

## 💻 코드에서 프로 기능 추가

### JS 분기

```javascript
if (window.IS_PRO) {
  // 프로 전용 로직 (예: 추가 테마, 내보내기 등)
}
```

### CSS 분기

```css
body.app-tier-pro .프로전용클래스 {
  /* 프로 전용 스타일 */
}
```

### 사용 예

- 통계 모달에 프로 전용 섹션 추가
- 테마 선택 UI (프로만)
- 데이터 내보내기/가져오기 (프로만)
- 광고 제거 (프로만)

---

## 🧪 로컬에서 프로 모드 테스트

```
http://localhost:5500/tama/?tier=pro
```

`?tier=pro` 를 붙이면 로컬에서도 프로 기능을 확인할 수 있습니다.

---

## 📂 브랜치 전략 (선택)

| 브랜치 | 용도 |
|--------|------|
| `main` | v1.0.0 출시용 (기본 + 프로 모두 같은 소스) |
| `develop` | v2.0.0 개발용 (선택) |

- 기본/프로는 **같은 main**에서 관리
- 배포 시 **다른 도메인**으로 나누어 배포

---

## 📋 출시 체크리스트

- [ ] Vercel 프로젝트 2개 생성 (basic, pro)
- [ ] 각 프로젝트에 Custom Domain 설정
- [ ] 프로 도메인(haruchipro.vercel.app) 접속 시 PRO 배지 표시 확인
- [ ] `?tier=pro` 로 로컬 프로 모드 테스트
- [ ] 노션 템플릿 2개 생성 (1000원 / 5000원, 각각 다른 URL 연결)
