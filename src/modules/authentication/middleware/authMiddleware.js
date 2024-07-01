// src\modules\authentication\middleware\authMiddleware.js
import jwt from "jsonwebtoken";
import { ROLE_PERMISSIONS } from "../config/roles.js"; 
import logger from "../../../../logger.js";

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization");


  if (!token) {
    logger.error("Unauthorized access");
    return res.status(401).json({ message: "Unauthorized access" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error(err.message);
      return res
        .status(403)
        .json({ message: "Forbidden, user is not authenticated!" });
    }

    req.user = user;
    next();
  });
};

const hasPermission = (requiredPermissions) => (req, res, next) => {
  const user = req.user;

  if (user && user.role) {
    const userPermissions = ROLE_PERMISSIONS[user.role];

    if (
      userPermissions &&
      requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      )
    ) {
      return next();
    }
  }
  logger.error("Forbidden, user does not have the permission");

  res
    .status(403)
    .json({ message: "Forbidden, user does not have the permission" });
};

export { authenticateJWT, hasPermission };
