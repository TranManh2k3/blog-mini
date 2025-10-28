exports.requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false });
  if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
  next();
};
