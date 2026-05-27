import crypto from 'crypto';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const API_KEY = process.env.FIREBASE_API_KEY;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const subscription = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });

  const id = crypto.createHash('sha256').update(subscription.endpoint).digest('hex').slice(0, 40);

  const fields = {
    endpoint: { stringValue: subscription.endpoint },
    updatedAt: { timestampValue: new Date().toISOString() },
  };
  if (subscription.keys) {
    fields.keys = {
      mapValue: {
        fields: {
          p256dh: { stringValue: subscription.keys.p256dh || '' },
          auth:   { stringValue: subscription.keys.auth   || '' },
        },
      },
    };
  }
  if (subscription.expirationTime) {
    fields.expirationTime = { stringValue: String(subscription.expirationTime) };
  }

  await fetch(
    `${BASE}/subscriptions/${id}?key=${API_KEY}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    }
  );

  res.status(200).json({ ok: true });
}
