/*
 * Finland Ice Hockey Tournament Platform
 * File: app.js
 * Author: Zawal (Backend Architecture, Database and DevOps)
 * Purpose: Express app bootstrap, middleware wiring, route mounting and server start
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const methodOverride = require('method-override');

const connectDB = require('./config/db');
const { loadUser } = require('./middleware/auth');
const flash = require('./middleware/flash');
const { notFound, errorHandler } = require('./middleware/errors');

const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 60 * 60 * 24 * 7
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use(loadUser);
app.use(flash);

app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/teams', teamRoutes);
app.use('/tournaments', tournamentRoutes);

app.use(notFound);
app.use(errorHandler);

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log('Finland Ice Hockey platform running on http://localhost:' + PORT);
  });
})();
