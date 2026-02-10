const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

function generateMemberCode() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ID${Date.now().toString().slice(-6)}${random}`;
}

async function createUniqueMemberCode(client, maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i += 1) {
    const code = generateMemberCode();
    const exists = await client.query('SELECT 1 FROM users WHERE member_code = $1', [code]);
    if (!exists.rowCount) return code;
  }
  throw new Error('Unable to generate unique member code');
}

async function register(req, res, next) {
  const { fullName, email, phone, password, sponsorCode } = req.body;

  if (!fullName || !password) {
    return res.status(400).json({ message: 'fullName and password are required' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    let sponsorId = null;
    let sponsorPath = '/Admin';

    if (sponsorCode) {
      const sponsor = await client.query('SELECT id, path FROM users WHERE member_code = $1', [sponsorCode]);
      if (!sponsor.rowCount) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Invalid sponsor code' });
      }
      sponsorId = sponsor.rows[0].id;
      sponsorPath = sponsor.rows[0].path;
    }

    const memberCode = await createUniqueMemberCode(client);
    const hash = await bcrypt.hash(password, 10);
    const path = `${sponsorPath}/${memberCode}`;

    const inserted = await client.query(
      `INSERT INTO users (member_code, full_name, email, phone, password_hash, sponsor_id, path, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'RED') RETURNING id, member_code, full_name, status`,
      [memberCode, fullName, email || null, phone || null, hash, sponsorId, path],
    );

    await client.query('COMMIT');
    return res.status(201).json(inserted.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email/phone/member already exists' });
    }
    return next(error);
  } finally {
    client.release();
  }
}

async function login(req, res, next) {
  const { emailOrCode, password } = req.body;
  if (!emailOrCode || !password) {
    return res.status(400).json({ message: 'emailOrCode and password are required' });
  }

  try {
    const user = await db.query(
      'SELECT id, member_code, full_name, role, password_hash, status, is_blocked FROM users WHERE email = $1 OR member_code = $1',
      [emailOrCode],
    );
    if (!user.rowCount) return res.status(401).json({ message: 'Invalid credentials' });

    const row = user.rows[0];
    if (row.is_blocked || row.status === 'BLOCKED') return res.status(403).json({ message: 'Account is blocked' });

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: row.id, role: row.role, memberCode: row.member_code },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '1d' },
    );
    return res.json({ token, role: row.role, memberCode: row.member_code, fullName: row.full_name });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login };
