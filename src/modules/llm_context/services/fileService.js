// src\modules\llm_context\services\fileService.js
import fs from "fs"; // package to access file system
import logger from "../../../../logger.js";
import auditLogger from "../../../../audit_logger.js";
import path from "path";

// Get the enterprise repository path
const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);
const FILE_UPLOAD_PATH = path.join(
  currentModuleDir.replace(/^\/([A-Z]:)/, "$1"),
  "..",
  "..",
  "..",
  "..",
  "repository"
); 

// To ensure the upload directory exists
if (!fs.existsSync(FILE_UPLOAD_PATH)) {
  fs.mkdirSync(FILE_UPLOAD_PATH);
}

// Function to upload documents on the platform
export const uploadFiles = async (files) => {
  logger.info("File upload triggered!");  
  // check files passed to the function
  if (!Array.isArray(files)) {
    throw new TypeError('Expected an array of files');
  }
  try {
    const uploadedFiles = [];
    /* Iterate through the file list to get the temporary file path and original filename of each file,
    combine with filename with the repository directory and move the file from previous location to the repository,
    then add the uploaded file's name to the list of uploaded files */
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
        auditLogger.error(`Error saving file ${originalFilename}: ${error.message}`);
        throw error;
      }
    }
    // return the list of files uploaded to the user
    return uploadedFiles;
  } catch (error) {
    logger.error(`Error uploading files: ${error.message}`);
    auditLogger.error(`Error uploading files: ${error.message}`);
    throw error;
  }
};

// Function to delete a document from the company repository
export const deleteFile = async (filename) => {
  const filePath = path.join(FILE_UPLOAD_PATH, filename);

  try {
    // To check if the file exists asynchronously
    await fs.promises.access(filePath);

    // Delete the file asynchronously
    await fs.promises.unlink(filePath);

    return { success: true, message: `File ${filename} deleted successfully.` };
  } catch (error) {
    // Handle specific errors from file deletion process
    if (error.code === "ENOENT") {
      return { success: false, message: `File ${filename} not found.` };
    } else {
      logger.error(`Error deleting file: ${error.message}`);
      auditLogger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }
};

// Function to list files in the company's repository/knowledge base
export const listFiles = async () => {
  logger.info("List files triggered!")
  try {
    // get the repository directory and return the files
    const files = fs.readdirSync(FILE_UPLOAD_PATH);
    return files;
  } catch (error) {
    logger.error(`Error listing files: ${error.message}`);
    auditLogger.error(`Error listing files: ${error.message}`);
    throw error;
  }
};

// Function to rename document in the company's knowledge base
export const renameFile = async (filename, newFilename) => {
  // get the old and new filenames passed and create file paths with them
  const filePath = path.join(FILE_UPLOAD_PATH, filename);
  const newFilePath = path.join(FILE_UPLOAD_PATH, newFilename);

  try {
    // Get the filepath from the file system and rename it to the new filepath
    await fs.promises.access(filePath);
    await fs.promises.rename(filePath, newFilePath);

    // Return success
    return {
      success: true,
      message: `File ${filename} renamed to ${newFilename} successfully.`,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { success: false, message: `File ${filename} not found.` };
    } else {
      logger.error(`Error renaming file: ${error.message}`);
      auditLogger.error(`Error renaming file: ${error.message}`);
      throw error;
    }
  }
};

// Function to view a document in the knowledge base
export const viewFile = async (filename) => {
  // get the documents file path
  const filePath = path.join(FILE_UPLOAD_PATH, filename);

  // create a promise
  return new Promise((resolve, reject) => {
    try {
      if (fs.existsSync(filePath)) {
        /* if the document exists,
        get the file type and create a read stream pointing to the file path of the document */
        const contentType = getContentType(filename);
        const fileStream = fs.createReadStream(filePath);
        // resolve the promise with a file stream and content type to be used on the frontend to view the document
        resolve({ fileStream, contentType });
      } else {
        reject(new Error(`File ${filename} was not found`));
      }
    } catch (error) {
      // Handle error by rejecting
      logger.error(`Error occured while accessing file: ${error.message}`);
      auditLogger.error(`Error occured while accessing file: ${error.message}`);
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
