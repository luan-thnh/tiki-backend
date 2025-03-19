class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const errorHandler = (error, req, res, next) => {
  let status = error.status || 500;
  let errors = error.message || 'Internal Server Error';

  if (error.errors) {
    status = 400;
    errors = {};

    for (let field in error.errors) {
      const fieldError = error.errors[field].properties.message;
      errors[field] = fieldError;
    }
  }

  if (typeof errors === 'string' && errors.includes(': ')) {
    const errorParts = errors.split(': ');

    errors = {
      [errorParts[0]]: errorParts[1],
    };
  }

  res.status(status).json({ message: 'Failed', data: errors });
};

module.exports = { errorHandler, HttpError };
