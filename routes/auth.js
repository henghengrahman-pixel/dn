const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin/dashboard');
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_ID && password === process.env.ADMIN_PASSWORD) {
    req.session.admin = true;
    req.session.adminId = username;
    return res.redirect('/admin/dashboard');
  }
  return res.status(401).render('login', { error: 'ID atau password salah' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
