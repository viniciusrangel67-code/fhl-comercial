const { ZodError } = require("zod");
const { fail } = require("../utils/apiResponse");

function notFoundHandler(req, res) {
  return fail(res, 404, "Rota não encontrada.", { path: req.originalUrl });
}

function errorHandler(error, req, res, _next) {
  const status = error.status || error.statusCode || 500;

  if (error instanceof ZodError) {
    return fail(res, 400, "Dados inválidos.", error.issues.map(issue => ({
      path: issue.path.join("."),
      message: issue.message
    })));
  }

  if (error.publicMessage) {
    return fail(res, status, error.publicMessage);
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${req.requestId || "no-request-id"}]`, error);
  }

  return fail(res, status, status >= 500 ? "Erro interno do servidor." : error.message);
}

module.exports = { errorHandler, notFoundHandler };
