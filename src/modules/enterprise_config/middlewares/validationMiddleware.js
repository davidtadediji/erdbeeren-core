// src\modules\enterprise_config\validation.js

import Joi from 'joi';

export const enterpriseDetailsSchema = Joi.object().pattern(
  Joi.string(),
  Joi.string().max(255) 
);

export const validateEnterpriseDetails = (req, res, next) => {
    const { error } = enterpriseDetailsSchema.validate(req.body);
  
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({ error: errorMessage });
    }
  
    next();
  };