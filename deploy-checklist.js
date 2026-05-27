const fs = require("fs");

const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "APP_ORIGIN",
  "GOOGLE_ALLOWED_DOMAIN"
];

let ok = true;
for (const key of required) {
  if (!process.env[key]) {
    console.error(`FALTA: ${key}`);
    ok = false;
  } else {
    console.log(`OK: ${key}`);
  }
}

if (!fs.existsSync("sql/schema.sql")) {
  console.error("FALTA: sql/schema.sql");
  ok = false;
}

if (!fs.existsSync("Dockerfile")) {
  console.error("FALTA: Dockerfile");
  ok = false;
}

process.exit(ok ? 0 : 1);
