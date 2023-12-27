// src\modules\llm_context\routes\fileRoutes.js
import express from 'express';
import multer from 'multer';
import { uploadFiles, deleteFile, listFiles } from '../services/fileService.js';
import logger from "../../../../logger.js";

const router = express.Router();
const upload = multer();

router.post('/upload', upload.array('file', 7), async (req, res, next) => {
  try {
    const files = await uploadFiles(req.files);
    res.json(files);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});


router.delete('/:filename', async (req, res, next) => {
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

router.get('/list', async (req, res, next) => {
  try {
    const files = await listFiles();
    res.json({ files });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// Add other file-related routes as needed

export default router;
