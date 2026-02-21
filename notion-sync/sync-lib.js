/**
 * 하루치 노션 XP 동기화 로직 (공통 모듈)
 *
 * - notion-sync/index.js: 로컬 실행 (dotenv)
 * - api/cron-sync.js: Vercel Cron 호출 (process.env from Vercel)
 */

const { Client } = require('@notionhq/client');

function buildConfig(env = process.env) {
  return {
    token: env.NOTION_API_KEY || env.NOTION_TOKEN,
    haruchiPageId: (env.HARUCHI_PAGE_ID || '').replace(/-/g, ''),
    xpLogDbId: (env.XP_LOG_DB_ID || '').replace(/-/g, ''),
    sources: [
      { id: env.TODO_DB_ID, type: '할일', titleProp: '할 일', xp: 10 },
      { id: env.ROUTINE_DB_ID, type: '루틴', titleProp: '이름', xp: 20 },
      { id: env.WORKOUT_DB_ID, type: '운동', titleProp: '운동', xp: 80 },
      { id: env.READING_SESSION_DB_ID, type: '독서', titleProp: '세션 이름', xp: 40 },
      { id: env.READING_BOOK_DB_ID, type: '책', titleProp: '책 이름', xp: 300, statusValue: '완독' },
      { id: env.SNS_DB_ID, type: 'SNS', titleProp: '제목', xp: 10, statusValue: '발행' },
    ].filter(s => s.id),
    grantedProp: 'XP 지급됨',
    grantedPropAlt: 'XP지급됨',
  };
}

function getTitle(page, propName) {
  const p = page.properties?.[propName];
  if (!p || p.type !== 'title') return '';
  return (p.title || []).map(t => t.plain_text || '').join('');
}

function getSelect(page, propName) {
  const p = page.properties?.[propName];
  if (!p || (p.type !== 'select' && p.type !== 'status')) return null;
  return p.select?.name || p.status?.name || '';
}

function getNumber(page, propName) {
  const p = page.properties?.[propName];
  if (!p || p.type !== 'number') return null;
  return p.number;
}

function findPropsInSchema(schema, candidates) {
  const p = schema.properties || {};
  return candidates.filter(name => p[name] != null);
}

async function queryWithFilterCandidates(notion, dbId, filtersToTry) {
  for (const filter of filtersToTry) {
    try {
      let results = [];
      let cursor;
      do {
        const res = await notion.databases.query({
          database_id: dbId,
          filter,
          start_cursor: cursor,
          page_size: 50,
        });
        results = results.concat(res.results || []);
        cursor = res.next_cursor;
      } while (cursor);
      return results;
    } catch (e) {
      const msg = (e.message || e.body?.message || '').toLowerCase();
      if (msg.includes('could not find property') || msg.includes('linked database') || msg.includes('validation_error')) continue;
      throw e;
    }
  }
  return [];
}

async function queryCompletedItems(notion, dbId, source, CONFIG) {
  const id = dbId.replace(/-/g, '');
  let schema;
  try {
    schema = await notion.databases.retrieve({ database_id: id });
  } catch (e) {
    if (!e.message?.includes('linked database')) {
      throw new Error('DB 조회 실패: ' + e.message, { cause: e });
    }
  }

  const completionCandidates = ['완료', '완료됨', '체크'];
  const statusCandidates = ['상태', 'Status'];
  const grantedCandidates = [CONFIG.grantedProp, CONFIG.grantedPropAlt];

  let completionProps = [], statusProps = [], grantedProps = [];
  if (schema) {
    completionProps = findPropsInSchema(schema, completionCandidates);
    statusProps = findPropsInSchema(schema, statusCandidates);
    grantedProps = findPropsInSchema(schema, grantedCandidates);
  }

  if (!schema || grantedProps.length === 0) {
    const filtersToTry = [];
    if (source.statusValue) {
      for (const sp of statusCandidates) {
        for (const gp of grantedCandidates) {
          filtersToTry.push({
            and: [
              { property: sp, status: { equals: source.statusValue } },
              { property: gp, checkbox: { equals: false } },
            ],
          });
        }
      }
    } else {
      for (const cp of completionCandidates) {
        for (const gp of grantedCandidates) {
          filtersToTry.push({
            and: [
              { property: cp, checkbox: { equals: true } },
              { property: gp, checkbox: { equals: false } },
            ],
          });
        }
      }
    }
    return await queryWithFilterCandidates(notion, id, filtersToTry);
  }

  if (grantedProps.length === 0) return [];

  let filter;
  if (source.statusValue && statusProps.length > 0) {
    const statusCond = statusProps.length > 1
      ? { or: statusProps.map(name => ({ property: name, status: { equals: source.statusValue } })) }
      : { property: statusProps[0], status: { equals: source.statusValue } };
    const grantedCond = grantedProps.length > 1
      ? { or: grantedProps.map(name => ({ property: name, checkbox: { equals: false } })) }
      : { property: grantedProps[0], checkbox: { equals: false } };
    filter = { and: [statusCond, grantedCond] };
  } else if (completionProps.length > 0) {
    const completionCond = completionProps.length > 1
      ? { or: completionProps.map(name => ({ property: name, checkbox: { equals: true } })) }
      : { property: completionProps[0], checkbox: { equals: true } };
    const grantedCond = grantedProps.length > 1
      ? { or: grantedProps.map(name => ({ property: name, checkbox: { equals: false } })) }
      : { property: grantedProps[0], checkbox: { equals: false } };
    filter = { and: [completionCond, grantedCond] };
  } else return [];

  let results = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: id,
      filter,
      start_cursor: cursor,
      page_size: 50,
    });
    results = results.concat(res.results || []);
    cursor = res.next_cursor;
  } while (cursor);
  return results;
}

