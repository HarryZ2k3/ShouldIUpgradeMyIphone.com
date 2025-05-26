// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Iphone = require('./models/Iphone');
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
const iphoneRoutes = require('./routes/iphoneRoutes');
//google account
require('dotenv').config();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());              // Enable CORS
app.use(express.json());      // Parse JSON

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Root route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Optional quick endpoint to get names only
app.get('/api/iphones', async (req, res) => {
  try {
    const models = await Iphone.find({}, { "Model Name": 1, _id: 0 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Full iPhone API routes
app.use('/api/iphones', iphoneRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id)
      .then(u => done(null, u))
      .catch(done)
);

// Local strategy for login
passport.use(new LocalStrategy({ usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'No user' });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return done(null, false, { message: 'Wrong password' });
      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }
));

// Google strategy for login
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