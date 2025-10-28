const router = require('express').Router();
const User = require('../schemas/users');
const Role = require('../schemas/roles');
const { requireAuth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/rbac');

router.use(requireAuth, requireRole(['ADMIN']));

router.get('/', async (req, res) => {
  const users = await User.find({ isDeleted: false }).populate('role', 'name');
  res.json({ success: true, data: users.map(u => ({
    id: u._id, email: u.email, displayName: u.displayName, role: u.role.name
  })) });
});

router.get('/:id', async (req, res) => {
  const u = await User.findOne({ _id: req.params.id, isDeleted: false }).populate('role', 'name');
  if (!u) return res.status(404).json({ success: false });
  res.json({ success: true, data: { id: u._id, email: u.email, displayName: u.displayName, role: u.role.name } });
});

router.patch('/:id', async (req, res) => {
  const role = await Role.findOne({ name: req.body.role, isDeleted: false });
  if (!role) return res.status(400).json({ success: false, message: 'Role không hợp lệ' });
  await User.updateOne({ _id: req.params.id }, { $set: { role: role._id } });
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  await User.updateOne({ _id: req.params.id }, { $set: { isDeleted: true } });
  res.json({ success: true });
});

module.exports = router;
