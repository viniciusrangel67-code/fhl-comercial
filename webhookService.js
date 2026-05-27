const crypto = require("crypto");
const { query } = require("../../db");

function validateSignature({ payload, signature, secret }) {
  if (!secret || !signature) return false;
  const hmac = crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  } catch (_err) {
    return false;
  }
}

async function recordWebhookEvent({ provider, eventType, externalId, officeId = null, payload, signatureValid }) {
  const result = await query(
    `insert into saas_webhook_events (provider, event_type, external_id, office_id, payload, signature_valid)
     values ($1,$2,$3,$4,$5,$6)
     on conflict (provider, external_id) do update set payload=$5, signature_valid=$6
     returning *`,
    [provider, eventType, externalId, officeId, payload, Boolean(signatureValid)]
  );
  return result.rows[0];
}

module.exports = { validateSignature, recordWebhookEvent };
