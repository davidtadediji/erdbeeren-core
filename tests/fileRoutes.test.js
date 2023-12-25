// FileRoutes.test.js

import request from 'supertest';
import express from 'express';
import { uploadFile, getFileById } from '../services/fileService';
import router from './FileRoutes';

jest.mock('../services/fileService');

const app = express();
app.use('/', router);

describe('FileRoutes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /upload', () => {
    it('should upload a file and return a JSON response', async () => {
      const fakeFile = { originalname: 'test.txt', buffer: Buffer.from('test content') };
      const fakeUser = { enterpriseId: 1 };
      const expectedResponse = { filename: 'test.txt', path: '/path/to/test.txt', enterpriseId: 1 };

      uploadFile.mockResolvedValue(expectedResponse);

      const response = await request(app)
        .post('/upload')
        .attach('file', fakeFile.buffer, fakeFile.originalname)
        .set('Authorization', 'Bearer fakeAccessToken') // Mocking a fake access token

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });
  });

  describe('GET /:fileId', () => {
    it('should get a file by ID and return a JSON response', async () => {
      const fakeUser = { enterpriseId: 1 };
      const fakeFile = { filename: 'test.txt', path: '/path/to/test.txt', enterpriseId: 1 };

      getFileById.mockResolvedValue(fakeFile);

      const response = await request(app)
        .get('/123') // assuming fileId is 123
        .set('Authorization', 'Bearer fakeAccessToken') // Mocking a fake access token

      expect(response.status).toBe(200);
      expect(response.body).toEqual(fakeFile);
    });

    it('should return a 404 if the file is not found', async () => {
      const fakeUser = { enterpriseId: 1 };

      getFileById.mockResolvedValue(null);

      const response = await request(app)
        .get('/456') // assuming fileId is 456
        .set('Authorization', 'Bearer fakeAccessToken') // Mocking a fake access token

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'File not found' });
    });
  });
});
