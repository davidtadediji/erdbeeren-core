// index.test.js
import request from 'supertest';
import app from '../../src/modules/authentication/index.js';

describe('Authentication Module', () => {
  it('should start the server and return "Server is running" message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Server is running');
  });

  // Add more tests for other functionality in index.js
});
