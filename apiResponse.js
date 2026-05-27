function ok(res, data = null, meta = {}) {
  return res.json({
    success: true,
    data,
    meta: {
      requestId: res.locals.requestId || null,
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
}

function created(res, data = null, meta = {}) {
  return res.status(201).json({
    success: true,
    data,
    meta: {
      requestId: res.locals.requestId || null,
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
}

function accepted(res, data = null, meta = {}) {
  return res.status(202).json({
    success: true,
    data,
    meta: {
      requestId: res.locals.requestId || null,
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
}

function fail(res, status, message, details = null) {
  return res.status(status).json({
    success: false,
    error: {
      message,
      details
    },
    meta: {
      requestId: res.locals.requestId || null,
      timestamp: new Date().toISOString()
    }
  });
}

module.exports = { ok, created, accepted, fail };
