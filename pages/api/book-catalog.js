/**
 * Book catalog — returns active services & staff.
 *
 * Runs as a Cloudflare Function via @cloudflare/next-on-pages.
 * Queries Neon (Supabase Postgres) directly at the edge.
 *
 * The Express SaaS server shares the same database — the website and
 * server are both backends reading/writing the same Supabase instance.
 * No need to proxy through the server on Cloudflare.
 */

const sql = require('../../lib/neon');

export const runtime = 'edge';

export default async function handler(req, res) {
  try {
    const [services, staff] = await Promise.all([
      sql`SELECT * FROM booking_services WHERE active = true ORDER BY category, name`,
      sql`SELECT staff_id as id, name, role, specialities, photo_url, avg_rating FROM booking_staff WHERE active = true ORDER BY name`,
    ]);
    res.json({ services, staff });
  } catch (e) {
    console.error('[book-catalog]', e.message);
    res.status(500).json({ error: 'Catalog unavailable', services: [], staff: [] });
  }
}
