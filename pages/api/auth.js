/**
 * Auth route — PIN verification.
 * 
 * Currently uses direct DB lookup (Neon) for auth, matching the same flow as the
 * desktop app. The Express server has a /api/auth/verify-pin endpoint that only
 * validates a pin against a known hash — it doesn't look up users.
 * 
 * To fully connect to the SaaS, a proper login endpoint should be added to the
 * server that handles user lookup + PIN verification + JWT issuance.
 * For now this remains direct DB for backward compatibility.
 */

const { login } = require('../../lib/auth');

export const runtime = 'edge';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN required' });
  const result = await login(pin);
  if (result.ok) return res.json({ success: true, role: result.role, name: result.name, token: result.token });
  res.status(401).json({ error: result.error || 'Invalid PIN' });
}
