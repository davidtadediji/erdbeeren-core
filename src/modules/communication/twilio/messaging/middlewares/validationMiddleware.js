// src\modules\communication\twilio\messaging\validationMiddleware.js
import Joi from "joi";

const twilioWebhookSchema = Joi.object({
  Body: Joi.string().required(),
  From: Joi.string().required(),
});

const twilioBroadcastSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
});

const validateTwilioWebhook = (req, res, next) => {
  const { error } = twilioWebhookSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ error: "Bad Request", message: error.message });
  }

  next();
};

const validateTwilioBroadcast = (req, res, next) => {
  const { error } = twilioBroadcastSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ error: "Bad Request", message: error.message });
  }

  next();
};

export { validateTwilioWebhook, validateTwilioBroadcast };
