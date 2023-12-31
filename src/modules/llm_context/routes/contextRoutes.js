// src\modules\llm_context\routes\contextRoutes.js
import express from 'express';
import { generateEnterpriseVectorStore, respondToMessage } from '../services/contextService.js';

const router = express.Router();

router.post('/generate', async (req, res, next) => {
    try {
        await generateEnterpriseVectorStore();
        res.status(200).json({ success: true, message: 'Vector store generated successfully.' });
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});


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

