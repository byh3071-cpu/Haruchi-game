# 하루치 OS - 노션 XP 연동

노션 DB(할일, 루틴, 운동, 독서, 책, SNS) 완료 시 XP를 지급하고 하루치 DB에 연결합니다.

## 실행 방법

```bash
cd notion-sync
npm install
npm start
```

## 환경 변수

- `notion-sync/.env` 가 없으면 프로젝트 루트 `.env` 를 자동으로 사용합니다.
- 새로 설정할 경우 `notion-sync/.env.example` 을 `.env` 로 복사한 뒤 값을 채워주세요.

## 노션 설정 체크리스트

- [ ] 각 소스 DB(할일, 루틴, 운동, 독서, 책, SNS)에 **Integration 연결**
- [ ] XP 로그 DB에 **Integration 연결**
- [ ] **하루치 캐릭터 페이지**를 Integration과 **공유** (HARUCHI_PAGE_ID)
- [ ] 책형 DB에 `XP 지급됨` 체크박스 속성 추가 (없는 경우)

## 베르셀(Vercel) 배포 시 (다마고치 실시간 XP)

다마고치가 노션 XP를 실시간으로 표시하려면 Vercel 환경변수에 다음을 설정하세요.

- `NOTION_API_KEY` - 노션 Integration 토큰
- `XP_LOG_DB_ID` - XP 로그 DB ID
- `HARUCHI_PAGE_ID` - 하루치 캐릭터 페이지 ID
