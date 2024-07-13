// src\modules\llm_context\middleware\errorMiddleware.js
import logger from "../../../../logger.js";
import auditLogger from "../../../../audit_logger.js";

const errorMiddleware = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  auditLogger.error(`Error: ${err.message}`);

  if (err.name === "InsufficientQuotaError") {
    res.status(403).json({
      success: false,
      message:
        "Insufficient quota. Please check your plan and billing details.",
    });
  } else if (err.name === "MulterError") {
    res.status(400).json({ error: "File upload error" });
  } else {   
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
};

export default errorMiddleware;
