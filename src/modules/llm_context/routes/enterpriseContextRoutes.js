// Import necessary modules and middlewares
import express from 'express';
import { ROLES } from "../../authentication/config/roles.js";
import { authenticateJWT, hasPermission } from "../../authentication/middleware/authMiddleware.js";
import { generateEnterpriseVectorStore } from '../services/enterpriseContextService.js';

const router = express.Router();

router.post(
  '/generate',
  authenticateJWT, // Ensure the user is authenticated
  hasPermission(["manageLLM"]), // Ensure the user has the 'admin' role
  async (req, res, next) => {
    try {
      await generateEnterpriseVectorStore();
      res.status(200).json({ success: true, message: 'Vector store generated successfully.' });
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  }
);


// Export the router
export default router;

