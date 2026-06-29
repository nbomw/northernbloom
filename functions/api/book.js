import { neon } from '@neondatabase/serverless';

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const sql = neon(context.env.DATABASE_URL);
  try {
    const b = await context.request.json();
    const name = b.customerName || b.name;
    const phone = b.customerPhone || b.phone || '';
    const svcId = b.serviceId || b.service_id || null;
    const stfId = b.staffId || b.staff_id || null;
    const durationMins = b.duration_mins || b.durationMins || null;

    // Accept either a combined ISO `datetime`, or separate `date` + `time`
    // (e.g. "2026-07-03" + "14:30") which the booking flow sends.
    let datetime = b.datetime || null;
    if (!datetime && b.date && b.time) {
      datetime = new Date(`${b.date}T${b.time}:00`).toISOString();
    }

    if (!name || !svcId || !datetime) {
      return new Response(JSON.stringify({ error: 'Missing required fields (name, serviceId, datetime/date+time)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const ref = 'NB' + Math.random().toString(36).slice(2, 10).toUpperCase();

    await sql`
      INSERT INTO bookings (reference, customer_name, customer_phone, service_id, staff_id, datetime, duration_mins, status, created_at)
      VALUES (${ref}, ${name}, ${phone}, ${svcId}, ${stfId}, ${datetime}, ${durationMins}, 'pending', now())
    `;

    return new Response(JSON.stringify({ success: true, reference: ref }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Booking failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
