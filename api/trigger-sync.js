/**
 * 즉시 notion-sync 실행 API
 *
 * Make.com, n8n 등에서 노션 DB 변경 감지 시 호출.
 * 완료 체크 → Make 트리거 → 이 API → notion-sync 즉시 실행 → 게임 폴링으로 XP 반영
 *
 * Vercel 환경변수:
 *   TRIGGER_SYNC_SECRET - 호출 시 인증용 (Make에서 Authorization: Bearer {값})
 *
 * 호출 예: POST /api/trigger-sync
 *   Header: Authorization: Bearer YOUR_TRIGGER_SYNC_SECRET
 *   또는: ?key=YOUR_TRIGGER_SYNC_SECRET
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { runSync } = require('../notion-sync/sync-lib.js');

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.TRIGGER_SYNC_SECRET;
  const auth = req.headers?.authorization || '';
  const keyFromQuery = req.query?.key || '';

  if (secret) {
    const validBearer = auth === `Bearer ${secret}`;
    const validKey = keyFromQuery === secret;
    if (!validBearer && !validKey) {
      return res.status(401).json({ error: 'Unauthorized', hint: 'TRIGGER_SYNC_SECRET required' });
    }
  }

  try {
    const { created } = await runSync();
    return res.status(200).json({ ok: true, created });
  } catch (e) {
    console.error('[trigger-sync]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