async function createXpLog(notion, source, title, xp, CONFIG, sourcePageId) {
  const dbId = CONFIG.xpLogDbId;
  if (!dbId) return null;
  const logTitle = `[${source.type}] · ${(title || '무제').slice(0, 50)} · [${xp}]XP`;
  const props = {};
  try {
    const schema = await notion.databases.retrieve({ database_id: dbId });
    const p = schema.properties || {};
    const titleKey = Object.keys(p).find(k => p[k]?.type === 'title') || '이름';
    const xpKey = Object.keys(p).find(k => k === 'XP' || k === 'xp') || 'XP';
    const relKey = Object.keys(p).find(k => ['하루치', '캐릭터', 'Haruchi'].includes(k) && p[k]?.type === 'relation');
    const sourceRelKey = Object.keys(p).find(k => (k.includes(source.type) || k.includes('DB')) && p[k]?.type === 'relation' && k !== relKey);
    const paymentKey = Object.keys(p).find(k => k.includes('지급키'));

    props[titleKey] = { title: [{ text: { content: logTitle } }] };
    props[xpKey] = { number: xp };
    if (relKey) props[relKey] = { relation: [{ id: CONFIG.haruchiPageId }] };
    if (sourceRelKey && sourcePageId) props[sourceRelKey] = { relation: [{ id: sourcePageId }] };
    if (paymentKey && sourcePageId) props[paymentKey] = { rich_text: [{ text: { content: sourcePageId } }] };
  } catch {
    props.이름 = { title: [{ text: { content: logTitle } }] };
    props.XP = { number: xp };
    props['지급키'] = { rich_text: [{ text: { content: sourcePageId } }] };
    props[`${source.type} DB`] = { relation: [{ id: sourcePageId }] };
  }
  const page = await notion.pages.create({
    parent: { database_id: dbId },
    properties: props,
  });
  return page.id;
}

async function markGranted(notion, pageId, propName, CONFIG) {
  for (const p of [propName, CONFIG.grantedProp, CONFIG.grantedPropAlt]) {
    try {
      await notion.pages.update({
        page_id: pageId,
        properties: { [p]: { checkbox: true } },
      });
      return;
    } catch {
      /* ignore */
    }
  }
}

/**
 * 노션 XP 동기화 실행 (공통 엔트리)
 * @param {object} [env] - process.env 대체 (테스트용)
 * @returns {{ created: number, error?: string }}
 */
async function runSync(env) {
  const CONFIG = buildConfig(env || process.env);
  if (!CONFIG.token || !CONFIG.haruchiPageId || !CONFIG.xpLogDbId) {
    throw new Error('필수 환경변수 없음: NOTION_API_KEY, HARUCHI_PAGE_ID, XP_LOG_DB_ID');
  }

  const notion = new Client({ auth: CONFIG.token });
  let totalCreated = 0;

  for (const src of CONFIG.sources) {
    if (!src.id) continue;
    try {
      const items = await queryCompletedItems(notion, src.id, src, CONFIG);
      for (const page of items) {
        let title = getTitle(page, src.titleProp);
        if (!title) {
          const t = Object.values(page.properties || {}).find(p => p?.type === 'title');
          if (t) title = (t.title || []).map(x => x.plain_text || '').join('');
        }
        let xp = src.xp;
        if (src.type === '책') {
          const bonus = getNumber(page, 'XP') || getNumber(page, '보너스 XP');
          if (bonus != null && bonus > 0) xp = Math.floor(bonus);
        }
        if (src.type === 'SNS') {
          const platform = getSelect(page, '플랫폼') || getSelect(page, '채널') || '';
          if (platform.includes('쓰레드') || platform.includes('Thread')) xp = 20;
          else if (platform.includes('인스타') || platform.includes('Instagram')) xp = 30;
          else if (platform.includes('블로그') || platform.includes('Blog')) xp = 80;
        }
        const logId = await createXpLog(notion, src, title, xp, CONFIG, page.id);
        if (logId) {
          await markGranted(notion, page.id, CONFIG.grantedProp, CONFIG);
          totalCreated++;
        }
      }
    } catch (e) {
      throw new Error(`${src.type} DB 처리 오류: ${e.message}`, { cause: e });
    }
  }
  return { created: totalCreated };
}

module.exports = { runSync, buildConfig };
