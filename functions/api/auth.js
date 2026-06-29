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
    const { pin } = await context.request.json();
    if (!pin) return new Response(JSON.stringify({ error: 'PIN required' }), { status: 400 });

    // Check staff by PIN
    const staff = await sql`SELECT staff_id, name, role FROM booking_staff WHERE pin = ${String(pin)} AND active = true LIMIT 1`;
    if (staff.length) {
      const s = staff[0];
      return new Response(JSON.stringify({
        success: true, role: s.role || 'staff', name: s.name,
        token: btoa(JSON.stringify({ id: s.staff_id, name: s.name, role: s.role }))
      }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid PIN' }), { status: 401 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Auth unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
