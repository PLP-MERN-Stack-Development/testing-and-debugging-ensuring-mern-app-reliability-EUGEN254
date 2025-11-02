const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: mongoose.Schema.Types.ObjectId,
  category: mongoose.Schema.Types.ObjectId,
  slug: String,
});

module.exports = mongoose.model('Post', PostSchema);
