const db = require('../db');

async function getProfile(req, res, next) {
  try {
    const result = await db.query(
      `SELECT u.id, u.member_code, u.full_name, u.email, u.phone, u.status, u.personal_sp_30d, u.total_team_sp_counter, u.kyc_status,
              s.id as sponsor_id, s.member_code as sponsor_code, s.full_name as sponsor_name
       FROM users u
       LEFT JOIN users s ON s.id = u.sponsor_id
       WHERE u.id = $1`,
      [req.user.id],
    );
    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function uploadKyc(req, res, next) {
  const { panNumber, aadhaarNumber, panImageUrl, aadhaarFrontUrl, aadhaarBackUrl } = req.body;
  try {
    await db.query('UPDATE users SET pan_number = $2, aadhaar_number = $3, kyc_status = $4, updated_at = NOW() WHERE id = $1', [req.user.id, panNumber || null, aadhaarNumber || null, 'PENDING']);
    await db.query(
      `INSERT INTO kyc_documents (user_id, pan_image_url, aadhaar_front_url, aadhaar_back_url)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT(user_id)
       DO UPDATE SET pan_image_url = EXCLUDED.pan_image_url, aadhaar_front_url = EXCLUDED.aadhaar_front_url, aadhaar_back_url = EXCLUDED.aadhaar_back_url, updated_at = NOW()`,
      [req.user.id, panImageUrl || null, aadhaarFrontUrl || null, aadhaarBackUrl || null],
    );
    return res.status(201).json({ message: 'KYC documents submitted' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getProfile, uploadKyc };
