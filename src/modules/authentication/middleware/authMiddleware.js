// src\modules\authentication\middleware\authMiddleware.js
import jwt from "jsonwebtoken";
import logger from "../../../../logger.js";
import { ROLE_PERMISSIONS } from "../config/roles.js";
// Function to authenticate user's request
const authenticateJWT = (req, res, next) => {
  // Get the token from the authorization header in requests
  const token = req.header("Authorization");

  // If there is no token return an unauthorized access response
  if (!token) {
    logger.error("Unauthorized access");
    return res.status(401).json({ message: "Unauthorized access" });
  }

  // If the token is not valid, the user will be restricted from accessing the system
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error(err.message);
      return res
        .status(403)
        .json({ message: "Forbidden, user is not authenticated!" });
    }

    // If the token is valid, set the user variable to be used for identifying the user's subsequent request in next().
    req.user = user;
    next();
  });
};
// Function to check if the user has the required permission
const hasPermission = (requiredPermissions) => (req, res, next) => {
  // Get the user set by the authenticateJWT
  const user = req.user;
  // check if the user's role has the requeied permissions and return next() to allow the user continue if they do
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
  // Deny the user access if they don't
  res
    .status(403)
    .json({ message: "Forbidden, user does not have the permission" });
};

export { authenticateJWT, hasPermission };
