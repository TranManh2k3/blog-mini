// backend/src/middlewares/role.js
exports.requireRole = (roles = []) => (req, res, next) => {
  if (!roles.length) return next();
  if (!req.user) return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Không đủ quyền" });
  }
  next();
};
