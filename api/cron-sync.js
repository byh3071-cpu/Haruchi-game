/**
 * Vercel Cron: 노션 XP 동기화 (notion-sync)
 *
 * vercel.json의 crons에서 5분마다 호출됨.
 * 사용자는 Vercel 환경변수만 설정하면 됨 — GitHub Actions 등 별도 설정 불필요.
 *
 * 보안: CRON_SECRET 설정 시 Vercel이 자동으로 Authorization 헤더에 포함해 호출함.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { runSync } = require('../notion-sync/sync-lib.js');

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  // Vercel Cron은 GET으로 호출. CRON_SECRET 있을 때만 검증
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers?.authorization || '';
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const { created } = await runSync();
    return res.status(200).json({ ok: true, created });
  } catch (e) {
    console.error('[cron-sync]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
