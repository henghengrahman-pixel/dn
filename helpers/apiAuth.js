module.exports = function apiAuth(req, res, next) {
  const configured = process.env.API_SECRET;
  if (!configured) return next();

  const token = req.headers['x-api-secret'] || req.body.api_secret || req.query.api_secret;
  if (token !== configured) {
    return res.status(401).json({ success: false, message: 'Unauthorized API secret' });
  }

  next();
};
