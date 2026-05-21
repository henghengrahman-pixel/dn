module.exports = function apiKey(req, res, next) {
  const configured = process.env.API_KEY;
  if (!configured) return next();
  const key = req.headers['x-api-key'] || req.body.api_key || req.query.api_key;
  if (key !== configured) return res.status(401).json({ success: false, message: 'Invalid API key' });
  next();
};
