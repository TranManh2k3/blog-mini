const router = require('express').Router();
const { requireAuth } = require('../middlewares/auth');
const Post = require('../schemas/posts');
const { paging } = require('../utils/pagination');

// PUBLIC: list
router.get('/', async (req, res) => {
  const q = req.query.q || '';
  const { limit, skip } = paging(req.query);
  const filter = { isDeleted: false };
  if (q) filter.title = { $regex: q, $options: 'i' };

  const data = await Post.find(filter)
    .populate('author', 'displayName')
    .skip(skip).limit(limit).sort('-createdAt');

  res.json({ success: true, data });
});

// PUBLIC: get by id
router.get('/:id', async (req, res) => {
  const p = await Post.findOne({ _id: req.params.id, isDeleted: false })
    .populate('author', 'displayName');
  if (!p) return res.status(404).json({ success: false });
  res.json({ success: true, data: p });
});

// CREATE: cần đăng nhập
router.post('/', requireAuth, async (req, res) => {
  const doc = await Post.create({
    title: req.body.title,
    content: req.body.content || '',
    author: req.user.id
  });
  res.status(201).json({ success: true, data: doc });
});

// UPDATE: tác giả hoặc ADMIN/EDITOR
router.patch('/:id', requireAuth, async (req, res) => {
  const cur = await Post.findById(req.params.id);
  if (!cur || cur.isDeleted) return res.status(404).json({ success: false });

  const isOwner = String(cur.author) === String(req.user.id);
  const canEdit = isOwner || ['ADMIN', 'EDITOR'].includes(req.user.role);
  if (!canEdit) return res.status(403).json({ success: false, message: 'Forbidden' });

  cur.title = req.body.title ?? cur.title;
  cur.content = req.body.content ?? cur.content;
  await cur.save();
  res.json({ success: true, data: cur });
});

// DELETE (soft): tác giả hoặc ADMIN/EDITOR
router.delete('/:id', requireAuth, async (req, res) => {
  const cur = await Post.findById(req.params.id);
  if (!cur || cur.isDeleted) return res.status(404).json({ success: false });

  const isOwner = String(cur.author) === String(req.user.id);
  const canDelete = isOwner || ['ADMIN', 'EDITOR'].includes(req.user.role);
  if (!canDelete) return res.status(403).json({ success: false, message: 'Forbidden' });

  cur.isDeleted = true;
  await cur.save();
  res.json({ success: true });
});

module.exports = router;
