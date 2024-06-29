// src\modules\communication\twilio\messaging\validationMiddleware.js
import Joi from "joi";

const twilioWebhookSchema = Joi.object({
  Body: Joi.string().required(),
  From: Joi.string().required(),
  // Add more validation rules as needed
});

const twilioBroadcastSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  // Add more validation rules as needed
});

const validateTwilioWebhook = (req, res, next) => {
  const { error } = twilioWebhookSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ error: "Bad Request", message: error.message });
  }

  // If all validations pass, proceed to the next middleware or the controller
  next();
};

const validateTwilioBroadcast = (req, res, next) => {
  const { error } = twilioBroadcastSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ error: "Bad Request", message: error.message });
  }

  // If all validations pass, proceed to the next middleware or the controller
  next();
};

export { validateTwilioWebhook, validateTwilioBroadcast };
