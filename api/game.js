/**
 * 하루치 노션 XP 연동 API
 *
 * NOTION_ENABLED (?notion=1) 모드에서 게임이 호출함.
 * 하루치 캐릭터 페이지의 Rollup/Formula(총 XP) 또는 XP 로그 DB 합산을 반환.
 *
 * Vercel 환경변수:
 *   NOTION_API_KEY 또는 NOTION_TOKEN - 노션 Integration 토큰
 *   HARUCHI_PAGE_ID - 하루치 캐릭터 페이지 ID
 *   NOTION_XP_PROPERTY (선택) - 총 XP 속성 이름 (기본: 총 XP, XP, 경험치, totalExp)
 *   XP_LOG_DB_ID (선택) - Rollup 없을 때 XP 로그 DB로 폴백
 */

import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = (req.query && req.query.action) || 'getXp';
  if (!isOwnerAuthorized(req)) {
    if (action === 'getLogs') return res.status(200).json({ logs: [] });
    if (action === 'getXp') return res.status(200).json({ totalExp: 0, source: 'owner_auth_required' });
    return res.status(403).json({ error: 'Owner authorization required' });
  }

  if (action === 'getLogs') {
    try {
      const token = process.env.NOTION_API_KEY || process.env.NOTION_TOKEN;
      const pageId = process.env.HARUCHI_PAGE_ID;
      const xpLogDbId = process.env.XP_LOG_DB_ID;
      if (!token || !pageId || !xpLogDbId) {
        return res.status(200).json({ logs: [] });
      }
      const notion = new Client({ auth: token });
      const haruchiId = pageId.replace(/-/g, '');
      const dbIdClean = xpLogDbId.replace(/-/g, '');
      const relProps = (process.env.NOTION_RELATION_PROPERTY || '하루치,캐릭터,Haruchi').split(',').map(s => s.trim());
      let logs = [];
      for (const relProp of relProps) {
        try {
          const q = await notion.databases.query({
            database_id: dbIdClean,
            filter: { property: relProp, relation: { contains: haruchiId } },
            sorts: [{ timestamp: 'created_time', direction: 'descending' }],
            page_size: 50,
          });
          for (const p of q.results || []) {
            const props = p.properties || {};
            const titleProp = props.이름 || props.제목 || Object.values(props).find(x => x?.type === 'title');
            const titleText = titleProp?.title || [];
            const raw = titleText.map(t => (t && t.plain_text) || '').join('');
            const m = raw.match(/\[([^\]]+)\]\s*·\s*(.+?)\s*·\s*\[(\d+)\]XP/);
            const type = m ? m[1] : '기타';
            const title = m ? m[2] : raw || '무제';
            const xp = m ? parseInt(m[3], 10) : (getXpFromProps(props) || parseXpFromTitle(props.이름 || props.제목) || 0);
            const created = p.created_time ? new Date(p.created_time).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'short' }) : '';
            logs.push({ type, title, xp, date: created });
          }
          break;
        } catch (_) { }
      }
      return res.status(200).json({ logs });
    } catch (err) {
      console.error('Notion 로그 조회 실패:', err.message);
      return res.status(200).json({ logs: [] });
    }
  }

  if (action === 'getXp') {
    try {
      const token = process.env.NOTION_API_KEY || process.env.NOTION_TOKEN;
      const pageId = process.env.HARUCHI_PAGE_ID;
      const xpPropNames = (process.env.NOTION_XP_PROPERTY || '총 XP,XP,경험치,totalExp').split(',').map(s => s.trim());

      if (!token) {
        console.warn('Notion API: NOTION_API_KEY 또는 NOTION_TOKEN 미설정');
        return res.status(200).json({ totalExp: 0, source: 'no_token' });
      }
      if (!pageId) {
        console.warn('Notion API: HARUCHI_PAGE_ID 미설정');
        return res.status(200).json({ totalExp: 0, source: 'no_page_id' });
      }

      const notion = new Client({ auth: token });
      const page = await notion.pages.retrieve({
        page_id: pageId.replace(/-/g, ''),
      });

      const props = page.properties || {};
      let totalExp = 0;

      for (const name of xpPropNames) {
        const p = props[name];
        if (!p) continue;
        if (p.rollup && p.rollup.type === 'number' && typeof p.rollup.number === 'number') {
          totalExp = Math.floor(p.rollup.number);
          break;
        }
        if (p.formula && p.formula.type === 'number' && typeof p.formula.number === 'number') {
          totalExp = Math.floor(p.formula.number);
          break;
        }
        if (p.type === 'number' && typeof p.number === 'number') {
          totalExp = Math.floor(p.number);
          break;
        }
      }

      if (totalExp === 0) {
        const xpLogDbId = process.env.XP_LOG_DB_ID;
        if (xpLogDbId) {
          const sum = await sumXpFromLogDb(notion, xpLogDbId, pageId.replace(/-/g, ''));
          if (sum > 0) totalExp = sum;
        }
      }

      return res.status(200).json({
        totalExp: Math.max(0, totalExp),
        source: totalExp > 0 ? 'notion' : 'stub',
      });
    } catch (err) {
      console.error('Notion XP 조회 실패:', err.message);
      return res.status(200).json({
        totalExp: 0,
        source: 'error',
        error: err.code || 'unknown',
      });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
};

function isOwnerAuthorized(req) {
  const ownerKey = process.env.OWNER_ACCESS_KEY;
  if (!ownerKey) return true;
  const cookie = String(req.headers?.cookie || '');
  const match = cookie.match(/(?:^|;\s*)haruchi_owner=([^;]+)/);
  if (!match) return false;
  return decodeURIComponent(match[1]) === ownerKey;
}

/** XP 로그 DB에서 하루치와 연결된 XP 합산 (Rollup 없을 때 폴백) */
async function sumXpFromLogDb(notion, dbId, haruchiPageId) {
  const dbIdClean = dbId.replace(/-/g, '');
  const relProps = (process.env.NOTION_RELATION_PROPERTY || '하루치,캐릭터,Haruchi').split(',').map(s => s.trim());

  for (const relProp of relProps) {
    try {
      let sum = 0;
      const res = await notion.databases.query({
        database_id: dbIdClean,
        filter: { property: relProp, relation: { contains: haruchiPageId } },
        page_size: 100,
      });
      for (const p of res.results || []) {
        const props = p.properties || {};
        const titleProp = props.이름 || props.제목 || props.title || Object.values(props).find(x => x?.type === 'title');
        const xp = getXpFromProps(props) || parseXpFromTitle(titleProp);
        if (xp > 0) sum += xp;
      }
      return sum;
    } catch (_) { }
  }
  return 0;
}

function getXpFromProps(props) {
  for (const name of ['XP', 'xp', '경험치', '총 XP']) {
    const p = props[name];
    if (!p) continue;
    if (p.type === 'number' && typeof p.number === 'number') return Math.floor(p.number);
  }
  return null;
}

function parseXpFromTitle(titleProp) {
  if (!titleProp || titleProp.type !== 'title') return 0;
  const arr = titleProp.title || [];
  const text = arr.map(t => t.plain_text || '').join('');
  const m = text.match(/\[(\d+)\]XP|·\s*\[(\d+)\]XP|(\d+)XP/i);
  return m ? parseInt(m[1] || m[2] || m[3], 10) : 0;
}
