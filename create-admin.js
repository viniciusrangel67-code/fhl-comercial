require("dotenv").config();

const bcrypt = require("bcryptjs");
const { query } = require("../src/db");
const { config } = require("../src/config");

async function main() {
  const name = process.argv[2] || "Administrador FHL";
  const email = process.argv[3];
  const password = process.argv[4];

  if (!email || !password) {
    console.error("Uso: node scripts/create-admin.js nome email senha");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, config.bcryptRounds);
  const result = await query(
    `insert into users (name, email, password_hash, role)
     values ($1,$2,$3,'admin')
     on conflict (email) do update set password_hash=excluded.password_hash, role='admin', active=true
     returning id, name, email, role`,
    [name, email, hash]
  );

  console.log("Administrador criado/atualizado:", result.rows[0]);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
