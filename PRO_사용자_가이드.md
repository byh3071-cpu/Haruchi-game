# 하루치 Pro 버전 — 사용자 가이드

> 사용자 관점에서 Pro 하루치를 사용하는 방법

---

## 프로 버전이란?

| 항목 | 기본 (1000원) | 프로 (5000원) |
|------|---------------|---------------|
| 접속 주소 | `haruchi.vercel.app` | `haruchipro.vercel.app` |
| 특징 | 수동 기록 위주 | 노션 자동 연동, 습관 달력 등 Pro 전용 기능 |

---

## 사용 방법 (두 가지 경우)

### 경우 1: 판매자 제공 링크로 사용 (가장 간단)

**노션 템플릿(5000원)을 구매한 경우**

1. 구매한 **노션 템플릿**을 노션 워크스페이스에 "템플릿으로 추가"
2. 판매자가 안내한 **Pro 링크**로 접속  
   예: `https://haruchipro.vercel.app/?notion=1`
3. 노션 페이지에 있는 **하루치를 임베드**하거나, 링크에서 바로 플레이
4. 끝. 별도 설정 없이 즐기시면 됩니다.

> ⚠️ 이 방식은 **판매자가 미리 노션·Pro 링크를 연결해 둔 경우**에만 해당합니다.  
> 템플릿에 포함된 안내를 따르세요.

---

### 경우 2: 직접 배포해서 사용 (DIY)

**자기 노션과 연동해서 Pro 하루치를 쓰고 싶은 경우**

#### 전체 흐름 (한눈에 보기)

```
[사용자]                    [Vercel]
   │                           │
   │  1. Fork → 배포 연결       │
   │  2. 환경변수 설정          │  ← 노션 API 키, DB ID 등
   │  3. Pro 링크로 접속        │
   │  ──────────────────────────▶  게임 (HTML) + api/game.js (XP 조회)
   │                           │
   │                           │  5분마다 자동 (Vercel Cron)
   │                           │  ──▶ api/cron-sync.js 호출
   │                           │       └── 노션 DB 체크 → XP 로그 생성
   │                           │
   │  노션에서 할 일 ✓ 체크     │
   │  ──────────────────────────▶  다음 cron 실행 시 XP 반영 → 게임에 표시
```

**핵심:** Vercel에 배포하면 **notion-sync가 Vercel Cron으로 5분마다 자동 실행**됩니다.  
GitHub Actions나 별도 서버 없이, **Vercel 환경변수만 설정하면 끝**입니다.

---

#### 1단계: 저장소 Fork & Vercel 배포

1. 이 GitHub 저장소를 **Fork**
2. [Vercel](https://vercel.com) 로그인 → **Import** → Fork한 저장소 연결
3. 프로젝트 설정에서 **Root Directory**를 빈칸(전체)
4. **Custom Domain**에 `haruchipro.vercel.app` 또는 본인 도메인 추가  
   → 도메인에 `haruchipro` 또는 `-pro`가 들어가면 Pro 모드로 동작

#### 2단계: 노션 설정

1. [노션 통합 만들기](https://www.notion.so/my-integrations) → 시크릿 복사 (API 키)
2. 노션에서 사용할 **페이지·DB** 준비  
   - 하루치 페이지 (캐릭터가 있는 페이지)  
   - XP 로그 DB, 할 일 DB, 루틴 DB 등 (필요한 것만)
3. 각 페이지·DB에서 **⋮ → 연결 → 방금 만든 통합** 선택

#### 3단계: 환경변수 설정 (노션 설정 도우미 활용)

1. `tama/notion-setup-helper.html` 페이지 열기  
   (로컬: `tama/notion-setup-helper.html` / 배포 후: `https://본인도메인/notion-setup-helper.html`)
2. 위에서 만든 **노션 링크**를 각 입력란에 붙여넣기 → 32자 ID 자동 추출
3. **"전체 복사"** 클릭
4. **Vercel 대시보드** → 프로젝트 → **Settings → Environment Variables** → 각 변수 **하나씩** 추가

   (선택) Cron 호출 보안용 `CRON_SECRET`을 임의의 긴 문자열로 추가하면, 외부에서 `/api/cron-sync` 직접 호출이 차단됩니다.

#### 4단계: Pro 링크로 접속

`https://haruchipro.vercel.app/?notion=1` (또는 본인이 설정한 Pro 도메인)로 접속하여 사용합니다.

**노션에서 할 일을 체크하면** → 약 5분 이내에 XP가 자동 반영됩니다 (Vercel Cron이 주기적으로 동기화).

---

## 요약

| 사용 방식 | 해야 할 일 |
|-----------|------------|
| **템플릿 구매자** | 노션 템플릿 추가 → 판매자 Pro 링크 접속 |
| **직접 배포** | Fork → Vercel 배포 → 노션 연동 → notion-setup-helper로 env 설정 → **끝** (Cron 자동 실행) |

---

## 로컬에서 Pro 모드 테스트

배포 전에 Pro 화면을 미리 보고 싶다면:

```
http://localhost:5500/tama/?tier=pro
```

`?tier=pro`를 붙이면 로컬에서도 Pro 전용 UI·기능이 활성화됩니다.
