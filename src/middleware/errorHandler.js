function errorHandler(err, req, res) {
  console.log("EE" + err);
  console.log("QQ" + req);
  console.log("RR" + res);
  // res.status(err.status || 500).json({
  //   result: "fail",
  //   error: err.message || "Error",
  // });
}

export default errorHandler;
