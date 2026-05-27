require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const files = [
  "schema.sql",
  "migration-1.3-commercial.sql",
  "migration-1.5-calculators.sql",
  "migration-1.7-saas-autonomo.sql",
  "migration-1.9-operational-restore.sql",
  "migration-2.0-consolidation.sql",
  "migration-2.2-final-documents.sql"
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não configurado. No Railway, adicione PostgreSQL e configure DATABASE_URL.");
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
  });

  await client.connect();

  try {
    for (const file of files) {
      const fullPath = path.join(__dirname, "..", "sql", file);
      if (!fs.existsSync(fullPath)) {
        console.log(`[migrate] arquivo não encontrado, ignorando: ${file}`);
        continue;
      }

      const sql = fs.readFileSync(fullPath, "utf8").trim();
      if (!sql) {
        console.log(`[migrate] arquivo vazio, ignorando: ${file}`);
        continue;
      }

      console.log(`[migrate] executando ${file}`);
      await client.query(sql);
    }

    console.log("[migrate] concluído com sucesso.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[migrate] falha:", err.message);
  console.error(err.stack);
  process.exit(1);
});
