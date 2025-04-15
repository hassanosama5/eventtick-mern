// Temporarily replace errorMiddleware.js with this minimal version
const errorHandler = (err, req, res, next) => {
  console.log("Error handler triggered");
  res.status(500).json({ message: "Test error handler" });
};
module.exports = { errorHandler };
