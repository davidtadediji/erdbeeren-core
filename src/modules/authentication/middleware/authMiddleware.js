// src\modules\authentication\middleware\authMiddleware.js

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized access' });
};

const hasPermission = (requiredPermissions) => (req, res, next) => {
  const user = req.user;

  if (user && user.role && requiredPermissions.includes(user.role)) {
    return next();
  }

  res.status(403).json({ message: 'Forbidden' });
};

export { isAuthenticated, hasPermission };