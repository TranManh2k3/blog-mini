const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { JWT_SECRET } = require('../config/env');
const Role = require('../schemas/roles');
const User = require('../schemas/users');


router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password, displayName } = req.body;
    const exist = await User.findOne({ email });
    if (exist && !exist.isDeleted) return res.status(409).json({ success: false, message: 'Email đã tồn tại' });

    const userRole = await Role.findOne({ name: 'USER', isDeleted: false });
    const passwordHash = await bcrypt.hash(password, 10);

    await User.updateOne(
      { email },
      { $set: { passwordHash, displayName, role: userRole._id, isDeleted: false } },
      { upsert: true }
    );
    return res.status(201).json({ success: true });
  }
);

router.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email, isDeleted:false }).populate('role');
    if (!user) return res.status(404).json({ success:false, message:'User không tồn tại' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ success:false, message:'Sai mật khẩu' });

    // >>> đổi 'sub' thành 'id', nhúng luôn email/role
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {                               // >>> thêm block user để FE lưu
        id: user._id.toString(),
        role: user.role.name,
        displayName: user.displayName,
        email: user.email
      }
    });
  }
);

module.exports = router;
