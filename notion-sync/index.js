/**
 * 하루치 노션 XP 동기화 스크립트
 *
 * 소스 DB(할일, 루틴, 운동, 독서, 책, SNS)에서 완료된 항목을 감지하여
 * XP 로그를 생성하고 하루치 캐릭터 페이지와 연결합니다.
 *
 * 실행: node index.js (또는 npm run sync)
 * Cron: 매 5~10분마다 실행 권장
 *
 * Vercel 배포 시: api/cron-sync.js가 Vercel Cron으로 자동 실행됨 (별도 설정 불필요)
 */

require('dotenv').config();
const { runSync } = require('./sync-lib');

runSync()
  .then(({ created }) => {
    console.log(`완료: ${created}개 XP 로그 생성`);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
