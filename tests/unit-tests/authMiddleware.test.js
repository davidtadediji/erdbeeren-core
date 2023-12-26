//authMiddleware.test.js
import { isAuthenticated, hasPermission } from '../../src/modules/authentication/middleware/authMiddleware.js';

describe('Authentication Middleware', () => {
  it('should allow access to authenticated users', () => {
    const req = { isAuthenticated: jest.fn().mockReturnValueOnce(true) };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    isAuthenticated(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should deny access to unauthenticated users', () => {
    const req = { isAuthenticated: jest.fn().mockReturnValueOnce(false) };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized access' });
  });

  it('should allow access to users with required permissions', () => {
    const req = { user: { role: 'admin' } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    hasPermission(['VIEW_PROFILE'])(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should deny access to users without required permissions', () => {
    const req = { user: { role: 'agent' } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    hasPermission(['VIEW_PROFILE', 'VIEW_ADMIN_DASHBOARD'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
  });

  // Add more tests for other functionality in authMiddleware.js
});
