const { MESSAGES } = require('../constants/validate.constant');
const { HttpError } = require('./errorHandler.middleware');
const verifyToken = require('./verifyToken.middleware');

const checkUserLogin = (req, res, next) => {
  try {
    verifyToken(req, res, () => {
      if (!req.user && !req?.user.userId) return next(new HttpError(MESSAGES.NOT_LOGGED_IN, 400));

      req.user = req.user;
      return next();
    });
  } catch (error) {
    next(error);
  }
};

const checkAdminLogin = (req, res, next) => {
  try {
    verifyToken(req, res, () => {
      if (!req.user && !req?.user.userId) return next(new HttpError(MESSAGES.NOT_LOGGED_IN, 400));
      if (!req.user && req?.user.role !== 1) return next(new HttpError(MESSAGES.NOT_AUTHORIZED_ACTION, 400));

      next();
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkUserLogin, checkAdminLogin };
