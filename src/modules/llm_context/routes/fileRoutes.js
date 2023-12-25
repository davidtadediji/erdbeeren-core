// FileRoutes.js

import express from 'express';
import multer from 'multer'; // For handling file uploads
import { uploadFile, getFileById } from '../services/fileService';

const router = express.Router();
const upload = multer();

router.post('/upload', upload.single('file'), async (req, res) => {
  const { enterpriseId } = req.user; // Assuming user authentication is implemented
  const file = await uploadFile(req.file, enterpriseId);
  res.json(file);
});

router.get('/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const { enterpriseId } = req.user; // Assuming user authentication is implemented

  const file = await getFileById(parseInt(fileId), enterpriseId);

  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }

  // You may implement file streaming or redirect to the S3 URL for download
  res.json(file);
});

// Add other file-related routes as needed
