const express = require("express");
const { query } = require("../db");

const router = express.Router();

router.get("/", async (_req, res) => {
  let database = "not_configured";
  try {
    await query("select 1");
    database = "ok";
  } catch (_error) {
    database = "error";
  }

  res.json({
    ok: true,
    app: "FHL Profissional",
    database,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
