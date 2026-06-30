import { neon } from '@neondatabase/serverless';

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export async function onRequest(context) {
  // CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response('', { headers: HEADERS });
  }

  if (context.request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'GET only' }), {
      status: 405,
      headers: HEADERS,
    });
  }

  const sql = neon(context.env.DATABASE_URL);
  const url = new URL(context.request.url);
  let since = url.searchParams.get('since');

  // Validate since parameter
  if (since) {
    try {
      new Date(since); // Will throw if invalid
    } catch {
      since = '1970-01-01T00:00:00.000Z';
    }
  } else {
    since = '1970-01-01T00:00:00.000Z';
  }

  try {
    // Fetch bookings (sorted by creation, limited to 100)
    const bookings = await sql`
      SELECT 
        b.id, b.reference, b.customer_name, b.customer_phone,
        b.service_id, bs.name as service_name,
        b.staff_id, bst.name as staff_name,
        b.datetime as appointment_date, b.duration_mins, b.notes, 
        b.status, b.created_at,
        CASE WHEN b.active = false THEN 1 ELSE 0 END as is_deleted
      FROM bookings b
      LEFT JOIN booking_services bs ON b.service_id = bs.service_id
      LEFT JOIN booking_staff bst ON b.staff_id = bst.staff_id
      WHERE b.created_at > ${since}
      ORDER BY b.created_at ASC
      LIMIT 100
    `;

    const pulledAt = new Date().toISOString();

    return new Response(JSON.stringify({
      bookings,
      pulledAt,
      count: bookings.length,
    }), {
      headers: HEADERS,
    });
  } catch (e) {
    console.error('[sync-pull] Error:', e);
    // On failure, echo back the original `since` as pulledAt
    // This prevents skipping bookings when connection recovers
    return new Response(JSON.stringify({
      error: 'Sync unavailable',
      bookings: [],
      pulledAt: since,
    }), {
      status: 500,
      headers: HEADERS,
    });
  }
}
