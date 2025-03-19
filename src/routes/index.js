const { HttpError } = require('../middleware/errorHandler.middleware');
const orderRouter = require('./order.route');
const productRouter = require('./product.route');
const userRouter = require('./user.route');

const appRouter = (app) => {
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/orders', orderRouter);
  // app.use('/api/v1/suggests', suggestRouter);

  app.use('*', (req, res, next) => {
    const error = new HttpError('The route can not be found!', 404);
    next(error);
  });
};

module.exports = appRouter;
