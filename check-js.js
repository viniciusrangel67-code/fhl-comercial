const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const ignore = new Set(["node_modules", ".git", "backups"]);
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith(".js")) files.push(full);
  }
}
walk(root);

let ok = true;
for (const file of files) {
  const r = spawnSync("node", ["--check", file], { encoding: "utf8" });
  if (r.status !== 0) {
    ok = false;
    console.error("FALHA JS:", path.relative(root, file));
    console.error(r.stderr);
  } else {
    console.log("OK JS:", path.relative(root, file));
  }
}
process.exit(ok ? 0 : 1);
