const jwt = require("jsonwebtoken");

exports.requireAuth = (req, res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return res.status(401).json({ success: false, message: "Chưa đăng nhập" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // cần có id + role để rules phía sau dùng
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};
