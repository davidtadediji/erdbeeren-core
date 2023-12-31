// Import necessary modules and middlewares
import express from 'express';
import multer from 'multer';
import { uploadFiles, deleteFile, listFiles } from '../services/fileService.js';
import logger from "../../../../logger.js";
import { authenticateJWT, hasPermission } from "../../authentication/middleware/authMiddleware.js";
import { ROLES } from "../../authentication/config/roles.js";

const router = express.Router();
const upload = multer();

// Protect the '/upload' route with authentication and permission check
router.post(
  '/upload',
  authenticateJWT, // Ensure the user is authenticated
  hasPermission([ROLES.ADMIN]), // Ensure the user has the 'admin' role
  upload.array('file', 7), // Handle file upload
  async (req, res, next) => {
    try {
      const files = await uploadFiles(req.files);
      res.json(files);
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  }
);

// Protect the '/:filename' (delete) route with authentication and permission check
router.delete('/:filename', authenticateJWT, hasPermission([ROLES.ADMIN]), async (req, res, next) => {
  const { filename } = req.params;
  try {
    const result = await deleteFile(filename);
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// Protect the '/list' route with authentication and permission check
router.get('/list', authenticateJWT, hasPermission([ROLES.ADMIN]), async (req, res, next) => {
  try {
    const files = await listFiles();
    res.json({ files });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});


// Export the router
export default router;
