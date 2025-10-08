const { ApiError } = require('../exeptions/api.error');
const { jwtService } = require('../services/jwt.service');

const isGuest = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return next();
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      return next();
    }

    jwtService.verifyRefresh(token);

    return next(ApiError.badRequest('You are already logged in'));
  } catch (err) {
    return next();
  }
};

module.exports = { isGuest };
