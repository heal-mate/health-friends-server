// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({
    result: "fail",
    error: err.message || "Error",
  });
}

export default errorHandler;
