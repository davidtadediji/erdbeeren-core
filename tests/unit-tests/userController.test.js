// userController.test.js
import { getUserProfile } from '../../src/modules/authentication/controller/userController.js';

describe('User Controller', () => {
  it('should return user profile when valid user ID is provided', async () => {
    const mockReq = { user: { id: 'someUserId' } };
    const mockRes = { json: jest.fn() };
    const mockNext = jest.fn();

    await getUserProfile(mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalled();
  });

  // Add more tests for other functionality in userController.js
});
