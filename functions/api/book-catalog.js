import { neon } from '@neondatabase/serverless';

export async function onRequest(context) {
  const sql = neon(context.env.DATABASE_URL);
  try {
    const [services, staff] = await Promise.all([
      sql`SELECT * FROM booking_services WHERE active = true ORDER BY category, name`,
      sql`SELECT staff_id as id, name, role, specialities, photo_url, avg_rating FROM booking_staff WHERE active = true ORDER BY name`,
    ]);
    return new Response(JSON.stringify({ services, staff }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Catalog unavailable', services: [], staff: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
