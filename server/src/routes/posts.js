// server/src/routes/posts.js
const express = require('express');
const router = express.Router();

// Dummy in-memory posts array
let posts = [];

// GET all posts
router.get('/', (req, res) => {
  res.json(posts);
});

// POST a post
router.post('/', (req, res) => {
  const { title, content } = req.body;
  const newPost = { id: posts.length + 1, title, content };
  posts.push(newPost);
  res.status(201).json(newPost);
});

module.exports = router;
