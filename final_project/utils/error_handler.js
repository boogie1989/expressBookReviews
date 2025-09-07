const { HttpError, InternalServerError } = require("./errors");

const errorHandler = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json(error);
      }

      console.log("ERROR: ", error.message);
      error = new InternalServerError();
      return res.status(error.statusCode).json(error);
    }
  };
};

module.exports = { errorHandler };
