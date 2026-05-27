import webpush from 'web-push';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const API_KEY    = process.env.FIREBASE_API_KEY;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ── Firestore REST helpers ──────────────────────────────────────────────────

function fsToObj(doc) {
  const obj = {};
  for (const [key, val] of Object.entries(doc.fields || {})) {
    if      (val.stringValue    !== undefined) obj[key] = val.stringValue;
    else if (val.integerValue   !== undefined) obj[key] = Number(val.integerValue);
    else if (val.booleanValue   !== undefined) obj[key] = val.booleanValue;
    else if (val.timestampValue !== undefined) obj[key] = val.timestampValue;
    else if (val.mapValue)                     obj[key] = fsToObj(val.mapValue);
  }
  return obj;
}

async function getSubscriptions() {
  const subs = [];
  let pageToken = null;
  do {
    const url = new URL(`${BASE}/subscriptions`);
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const res = await fetch(url.toString());
    if (!res.ok) break;
    const data = await res.json();
    for (const fsDoc of data.documents || []) {
      const id = fsDoc.name.split('/').pop();
      subs.push({ id, ...fsToObj(fsDoc) });
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken);
  return subs;
}

async function deleteSub(docId) {
  await fetch(`${BASE}/subscriptions/${docId}?key=${API_KEY}`, { method: 'DELETE' });
}

async function writeHistory(title, body, targetSchool, targetRole, status) {
  await fetch(`${BASE}/notification-history?key=${API_KEY}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      fields: {
        title:        { stringValue: title },
        body:         { stringValue: body },
        targetSchool: { stringValue: targetSchool || 'all' },
        targetRole:   { stringValue: targetRole   || 'all' },
        status:       { stringValue: status },
        sentAt:       { timestampValue: new Date().toISOString() },
      },
    }),
  });
}

// ── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Init VAPID inside the handler so a misconfigured key gives an actionable
  // error message rather than crashing the module on cold start.
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    return res.status(500).json({ error: `VAPID config error: ${err.message}` });
  }

  // Parse body — Vercel auto-parses application/json, but guard against edge cases.
  let parsed = req.body;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { parsed = {}; }
  }

  const { title, body, targetSchool, targetRole } = parsed || {};
  if (!title || !body) return res.status(400).json({ error: 'Missing title or body' });

  const subs = await getSubscriptions();

  // Deduplicate by endpoint, remove stale dupes
  const seen   = new Set();
  const unique = [];
  for (const sub of subs) {
    if (seen.has(sub.endpoint)) {
      await deleteSub(sub.id);
    } else {
      seen.add(sub.endpoint);
      unique.push(sub);
    }
  }

  // Filter by targetSchool and targetRole.
  // Subscriptions that have no school/role field are legacy (pre-targeting) —
  // treat them as matching everything so they continue to receive all-audience sends.
  const targets = unique.filter(sub => {
    const schoolMatch =
      !targetSchool || targetSchool === 'all' ||
      !sub.school   || sub.school   === 'all' ||
      sub.school === targetSchool;
    const roleMatch =
      !targetRole || targetRole === 'all' ||
      !sub.role   || sub.role   === 'all' ||
      sub.role === targetRole;
    return schoolMatch && roleMatch;
  });

  const payload = JSON.stringify({ title, body });
  let sent   = 0;
  let failed = 0;

  for (const sub of targets) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.keys?.p256dh, auth: sub.keys?.auth } },
        payload
      );
      sent++;
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await deleteSub(sub.id);
      }
      failed++;
    }
  }

  await writeHistory(title, body, targetSchool, targetRole, 'success');
  res.status(200).json({ ok: true, sent, failed });
}
