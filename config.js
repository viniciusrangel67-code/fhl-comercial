const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  appOrigin: process.env.APP_ORIGIN || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  authCookieName: process.env.AUTH_COOKIE_NAME || "fhl_token",
  authCookieSecure: String(process.env.AUTH_COOKIE_SECURE || "false") === "true",
  appVersion: process.env.APP_VERSION || "1.7.0",
  saas: {
    enabled: String(process.env.SAAS_MODE || "true") === "true",
    defaultPlan: process.env.DEFAULT_PLAN || "starter",
    defaultTrialDays: Number(process.env.DEFAULT_TRIAL_DAYS || 14),
    platformAdminEmail: process.env.PLATFORM_ADMIN_EMAIL || "",
    supportEmail: process.env.SUPPORT_EMAIL || ""
  },
  backup: {
    enabled: String(process.env.BACKUP_ENABLED || "true") === "true",
    dir: process.env.BACKUP_DIR || "./backups",
    retentionDays: Number(process.env.BACKUP_RETENTION_DAYS || 30),
    scheduleCron: process.env.BACKUP_SCHEDULE_CRON || "0 3 * * *"
  },
  billing: {
    provider: process.env.BILLING_PROVIDER || "manual",
    webhookSecret: process.env.BILLING_WEBHOOK_SECRET || ""
  },
  google: {
    workspaceDomain: process.env.GOOGLE_WORKSPACE_DOMAIN || "",
    allowedDomain: process.env.GOOGLE_ALLOWED_DOMAIN || process.env.GOOGLE_WORKSPACE_DOMAIN || "",
    requireHostedDomain: String(process.env.GOOGLE_REQUIRE_HOSTED_DOMAIN || "true") === "true",
    sharedDriveId: process.env.GOOGLE_DRIVE_SHARED_DRIVE_ID || "",
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI || "",
    loginSuccessRedirect: process.env.GOOGLE_LOGIN_SUCCESS_REDIRECT || "http://localhost:3000/app.html",
    loginFailureRedirect: process.env.GOOGLE_LOGIN_FAILURE_REDIRECT || "http://localhost:3000/?login=failed"
  }
};

module.exports = { config };
