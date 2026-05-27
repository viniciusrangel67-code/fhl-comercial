const { google } = require("googleapis");
const { config } = require("../config");

/**
 * Serviço preparado para integração real com Google Drive API.
 *
 * Nesta entrega não há credenciais fixas no código.
 * Para produção, configure OAuth/refresh token ou service account com
 * Domain-Wide Delegation no Google Workspace, conforme política do escritório.
 */
function assertDriveConfigured() {
  if (!config.google.clientId || !config.google.clientSecret || !config.google.redirectUri) {
    const error = new Error("Google Drive OAuth não configurado.");
    error.publicMessage = "Integração real com Drive ainda não configurada. Use vínculos por link ou configure OAuth.";
    throw error;
  }
}

function driveClient(auth) {
  assertDriveConfigured();
  return google.drive({ version: "v3", auth });
}

async function createClientFolder(auth, { clientName, processNumber }) {
  assertDriveConfigured();

  if (!auth) {
    return {
      simulated: true,
      clientName,
      processNumber,
      message: "Contrato de criação de pasta preparado. Conectar OAuth para executar no Drive real."
    };
  }

  const drive = driveClient(auth);
  const parent = config.google.sharedDriveId || undefined;
  const metadata = {
    name: processNumber ? `${clientName} - ${processNumber}` : clientName,
    mimeType: "application/vnd.google-apps.folder",
    parents: parent ? [parent] : undefined
  };

  const response = await drive.files.create({
    requestBody: metadata,
    fields: "id,name,webViewLink",
    supportsAllDrives: true
  });

  return response.data;
}

async function listFiles(auth, folderId) {
  assertDriveConfigured();
  if (!auth) return [];

  const drive = driveClient(auth);
  const response = await drive.files.list({
    q: folderId ? `'${folderId}' in parents and trashed=false` : "trashed=false",
    fields: "files(id,name,mimeType,webViewLink,modifiedTime)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  return response.data.files || [];
}

module.exports = { createClientFolder, listFiles, driveClient };
