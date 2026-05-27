const ROLE_PERMISSIONS = {
  platform_admin: ["*"],
  admin: ["*"],
  socio: [
    "dashboard:read","clients:*","processes:*","tasks:*","finance:*","documents:*",
    "lgpd:*","support:*","billing:read","backups:*","users:*","audit:read"
  ],
  advogado: [
    "dashboard:read","clients:read","clients:write","processes:*","tasks:*",
    "documents:*","lgpd:write","support:*","finance:read"
  ],
  financeiro: [
    "dashboard:read","clients:read","processes:read","finance:*","billing:read","support:*"
  ],
  atendimento: [
    "dashboard:read","clients:*","tasks:read","tasks:write","documents:read","support:*"
  ],
  visitante: ["dashboard:read","clients:read","processes:read","documents:read"]
};

function hasPermission(role, permission) {
  const allowed = ROLE_PERMISSIONS[role] || [];
  if (allowed.includes("*") || allowed.includes(permission)) return true;
  const [module] = permission.split(":");
  return allowed.includes(`${module}:*`);
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: true, message: "Autenticação obrigatória." });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: true, message: "Perfil sem permissão." });
    }
    return next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: true, message: "Autenticação obrigatória." });
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ error: true, message: `Permissão insuficiente: ${permission}` });
    }
    return next();
  };
}

module.exports = { ROLE_PERMISSIONS, hasPermission, requireRole, requirePermission };
