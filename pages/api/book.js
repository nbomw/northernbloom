/**
 * Book appointment — creates a new booking in Neon.
 *
 * Runs as a Cloudflare Function via @cloudflare/next-on-pages.
 * Queries Neon (shared Supabase Postgres) directly at the edge.
 *
 * The Express SaaS server writes to the same database, so bookings
 * created here are visible to both the website and the server's sync.
 */

const sql = require

export const runtime = 'edge';('../../lib/neon');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const b = req.body;
  const name = b.customerName || b.name;
  const phone = b.customerPhone || b.phone || '';
  const svcId = b.serviceId || b.service_id || null;
  const stfId = b.staffId || b.staff_id || null;
  const dt = b.datetime || (b.date && b.time ? new Date(b.date + 'T' + b.time + '+05:30').toISOString() : null);

  if (!name) return res.status(400).json({ error: 'Name required' });

  const ref = 'NB' + Date.now().toString(36).toUpperCase();

  try {
    const result = await sql`
      INSERT INTO bookings (instance_id, reference, service_id, staff_id, customer_name, customer_phone, datetime, duration_mins, notes)
      VALUES ('default', ${ref}, ${svcId}, ${stfId}, ${name}, ${phone}, ${dt}, ${b.duration_mins || 30}, ${b.notes || b.note || ''})
      RETURNING reference
    `;
    res.json({ success: true, ref: result[0].reference });
  } catch (e) {
    console.error('[book]', e.message);
    res.status(500).json({ error: 'Booking failed — please try again' });
  }
}
