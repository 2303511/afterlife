/**
 * Blocks if there is no valid session.
 */
function ensureAuth(req, res, next) {
  if (!req.session?.userID) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

/**
 * Blocks unless the user’s role is one of the allowed roles.
 * @param {string[]} roles  lowercase names e.g. ['staff','admin']
 */
function ensureRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

/**
 * Allows if:
 *  • req.session.userID === targetID (from req.query.userID or req.body.userID), OR
 *  • req.session.role is in the allowed roles list.
 */
function ensureSelfOrRole(roles) {
  return (req, res, next) => {
    const targetID = req.query.userID || req.body.userID;
    if (req.session.userID === targetID || roles.includes(req.session.role)) {
      return next();
    }
    res.status(403).json({ error: "Forbidden" });
  };
}

module.exports = {
  ensureAuth,
  ensureRole,
  ensureSelfOrRole,
};
