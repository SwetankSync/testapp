const db = require('../db');
const { processUplineTreeEffects } = require('../services/spDistribution');

async function distribute(req, res, next) {
  const { purchaserId, purchaseSP } = req.body;
  if (!purchaserId || !purchaseSP || Number(purchaseSP) <= 0) {
    return res.status(400).json({ message: 'purchaserId and positive purchaseSP are required' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await processUplineTreeEffects({ client, purchaserId, purchaseSP: Number(purchaseSP) });
    await client.query('COMMIT');
    return res.json({ message: 'Distribution completed' });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
}

module.exports = { distribute };
