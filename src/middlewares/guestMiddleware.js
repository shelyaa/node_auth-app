import { ApiError } from '../exeptions/api.error.js';
import jwtService from '../services/jwt.service.js';

export const isGuest = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    try {
      await jwtService.verifyRefresh(refreshToken);

      return next(ApiError.badRequest('You are already logged in'));
    } catch (err) {
      return next();
    }
  }

  next();
};
