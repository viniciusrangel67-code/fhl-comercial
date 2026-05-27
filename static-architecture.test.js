const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function assert(condition, message) {
  if (!condition) {
    console.error("FALHA:", message);
    process.exitCode = 1;
  } else {
    console.log("OK:", message);
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
assert(Boolean(pkg.dependencies.express), "Express presente");
assert(Boolean(pkg.dependencies.pg), "PostgreSQL presente");
assert(Boolean(pkg.dependencies.googleapis), "googleapis presente");
assert(!pkg.dependencies["@googleapis/drive"], "@googleapis/drive removido");

const schema = fs.readFileSync(path.join(root, "sql", "schema.sql"), "utf8");
[
  "users", "clients", "processes", "tasks", "finance_entries",
  "documents", "lgpd_records", "audit_logs"
].forEach((table) => {
  assert(schema.includes(`create table if not exists ${table}`), `Tabela ${table}`);
});

["deleted_at", "deleted_by", "deleted_reason", "google_subject"].forEach((column) => {
  assert(schema.includes(column), `Coluna ${column}`);
});

const auth = fs.readFileSync(path.join(root, "src", "routes", "auth.js"), "utf8");
assert(auth.includes('router.get("/google"'), "Rota Google login");
assert(auth.includes('router.get("/google/callback"'), "Callback Google OAuth");

["clients", "processes", "tasks", "finance", "documents", "lgpd"].forEach((route) => {
  const text = fs.readFileSync(path.join(root, "src", "routes", `${route}.js`), "utf8");
  assert(text.includes('router.delete("/:id"'), `Soft delete em ${route}`);
  assert(text.includes('router.patch("/:id/restore"'), `Restore em ${route}`);
});
