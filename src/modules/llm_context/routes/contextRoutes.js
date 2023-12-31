// Import necessary modules and middlewares
import express from 'express';
import { generateEnterpriseVectorStore, respondToMessage } from '../services/contextService.js';
import Joi from "joi";
import { authenticateJWT, hasPermission } from "../../authentication/middleware/authMiddleware.js";
import { ROLES } from "../../authentication/config/roles.js";

const router = express.Router();

router.post(
  '/generate',
  authenticateJWT, // Ensure the user is authenticated
  hasPermission([ROLES.ADMIN]), // Ensure the user has the 'admin' role
  async (req, res, next) => {
    try {
      await generateEnterpriseVectorStore();
      res.status(200).json({ success: true, message: 'Vector store generated successfully.' });
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  }
);


const messageValidation = (req, res, next) => {
    const schema = Joi.object({
      message: Joi.string().required(),
    });
  
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
    next();
  };

  
router.post('/message', messageValidation, async (req, res, next) => {
    try {
        const reply = await respondToMessage(req.body.message);
        res.json({reply});
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});


// Export the router
export default router;

