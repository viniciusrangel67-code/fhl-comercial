const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { query } = require("../db");
const { config } = require("../config");

async function ensureDir() {
  await fs.mkdir(config.backup.dir, { recursive: true });
}

async function runOfficeBackup(officeId) {
  await ensureDir();

  const tables = ["clients", "processes", "tasks", "finance_entries", "documents", "lgpd_records"];
  const payload = { officeId, exportedAt: new Date().toISOString(), tables: {} };

  for (const table of tables) {
    const result = await query(`select * from ${table} where office_id=$1`, [officeId]);
    payload.tables[table] = result.rows;
  }

  const json = JSON.stringify(payload, null, 2);
  const checksum = crypto.createHash("sha256").update(json).digest("hex");
  const filename = `backup-${officeId}-${new Date().toISOString().slice(0,10)}-${checksum.slice(0,8)}.json`;
  const filePath = path.join(config.backup.dir, filename);

  const job = await query(
    `insert into backup_jobs (office_id, status, started_at)
     values ($1,'running',now()) returning *`,
    [officeId]
  );

  await fs.writeFile(filePath, json, "utf8");

  const done = await query(
    `update backup_jobs set status='done', file_path=$2, checksum=$3, finished_at=now()
     where id=$1 returning *`,
    [job.rows[0].id, filePath, checksum]
  );

  return done.rows[0];
}

async function listBackups(officeId) {
  const result = await query(
    "select id, status, file_path, checksum, started_at, finished_at, created_at from backup_jobs where office_id=$1 order by created_at desc limit 100",
    [officeId]
  );
  return result.rows;
}

module.exports = { runOfficeBackup, listBackups };
