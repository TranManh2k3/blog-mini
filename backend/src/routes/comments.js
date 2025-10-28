const router = require('express').Router();
const { requireAuth } = require('../middlewares/auth');
const Comment = require('../schemas/comments');

// LIST theo post (public)
router.get('/post/:postId', async (req, res) => {
  const data = await Comment.find({ post: req.params.postId, isDeleted: false })
    .populate('author', 'displayName')
    .sort('-createdAt');
  res.json({ success: true, data });
});

// CREATE (cần token)
router.post('/post/:postId', requireAuth, async (req, res) => {
  const doc = await Comment.create({
    content: req.body.content,
    post: req.params.postId,
    author: req.user.id
  });
  res.status(201).json({ success: true, data: doc });
});

// UPDATE (tác giả hoặc ADMIN)
router.patch('/:id', requireAuth, async (req, res) => {
  const cur = await Comment.findById(req.params.id);
  if (!cur || cur.isDeleted) return res.status(404).json({ success: false });

  const isOwner = String(cur.author) === String(req.user.id);
  if (!isOwner && req.user.role !== 'ADMIN')
    return res.status(403).json({ success: false, message: 'Forbidden' });

  cur.content = req.body.content ?? cur.content;
  await cur.save();
  res.json({ success: true, data: cur });
});

// DELETE (soft) (tác giả hoặc ADMIN)
router.delete('/:id', requireAuth, async (req, res) => {
  const cur = await Comment.findById(req.params.id);
  if (!cur || cur.isDeleted) return res.status(404).json({ success: false });

  const isOwner = String(cur.author) === String(req.user.id);
  if (!isOwner && req.user.role !== 'ADMIN')
    return res.status(403).json({ success: false, message: 'Forbidden' });

  cur.isDeleted = true;
  await cur.save();
  res.json({ success: true });
});

module.exports = router;
