const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
function assert(condition, message) { if (!condition) { console.error("FALHA:", message); process.exitCode = 1; } else console.log("OK:", message); }

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const app = fs.readFileSync(path.join(root, "public", "app-comercial.html"), "utf8");
const api = fs.readFileSync(path.join(root, "public", "api-client.js"), "utf8");

assert(pkg.version === "2.5.0", "versão 2.5.0");
[
  "src/utils/apiResponse.js",
  "src/middleware/requestContext.js",
  "src/middleware/errorHandler.js",
  "src/middleware/planGuard.js",
  "src/middleware/policyGuard.js",
  "src/routes/status.js",
  "docs/ARQUITETURA_PROFISSIONAL_1.6.md"
].forEach(file => assert(fs.existsSync(path.join(root, file)), `arquivo ${file}`));

["requestContext", "errorHandler", "notFoundHandler", "/api/status"].forEach(token => assert(server.includes(token), `server possui ${token}`));
["architectureStatus", "/status/architecture"].forEach(token => assert(api.includes(token), `api-client possui ${token}`));
["Arquitetura Profissional 1.6", "loadArchitectureStatus", "architectureStatusBox"].forEach(token => assert(app.includes(token), `UI arquitetura ${token}`));

const response = fs.readFileSync(path.join(root, "src/utils/apiResponse.js"), "utf8");
["success", "meta", "requestId", "timestamp"].forEach(token => assert(response.includes(token), `response padrão ${token}`));
