const { query } = require("../../db");

const DEFAULT_CHECKLIST = {
  officeCreated: false,
  ownerCreated: false,
  planSelected: false,
  termsAccepted: false,
  firstClientCreated: false,
  firstProcessCreated: false,
  billingConfigured: false,
  backupConfigured: false
};

function nextStep(checklist = {}) {
  const merged = { ...DEFAULT_CHECKLIST, ...checklist };
  const pending = Object.entries(merged).find(([, done]) => !done);
  return pending ? pending[0] : "completed";
}

async function createOnboardingFlow({ officeId, ownerUserId, planCode = "starter" }) {
  const checklist = { ...DEFAULT_CHECKLIST, officeCreated: true, ownerCreated: true, planSelected: Boolean(planCode) };
  const step = nextStep(checklist);
  const result = await query(
    `insert into saas_onboarding_flows (office_id, owner_user_id, step, status, checklist)
     values ($1,$2,$3,$4,$5)
     returning *`,
    [officeId, ownerUserId, step, step === "completed" ? "completed" : "in_progress", checklist]
  );
  return result.rows[0];
}

async function updateChecklist({ officeId, patch }) {
  const existing = await query(`select * from saas_onboarding_flows where office_id=$1 order by created_at desc limit 1`, [officeId]);
  const current = existing.rows[0]?.checklist || DEFAULT_CHECKLIST;
  const checklist = { ...current, ...patch };
  const step = nextStep(checklist);
  const status = step === "completed" ? "completed" : "in_progress";
  const result = await query(
    `update saas_onboarding_flows
     set checklist=$2, step=$3, status=$4, completed_at=case when $4='completed' then now() else completed_at end, updated_at=now()
     where office_id=$1
     returning *`,
    [officeId, checklist, step, status]
  );
  return result.rows[0];
}

module.exports = { DEFAULT_CHECKLIST, nextStep, createOnboardingFlow, updateChecklist };
