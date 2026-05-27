const express = require("express");
const { authRequired } = require("../middleware/auth");
const { tenantRequired } = require("../middleware/tenant");
const { requireRole } = require("../middleware/rbac");
const { runOfficeBackup, listBackups } = require("../services/backupService");
const { auditLog } = require("../services/audit");

const router = express.Router();
router.use(authRequired, tenantRequired, requireRole("admin"));

router.get("/", async (req, res) => {
  const data = await listBackups(req.officeId);
  res.json({ data });
});

router.post("/run", async (req, res) => {
  const result = await runOfficeBackup(req.officeId);
  await auditLog({ userId: req.user.id, officeId: req.officeId, module: "Backup", action: "Backup manual", entityType: "backup_job", entityId: result.id, ip: req.ip });
  res.status(202).json({ data: result });
});

module.exports = router;
