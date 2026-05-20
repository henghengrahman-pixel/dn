require('dotenv').config();

const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const expressLayouts = require('express-ejs-layouts');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./config/db');
const realtime = require('./socket/realtime');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change_me_in_env';

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI belum diisi. Isi di Railway Variables atau .env lokal.');
  process.exit(1);
}

connectDB(MONGO_URI);
realtime.init(server);

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', false);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);

app.use(session({
  name: 'mutasi.sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use('/', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/admin', require('./routes/admin'));

app.get('/', (req, res) => res.redirect('/admin/dashboard'));
app.use((req, res) => res.status(404).render('error', { title: '404', message: 'Halaman tidak ditemukan' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: '500', message: 'Server error' });
});

server.listen(PORT, () => console.log(`Mutasi Dana Realtime running on port ${PORT}`));
