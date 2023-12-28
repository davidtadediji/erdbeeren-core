// src\modules\llm_context\routes\contextRoutes.js
import express from 'express';
import { generateVectorStore } from '../services/contextService.js';

const router = express.Router();

router.post('/generate', async (req, res, next) => {
    try {
        await generateVectorStore();
        res.status(200).json({ success: true, message: 'Vector store generated successfully.' });
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
});

// Export the router
export default router;

