import express from 'express';
import { ROLES } from "../../authentication/config/roles.js";
import { authenticateJWT, hasPermission } from "../../authentication/middleware/authMiddleware.js";
import { generateCustomerVectorStore } from '../services/customerContextService.js';

const router = express.Router();

router.post(
  '/generate',
  authenticateJWT, 
  hasPermission(["manageLLM"]), // Ensure the user has the 'admin' role
  async (req, res, next) => {
    const  {customerSid}= req.body
    try {
      await generateCustomerVectorStore(customerSid);
      res.status(200).json({ success: true, message: 'Vector store generated successfully.' });
    } catch (error) {
      next(error); 
    }
  }
);


export default router;

