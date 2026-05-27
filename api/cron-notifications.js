// REMINDER: Before deploying to production, create a composite Firestore index on the
// scheduled-notifications collection for the fields: active (ascending) and scheduledAt (ascending).
// Without this index, the query will fail in production.

import sendHandler from './send-notification.js';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const API_KEY = process.env.FIREBASE_API_KEY;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function tsToDate(val) {
  if (!val) return null;
  if (typeof val === 'string') return new Date(val);
  if (val.seconds) return new Date(val.seconds * 1000);
  return new Date(val);
}

function fsToObj(fsDoc) {
  const obj = {};
  for (const [key, val] of Object.entries(fsDoc.fields || {})) {
    if (val.stringValue !== undefined)      obj[key] = val.stringValue;
    else if (val.booleanValue !== undefined) obj[key] = val.booleanValue;
    else if (val.integerValue !== undefined) obj[key] = Number(val.integerValue);
    else if (val.timestampValue !== undefined) obj[key] = tsToDate(val.timestampValue);
    else if (val.mapValue) obj[key] = fsToObj(val.mapValue);
  }
  return obj;
}

async function getScheduled() {
  const url = `${BASE}/scheduled-notifications:runQuery?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'scheduled-notifications' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'active' }, op: 'EQUAL', value: { booleanValue: true } } },
              { fieldFilter: { field: { fieldPath: 'fired' },  op: 'EQUAL', value: { booleanValue: false } } },
            ],
          },
        },
        orderBy: [{ field: { fieldPath: 'scheduledAt' }, direction: 'ASCENDING' }],
      },
    }),
  });
  if (!res.ok) return [];
  const results = await res.json();
  return results
    .filter(r => r.document)
    .map(r => ({ id: r.document.name.split('/').pop(), ...fsToObj(r.document) }));
}

async function markFired(docId) {
  await fetch(
    `${BASE}/scheduled-notifications/${docId}?key=${API_KEY}&updateMask.fieldPaths=fired`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { fired: { booleanValue: true } } }),
    }
  );
}

export default async function handler(req, res) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = new Date();
  const scheduled = await getScheduled();
  let fired = 0;

  for (const notif of scheduled) {
    const scheduledAt = notif.scheduledAt instanceof Date ? notif.scheduledAt : tsToDate(notif.scheduledAt);
    if (!scheduledAt || scheduledAt > now) continue;

    const fakeReq = {
      method: 'POST',
      headers: { 'x-admin-secret': process.env.ADMIN_SECRET },
      body: { title: notif.title, message: notif.message },
    };
    const fakeRes = {
      status() { return this; },
      json()   { return this; },
    };

    await sendHandler(fakeReq, fakeRes);
    await markFired(notif.id);
    fired++;
  }

  res.status(200).json({ ok: true, fired });
}
