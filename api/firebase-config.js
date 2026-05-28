// Returns the Firebase client config at runtime so the browser can initialize
// the Firestore SDK without needing VITE_ env vars baked into the bundle.
// The Firebase apiKey and projectId are designed to be public — security lives
// in Firestore Security Rules, not in hiding these values.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json({
    apiKey:    process.env.FIREBASE_API_KEY    || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
  });
}
