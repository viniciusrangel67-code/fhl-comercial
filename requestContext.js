const crypto = require("crypto");

function requestContext(req, res, next) {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = requestId;
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  res.locals.startedAt = Date.now();
  next();
}

module.exports = { requestContext };
