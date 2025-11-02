// server/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const { verifyToken } = require('./utils/auth');

app.use(express.json());

// Proper auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    req.user = {
      userId: decoded.userId // This matches what generateToken puts in the token
    };
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Apply auth middleware to all routes
app.use(authMiddleware);

// Import models
const Post = require('./models/Post');
const User = require('./models/User');

// POST /api/posts - Create new post (requires auth)
app.post('/api/posts', async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, content, category } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const post = await Post.create({
      title,
      content,
      author: new mongoose.Types.ObjectId(req.user.userId), // Convert to ObjectId
      category: new mongoose.Types.ObjectId(category),
      slug: title.toLowerCase().replace(/\s+/g, '-'),
    });

    // Populate author info for response
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username email');
    
    res.status(201).json({
      ...populatedPost.toObject(),
      author: populatedPost.author._id.toString() // Return string ID for consistency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts - Get all posts with filtering and pagination
app.get('/api/posts', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query = {};
    if (category) {
      query.category = new mongoose.Types.ObjectId(category);
    }

    // Execute query with pagination
    const posts = await Post.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('author', 'username email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    // Get total count for pagination info
    const total = await Post.countDocuments(query);

    // Convert posts to include string IDs for consistency
    const postsWithStringIds = posts.map(post => ({
      ...post.toObject(),
      _id: post._id.toString(),
      author: post.author._id.toString(),
      category: post.category._id.toString()
    }));

    res.status(200).json({
      posts: postsWithStringIds,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts/:id - Get single post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email')
      .populate('category', 'name');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Convert to string IDs for consistency
    const responsePost = {
      ...post.toObject(),
      _id: post._id.toString(),
      author: post.author._id.toString(),
      category: post.category._id.toString()
    };
    
    res.status(200).json(responsePost);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/posts/:id - Update post (requires auth + author check)
app.put('/api/posts/:id', async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author - compare string IDs
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const { title, content } = req.body;
    const updates = {};
    
    if (title) updates.title = title;
    if (content) updates.content = content;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'username email');

    // Convert to string IDs for consistency
    const responsePost = {
      ...updatedPost.toObject(),
      _id: updatedPost._id.toString(),
      author: updatedPost.author._id.toString()
    };

    res.status(200).json(responsePost);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/posts/:id - Delete post (requires auth + author check)
app.delete('/api/posts/:id', async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author - compare string IDs
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Test route to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

module.exports = app;