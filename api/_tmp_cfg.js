export default function handler(req, res) {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET)
    return res.status(401).end();
  res.json({
    k: process.env.FIREBASE_API_KEY,
    p: process.env.FIREBASE_PROJECT_ID,
  });
}
