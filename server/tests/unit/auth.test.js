// tests/unit/auth.test.js
const jwt = require('jsonwebtoken');
const { generateToken, verifyToken, JWT_SECRET } = require('../../src/utils/auth');

describe('generateToken', () => {
  it('should generate a valid JWT token', () => {
    const user = {
      _id: '123',
      username: 'testuser'
    };

    const token = generateToken(user);
    const decoded = verifyToken(token);

    expect(decoded).toHaveProperty('userId', '123');
    expect(decoded).toHaveProperty('username', 'testuser');
    expect(decoded).toHaveProperty('exp');
    expect(decoded).toHaveProperty('iat');
  });

  it('should throw error for invalid token', () => {
    expect(() => {
      verifyToken('invalid-token');
    }).toThrow();
  });
});