const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const API_KEY    = process.env.FIREBASE_API_KEY;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let parsed = req.body;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { parsed = {}; }
  }

  const { title, message, scheduledAt, targetSchool, targetRole } = parsed || {};
  if (!title || !message || !scheduledAt) {
    return res.status(400).json({ error: 'Missing title, message, or scheduledAt' });
  }

  const isoTs = typeof scheduledAt === 'string' ? scheduledAt : new Date(scheduledAt).toISOString();

  const docRes = await fetch(`${BASE}/scheduled-notifications?key=${API_KEY}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        title:        { stringValue: title },
        message:      { stringValue: message },
        scheduledAt:  { timestampValue: isoTs },
        targetSchool: { stringValue: targetSchool || 'all' },
        targetRole:   { stringValue: targetRole   || 'all' },
        recurrence:   { stringValue: 'none' },
        active:       { booleanValue: true },
        fired:        { booleanValue: false },
        createdAt:    { timestampValue: new Date().toISOString() },
      },
    }),
  });

  if (!docRes.ok) {
    const err = await docRes.json().catch(() => ({}));
    return res.status(500).json({ error: err.error?.message || 'Firestore write failed' });
  }

  const doc = await docRes.json();
  const id  = doc.name?.split('/').pop();
  res.status(200).json({ ok: true, id });
}
