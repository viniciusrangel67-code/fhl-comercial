const { google } = require("googleapis");
const { config } = require("../config");

function googleOAuthClient() {
  if (!config.google.clientId || !config.google.clientSecret || !config.google.redirectUri) {
    const error = new Error("Google OAuth não configurado.");
    error.publicMessage = "Google OAuth ainda não configurado no .env.";
    throw error;
  }

  return new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
}

function buildGoogleAuthUrl() {
  const client = googleOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile"],
    hd: config.google.allowedDomain || undefined
  });
}

async function exchangeCodeForProfile(code) {
  const client = googleOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  if (!tokens.id_token) {
    const error = new Error("Google não retornou id_token.");
    error.publicMessage = "Falha na autenticação Google.";
    throw error;
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.google.clientId
  });

  const payload = ticket.getPayload();
  const email = String(payload.email || "").toLowerCase();
  const hostedDomain = payload.hd || email.split("@")[1] || "";

  if (config.google.requireHostedDomain) {
    const allowed = String(config.google.allowedDomain || "").toLowerCase();
    if (!allowed || String(hostedDomain).toLowerCase() !== allowed) {
      const error = new Error("Domínio Google não autorizado.");
      error.publicMessage = "Use uma conta do domínio Google Workspace autorizado.";
      error.status = 403;
      throw error;
    }
  }

  return {
    googleSubject: payload.sub,
    name: payload.name || email,
    email,
    picture: payload.picture || null,
    hostedDomain,
    emailVerified: Boolean(payload.email_verified),
    tokens
  };
}

module.exports = { buildGoogleAuthUrl, exchangeCodeForProfile };
