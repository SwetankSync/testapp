const DEFAULT_LEVEL_PERCENTAGES = { 1: 0.08, 2: 0.04, 3: 0.03, 4: 0.02, 5: 0.015, 6: 0.0125, 7: 0.01, 8: 0.01 };

async function upsertWallet(client, userId, walletType, delta) {
  await client.query(
    `INSERT INTO wallets (user_id, wallet_type, balance)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, wallet_type)
     DO UPDATE SET balance = wallets.balance + EXCLUDED.balance, updated_at = NOW()`,
    [userId, walletType, delta],
  );
}

async function processUplineTreeEffects({ client, purchaserId, purchaseSP, maxDepth = 8, levelPercentages = DEFAULT_LEVEL_PERCENTAGES }) {
  const purchaserResult = await client.query('SELECT sponsor_id FROM users WHERE id = $1 FOR UPDATE', [purchaserId]);
  if (purchaserResult.rowCount === 0) throw new Error('Purchaser not found');

  let currentSponsorId = purchaserResult.rows[0].sponsor_id;
  let level = 1;

  while (currentSponsorId && level <= maxDepth) {
    const uplineResult = await client.query(
      'SELECT id, sponsor_id, role, status, is_hold_active, personal_sp_30d, total_team_sp_counter, next_bonus_target FROM users WHERE id = $1 FOR UPDATE',
      [currentSponsorId],
    );
    if (!uplineResult.rowCount) break;

    const upline = uplineResult.rows[0];
    if (upline.role === 'ADMIN') break;

    const commissionPct = levelPercentages[level] || 0;
    const commission = Number((purchaseSP * commissionPct).toFixed(2));
    const shouldHold = upline.is_hold_active || Number(upline.personal_sp_30d) < 50;

    if (commission > 0 && upline.status === 'GREEN') {
      const targetWallet = shouldHold ? 'HOLD' : 'INCENTIVE';
      await upsertWallet(client, upline.id, targetWallet, commission);
      if (!shouldHold) await upsertWallet(client, upline.id, 'AVAILABLE', commission);

      await client.query(
        `INSERT INTO sp_ledger (user_id, source_user_id, transaction_type, sp_amount, amount, level_depth, notes, metadata)
         VALUES ($1, $2, 'COMMISSION_CREDIT', $3, $4, $5, $6, $7::jsonb)`,
        [upline.id, purchaserId, purchaseSP, commission, level, `Level ${level} commission`, JSON.stringify({ commissionPct, shouldHold })],
      );
    }

    const updatedCounter = Number(upline.total_team_sp_counter) + purchaseSP;
    const target = Number(upline.next_bonus_target || 450);
    const cycles = Math.floor(updatedCounter / target);
    const lapsedSP = cycles * target;
    const carry = Number((updatedCounter - lapsedSP).toFixed(2));

    if (cycles > 0) {
      const bonusWallet = shouldHold ? 'HOLD' : 'BONUS';
      await upsertWallet(client, upline.id, bonusWallet, lapsedSP);
      if (!shouldHold) await upsertWallet(client, upline.id, 'AVAILABLE', lapsedSP);

      await client.query(
        `INSERT INTO sp_ledger (user_id, source_user_id, transaction_type, amount, notes)
         VALUES
         ($1, $2, 'BONUS_CREDIT', $3, $4),
         ($1, $2, 'BONUS_LAPSE',  $3, $5)`,
        [upline.id, purchaserId, lapsedSP, `Bonus for ${cycles} cycle(s)`, `Lapsed SP ${lapsedSP}, carry ${carry}`],
      );
    }

    await client.query('UPDATE users SET total_team_sp_counter = $2, updated_at = NOW() WHERE id = $1', [upline.id, carry]);

    currentSponsorId = upline.sponsor_id;
    level += 1;
  }
}

module.exports = { processUplineTreeEffects, DEFAULT_LEVEL_PERCENTAGES, upsertWallet };
