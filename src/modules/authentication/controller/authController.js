// src\modules\authentication\controller\authController.js
import passport from 'passport';
import { prisma } from '../prisma/client';
import bcrypt from 'bcrypt';

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


export const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { username } });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        // Additional fields as needed
      },
    });

    return res.json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    next(error);
  }
};
