function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
}

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || (error.code === '23505' ? 409 : 500);
  const code = error.code && error.code !== '23505'
    ? error.code
    : statusCode === 409 ? 'CONFLICT' : 'INTERNAL_ERROR';
  const message = statusCode >= 500 ? 'An unexpected server error occurred.' : error.message;

  if (statusCode >= 500) {
    console.error('Unhandled request error:', {
      name: error.name,
      code: error.code,
      message: error.message,
    });
  }
  res.status(statusCode).json({ error: { code, message } });
}

module.exports = { notFoundHandler, errorHandler };
