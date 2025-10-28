const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { PORT } = require('./config/env');
const { errorHandler } = require('./middlewares/error');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const testRoute = require('./routes/test');
const postRoute = require('./routes/posts');
const commentRoute = require('./routes/comments');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/test', testRoute);
app.use('/api/posts', postRoute);
app.use('/api/comments', commentRoute);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT}`));
}).catch(err => {
  console.error('❌ DB connect error:', err);
});
