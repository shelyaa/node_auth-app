const { User } = require('../models/user.js');
const { v4: uuidv4 } = require('uuid');
const { emailService } = require('./email.service');
const { ApiError } = require('../exeptions/api.error');
const bcrypt = require('bcrypt');
const { Token } = require('../models/token.js');

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, email, name }) {
  return { id, email, name };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function updateName(name, userId) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  user.name = name;

  await user.save();

  return user;
}

async function updatePassword(oldPassword, newPassword, userId) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw ApiError.badRequest('Old password is incorrect');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return user;
}

async function updateEmailRequest(password, userId, newEmail) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Password is incorrect');
  }

  const token = await Token.findOne({ where: { userId } });

  const emailChangeToken = uuidv4();

  if (token) {
    token.emailChangeToken = emailChangeToken;
    await token.save();
  } else {
    await Token.create({
      userId,
      emailChangeToken,
    });
  }

  user.newEmail = newEmail;
  await user.save();

  await emailService.sendEmailChangeToken(user.email, emailChangeToken);

  return { message: 'На стару пошту надіслано листа з підтвердженням' };
}

async function updateEmailConfirmation(token) {
  const tokenRecord = await Token.findOne({
    where: { emailChangeToken: token },
    include: User,
  });

  if (!tokenRecord || !tokenRecord.User) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  const user = tokenRecord.User;

  user.email = user.newEmail;
  user.newEmail = null;

  await user.save();

  tokenRecord.emailChangeToken = null;
  await tokenRecord.save();

  return { message: 'Email change successfully' };
}

async function register(name, email, hashedPass) {
  const activationToken = uuidv4();

  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    name,
    email,
    password: hashedPass,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function createPasswordResetToken(email) {
  const existingUser = await findByEmail(email);

  if (!existingUser) {
    return;
  }

  const resetToken = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  const token = await Token.findOne({ where: { userId: existingUser.id } });

  if (token) {
    token.resetToken = resetToken;
    token.resetTokenExpires = expiresAt;
    await token.save();
  } else {
    await Token.create({
      userId: existingUser.id,
      resetToken,
      resetTokenExpires: expiresAt,
    });
  }

  await emailService.sendResetPasswordEmail(email, resetToken);
}

const resetPasswordService = async (token, newPassword) => {
  const tokenRecord = await Token.findOne({
    where: { resetToken: token },
    include: User,
  });

  if (!tokenRecord || !tokenRecord.User) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  const user = tokenRecord.User;

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  tokenRecord.resetToken = null;
  tokenRecord.resetTokenExpires = null;
  await tokenRecord.save();

  return { message: 'Password reset successfully' };
};

const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  updateName,
  updateEmailRequest,
  updatePassword,
  register,
  createPasswordResetToken,
  resetPasswordService,
  updateEmailConfirmation,
};

module.exports = {
  userService,
};
