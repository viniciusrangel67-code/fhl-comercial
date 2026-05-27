const { query } = require("../../db");

const BILLING_STATUSES = ["trial", "active", "past_due", "suspended", "cancelled"];

function normalizeStatus(status) {
  return BILLING_STATUSES.includes(status) ? status : "trial";
}

async function setBillingStatus({ officeId, status, reason = null }) {
  const normalized = normalizeStatus(status);
  const result = await query(
    `update offices
     set billing_status=$2,
         blocked_at=case when $2 in ('suspended','cancelled') then now() else null end,
         blocked_reason=case when $2 in ('suspended','cancelled') then $3 else null end,
         updated_at=now()
     where id=$1
     returning id, name, plan_code, billing_status, blocked_at, blocked_reason`,
    [officeId, normalized, reason]
  );
  return result.rows[0];
}

async function lockAccount({ officeId, lockType, reason, createdBy = null }) {
  const result = await query(
    `insert into saas_account_locks (office_id, lock_type, reason, created_by)
     values ($1,$2,$3,$4)
     returning *`,
    [officeId, lockType, reason, createdBy]
  );
  await setBillingStatus({ officeId, status: "suspended", reason });
  return result.rows[0];
}

async function unlockAccount({ officeId, liftedBy = null }) {
  await query(
    `update saas_account_locks
     set active=false, lifted_at=now(), lifted_by=$2
     where office_id=$1 and active=true`,
    [officeId, liftedBy]
  );
  return setBillingStatus({ officeId, status: "active" });
}

module.exports = { BILLING_STATUSES, normalizeStatus, setBillingStatus, lockAccount, unlockAccount };
