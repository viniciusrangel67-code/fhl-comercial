require("dotenv").config();

const express = require("express");
const { applySecurity } = require("./src/middleware/security");
const { requestContext } = require("./src/middleware/requestContext");
const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cookieParser = require("cookie-parser");

const { config } = require("./src/config");
const { ensureDatabase } = require("./src/db");

const authRoutes = require("./src/routes/auth");
const clientRoutes = require("./src/routes/clients");
const processRoutes = require("./src/routes/processes");
const taskRoutes = require("./src/routes/tasks");
const financeRoutes = require("./src/routes/finance");
const documentRoutes = require("./src/routes/documents");
const auditRoutes = require("./src/routes/audit");
const lgpdRoutes = require("./src/routes/lgpd");
const healthRoutes = require("./src/routes/health");
const adminRoutes = require("./src/routes/admin");
const billingRoutes = require("./src/routes/billing");
const supportRoutes = require("./src/routes/support");
const backupRoutes = require("./src/routes/backups");
const policyRoutes = require("./src/routes/policies");
const calculatorRoutes = require("./src/routes/calculators");
const indexerRoutes = require("./src/routes/indexers");
const statusRoutes = require("./src/routes/status");
const saasRoutes = require("./src/routes/saas");
const operationalRoutes = require("./src/routes/operational");
const workspaceRoutes = require("./src/routes/workspace");

const app = express();
app.use(requestContext);
applySecurity(app);

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: config.appOrigin,
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use(express.static(path.join(__dirname, "public")));
app.get("/app-comercial.html", (_req, res) => res.sendFile(path.join(__dirname, "public", "app-comercial.html")));

app.use("/api/health", healthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/backups", backupRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/calculators", calculatorRoutes);
app.use("/api/indexers", indexerRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/saas", saasRoutes);
app.use("/api/operational", operationalRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/processes", processRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/lgpd", lgpdRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/mvp", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "mvp-local.html"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: true,
    message: err.publicMessage || "Erro interno do servidor."
  });
});

ensureDatabase()
  .then(() => {
    app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
      console.log(`FHL Profissional rodando em http://localhost:${config.port}`);
    });
  })
  .catch((error) => {
    console.error("Falha ao iniciar banco/servidor:", error);
    process.exit(1);
  });
