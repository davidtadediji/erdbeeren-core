// Example test for userController.js
import { getUserProfile } from '../../src/modules/authentication/controllers/userController.js';
import { prisma } from '@prisma/client';

jest.mock('@prisma/client'); // Mock the Prisma client

describe('getUserProfile', () => {
  it('should return user profile when a valid user is authenticated', async () => {
    const mockUser = { id: 1, username: 'testuser' };
    const mockReq = { user: mockUser };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Mock the Prisma client function
    prisma.user.findUnique.mockResolvedValueOnce({ id: 1, username: 'testuser', /* other fields */ });

    await getUserProfile(mockReq, mockRes, jest.fn());

    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({ userProfile: { id: 1, username: 'testuser' } });
  });

  it('should handle the case where user profile is not found', async () => {
    const mockReq = { user: { id: 2, username: 'anotheruser' } }; // Define mockReq for the second test case
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Mock the Prisma client function to return null
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await getUserProfile(mockReq, mockRes, jest.fn());

    // Assert that the response has the correct status code and message
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'User profile not found' });
  });
});
