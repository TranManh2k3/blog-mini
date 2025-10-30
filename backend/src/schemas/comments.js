const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
  post:   { type: Schema.Types.ObjectId, ref: "post", required: true },
  author: { type: Schema.Types.ObjectId, ref: "user", required: true },
  content:{ type: String, required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("comment", commentSchema);
