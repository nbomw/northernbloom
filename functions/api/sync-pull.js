import { neon } from '@neondatabase/serverless';

export async function onRequest(context) {
  const sql = neon(context.env.DATABASE_URL);
  const url = new URL(context.request.url);
  const since = url.searchParams.get('since') || '1970-01-01T00:00:00.000Z';

  try {
    const bookings = await sql`
      SELECT b.id, b.reference, b.customer_name, b.customer_phone,
             b.service_id, bs.name as service_name,
             b.staff_id, bst.name as staff_name,
             b.datetime as appointment_date, b.duration_mins, b.notes, b.status, b.created_at
      FROM bookings b
      LEFT JOIN booking_services bs ON b.service_id = bs.service_id
      LEFT JOIN booking_staff bst ON b.staff_id = bst.staff_id
      WHERE b.created_at > ${since}
      ORDER BY b.created_at ASC
      LIMIT 100
    `;
    return new Response(JSON.stringify({ bookings, pulledAt: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Sync unavailable', bookings: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
