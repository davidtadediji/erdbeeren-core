// src\modules\llm_context\services\fileService.js
import fs from 'fs';
import logger from '../../../../logger.js';
import path from 'path';

const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("File service dir: " + currentModuleDir);

const FILE_UPLOAD_PATH = path.join(currentModuleDir.replace(/^\/([A-Z]:)/, '$1'), '..', 'context'); // Adjust the path as needed

logger.info("File upload path: " + FILE_UPLOAD_PATH)
// Ensure the upload directory exists
if (!fs.existsSync(FILE_UPLOAD_PATH)) {
  fs.mkdirSync(FILE_UPLOAD_PATH);
}

export const uploadFiles = async (files) => {
  try {
    const uploadedFiles = [];

    for (const file of files) {
      const { originalname, buffer } = file;
      const filePath = path.join(FILE_UPLOAD_PATH, originalname);

      // Write each file to the local file system asynchronously
      await fs.promises.writeFile(filePath, buffer);

      // Collect file metadata for each uploaded file
      uploadedFiles.push({ filename: originalname, path: filePath });
    }

    // Return an array of uploaded files
    return uploadedFiles;
  } catch (error) {
    logger.error(`Error uploading files: ${error.message}`);
    throw error; // Rethrow the error to be caught by the calling code
  }
};



export const deleteFile = async (filename) => {
  const filePath = path.join(FILE_UPLOAD_PATH, filename);

  try {
    // Check if the file exists asynchronously
    await fs.promises.access(filePath);

    // Delete the file asynchronously
    await fs.promises.unlink(filePath);

    return { success: true, message: `File ${filename} deleted successfully.` };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { success: false, message: `File ${filename} not found.` };
    } else {
      logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }
};


export const listFiles = async () => {
  try {
    const files = fs.readdirSync(FILE_UPLOAD_PATH);
    return files;
  } catch (error) {
    logger.error(`Error listing files: ${error.message}`);
    throw error;
  }
};
