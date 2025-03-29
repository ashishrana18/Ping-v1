import { ApiError } from "../utils/ApiError.js";

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }
  // For other errors, send a generic error response.
  res.status(500).json({
    statusCode: 500,
    message: "Internal server error",
    success: false,
    errors: err.message ? [err.message] : [],
    data: null
  });
}

export default errorHandler;
