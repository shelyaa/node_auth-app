const { ApiError } = require('../exeptions/api.error.js');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  res.status(500).send({ message: 'Server Error' });
};

module.exports = {
  errorMiddleware,
};
