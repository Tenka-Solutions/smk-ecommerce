const crypto = require("node:crypto");

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getRequestApiKey(req) {
  const headerKey = req.get("x-admin-api-key");
  const authorization = req.get("authorization") || "";

  if (headerKey) {
    return headerKey;
  }

  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return "";
}

function requireAdminApiKey(req, res, next) {
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey) {
    res.status(503).json({ ok: false, error: "API admin no configurada" });
    return;
  }

  if (!safeEqual(getRequestApiKey(req), configuredKey)) {
    res.status(401).json({ ok: false, error: "No autorizado" });
    return;
  }

  next();
}

module.exports = {
  requireAdminApiKey,
};
