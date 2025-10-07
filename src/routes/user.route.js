const express = require('express');
const { userController } = require('../controllers/user.controller.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { catchError } = require('../utils/catchError.js');

const userRouter = express.Router();

userRouter.get('/users', authMiddleware, userController.getAllActivated);

userRouter.patch(
  '/me/name',
  authMiddleware,
  catchError(userController.updateName),
);

userRouter.patch(
  '/me/reset-password',
  authMiddleware,
  catchError(userController.updatePassword),
);

userRouter.patch(
  '/me/reset-email',
  authMiddleware,
  catchError(userController.requestEmailChange),
);

userRouter.get(
  '/me/reset-email/:token',

  catchError(userController.confirmEmailChange),
);

module.exports = {
  userRouter,
};
