// passport.test.js
import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcryptjs';
import { prisma } from '@prisma/client';
import '../../src/modules/authentication/config/passport.js';

// Mock the prisma module
jest.mock('@prisma/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Passport Configuration', () => {
  it('should authenticate a user with valid credentials', async () => {
    const done = jest.fn();

    // Mocking prisma.user.findUnique
    prisma.user.findUnique.mockResolvedValueOnce({ id: 1, username: 'testuser', password: 'hashedPassword' });
    bcrypt.compare.mockResolvedValueOnce(true);

    await new LocalStrategy(async (username, password, callback) => {
      callback(null, { username });
    })('testuser', 'password', done);

    expect(done).toHaveBeenCalledWith(null, { username: 'testuser' });
  });

  it('should not authenticate a user with invalid credentials', async () => {
    const done = jest.fn();

    // Mocking prisma.user.findUnique
    prisma.user.findUnique.mockResolvedValueOnce({ id: 1, username: 'testuser', password: 'hashedPassword' });
    bcrypt.compare.mockResolvedValueOnce(false);

    await new LocalStrategy(async (username, password, callback) => {
      callback(null, { username });
    })('testuser', 'wrongpassword', done);

    expect(done).toHaveBeenCalledWith(null, false);
  });

  it('should handle authentication errors', async () => {
    const done = jest.fn();

    // Mocking prisma.user.findUnique to simulate an error
    prisma.user.findUnique.mockRejectedValueOnce(new Error('User lookup error'));

    await new LocalStrategy(async (username, password, callback) => {
      callback(null, { username });
    })('testuser', 'password', done);

    expect(done).toHaveBeenCalledWith(new Error('User lookup error'));
  });

  it('should handle the case where the user does not exist', async () => {
    const done = jest.fn();

    // Mocking prisma.user.findUnique when the user does not exist
    prisma.user.findUnique.mockResolvedValueOnce(null);

    // Now, if you call your LocalStrategy with a non-existent username, it should handle it properly
    await new LocalStrategy(async (username, password, callback) => {
      callback(null, { username });
    })('nonexistentuser', 'password', done);

    expect(done).toHaveBeenCalledWith(null, false, { message: 'Incorrect username.' });
  });

  // Add more tests for other functionality in passport.js
});
