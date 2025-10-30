// backend/src/routes/comments.js
const express = require("express");
const router = express.Router();

const Comment = require("../schemas/comments");
const Post = require("../schemas/posts");
const { requireAuth } = require("../middlewares/auth");

const asyncWrap = fn => (req, res) => fn(req, res).catch(err => {
  console.error(err);
  res.status(500).json({ success:false, message: err.message || "Internal error" });
});

/**
 * GET /api/comments/post/:postId
 * Public: lấy list comment của 1 post
 */
router.get("/post/:postId", asyncWrap(async (req, res) => {
  const list = await Comment.find({ post: req.params.postId, isDeleted: false })
    .sort({ createdAt: 1 })
    .populate("author", "_id displayName"); // QUAN TRỌNG: để FE biết chủ sở hữu
  res.json({ success:true, data:list });
}));

/**
 * POST /api/comments/post/:postId
 * Yêu cầu đăng nhập
 */
router.post("/post/:postId", requireAuth, asyncWrap(async (req, res) => {
  const { content } = req.body || {};
  if (!content) return res.status(400).json({ success:false, message:"Thiếu nội dung" });

  const post = await Post.findOne({ _id: req.params.postId, isDeleted: false });
  if (!post) return res.status(404).json({ success:false, message:"Bài viết không tồn tại" });

  const cmt = await Comment.create({
    post: post._id,
    author: req.user.id,
    content,
    isDeleted: false,
  });

  res.status(201).json({ success:true, data:cmt });
}));

/**
 * PATCH /api/comments/:id
 * Chỉ chủ comment hoặc ADMIN/EDITOR
 */
router.patch("/:id", requireAuth, asyncWrap(async (req, res) => {
  const cmt = await Comment.findById(req.params.id).populate("author", "_id");
  if (!cmt || cmt.isDeleted) return res.status(404).json({ success:false, message:"Không tìm thấy bình luận" });

  const isOwner = String(cmt.author?._id) === req.user.id;
  const isAdmin  = req.user.role === "ADMIN";
  const isEditor = req.user.role === "EDITOR";
  if (!(isOwner || isAdmin || isEditor)) {
    return res.status(403).json({ success:false, message:"Không đủ quyền" });
  }

  if (typeof req.body.content === "string") cmt.content = req.body.content;
  await cmt.save();
  res.json({ success:true, data:cmt });
}));

/**
 * DELETE (soft) /api/comments/:id
 * Chỉ chủ comment hoặc ADMIN/EDITOR
 */
router.delete("/:id", requireAuth, asyncWrap(async (req, res) => {
  const cmt = await Comment.findById(req.params.id).populate("author", "_id");
  if (!cmt || cmt.isDeleted) return res.status(404).json({ success:false, message:"Không tìm thấy bình luận" });

  const isOwner = String(cmt.author?._id) === req.user.id;
  const isAdmin  = req.user.role === "ADMIN";
  const isEditor = req.user.role === "EDITOR";
  if (!(isOwner || isAdmin || isEditor)) {
    return res.status(403).json({ success:false, message:"Không đủ quyền" });
  }

  cmt.isDeleted = true;
  await cmt.save();
  res.json({ success:true, message:"Đã xóa (mềm)" });
}));

module.exports = router;

