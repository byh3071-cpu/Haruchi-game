/**
 * Hamster Damagochi - Notion XP 조회 API (Vercel Serverless)
 *
 * XP 로그 DB에서 하루치(HARUCHI_PAGE_ID)에 연결된 XP 합계 + 최근 로그를 반환합니다.
 * [환경변수] NOTION_API_KEY, XP_LOG_DB_ID, HARUCHI_PAGE_ID
 *
 * [응답] { totalXP, level, exp, maxExp, recentLogs: [{ id, type, title, xp }] }
 */

import { Client } from '@notionhq/client';

const XP_AMOUNT_KEY = 'XP';
const XP_TYPE_KEY = process.env.XP_LOG_TYPE_KEY || '타입';
const XP_TITLE_KEY = process.env.XP_LOG_TITLE_KEY || '[타입] · [원본/내용] · [XP]';
const HARUCHI_RELATION_KEY = '하루치 DB';
const MAX_EXP_PER_LEVEL = 100;
const RECENT_LOGS_LIMIT = 50;

function getPropText(prop) {
  if (!prop) return '';
  if (prop.title?.length > 0) return prop.title[0].plain_text;
  if (prop.rich_text?.length > 0) return prop.rich_text[0].plain_text;
  return '';
}

function getPropSelect(prop) {
  return prop?.select?.name || '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.NOTION_API_KEY;
  const xpDbId = process.env.XP_LOG_DB_ID;
  const haruchiPageId = process.env.HARUCHI_PAGE_ID;

  if (!apiKey || !xpDbId || !haruchiPageId) {
    return res.status(500).json({
      error: 'Notion 연동 미설정',
      message: 'Vercel에 NOTION_API_KEY, XP_LOG_DB_ID, HARUCHI_PAGE_ID 를 설정해주세요.',
      totalXP: 0,
      level: 1,
      exp: 0,
      maxExp: MAX_EXP_PER_LEVEL,
      recentLogs: [],
    });
  }

  try {
    const notion = new Client({ auth: apiKey });
    let totalXP = 0;
    const recentLogs = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: xpDbId,
        filter: {
          property: HARUCHI_RELATION_KEY,
          relation: { contains: haruchiPageId },
        },
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
        start_cursor: startCursor,
        page_size: 100,
      });

      for (const page of response.results) {
        const xpProp = page.properties[XP_AMOUNT_KEY];
        const xp = xpProp?.type === 'number' && typeof xpProp.number === 'number' ? xpProp.number : 0;
        totalXP += xp;

        if (recentLogs.length < RECENT_LOGS_LIMIT) {
          const type = getPropSelect(page.properties[XP_TYPE_KEY]);
          const title = getPropText(page.properties[XP_TITLE_KEY]) || getPropText(page.properties['Name']);
          recentLogs.push({ id: page.id, type, title, xp });
        }
      }

      hasMore = response.has_more;
      startCursor = response.next_cursor ?? undefined;
    }

    const level = Math.floor(totalXP / MAX_EXP_PER_LEVEL) + 1;
    const exp = totalXP % MAX_EXP_PER_LEVEL;

    return res.status(200).json({
      totalXP,
      level,
      exp,
      maxExp: MAX_EXP_PER_LEVEL,
      recentLogs,
    });
  } catch (e) {
    console.error('[api/game] Notion 오류:', e.message);
    return res.status(500).json({
      error: 'Notion 조회 실패',
      message: e.message,
      totalXP: 0,
      level: 1,
      exp: 0,
      maxExp: MAX_EXP_PER_LEVEL,
      recentLogs: [],
    });
  }
}
