const router = require('express').Router();
const passport = require('passport');
const bcrypt   = require('bcrypt');
const User     = require('../models/User');

// — Register via email/password —
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash: hash });
    req.login(user, err => err ? res.sendStatus(500) : res.json(user));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// — Login via email/password —
router.post('/login',
  passport.authenticate('local'),
  (req, res) => res.json(req.user)
);

// — Google OAuth flow —
router.get('/google',
  passport.authenticate('google', { scope: ['profile','email'] })
);
router.get('/google/callback',
  passport.authenticate('google', {
    successRedirect:  process.env.FRONTEND_URL,
    failureRedirect:  process.env.FRONTEND_URL + '/login'
  })
);

// GET /auth/logout
router.get('/logout', (req, res, next) => {
  // Passport 0.6 requires callback for logout
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => {
      // Clear the session cookie on the client
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  });
});

// — Get current user —
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  res.json(req.user);
});

// — Update currentModel —
router.put('/me/model', async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  req.user.currentModel = req.body.model;
  await req.user.save();
  res.json({ currentModel: req.user.currentModel });
});

module.exports = router;
