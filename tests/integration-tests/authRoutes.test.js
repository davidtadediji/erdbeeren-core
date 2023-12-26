// authentication.test.js

import express from 'express';
import request from 'supertest';
import app from '../../src/modules/authentication/index.js'; // Adjust the path accordingly

describe('Authentication API', () => {
  // Use this token variable to store the authentication token for subsequent requests
  let token;

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/signup')
      .send({ username: 'testuser', password: 'testpassword' })
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('message', 'User created successfully');
  });

  it('should log in and return an authentication token', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpassword' })
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('message', 'Authentication successful');
    expect(response.body.user).toHaveProperty('token');

    // Save the token for future requests
    token = response.body.user.token;
  });

  it('should access a protected route with the obtained token', async () => {
    const response = await request(app)
      .get('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('userProfile');
  });

  it('should log out successfully', async () => {
    const response = await request(app)
      .get('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Logout successful');
  });
});
