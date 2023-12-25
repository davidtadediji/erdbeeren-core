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
