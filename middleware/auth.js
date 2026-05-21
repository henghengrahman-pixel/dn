module.exports = function auth(req, res, next) {
  if (!req.session.admin) return res.redirect('/login');
  next();
};
