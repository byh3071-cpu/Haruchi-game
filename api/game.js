/**
 * 하루치 노션 XP 연동 API
 *
 * NOTION_ENABLED (?notion=1) 모드에서 호출됨.
 * 환경변수 NOTION_TOKEN, NOTION_DB_ID 등 설정 시 노션에서 XP 조회·반영.
 *
 * 현재: 스텁 (totalExp: 0 반환) - 실제 노션 연동은 아래 로직을 구현하면 됨.
 */
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = (req.query && req.query.action) || 'getXp';

  if (action === 'getXp') {
    /* TODO: 노션 API에서 XP 합산 조회 후 totalExp 반환
     * const token = process.env.NOTION_TOKEN;
     * const dbId = process.env.NOTION_DB_ID;
     * ... Notion API 호출 ...
     */
    return res.status(200).json({
      totalExp: 0,
      source: 'stub'
    });
  }

  return res.status(400).json({ error: 'Unknown action' });
};
