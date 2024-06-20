import express from 'express';
import { ROLES } from "../../authentication/config/roles.js";
import { authenticateJWT, hasPermission } from "../../authentication/middleware/authMiddleware.js";
import { generateEnterpriseVectorStore } from '../services/enterpriseContextService.js';

const router = express.Router();

router.post(
  '/generate',
  authenticateJWT,
  hasPermission(["manageLLM"]), 
  async (req, res, next) => {
    try {
      await generateEnterpriseVectorStore();
      res.status(200).json({ success: true, message: 'Vector store generated successfully.' });
    } catch (error) {
      next(error); 
    }
  }
);


export default router;

