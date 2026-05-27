const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { config } = require("../config");

function applySecurity(app) {
  app.disable("x-powered-by");

  app.use(helmet({
    contentSecurityPolicy: config.env === "production" ? {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'"],
        "frame-ancestors": ["'none'"]
      }
    } : false
  }));

  app.use(rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    limit: Number(process.env.RATE_LIMIT_MAX || 500),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, message: "Muitas requisições. Aguarde e tente novamente." }
  }));
}

module.exports = { applySecurity };
