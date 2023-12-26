// userRoutes.test.js
import request from 'supertest';
import app from '../../src/modules/authentication/index.js'; // Adjust the path accordingly

describe('User Routes', () => {
  it('should return user profile with proper authentication', async () => {
    const response = await request(app)
      .get('/user/profile')
      .set('Cookie', ['user=someUserId']) // Assuming you have a valid user ID here
      .expect(200);

    expect(response.body).toHaveProperty('userProfile');
  });

  // Add more tests for other functionality in userRoutes.js
});
