/**
 * Sync-pull — returns bookings created after a given timestamp.
 *
 * Used by the desktop app to pull cloud bookings. Queries Neon
 * (shared Supabase Postgres) directly at the edge via Cloudflare.
 *
 * The Express SaaS server also queries the same database for sync.
 */

const sql = require('../../lib/neon');

export default async function handler(req, res) {
  const since = req.query.since;
  if (!since) return res.status(400).json({ error: 'missing since' });

  try {
    const bookings = await sql`
      SELECT b.id, b.reference, b.customer_name, b.customer_phone,
             b.service_id, bs.name as service_name,
             b.staff_id, bst.name as staff_name,
             b.datetime, b.duration_mins, b.notes, b.status, b.created_at
      FROM bookings b
      LEFT JOIN booking_services bs ON b.service_id = bs.service_id
      LEFT JOIN booking_staff bst ON b.staff_id = bst.staff_id
      WHERE b.created_at > ${since}
      ORDER BY b.created_at ASC
      LIMIT 100
    `;
    res.json({ bookings });
  } catch (e) {
    console.error('[sync-pull]', e.message);
    res.status(500).json({ error: 'Sync unavailable', bookings: [] });
  }
}
