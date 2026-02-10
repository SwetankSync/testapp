const { evaluateAndApplyMonthlyHold } = require('../services/holdService');

async function runMonthlyHold(req, res, next) {
  try {
    await evaluateAndApplyMonthlyHold();
    return res.json({ message: 'Monthly hold evaluation completed' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  runMonthlyHold,
};
