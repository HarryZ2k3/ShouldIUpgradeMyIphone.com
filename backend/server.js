// File: backend/server.js

require('dotenv').config();
const express         = require('express');
const mongoose        = require('mongoose');
const cors            = require('cors');
const session         = require('express-session');
const MongoStore      = require('connect-mongo');
const passport        = require('passport');
const LocalStrategy   = require('passport-local').Strategy;
const GoogleStrategy  = require('passport-google-oauth20').Strategy;
const bcrypt          = require('bcrypt');

const authRoutes      = require('./routes/auth');
const iphoneRoutes    = require('./routes/iphoneRoutes');
const User            = require('./models/User');

// — Create the Express app —
const app = express();

// — Trust proxy so secure cookies work behind Render’s load balancer —
app.set('trust proxy', 1);

// — Connect to MongoDB —
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// — Middleware —
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// — Session setup —
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: {
    secure: true,           // only send over HTTPS
    httpOnly: true,         // not accessible from JS
    sameSite: 'none',       // allow cross-site
    maxAge: 1000 * 60 * 60 * 24 * 7  // 1 week
  }
}));

// — Passport setup —
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id)
    .then(u => done(null, u))
    .catch(done)
);

// — Local Strategy —
passport.use(new LocalStrategy({ usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'No user found' });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return done(null, false, { message: 'Incorrect password' });
      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }
));

// — Google Strategy —
passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.BACKEND_URL}/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email:    profile.emails[0].value
        });
      }
      done(null, user);
    } catch (e) {
      done(e);
    }
  }
));
// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// — Routes —
app.use('/auth', authRoutes);
app.use('/api/iphones', iphoneRoutes);

// — Health check or root endpoint —
app.get('/', (req, res) => res.send('Server is running'));

// — Start server —
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

