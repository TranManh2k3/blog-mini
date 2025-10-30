const express = require("express");
const router = express.Router();
const Post = require("../schemas/posts");
const { requireAuth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/role");

// helper: trả lỗi gọn
const asyncWrap = fn => (req, res) => fn(req, res).catch(err => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || "Internal error" });
});

/**
 * GET /api/posts
 * Public: trả danh sách bài chưa xóa mềm
 */
router.get("/", asyncWrap(async (req, res) => {
  const list = await Post.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .select("_id title content author createdAt updatedAt");
  res.json({ success: true, data: list });
}));

/**
 * GET /api/posts/:id
 * Public: chi tiết bài viết
 */
router.get("/:id", asyncWrap(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
    .populate("author", "_id displayName");
  if (!post) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" });
  res.json({ success: true, data: post });
}));

/**
 * POST /api/posts
 * Chỉ ADMIN/EDITOR
 */
router.post("/", requireAuth, requireRole(["ADMIN", "EDITOR"]), asyncWrap(async (req, res) => {
  try {
  const { title, content } = req.body || {};
  if (!title) return res.status(400).json({ success: false, message: "Thiếu tiêu đề" });
  const created = await Post.create({
    title,
    content: content || "",
    author: req.user.id,
    isDeleted: false
  });

  res.status(201).json({ success: true, data: created });
  } catch (e) {
      console.error("CreatePost error:", e);
      res.status(500).json({ success: false, message: e.message });
    }
}));
module.exports = router;
/**
 * PATCH /api/posts/:id
 * Mặc định: chỉ ADMIN/EDITOR
 * (Nếu muốn cho phép CHỦ BÀI cũng sửa, bỏ requireRole và bật phần checkOwner bên dưới)
 */
router.patch("/:id", requireAuth, requireRole(["ADMIN", "EDITOR"]), asyncWrap(async (req, res) => {
  const { title, content } = req.body || {};
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" });

  // // Nếu muốn tác giả cũng được sửa:
  // const isOwner = String(post.author) === req.user.id;
  // if (!(isOwner || ["ADMIN","EDITOR"].includes(req.user.role))) {
  //   return res.status(403).json({ success:false, message:"Không đủ quyền" });
  // }

  if (typeof title === "string") post.title = title;
  if (typeof content === "string") post.content = content;

  await post.save();
  res.json({ success: true, data: post });
}));

/**
 * DELETE (soft) /api/posts/:id
 * Mặc định: chỉ ADMIN/EDITOR
 * (Tương tự, có thể bật check owner nếu muốn)
 */
router.delete("/:id", requireAuth, requireRole(["ADMIN", "EDITOR"]), asyncWrap(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.isDeleted) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" });

  // // Nếu muốn tác giả cũng được xóa:
  // const isOwner = String(post.author) === req.user.id;
  // if (!(isOwner || ["ADMIN","EDITOR"].includes(req.user.role))) {
  //   return res.status(403).json({ success:false, message:"Không đủ quyền" });
  // }

  post.isDeleted = true;
  await post.save();
  res.json({ success: true, message: "Đã xóa (mềm)" });
}));

module.exports = router;
