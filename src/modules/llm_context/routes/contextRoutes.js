// src\modules\llm_context\routes\contextRoutes.js
import express from 'express';
import { generateVectorStore, respondToMessage } from '../services/contextService.js';

const router = express.Router();

router.post('/generate', async (req, res, next) => {
    try {
        await generateVectorStore();
        res.status(200).json({ success: true, message: 'Vector store generated successfully.' });
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});

router.post('/message', async (req, res, next) => {
    try {
        const reply = await respondToMessage(req.body.message);
        res.json({reply});
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});


// Export the router
export default router;

