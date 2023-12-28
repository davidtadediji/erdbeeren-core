// src\modules\llm_context\middleware\errorMiddleware.js
import logger from "../../../../logger.js";

const errorMiddleware = (err, req, res, next) => {
  // Log the error
  logger.error(`Error: ${err.message}`);

  if (err.name === "InsufficientQuotaError") {
    res
      .status(403)
      .json({
        success: false,
        message:
          "Insufficient quota. Please check your plan and billing details.",
      });
  }
  // Handle specific errors and send appropriate responses
  else if (err.name === "MulterError") {
    res.status(400).json({ error: "File upload error" });
  } else {
    // Handle other errors with a generic response
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
};

export default errorMiddleware;
