const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  post:    { type: mongoose.Schema.Types.ObjectId, ref: 'post', required: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('comment', commentSchema);
