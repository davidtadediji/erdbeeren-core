// Import necessary modules and middlewares
import express from "express";
import Joi from "joi";
import { respondToMessage } from "../services/modelService.js";

const router = express.Router();

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

router.post("/message", messageValidation, async (req, res, next) => {
  try {
    const reply = await respondToMessage(req.body.message);
    res.json({ reply });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// Export the router
export default router;
