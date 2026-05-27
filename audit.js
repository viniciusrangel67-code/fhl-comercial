const express = require("express");
const { query } = require("../db");
const { authRequired } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

const router = express.Router();

router.get("/", authRequired, requireRole("admin"), async (_req, res) => {
  const result = await query("select * from audit_logs order by created_at desc limit 1000");
  res.json({ data: result.rows });
});

module.exports = router;
