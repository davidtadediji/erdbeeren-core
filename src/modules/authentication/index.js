// src\modules\authentication\index.js
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import errorMiddleware from './middleware/errorMiddleware';

// Use esm to enable import/export in CommonJS environments
require = require('esm')(module /*, options */);

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Register the error handler after your route-handling middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
