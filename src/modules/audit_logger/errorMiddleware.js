
import logger from "../../../logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);
  res
    .status(500)
    .json({ message: "Internal Server Error", err});
};

export default errorHandler;
