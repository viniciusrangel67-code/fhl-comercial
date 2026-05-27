const { Pool } = require("pg");
const { config } = require("./config");

let pool = null;

function getPool() {
  if (!config.databaseUrl) {
    const error = new Error("DATABASE_URL não configurado.");
    error.publicMessage = "Banco de dados não configurado. Preencha DATABASE_URL no .env.";
    throw error;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.env === "production" ? { rejectUnauthorized: false } : false
    });
  }

  return pool;
}

async function query(text, params = []) {
  return getPool().query(text, params);
}

async function tx(fn) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function ensureDatabase() {
  if (!config.databaseUrl) {
    console.warn("DATABASE_URL ausente. O servidor inicia, mas as rotas de dados exigirão banco configurado.");
    return;
  }
  await query("select 1");
}

module.exports = { query, tx, ensureDatabase };
