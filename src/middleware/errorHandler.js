function errorHandler(err, req, res) {
  res.status(err.status || 500).json({
    result: "fail",
    error: err.message || "Error",
  });
}

export default errorHandler;
