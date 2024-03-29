const jwt = require('jsonwebtoken');
const { HttpError } = require('./errorHandler.middleware');

const verifyToken = (req, res, next) => {
  const Authorization = req.header('authorization');

  try {
    if (!Authorization) {
      req.user = { userId: null, role: null };
      const error = new HttpError('Unauthorized!!', 400);
      return next(error);
    }

    const token = Authorization.replace('Bearer ', '');

    // Verify
    const payload = jwt.verify(token, process.env.SECRET_KEY || 'DEFAULT_SECRET');
    const { userId, role } = payload;

    // Assign req
    req.user = { userId, role };
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = verifyToken;
