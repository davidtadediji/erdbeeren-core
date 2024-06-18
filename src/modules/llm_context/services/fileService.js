// src\modules\llm_context\services\fileService.js
import fs from "fs";
import logger from "../../../../logger.js";
import path from "path";

const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("File service dir: " + currentModuleDir);

const FILE_UPLOAD_PATH = path.join(
  currentModuleDir.replace(/^\/([A-Z]:)/, "$1"),
  "..",
  "..",
  "..",
  "..",
  "repository"
); // Adjust the path as needed

logger.info("File upload path: " + FILE_UPLOAD_PATH);
// Ensure the upload directory exists
if (!fs.existsSync(FILE_UPLOAD_PATH)) {
  fs.mkdirSync(FILE_UPLOAD_PATH);
}

export const uploadFiles = async (files) => {
  logger.info("File upload triggered!");
  
  if (!Array.isArray(files)) {
    throw new TypeError('Expected an array of files');
  }
  
  try {
    const uploadedFiles = [];

    for (const file of files) {
      const { originalFilename, path: tempFilePath } = file;
      const targetFilePath = path.join(FILE_UPLOAD_PATH, originalFilename);

      try {
        await fs.promises.rename(tempFilePath, targetFilePath);
        uploadedFiles.push({
          filename: originalFilename,
          path: targetFilePath,
        });
      } catch (error) {
        logger.error(`Error saving file ${originalFilename}: ${error.message}`);
        throw error;
      }
    }
    return uploadedFiles;
  } catch (error) {
    logger.error(`Error uploading files: ${error.message}`);
    throw error;
  }
};

export const deleteFile = async (filename) => {
  const filePath = path.join(FILE_UPLOAD_PATH, filename);

  try {
    // To check if the file exists asynchronously
    await fs.promises.access(filePath);

    // Delete the file asynchronously
    await fs.promises.unlink(filePath);

    return { success: true, message: `File ${filename} deleted successfully.` };
  } catch (error) {
    if (error.code === "ENOENT") {
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

export const renameFile = async (filename, newFilename) => {
  const filePath = path.join(FILE_UPLOAD_PATH, filename);
  const newFilePath = path.join(FILE_UPLOAD_PATH, newFilename);

  try {
    await fs.promises.access(filePath);

    await fs.promises.rename(filePath, newFilePath);

    return {
      success: true,
      message: `File ${filename} renamed to ${newFilename} successfully.`,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { success: false, message: `File ${filename} not found.` };
    } else {
      logger.error(`Error renaming file: ${error.message}`);
      throw error;
    }
  }
};

export const viewFile = async (filename) => {
  const filePath = path.join(FILE_UPLOAD_PATH, filename);

  return new Promise((resolve, reject) => {
    try {
      if (fs.existsSync(filePath)) {
        const contentType = getContentType(filename);

        const fileStream = fs.createReadStream(filePath);
        resolve({ fileStream, contentType });
      } else {
        reject(new Error(`File ${filename} was not found`));
      }
    } catch (error) {
      logger.error(`Error occured while accessing file: ${error.message}`);
      reject(error);
    }
  });
};

// Helper function to determine content type based on file extension
const getContentType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".doc":
    case ".docx":
      return "application/msword";
    case ".txt":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
};
