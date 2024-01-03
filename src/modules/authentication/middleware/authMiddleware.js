// src\modules\authentication\middleware\authMiddleware.js
import jwt from 'jsonwebtoken';
import { ROLE_PERMISSIONS } from '../config/roles.js'; // Make sure to import ROLE_PERMISSIONS

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.user = user;
    next();
  });
};

const hasPermission = (requiredPermissions) => (req, res, next) => {
  const user = req.user;

  if (user && user.role) {
    const userPermissions = ROLE_PERMISSIONS[user.role];

    if (userPermissions && requiredPermissions.every(permission => userPermissions.includes(permission))) {
      return next();
    }
  }

  res.status(403).json({ message: 'Forbidden' });
};

export { authenticateJWT, hasPermission };
