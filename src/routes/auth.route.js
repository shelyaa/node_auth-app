const express = require('express');
const { authController } = require('../controllers/auth.controller.js');
const { catchError } = require('../utils/catchError.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { isGuest } = require('../middlewares/guestMiddleware.js');

const authRouter = express.Router();

authRouter.post('/registration', isGuest, catchError(authController.register));

authRouter.get(
  '/activation/:activationToken',
  isGuest,
  catchError(authController.activate),
);
authRouter.post('/login', isGuest, catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', authMiddleware, catchError(authController.logout));

authRouter.post(
  '/reset-password',
  isGuest,
  catchError(authController.resetRequest),
);

authRouter.post(
  '/reset-password/:token',
  catchError(authController.resetPassword),
);

module.exports = {
  authRouter,
};
