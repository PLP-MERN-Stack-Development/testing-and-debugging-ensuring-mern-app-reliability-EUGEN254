// tests/unit/posts.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const Post = require('../../src/models/Post');
const User = require('../../src/models/User');
const { generateToken } = require('../../src/utils/auth');

let mongoServer;
let token;
let userId;
let postId;
let categoryId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test user
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  });
  userId = user._id;
  token = generateToken(user);

  // Create category ID for testing
  categoryId = new mongoose.Types.ObjectId();

  // Create test post
  const post = await Post.create({
    title: 'Test Post',
    content: 'This is a test post content',
    author: userId,
    category: categoryId,
    slug: 'test-post',
  });
  postId = post._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear and recreate test data before each test
  await Post.deleteMany({});
  await User.deleteMany({});

  // Recreate test user
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  });
  userId = user._id;
  token = generateToken(user);

  // Recreate test post
  const post = await Post.create({
    title: 'Test Post',
    content: 'This is a test post content',
    author: userId,
    category: categoryId,
    slug: 'test-post',
  });
  postId = post._id;
});

describe('POST /api/posts', () => {
  it('should create a new post when authenticated', async () => {
    const newPost = {
      title: 'New Test Post',
      content: 'This is a new test post content',
      category: categoryId.toString(),
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(newPost);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe(newPost.title);
    expect(res.body.content).toBe(newPost.content);
    expect(res.body.author).toBe(userId.toString());
  });

  it('should return 401 if not authenticated', async () => {
    const newPost = {
      title: 'Unauthorized Post',
      content: 'This should not be created',
      category: categoryId.toString(),
    };

    const res = await request(app).post('/api/posts').send(newPost);

    expect(res.status).toBe(401);
  });

  it('should return 400 if missing required fields', async () => {
    const incompletePost = {
      title: 'Incomplete Post',
      // missing content and category
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(incompletePost);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/posts', () => {
  it('should return all posts', async () => {
    // Create additional posts
    await Post.create([
      {
        title: 'Second Post',
        content: 'Second post content',
        author: userId,
        category: categoryId,
        slug: 'second-post',
      },
      {
        title: 'Third Post',
        content: 'Third post content',
        author: userId,
        category: categoryId,
        slug: 'third-post',
      }
    ]);

    const res = await request(app).get('/api/posts');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.posts)).toBeTruthy();
    expect(res.body.posts.length).toBe(3); // Initial + 2 new posts
    expect(res.body).toHaveProperty('totalPages');
    expect(res.body).toHaveProperty('currentPage');
    expect(res.body).toHaveProperty('total');
  });

  it('should filter posts by category', async () => {
    const differentCategoryId = new mongoose.Types.ObjectId();
    
    // Create post with different category
    await Post.create({
      title: 'Filtered Post',
      content: 'This post should be filtered by category',
      author: userId,
      category: differentCategoryId,
      slug: 'filtered-post',
    });

    const res = await request(app).get(`/api/posts?category=${differentCategoryId.toString()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.posts)).toBeTruthy();
    expect(res.body.posts.length).toBe(1);
    expect(res.body.posts[0].category).toBe(differentCategoryId.toString());
    expect(res.body.posts[0].title).toBe('Filtered Post');
  });

  it('should paginate results', async () => {
    // Create multiple posts for pagination
    const posts = [];
    for (let i = 0; i < 15; i++) {
      posts.push({
        title: `Pagination Post ${i}`,
        content: `Content for pagination test ${i}`,
        author: userId,
        category: categoryId,
        slug: `pagination-post-${i}`,
      });
    }
    await Post.insertMany(posts);

    const page1 = await request(app).get('/api/posts?page=1&limit=10');
    const page2 = await request(app).get('/api/posts?page=2&limit=10');

    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    expect(page1.body.posts.length).toBe(10);
    expect(page2.body.posts.length).toBe(6); // 16 total posts (1 initial + 15 new) - 10 from page1 = 6 remaining
    expect(page1.body.currentPage).toBe(1);
    expect(page2.body.currentPage).toBe(2);
  });

  it('should return empty array when no posts exist', async () => {
    // Clear all posts
    await Post.deleteMany({});

    const res = await request(app).get('/api/posts');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.posts)).toBeTruthy();
    expect(res.body.posts.length).toBe(0);
    expect(res.body.total).toBe(0);
  });
});

describe('GET /api/posts/:id', () => {
  it('should return a post by ID', async () => {
    const res = await request(app).get(`/api/posts/${postId}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(postId.toString());
    expect(res.body.title).toBe('Test Post');
    expect(res.body.content).toBe('This is a test post content');
  });

  it('should return 404 for non-existent post', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/posts/${nonExistentId}`);
    expect(res.status).toBe(404);
  });

  it('should return 404 for invalid post ID format', async () => {
    const res = await request(app).get('/api/posts/invalid-id');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/posts/:id', () => {
  it('should update a post when authenticated as author', async () => {
    const updates = { 
      title: 'Updated Test Post', 
      content: 'Updated content' 
    };

    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updates.title);
    expect(res.body.content).toBe(updates.content);
    expect(res.body._id).toBe(postId.toString());
  });

  it('should return 401 if not authenticated', async () => {
    const updates = { title: 'Unauthorized Update' };
    const res = await request(app).put(`/api/posts/${postId}`).send(updates);
    expect(res.status).toBe(401);
  });

  it('should return 403 if not the author', async () => {
    // Create another user
    const anotherUser = await User.create({
      username: 'anotheruser',
      email: 'another@example.com',
      password: 'password123',
    });
    const anotherToken = generateToken(anotherUser);

    const updates = { title: 'Forbidden Update' };
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .send(updates);

    expect(res.status).toBe(403);
  });

  it('should return 404 for non-existent post', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const updates = { title: 'Update Non-Existent' };
    
    const res = await request(app)
      .put(`/api/posts/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.status).toBe(404);
  });

  it('should update only provided fields', async () => {
    const updates = { title: 'Only Title Updated' };
    
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updates.title);
    expect(res.body.content).toBe('This is a test post content'); // Original content unchanged
  });
});

describe('DELETE /api/posts/:id', () => {
  it('should delete a post when authenticated as author', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post deleted successfully');
    
    // Verify post is actually deleted
    const deletedPost = await Post.findById(postId);
    expect(deletedPost).toBeNull();
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app).delete(`/api/posts/${postId}`);
    expect(res.status).toBe(401);
  });

  it('should return 403 if not the author', async () => {
    // Create another user
    const anotherUser = await User.create({
      username: 'anotheruser',
      email: 'another@example.com',
      password: 'password123',
    });
    const anotherToken = generateToken(anotherUser);

    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${anotherToken}`);

    expect(res.status).toBe(403);
    
    // Verify post still exists
    const existingPost = await Post.findById(postId);
    expect(existingPost).not.toBeNull();
  });

  it('should return 404 for non-existent post', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const res = await request(app)
      .delete(`/api/posts/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

// Additional test to verify API is working
describe('API Health Check', () => {
  it('should return API working message', async () => {
    const res = await request(app).get('/api/test');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('API is working!');
  });
});