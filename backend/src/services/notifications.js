function sanitizePhone(phone) {
  if (!phone) return null;
  return String(phone).replace(/[^0-9+]/g, '');
}

async function sendActivationNotification({ phone, memberCode }) {
  const to = sanitizePhone(phone);
  if (!to) return;
  // Placeholder integration point for SMS/WhatsApp provider.
  // eslint-disable-next-line no-console
  console.log(`[notify] activation -> ${to} | member=${memberCode}`);
}

async function sendHoldNotification({ phone, memberCode, reason }) {
  const to = sanitizePhone(phone);
  if (!to) return;
  // Placeholder integration point for SMS/WhatsApp provider.
  // eslint-disable-next-line no-console
  console.log(`[notify] hold -> ${to} | member=${memberCode} | reason=${reason}`);
}

module.exports = {
  sendActivationNotification,
  sendHoldNotification,
};
