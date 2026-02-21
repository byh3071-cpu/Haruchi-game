export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const ownerKey = process.env.OWNER_ACCESS_KEY;
  if (!ownerKey) {
    return res.status(500).json({ ok: false, error: 'OWNER_ACCESS_KEY is not set' });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const providedKey =
    (req.query && req.query.key) ||
    req.headers?.['x-owner-key'] ||
    (req.body && req.body.key) ||
    '';

  if (String(providedKey) !== String(ownerKey)) {
    return res.status(401).json({ ok: false, error: 'Invalid owner key' });
  }

  const encoded = encodeURIComponent(ownerKey);
  const cookie =
    `haruchi_owner=${encoded}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`;
  res.setHeader('Set-Cookie', cookie);

  return res.status(200).json({ ok: true });
}
