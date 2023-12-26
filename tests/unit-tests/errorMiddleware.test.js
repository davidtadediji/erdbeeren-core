// errorMiddleware.test.js
import errorHandler from '../../src/modules/authentication/middleware/errorMiddleware.js';

describe('Error Middleware', () => {
  it('should handle errors and respond with a 500 status', () => {
    const mockError = new Error('Test error');
    const mockReq = {};
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockNext = jest.fn();

    errorHandler(mockError, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      error: 'Test error',
    });
  });

  // Add more tests for other functionality in errorMiddleware.js
});
