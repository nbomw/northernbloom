import { neon } from '@neondatabase/serverless';

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sql = neon(context.env.DATABASE_URL);
  try {
    const b = await context.request.json();
    const name = b.customerName || b.name;
    const phone = b.customerPhone || b.phone || '';
    const svcId = b.serviceId || b.service_id || null;
    const stfId = b.staffId || b.staff_id || null;
    const datetime = b.datetime || b.date || new Date().toISOString();

    const ref = 'NB' + Math.random().toString(36).slice(2, 10).toUpperCase();

    await sql`
      INSERT INTO bookings (reference, customer_name, customer_phone, service_id, staff_id, datetime, status, created_at)
      VALUES (${ref}, ${name}, ${phone}, ${svcId}, ${stfId}, ${datetime}, 'pending', new Date().toISOString())
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
