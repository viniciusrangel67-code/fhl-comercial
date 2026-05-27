const jwt = require("jsonwebtoken");
const { config } = require("../config");

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies && req.cookies[config.authCookieName]) return req.cookies[config.authCookieName];
  return null;
}

function authRequired(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: true, message: "Autenticação obrigatória." });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch (_error) {
    return res.status(401).json({ error: true, message: "Sessão inválida ou expirada." });
  }
}

function signUser(user) {
  return jwt.sign({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    officeId: user.office_id || user.officeId || null
  }, config.jwtSecret, { expiresIn: "8h" });
}

function setAuthCookie(res, token) {
  res.cookie(config.authCookieName, token, {
    httpOnly: true,
    secure: config.authCookieSecure,
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000
  });
}

function clearAuthCookie(res) {
  res.clearCookie(config.authCookieName);
}

module.exports = { authRequired, signUser, setAuthCookie, clearAuthCookie, extractToken };
