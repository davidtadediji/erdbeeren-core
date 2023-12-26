// Import necessary modules and functions
import * as passport from 'passport';
jest.mock('passport');
import { prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { login, logout, signup } from '../../src/modules/authentication/controller/authController.js';

// Mock prisma
jest.mock('@prisma/client');

// Define test suite
describe('Auth Controller', () => {
  // Run after each test to clear mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case for successful user authentication on login
  it('should authenticate a user on login', async () => {
    // Create mock request, response, and next objects
    const req = {};
    const res = { json: jest.fn() };
    const next = jest.fn();

    // Mock the req.logIn method
    req.logIn = jest.fn((user, callback) => {
      callback(null);
    });

    // Mock passport authentication success
    passport.authenticate.mockImplementationOnce((strategy, options, callback) => {
      callback(null, { username: 'testuser' });
    });

    // Call the login function
    await login(req, res, next);

    // Assertions
    expect(req.logIn).toHaveBeenCalledWith({ username: 'testuser' }, expect.any(Function));
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication successful', user: { username: 'testuser' } });
  });

  // Test case for handling authentication failure on login
  it('should handle authentication failure on login', async () => {
    // Create mock request, response, and next objects
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    // Mock passport authentication failure
    passport.authenticate.mockImplementationOnce((strategy, options, callback) => {
      callback(null, false);
    });

    // Call the login function
    await login(req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication failed' });
  });

  // Test case for handling login errors
  it('should handle login errors', async () => {
    // Create mock request, response, and next objects
    const req = {};
    const res = { json: jest.fn() };
    const next = jest.fn();

    // Mock passport authentication with an error
    passport.authenticate.mockImplementationOnce((strategy, options, callback) => {
      callback(new Error('Login error'));
    });

    // Call the login function
    await login(req, res, next);

    // Assertion
    expect(next).toHaveBeenCalledWith(new Error('Login error'));
  });

  // Test case for logging out a user
  it('should logout a user on logout', async () => {
    // Create mock request and response objects
    const req = { logout: jest.fn() };
    const res = { json: jest.fn() };

    // Call the logout function
    logout(req, res);

    // Assertions
    expect(req.logout).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
  });

  // Test case for creating a new user on signup
  it('should create a new user on signup', async () => {
    // Create mock request, response, and next objects with user data
    const req = { body: { username: 'testuser', password: 'testpassword' } };
    const res = { json: jest.fn() };
    const next = jest.fn();

    // Mock prisma user lookup and bcrypt hash
    prisma.user.findUnique.mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce('hashedPassword');
    prisma.user.create.mockResolvedValueOnce({ username: 'testuser' });

    // Call the signup function
    await signup(req, res, next);

    // Assertions
    expect(res.json).toHaveBeenCalledWith({ message: 'User created successfully', user: { username: 'testuser' } });
  });

  // Test case for handling signup errors
  it('should handle signup errors', async () => {
    // Create mock request, response, and next objects with user data
    const req = { body: { username: 'testuser', password: 'testpassword' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    // Mock prisma user lookup with an error
    prisma.user.findUnique.mockResolvedValueOnce(null);
    // Mock bcrypt hash with an error
    bcrypt.hash.mockRejectedValueOnce(new Error('Hashing error'));

    // Call the signup function
    await signup(req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error', error: 'Hashing error' });
  });

  // Add more tests for other functionality in authController.js
});
