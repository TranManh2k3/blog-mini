function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ success:false, message:'Server error' });
}
module.exports = { errorHandler };
