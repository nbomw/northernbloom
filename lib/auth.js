const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sql = require('./neon');

const JWT_SECRET = process.env.JWT_SECRET || 'nyx-bloom-secret-2026';

async function login(pin) {
  const cleanPin = String(pin).trim();

  // Check owner PIN from instances table
  const inst = await sql`SELECT owner_pin FROM instances LIMIT 1`;
  if (inst.length && cleanPin === inst[0].owner_pin) {
    const token = jwt.sign({ role: 'owner', name: 'Owner' }, JWT_SECRET, { expiresIn: '24h' });
    return { ok: true, role: 'owner', name: 'Owner', token };
  }

  // Check staff PIN
  const staff = await sql`SELECT staff_id, name, role, pin_hash, pin FROM booking_staff WHERE active = true`;
  for (const s of staff) {
    const match = s.pin_hash
      ? bcrypt.compareSync(cleanPin, s.pin_hash)
      : s.pin && cleanPin === String(s.pin);
    if (match) {
      const token = jwt.sign({ staff_id: s.staff_id, name: s.name, role: s.role || 'staff' }, JWT_SECRET, { expiresIn: '24h' });
      return { ok: true, role: 'staff', staffId: s.staff_id, name: s.name, token };
    }
  }

  return { ok: false, error: 'Invalid PIN' };
}

function verify(token) {
  try { return jwt.verify(token.replace('Bearer ', ''), JWT_SECRET); }
  catch { return null; }
}

module.exports = { login, verify, JWT_SECRET };
