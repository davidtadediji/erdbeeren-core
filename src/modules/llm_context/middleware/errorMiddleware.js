// src\modules\llm_context\middleware\errorMiddleware.js
import logger from "../../../../logger.js";

const errorMiddleware = (err, req, res, next) => {
  // Log the error
  logger.error(`Error: ${err.message}`);

  // Handle specific errors and send appropriate responses
  if (err.name === 'MulterError') {
    res.status(400).json({ error: 'File upload error' });
  } else {
    // Handle other errors with a generic response
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default errorMiddleware;
