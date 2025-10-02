const { User } = require('../models/user.js');
const { userService } = require('../services/user.service.js');
const { jwtService } = require('../services/jwt.service.js');
const { ApiError } = require('../exeptions/api.error.js');
const bcrypt = require('bcrypt');
const { tokenService } = require('../services/token.service.js');
const { userValidation } = require('../services/userValidation.service.js');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: userValidation.validateEmail(email),
    password: userValidation.validatePassword(password),
  };

  if (!name) {
    throw ApiError.badRequest('Name is require');
  }

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.sendStatus(404);
  }

  user.activationToken = null;
  await user.save();
  res.send(user);
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    const user = await userService.findByEmail(email);

    if (!user) {
      throw ApiError.badRequest('No such user');
    }

    if (user.activationToken) {
      throw ApiError.badRequest('Account is not activated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.badRequest('Wrong password');
    }

    await generateTokens(res, user);
  } catch (err) {
    throw err;
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unathorized();
  }

  const user = await userService.findByEmail(userData.email);

  await generateTokens(res, user);
};

async function generateTokens(res, user) {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  res.send({ user: normalizedUser, accessToken });
}

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unathorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const resetRequest = async (req, res) => {
  const { email } = req.body;

  await userService.createPasswordResetToken(email);

  res.json({ message: 'Якщо акаунт існує, інструкції надіслані на email' });
};

const resetPassword = async (req, res) => {
  try {
    const { password, confirmation } = req.body;
    const { token } = req.params;

    if (!password || !confirmation) {
      throw ApiError.badRequest('Password and confirmation are required');
    }

    if (password !== confirmation) {
      throw ApiError.badRequest('Passwords do not match');
    }

    const result = await userService.resetPasswordService(token, password);

    res.status(200).json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      res
        .status(err.status || 400)
        .json({ message: err.message, errors: err.errors || null });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetRequest,
  resetPassword,
};

module.exports = { authController };
