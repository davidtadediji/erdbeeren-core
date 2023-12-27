// src\modules\authentication\controllers\authController.js
import { PrismaClient } from '@prisma/client';
import logger from '../../../../logger.js';

// Create an instance of the Prisma client
const prisma = new PrismaClient();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ROLES } from '../config/roles.js';


export const login = async (req, res, next) => {
  logger.info("Login triggered")

  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.json({ message: 'Authentication successful', token, user });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req, res, next) => {
  logger.info("signup triggered: " + JSON.stringify(req.body, null, 2))
  try {
    const { username, password, role } = req.body;
    
    logger.info("Username: " + username)
    // Check if the user already exists
    const existingUser = await prisma.user.findFirst({ where: { username: username } });

    if (existingUser) {
      logger.info("User already exists")
      return res.status(400).json({ message: 'User already exists' });
    }

    logger.info("User does not exist yet")

    
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    logger.info("Hashed password:" + hashedPassword)

    // Ensure the provided role is valid
    const validRoles = Object.values(ROLES);
    const userRole = validRoles.includes(role) ? role : ROLES.AGENT;

    // Create the new user with the specified role
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: userRole,
        // Additional fields as needed
      },
    });

    logger.info("User created successfully" + newUser)

    return res.json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    next(error);
  }
};
