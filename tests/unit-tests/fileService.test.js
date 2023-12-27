// fileService.test.js

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { uploadFile, getFileById } from '../../src/modules/llm_context/services/fileService.js';

jest.mock('fs');
jest.mock('@prisma/client');

const prismaMock = new PrismaClient();

describe('FileService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a file and save metadata to the database', async () => {
      const fakeFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('test content'),
      };
      const fakeEnterpriseId = 1;
      const fakeFilePath = path.join(__dirname, 'uploads', 'test.txt');
      const fakeSavedFile = { id: 1, filename: 'test.txt', path: fakeFilePath, enterpriseId: 1 };

      fs.existsSync.mockReturnValue(true);
      fs.writeFileSync.mockReturnValue();
      prismaMock.file.create.mockResolvedValue(fakeSavedFile);

      const result = await uploadFile(fakeFile, fakeEnterpriseId);

      expect(result).toEqual(fakeSavedFile);
      expect(fs.writeFileSync).toHaveBeenCalledWith(fakeFilePath, fakeFile.buffer);
      expect(prismaMock.file.create).toHaveBeenCalledWith({
        data: {
          filename: fakeFile.originalname,
          path: fakeFilePath,
          enterpriseId: fakeEnterpriseId,
        },
      });
    });
  });

  describe('getFileById', () => {
    it('should get a file by ID', async () => {
      const fakeFileId = 1;
      const fakeEnterpriseId = 1;
      const fakeFile = { id: 1, filename: 'test.txt', path: '/path/to/test.txt', enterpriseId: 1 };

      prismaMock.file.findUnique.mockResolvedValue(fakeFile);

      const result = await getFileById(fakeFileId, fakeEnterpriseId);

      expect(result).toEqual(fakeFile);
      expect(prismaMock.file.findUnique).toHaveBeenCalledWith({
        where: { id: fakeFileId, enterpriseId: fakeEnterpriseId },
      });
    });
  });
});




/*
 // fileService.test.js
import { uploadFile, getFileByName, deleteFile, listFiles } from '../path/to/fileService';

describe('fileService', () => {
  test('uploads a file', async () => {
    const file = { originalname: 'test.txt', buffer: Buffer.from('Test content') };
    const result = await uploadFile(file);
    expect(result.filename).toBe('test.txt');
    expect(result.path).toMatch(/uploads\/test.txt/);
  });

  test('gets a file by name', async () => {
    const result = await getFileByName('test.txt');
    expect(result.filename).toBe('test.txt');
    expect(result.path).toMatch(/uploads\/test.txt/);
  });

  test('deletes a file by name', async () => {
    const result = await deleteFile('test.txt');
    expect(result.success).toBe(true);
    expect(result.message).toBe('File test.txt deleted successfully.');
  });

  test('tries to get a non-existent file', async () => {
    const result = await getFileByName('nonexistent.txt');
    expect(result).toBe(null);
  });

  test('tries to delete a non-existent file', async () => {
    const result = await deleteFile('nonexistent.txt');
    expect(result.success).toBe(false);
    expect(result.message).toBe('File nonexistent.txt not found.');
  });

  test('lists all files', async () => {
    // Mock the required dependencies or adjust as needed
    jest.mock('fs', () => ({
      readdirSync: jest.fn(() => ['test.txt']),
    }));

    const files = await listFiles();
    expect(files).toEqual(['test.txt']);
  });
});
*/