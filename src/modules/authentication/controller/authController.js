import passport from 'passport';

export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ message: 'Authentication successful', user });
    });
  })(req, res, next);
};

export const logout = (req, res) => {
  req.logout();
  res.json({ message: 'Logout successful' });
};
