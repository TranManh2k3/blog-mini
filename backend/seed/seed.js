// seed/seed.js
const bcrypt = require('bcryptjs');
const { connectDB } = require('../src/config/db');
const Role = require('../src/schemas/roles');
const User = require('../src/schemas/users');


(async () => {
  try {
    await connectDB();

    for (const name of ['ADMIN', 'EDITOR', 'USER']) {
      await Role.updateOne({ name }, { $set: { name } }, { upsert: true });
    }

    const adminRole = await Role.findOne({ name: 'ADMIN', isDeleted: false });
    const email = 'admin@example.com';
    const passwordHash = await bcrypt.hash('admin123', 10);

    await User.updateOne(
      { email },
      { $set: { email, passwordHash, displayName: 'Admin', role: adminRole._id, isDeleted: false } },
      { upsert: true }
    );

    const userRole = await Role.findOne({ name: 'USER', isDeleted: false });
    const userEmail = 'user2@example.com';
    const userPassword = await bcrypt.hash('user123', 10);

    await User.updateOne(
      { email: userEmail },
      { $set: { email: userEmail, passwordHash: userPassword, displayName: 'User 2', role: userRole._id, isDeleted: false } },
      { upsert: true }
    );

    console.log('🌱 Seed done (roles + admin)');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
