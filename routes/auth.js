const router = require('express').Router();

router.get('/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin/dashboard');
  res.render('login', { title: 'Login' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_ID && password === process.env.ADMIN_PASSWORD) {
    req.session.admin = { username, loginAt: new Date().toISOString() };
    return res.redirect('/admin/dashboard');
  }
  res.render('login', { title: 'Login', error: 'ID atau password salah' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
