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
  "knowledge_base"
); 

logger.info("File upload path: " + FILE_UPLOAD_PATH);
// Ensure the upload directory exists
if (!fs.existsSync(FILE_UPLOAD_PATH)) {
  fs.mkdirSync(FILE_UPLOAD_PATH);
}

export const listFiles = async () => {
  logger.info("List files triggered!");
  try {
    const files = fs.readdirSync(FILE_UPLOAD_PATH);
    return files;
  } catch (error) {
    logger.error(`Error listing files: ${error.message}`);
    throw error;
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
