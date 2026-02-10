const db = require('../db');

async function checkHoldStatus(req, res, next) {
  try {
    const { id: userId } = req.user;
    const result = await db.query(
      'SELECT is_hold_active, personal_sp_30d FROM users WHERE id = $1',
      [userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { is_hold_active: isHoldActive } = result.rows[0];
    if (isHoldActive) {
      return res.status(403).json({
        message: 'Withdrawals are blocked while account is in hold. Complete 50 SP personal business to release.',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  checkHoldStatus,
};
