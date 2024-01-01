// src\modules\authentication\middleware\errorMiddleware.js
import logger from "../../../../logger.js"
const errorHandler = (err, req, res, next) => {
    logger.error(err.message); // Log the error
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  };
  
  export default errorHandler;
  