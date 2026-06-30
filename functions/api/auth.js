import { neon } from '@neondatabase/serverless';

const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

// Simple in-memory rate limiting (per Cloudflare worker instance)
const loginAttempts = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const window = 5 * 60 * 1000; // 5 minutes
  const limit = 3; // max 3 attempts
  
  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, []);
  }
  
  const attempts = loginAttempts.get(ip) || [];
  const recentAttempts = attempts.filter(t => now - t < window);
  
  if (recentAttempts.length >= limit) {
    return true; // Rate limited
  }
  
  recentAttempts.push(now);
  loginAttempts.set(ip, recentAttempts);
  return false;
}

function getClientIp(context) {
  return context.request.headers.get('cf-connecting-ip') || 
         context.request.headers.get('x-forwarded-for')?.split(',')[0] || 
         'unknown';
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response('', { headers: COMMON_HEADERS });
  }
  
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: COMMON_HEADERS,
    });
  }

  const clientIp = getClientIp(context);
  
  // Rate limiting - max 3 attempts per 5 minutes
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many attempts. Try again in 5 minutes.' }), {
      status: 429,
      headers: COMMON_HEADERS,
    });
  }

  const sql = neon(context.env.DATABASE_URL);
  try {
    const { pin } = await context.request.json();
    if (!pin || typeof pin !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid PIN required' }), { 
        status: 400,
        headers: COMMON_HEADERS
      });
    }

    // Check staff by PIN (case-sensitive, exact match)
    const staff = await sql`SELECT staff_id, name, role FROM booking_staff WHERE pin = ${String(pin)} AND active = true LIMIT 1`;
    if (staff.length) {
      const s = staff[0];
      return new Response(JSON.stringify({
        success: true,
        role: s.role || 'staff',
        name: s.name,
        token: btoa(JSON.stringify({ id: s.staff_id, name: s.name, role: s.role }))
      }), { headers: COMMON_HEADERS });
    }

    // Log failed attempt (for audit)
    console.warn(`[AUTH] Invalid PIN attempt from ${clientIp}`);
    
    return new Response(JSON.stringify({ error: 'Invalid PIN' }), { 
      status: 401,
      headers: COMMON_HEADERS
    });
  } catch (e) {
    console.error('[AUTH] Error:', e);
    return new Response(JSON.stringify({ error: 'Auth unavailable' }), {
      status: 500,
      headers: COMMON_HEADERS,
    });
  }
}
