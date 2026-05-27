const { query } = require("../../db");
const { evaluateUsage } = require("./saasPlanService");

function currentPeriod(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { periodStart: start.toISOString().slice(0,10), periodEnd: end.toISOString().slice(0,10) };
}

async function collectUsage(officeId) {
  const { periodStart, periodEnd } = currentPeriod();

  const users = await query(`select count(*)::int as count from users where office_id=$1 and deleted_at is null`, [officeId]);
  const clients = await query(`select count(*)::int as count from clients where office_id=$1 and deleted_at is null`, [officeId]);
  const processes = await query(`select count(*)::int as count from processes where office_id=$1 and deleted_at is null`, [officeId]);
  const documents = await query(`select count(*)::int as count from documents where office_id=$1 and deleted_at is null`, [officeId]);

  const usage = {
    users_count: users.rows[0].count,
    clients_count: clients.rows[0].count,
    processes_count: processes.rows[0].count,
    documents_count: documents.rows[0].count,
    storage_bytes: 0,
    api_calls: 0
  };

  await query(
    `insert into saas_usage_counters (office_id, period_start, period_end, users_count, clients_count, processes_count, documents_count, storage_bytes, api_calls)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     on conflict (office_id, period_start, period_end)
     do update set users_count=$4, clients_count=$5, processes_count=$6, documents_count=$7, storage_bytes=$8, api_calls=$9, updated_at=now()`,
    [officeId, periodStart, periodEnd, usage.users_count, usage.clients_count, usage.processes_count, usage.documents_count, usage.storage_bytes, usage.api_calls]
  );

  return { periodStart, periodEnd, ...usage };
}

async function usageStatus({ officeId, planCode }) {
  const usage = await collectUsage(officeId);
  return evaluateUsage(planCode, usage);
}

module.exports = { currentPeriod, collectUsage, usageStatus };
